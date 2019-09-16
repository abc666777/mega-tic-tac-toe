NONE = 0;
MENU = 5
START = 1;
PLAY = 2;
STOP = 3;
PAUSE = 4;

STATE = NONE;

PLAYER = 'X';
arrayValue = [];
initValue = 0;
boxCount = 225;
BGM = new sound('bgm.mp3');

SPACEBAR = 32 //KEYCODE
P = 80 //KEYCODE

document.body.onkeyup = function(e){
    if(e.keyCode == SPACEBAR && STATE == NONE){
        BGM.play();
        setState(MENU);
    }
    if(e.keyCode == P){
        BGM.stop();
    }
}

function init(state) {
    if (state == START) {
        //scene Make table
        setState(PLAY);
        document.getElementById('scene').innerHTML = "";
        let table = document.createElement('table');
        for (let i = 0; i < 15; i++) {
            let row = table.insertRow(-1);
            for (let j = 0; j < 15; j++) {
                let col = row.insertCell(-1);
                col.id = 'x' + i + 'y' + j;
                col.setAttribute('onclick', `clicked(PLAYER,${i},${j});`);
                col.classList.add('table-col');
            }
        }
        document.getElementById('scene').appendChild(table);
    }
    for (let i = 0; i < 15; i++){
        arrayValue[i] = [];
    }
    for (let i = 0; i < 15; i++){
        for(let j = 0; j < 15; j++){
            arrayValue[i][j] = `${i}:${j}`;
            initValue++;
        }
    }
}

function clicked(player, x, y){ //CLICKED FUNCTION
    if(document.getElementById(`x${x}y${y}`).innerText == '' && STATE == PLAY){
        document.getElementById(`x${x}y${y}`).innerText = PLAYER;
        arrayValue[x][y] = PLAYER;
        checkWinCon();
    }
    if(STATE == PLAY){
        toggleTurn();
    }
}

function toggleTurn(){ //TOGGLE TURN
    if(PLAYER == 'X'){PLAYER = 'O';}
    else{PLAYER = 'X';}
}

function checkWinCon(){ //CHECK FOR WINNERS
    checkHorizontal();
    checkVerticle();
    checkLeftArc();
    checkRightArc();
}

function setState(arg){
    STATE = arg;
}

function checkHorizontal(){ //CHECK NAEW NORN
    if(STATE == PLAY){
        for(let i = 0; i < 15; i++){
            for(let j = 0; j < 11; j++){
                if(arrayValue[i][j] == arrayValue[i][j+1] && arrayValue[i][j+1] == arrayValue[i][j+2] 
                    && arrayValue[i][j+2] == arrayValue[i][j+3] && arrayValue[i][j+3] == arrayValue[i][j+4])
                        {alert(PLAYER + ' WINS!');setState(STOP);}
            }
        }
    }
}

function checkVerticle(){ //CHECK NAEW TUNG
    if(STATE == PLAY){
        for(let i = 0; i < 15; i++){
            for(let j = 0; j < 11; j++){
                if(arrayValue[j][i] == arrayValue[j+1][i] && arrayValue[j+1][i] == arrayValue[j+2][i] 
                    && arrayValue[j+2][i] == arrayValue[j+3][i] && arrayValue[j+3][i] == arrayValue[j+4][i])
                        {alert(PLAYER + ' WINS!');setState(STOP);}
            }
        }
    }
}

function checkLeftArc(){ //CHECK CHIANG SAI
    if(STATE == PLAY){
        for(let i = 0; i < 11; i++){
            for(let j = 0; j < 11; j++){
                if(arrayValue[i][j] == arrayValue[i+1][j+1] && arrayValue[i+1][j+1] == arrayValue[i+2][j+2] 
                    && arrayValue[i+2][j+2] == arrayValue[i+3][j+3] && arrayValue[i+3][j+3] == arrayValue[i+4][j+4])
                        {alert(PLAYER + ' WINS!');setState(STOP);}
            }
        }
    }
}

function checkRightArc(){ //CHECK CHIANG SAI
    if(STATE == PLAY){
        for(let i = 0; i < 11; i++){
            for(let j = 4; j < 15; j++){
                if(arrayValue[i][j] == arrayValue[i+1][j-1] && arrayValue[i+1][j-1] == arrayValue[i+2][j-2] 
                    && arrayValue[i+2][j-2] == arrayValue[i+3][j-3] && arrayValue[i+3][j-3] == arrayValue[i+4][j-4])
                        {alert(PLAYER + ' WINS!');setState(STOP);}
            }
        }
    }
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        playSound = this.sound.play();
        if (playSound !== undefined) {
            playSound.then(_ => {}).catch(error => {});
        }
    }
    this.stop = function(){
        this.sound.pause();
    }
}
