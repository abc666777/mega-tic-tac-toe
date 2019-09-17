//YEET
NONE = 0;
START = 1;
PLAY = 2;
STOP = 3;
PAUSE = 4;
MENU = 5;
STATE = NONE;

PLAYER = 'X';
arrayValue = [];
initValue = 0;
boxCount = 225;

TIME = 0;
COUTER = 0;
//Page
menuPage = document.getElementById('menuPause');
startPage = document.getElementById('start-page');
menuMode = document.getElementById('menu');
playPage = document.getElementById('play-page');
winner = document.getElementById('winner');

BGM = new sound('bgm.mp3');
SFX = new sound('sfx.wav');


if (BGM.duration > 0 && !BGM.paused) {

} else {
    BGM.play();
}

window.onload = init(NONE, 0)

function init(state, time) {
    TIME = time;
    COUTER = time;
    //Make Open page
    if (state == NONE) {
        menuPage.style.display = 'none';
        startPage.style.display = 'flex';
        menuMode.style.display = 'none';
        playPage.style.display = 'none';
        winner.style.display = 'none';
    }
    if (state == START) {
        //scene Make Table
        menuPage.style.display = 'none';
        startPage.style.display = 'none';
        menuMode.style.display = 'none';
        playPage.style.display = 'block';
        winner.style.display = 'none';
        setState(PLAY);
        let table = document.createElement('table');
        for (let i = 0; i < 15; i++) {
            let row = table.insertRow(-1);
            for (let j = 0; j < 15; j++) {
                let col = row.insertCell(-1);
                col.id = 'x' + i + 'y' + j;
                col.setAttribute('onclick', `clicked(PLAYER,${i},${j});`);
                col.classList.add('table-col');
            }
            for (let i = 0; i < 15; i++) {
                arrayValue[i] = [];
            }
            for (let i = 0; i < 15; i++) {
                for (let j = 0; j < 15; j++) {
                    arrayValue[i][j] = `${i}:${j}`;
                    initValue++;
                }
            }
        }
        //Set time counter
        turnManage(time);
        playTable.appendChild(table);
    }
    if (state == MENU) {
        BGM.play();
        menuPage.style.display = 'none';
        startPage.style.display = 'none';
        menuMode.style.display = 'flex';
        playPage.style.display = 'none';
        winner.style.display = 'none';
    }
}

function callPauseMenu(x) {
    if (x) {
        menuPage.style.display = 'flex';
        setState(PAUSE);
    } else {
        menuPage.style.display = 'none';
        setState(PLAY);
    }
}

function callWinner(x, player) {
    if (x) {
        winner.style.display = 'flex';
        setState(PAUSE);
    } else {
        winner.style.display = 'none';
        setState(PLAY);
    }
    winname.innerHTML = PLAYER + ' WIN!!';

}

function turnManage(time) {
    if (STATE == PLAY) {
        gameTime = setInterval(() => {
            setCounter();
        }, 1000);
    }
}

function gameStop(state) {
    clearInterval(gameTime);
    playTable.innerHTML = '';
    setTimeout(() => {
        init(state, 0);
    }, 100);
}

function setCounter() {
    if (STATE == PLAY) {
        COUTER--;
        if (COUTER <= 0) {
            COUTER = TIME
            toggleTurn();
        };
        timeCounter.innerHTML = `TIME: <b>${COUTER}</b>`
    }
}

//Gameplay 
function clicked(player, x, y) { //CLICKED FUNCTION
        SFX.play();
    if (document.getElementById(`x${x}y${y}`).innerText == '' && STATE == PLAY) {
        document.getElementById(`x${x}y${y}`).innerText = PLAYER;
        document.getElementById(`x${x}y${y}`).classList.add('addTotable');
        arrayValue[x][y] = PLAYER;
        COUTER = TIME;
        checkWinCon();
        toggleTurn();

    }
}

function toggleTurn() { //TOGGLE TURN
    if (PLAYER == 'X') { PLAYER = 'O'; }
    else { PLAYER = 'X'; }
    turn.innerHTML = `TURN OF <b>${PLAYER}</b>`
}

function checkWinCon() { //CHECK FOR WINNERS
    checkHorizontal();
    checkVerticle();
    checkLeftArc();
    checkRightArc();
}

