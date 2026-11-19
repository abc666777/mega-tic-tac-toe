const N = 15;
const $ = id => document.getElementById(id);
const SCREENS = ['start-page', 'menu', 'lobby', 'waiting', 'play-page'];
const sfx = new Audio('sfx.wav'), bgm = new Audio('bgm.mp3');
bgm.loop = true;
const play = a => { a.currentTime = 0; a.play().catch(() => {}); }; // ignore autoplay-policy errors

// When the page is on GitHub Pages, set this to your deployed Node server (wss://...).
const REMOTE_SERVER = 'wss://mega-tic-tac-toe.onrender.com';
const SERVER_URL = location.hostname.endsWith('github.io')
  ? REMOTE_SERVER
  : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;

let ws, me, turn, over = true, time = 30;

const show = name => SCREENS.forEach(s => { $(s).hidden = s !== name; });

function send(m) {
  const go = () => ws.send(JSON.stringify(m));
  if (ws && ws.readyState === 1) return go();
  if (ws && ws.readyState === 0) return ws.addEventListener('open', go, { once: true });
  let opened = false;
  try { ws = new WebSocket(SERVER_URL); }
  catch { return fail('Invalid server address in game.js'); }
  ws.onopen = () => { opened = true; go(); };
  ws.onmessage = e => handle(JSON.parse(e.data));
  ws.onclose = () => {
    if (!opened) fail('Cannot reach the game server. Check REMOTE_SERVER in game.js and that the server is running.');
    else if (!$('waiting').hidden) fail('Disconnected from server');
    else if (!over) finish({ reason: 'disconnect' });
  };
}
const fail = msg => { show('lobby'); $('msg').textContent = msg; };
const leave = () => { over = true; if (ws && ws.readyState === 1) ws.send('{"t":"leave"}'); };

function handle(m) {
  switch (m.t) {
    case 'waiting': $('roomcode').textContent = m.code ? `CODE: ${m.code}` : 'FINDING PLAYER...'; show('waiting'); break;
    case 'error': $('msg').textContent = m.msg; break;
    case 'start': startGame(m); break;
    case 'move': place(m.x, m.y, m.p); break;
    case 'turn': setTurn(m.turn, m.left); break;
    case 'end': finish(m); break;
  }
}

function startGame(m) {
  me = m.you; over = false;
  let html = '<table>';
  for (let i = 0; i < N; i++) {
    html += '<tr>';
    for (let j = 0; j < N; j++) html += `<td class="table-col" id="x${i}y${j}" data-x="${i}" data-y="${j}"></td>`;
    html += '</tr>';
  }
  $('playTable').innerHTML = html + '</table>';
  setTurn('X', m.time);
  show('play-page');
  play(sfx);
}

function setTurn(t, left) {
  turn = t;
  $('turn').innerHTML = `TURN OF <b>${t}</b>${t === me ? ' (YOU)' : ''}`;
  $('timeCounter').innerHTML = `TIME: <b>${left}</b>`;
}

function place(x, y, p) {
  const c = $(`x${x}y${y}`);
  c.innerHTML = `<div>${p}</div>`;
  c.classList.add('addTotable');
  play(sfx);
}

function finish(m) {
  over = true;
  $('winname').textContent = m.reason === 'disconnect' ? 'DISCONNECTED'
    : m.draw ? 'DRAW!'
    : m.reason === 'left' ? 'OPPONENT LEFT' : m.winner === me ? 'YOU WIN!!' : 'YOU LOSE';
  (m.line || []).forEach(([x, y]) => { $(`x${x}y${y}`).style.backgroundColor = 'green'; });
  $('menuPause').hidden = true;
  $('winner').hidden = false;
  play(sfx);
}

function reset(screen) {
  leave();
  $('playTable').innerHTML = '';
  $('winner').hidden = $('menuPause').hidden = true;
  $('msg').textContent = '';
  show(screen);
}

const actions = {
  start: () => { bgm.play().catch(() => {}); reset('menu'); },
  time: el => { time = +el.dataset.v; show('lobby'); },
  quick: () => send({ t: 'quick', time }),
  create: () => send({ t: 'create', time }),
  join: () => send({ t: 'join', code: $('code').value }),
  cancel: () => reset('lobby'),
  pause: () => { $('menuPause').hidden = false; }, // online games can't be paused, only the menu opens
  resume: () => { $('menuPause').hidden = true; },
  mode: () => reset('menu'),
  exit: () => reset('start-page'),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  play(sfx);
  actions[el.dataset.a](el);
});

$('playTable').addEventListener('click', e => { // one listener for all 225 cells
  const c = e.target.closest('td');
  if (c && !over && turn === me && !c.textContent) send({ t: 'move', x: +c.dataset.x, y: +c.dataset.y });
});