"use strict";

const DOMAIN = "websockettictactoe.co.uk"; // set to "127.0.0.1" or your servers ip/domain name if you want to host your own server you will need to change wss to ws as well unless you have a certificate
const PORT = "6080";

let websocket = new WebSocket(`wss://${DOMAIN}:${PORT}/`);

websocket.onmessage = function (event)
{
    const data = JSON.parse(event.data);
    switch (data.type) 
    {
        case 'leave':
            delete players[data.name];
            break;
        case 'update':
            Object.keys(data.players).forEach(name => {
                if (players.hasOwnProperty(name)) {
                    players[name].paths = players[name].paths.concat(data.players[name]);
                }
                else {
                    players[name] = new AnimatedSprit(790, 645, animations, "idleDown", time);
                    players[name].paths = players[name].paths.concat(data.players[name]);
                    players[name].paths[0].time = time;
                }
            })
            if (players.hasOwnProperty(player.name)) { delete players[player.name]; }
            break;
    }
}

let players = {};

let canvas = document.getElementById("game-canvas");
let ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// constants
const GAME_WIDTH =  960; // should be equal to or less than canvas width
const GAME_HEIGHT =  540; // should be equal to or less than canvas height

let dT = 0; // the time between frames in seconds
let paused = false; // controls wether the game is paused or not
let time = 0; // time in seconds

const background = new Image();
background.src = "./assets/pelletTown.png";

const idleSpriteSheet = [new Image()];
idleSpriteSheet[0].src = "./assets/player/playerIdleDown.png";

const runSpriteSheet = [new  Image(), new  Image(), new  Image(), new Image()];
runSpriteSheet[0].src = "./assets/player/playerUp.png";
runSpriteSheet[1].src = "./assets/player/playerDown.png";
runSpriteSheet[2].src = "./assets/player/playerLeft.png";
runSpriteSheet[3].src = "./assets/player/playerRight.png";
const scale = 3;
const animations = {
    runUp: new Animation(0, 0, 20, 30, time, 4, scale, 0.2, 0, runSpriteSheet[0], [], true),
    runDown: new Animation(0, 0, 20, 30, time, 4, scale, 0.2, 0, runSpriteSheet[1], [], true),
    runLeft: new Animation(0, 0, 20, 30, time, 4, scale, 0.2, 0, runSpriteSheet[2], [], true),
    runRight: new Animation(0, 0, 20, 30, time, 4, scale, 0.2, 0, runSpriteSheet[3], [], true),
    idleDown: new Animation(0, 0, 20, 30, time, 2, scale, 0.4, 0, idleSpriteSheet[0], [], true),
};

const player = new AnimatedSprit(790, 645, animations, "runDown", time);

// intial setup
function setup()
{
    document.addEventListener("keydown", keyPressed);
    document.addEventListener("keyup", keyUp);
    
    window.requestAnimationFrame(loop);
}

const directions = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
}
// physics update
function update(dT)
{
    Object.keys(players).forEach(playerName => players[playerName].updateFromPaths(dT, time));
    player.update(dT, time, websocket, directions);
}

// draw update
function draw(dT)
{
    colorRect(ctx, 0, 0, canvas.width, canvas.height, "#444444")
    ctx.drawImage(background, player.x, player.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    Object.keys(players).forEach(playerName => players[playerName].draw(ctx, time, false, player.x, player.y));
    player.draw(ctx, time, true);
}

// game loop
let oldTimeStamp = 0;
function loop(timeStamp)
{
    dT = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    if (!isNaN(dT))
    {
        time += dT;
    }

    if (!paused)
    {
        update(dT);
    }

    draw(dT)

    window.requestAnimationFrame(loop);
}

setup();

// keyboard input
let upKeyDown = false;
let downKeyDown = false;
let rightKeyDown = false;
let leftKeyDown = false;
let spaceKeyDown = false;
let enterKeyDown = false;
let zeroKeyDown = false;
let oneKeyDown = false;

function keyUp(evt)
{
    let updatePath = false;
    switch(evt.keyCode)
    {
        case 13:
            enterKeyDown = false;
            break;
        case 32:
            spaceKeyDown = false;
            break;
        case 37:
            player.left = 0;
            updatePath = true;
            leftKeyDown = false;
            break;
        case 38:
            player.up = 0;
            updatePath = true;
            upKeyDown = false;
            break;
        case 39:
            player.right = 0;
            updatePath = true;
            rightKeyDown = false;
            break;
        case 40:
            player.down = 0;
            updatePath = true;
            downKeyDown = false;
            break;
        case 48:
            zeroKeyDown = false;
            break;
        case 49:
            oneKeyDown = false;
            break;
    }
    if (updatePath)
    {
        player.paths.push(player.getPath(time))
    }
}

function keyPressed(evt)
{   
    let updatePath = false;
    switch(evt.keyCode)
    {
        case 13:
            if (!enterKeyDown)
            {  
                paused = false;
                enterKeyDown = true;
            }
            break;
        case 32:
            if (!spaceKeyDown && !paused)
            {  
                spaceKeyDown = true;
            }
            break;
        case 37:
            if (!leftKeyDown && !paused)
            {  
                player.left = -1;
                updatePath = true;
                leftKeyDown = true;
            }
            break;
        case 38:
            if (!upKeyDown && !paused)
            {
                player.up = -1;
                updatePath = true;
                upKeyDown = true;
            }
            break;
        case 39:
            if (!rightKeyDown && !paused)
            {      
                player.right = 1;
                updatePath = true;       
                rightKeyDown = true;
            }
            break;
        case 40:
            if (!downKeyDown && !paused)
            {
                player.down = 1;
                updatePath = true;
                downKeyDown = true;
            }
            break;
        case 48:
            if (!zeroKeyDown && !paused)
            {
                zeroKeyDown = true;
            }
            break;
        case 49:
            if (!oneKeyDown && !paused)
            {
                oneKeyDown = true;
            }
            break;
    }
    if (updatePath)
    {
        player.paths.push(player.getPath(time))
    }
}