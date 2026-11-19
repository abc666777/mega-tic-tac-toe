// Authoritative game server: serves static files + WebSocket matchmaking/game logic.
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');

const N = 15, WIN = 5, PORT = process.env.PORT || 3000, TIMES = [30, 15, 5];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };
const FILES = new Set(['index.html', 'game.js', 'game.css', 'font.ttf', 'pause-symbol.svg', 'sfx.wav', 'bgm.mp3']);

const server = http.createServer((req, res) => {
  const f = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0];
  if (!FILES.has(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] });
  fs.createReadStream(path.join(__dirname, f)).pipe(res);
});

const queue = {};          // turn time -> socket waiting for a quick match
const pending = new Map(); // room code -> { ws, time } (custom rooms waiting for a guest)
const games = new Set();
const send = (ws, m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
const both = (g, m) => { send(g.players.X, m); send(g.players.O, m); };
const newCode = () => { let c; do c = Math.random().toString(36).slice(2, 6).toUpperCase(); while (pending.has(c)); return c; };

// Only the cells around the last move can form a new line, so check just those 4 axes.
function winLine(b, x, y, p) {
  for (const [dx, dy] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const line = [[x, y]];
    for (const s of [1, -1])
      for (let i = 1; ; i++) {
        const a = x + dx * i * s, c = y + dy * i * s;
        if (a < 0 || c < 0 || a >= N || c >= N || b[a * N + c] !== p) break;
        line.push([a, c]);
      }
    if (line.length >= WIN) return line;
  }
}

function startGame(a, b, time) {
  const [x, o] = Math.random() < 0.5 ? [a, b] : [b, a];
  const g = { players: { X: x, O: o }, board: Array(N * N).fill(''), turn: 'X', left: time, time, moves: 0 };
  x.game = o.game = g; games.add(g);
  send(x, { t: 'start', you: 'X', time }); send(o, { t: 'start', you: 'O', time });
}

function endGame(g, result) {
  if (!games.delete(g)) return;
  both(g, { t: 'end', ...result });
  g.players.X.game = g.players.O.game = null;
}

function move(ws, x, y) {
  const g = ws.game;
  if (!g || g.players[g.turn] !== ws || !Number.isInteger(x) || !Number.isInteger(y)
    || x < 0 || y < 0 || x >= N || y >= N || g.board[x * N + y]) return;
  const p = g.turn;
  g.board[x * N + y] = p; g.moves++;
  both(g, { t: 'move', x, y, p });
  const line = winLine(g.board, x, y, p);
  if (line) return endGame(g, { winner: p, line });
  if (g.moves === N * N) return endGame(g, { draw: true }); // board full, no winner
  g.turn = p === 'X' ? 'O' : 'X'; g.left = g.time;
  both(g, { t: 'turn', turn: g.turn, left: g.left });
}

function leave(ws) {
  if (ws.queued && queue[ws.queued] === ws) delete queue[ws.queued];
  ws.queued = 0;
  if (ws.pending) { pending.delete(ws.pending); ws.pending = 0; }
  const g = ws.game;
  if (g) endGame(g, { winner: g.players.X === ws ? 'O' : 'X', reason: 'left' });
}

setInterval(() => { // one shared clock for every game
  for (const g of games) {
    if (--g.left <= 0) { g.turn = g.turn === 'X' ? 'O' : 'X'; g.left = g.time; }
    both(g, { t: 'turn', turn: g.turn, left: g.left });
  }
}, 1000);

new WebSocketServer({ server }).on('connection', ws => {
  ws.on('close', () => leave(ws));
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'move') return move(ws, m.x, m.y);
    if (m.t === 'leave') return leave(ws);
    if (ws.game || ws.queued || ws.pending) return; // already busy
    if (m.t === 'quick' && TIMES.includes(m.time)) {
      const w = queue[m.time];
      if (w && w.readyState === 1) { delete queue[m.time]; w.queued = 0; startGame(w, ws, m.time); }
      else { queue[m.time] = ws; ws.queued = m.time; send(ws, { t: 'waiting' }); }
    } else if (m.t === 'create' && TIMES.includes(m.time)) {
      const code = newCode(); pending.set(code, { ws, time: m.time }); ws.pending = code;
      send(ws, { t: 'waiting', code });
    } else if (m.t === 'join') {
      const p = pending.get(String(m.code || '').trim().toUpperCase());
      if (!p) return send(ws, { t: 'error', msg: 'Room not found' });
      pending.delete(p.ws.pending); p.ws.pending = 0;
      startGame(p.ws, ws, p.time);
    }
  });
});

server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