function setState(arg) {
    STATE = arg;
}

function checkHorizontal() { //CHECK NAEW NORN
    if (STATE == PLAY) {
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 11; j++) {
                if (arrayValue[i][j] == arrayValue[i][j + 1] && arrayValue[i][j + 1] == arrayValue[i][j + 2]
                    && arrayValue[i][j + 2] == arrayValue[i][j + 3] && arrayValue[i][j + 3] == arrayValue[i][j + 4]) {
                    setState(STOP);
                    document.getElementById('x' + i + 'y' + j).style.backgroundColor = 'green';
                    document.getElementById('x' + i + 'y' + (j + 1)).style.backgroundColor = 'green';
                    document.getElementById('x' + i + 'y' + (j + 2)).style.backgroundColor = 'green';
                    document.getElementById('x' + i + 'y' + (j + 3)).style.backgroundColor = 'green';
                    document.getElementById('x' + i + 'y' + (j + 4)).style.backgroundColor = 'green';
                    callWinner(true, PLAYER);
                }
            }
        }
    }
}

function checkVerticle() { //CHECK NAEW TUNG
    if (STATE == PLAY) {
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 11; j++) {
                if (arrayValue[j][i] == arrayValue[j + 1][i] && arrayValue[j + 1][i] == arrayValue[j + 2][i]
                    && arrayValue[j + 2][i] == arrayValue[j + 3][i] && arrayValue[j + 3][i] == arrayValue[j + 4][i]) {
                    setState(STOP);
                    document.getElementById('x' + j + 'y' + i).style.backgroundColor = 'green';
                    document.getElementById('x' + (j + 1) + 'y' + i).style.backgroundColor = 'green';
                    document.getElementById('x' + (j + 2) + 'y' + i).style.backgroundColor = 'green';
                    document.getElementById('x' + (j + 3) + 'y' + i).style.backgroundColor = 'green';
                    document.getElementById('x' + (j + 4) + 'y' + i).style.backgroundColor = 'green';
                    callWinner(true, PLAYER)
                }
            }
        }
    }
}

function checkLeftArc() { //CHECK CHIANG SAI
    if (STATE == PLAY) {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if (arrayValue[i][j] == arrayValue[i + 1][j + 1] && arrayValue[i + 1][j + 1] == arrayValue[i + 2][j + 2]
                    && arrayValue[i + 2][j + 2] == arrayValue[i + 3][j + 3] && arrayValue[i + 3][j + 3] == arrayValue[i + 4][j + 4]) {
                    setState(STOP);
                    document.getElementById('x' + i + 'y' + j).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 1) + 'y' + (j + 1)).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 2) + 'y' + (j + 2)).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 3) + 'y' + (j + 3)).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 4) + 'y' + (j + 4)).style.backgroundColor = 'green';
                    callWinner(true, PLAYER)
                }
            }
        }
    }
}

function checkRightArc() { //CHECK CHIANG SAI
    if (STATE == PLAY) {
        for (let i = 0; i < 11; i++) {
            for (let j = 4; j < 15; j++) {
                if (arrayValue[i][j] == arrayValue[i + 1][j - 1] && arrayValue[i + 1][j - 1] == arrayValue[i + 2][j - 2]
                    && arrayValue[i + 2][j - 2] == arrayValue[i + 3][j - 3] && arrayValue[i + 3][j - 3] == arrayValue[i + 4][j - 4]) {
                    setState(STOP);
                    document.getElementById('x' + i + 'y' + j).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 1) + 'y' + (j - 1)).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 2) + 'y' + (j - 2)).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 3) + 'y' + (j - 3)).style.backgroundColor = 'green';
                    document.getElementById('x' + (i + 4) + 'y' + (j - 4)).style.backgroundColor = 'green';
                    callWinner(true, PLAYER)
                }
            }
        }
    }
}

function sound(src) { //ADD AUDIO TAG
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () { //BGM.play(); START BGM MUSIC
        playSound = this.sound.play(); //ERROR HANDLER (For Chrome Policy)
        if (playSound !== undefined) {
            playSound.then(_ => { }).catch(error => { });
        }
    }
    this.stop = function () { //BGM.stop();
        this.sound.pause();
    }
}
