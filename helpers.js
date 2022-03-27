"use strict";

class AnimatedSprit
{
    constructor (x, y, animations, state, time)
    {
        this.x = x;
        this.y = y;
        this.animations = animations;
        this.state = state;
        this.speed = 300;
        this.up = 0;
        this.down = 0;
        this.left = 0;
        this.right = 0;
        this.direction = "down";
        this.name = Math.random();
        this.paths = [];
        this.lastTimePathTime = time;
        this.sentName = false;
    }

    draw(ctx, time, fixed, playerX, playerY)
    {
        if (fixed)
        {
            this.animations[this.state].x = (canvas.width / 2) - 30;
            this.animations[this.state].y =  (canvas.height / 2) - 45;
        }
        else
        {
            this.animations[this.state].x = this.x - playerX + ((canvas.width / 2) - 30);
            this.animations[this.state].y = this.y - playerY + ((canvas.height / 2) - 45);
        }

        this.animations[this.state].animate(ctx, time);
    }

    update(dT, time, websocket)
    {
        if (this.left + this.right > 0)
        {
            this.state = "runRight";
            this.direction = "Right";
        }
        else if (this.left + this.right < 0)
        {
            this.state = "runLeft";
            this.direction = "Left";

        }
        else if (this.up + this.down > 0)
        {
            this.state = "runDown";
            this.direction = "Down";

        }
        else if (this.up + this.down < 0)
        {
            this.state = "runUp";
            this.direction = "Up";
        }
        else 
        {
            this.state = "idleDown";
        }

        this.x += dT * this.speed * (this.left + this.right);
        this.y += dT * this.speed * (this.up + this.down);

        if (websocket !== false && websocket.readyState === 1 && (this.paths.length > 0 || !this.sentName))
        {
            websocket.send(JSON.stringify({ action: 'move', "name": this.name, "paths": this.paths}));
            this.sentName = true;
            this.lastTimePathSent = time;
            this.paths = [];
        }
    }

    updateFromPaths(dT, time)
    {
        while (this.paths.length > 1 && this.paths[0].time + this.paths[1].deltaFromLastPath <= time)
        {
            this.paths[1].actualTime = this.paths[0].actualTime + this.paths[1].deltaFromLastPath;
            this.paths.shift();
            this.paths[0].time = time - this.paths[0].actualTime < 0.5 ? time : this.paths[0].actualTime;
            this.x = this.paths[0].x;
            this.y = this.paths[0].y;
            this.left = this.paths[0].left;
            this.right = this.paths[0].right;
            this.up = this.paths[0].up;
            this.down = this.paths[0].down;
        }

        
        if (this.left + this.right > 0)
        {
            this.state = "runRight";
            this.direction = "Right";
        }
        else if (this.left + this.right < 0)
        {
            this.state = "runLeft";
            this.direction = "Left";

        }
        else if (this.up + this.down > 0)
        {
            this.state = "runDown";
            this.direction = "Down";

        }
        else if (this.up + this.down < 0)
        {
            this.state = "runUp";
            this.direction = "Up";
        }
        else 
        {
            this.state = "idleDown";
        }

        this.x += dT * this.speed * (this.left + this.right);
        this.y += dT * this.speed * (this.up + this.down);
    }

    getPath(time)
    {
        const path = {
            actualTime: time,
            time: time,
            deltaFromLastPath: time - this.lastTimePathTime,
            x: this.x,
            y: this.y,
            up: this.up,
            down: this.down,
            left: this.left,
            right: this.right,
            state: this.state,
        }
        this.lastTimePathTime = time;
        return path
    }
}

class Animation
{
    constructor (x, y, width, height, time, numberOfFrames, scale=1, interval=0.1, startingFrame=0, spriteSheet=null, sprites=new Array(), looping=false)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale
        this.time = time;
        this.numberOfFrames = numberOfFrames;
        
        this.interval = interval; // in seconds
        this.currentFrame = startingFrame;
        this.spriteSheet = spriteSheet;
        this.sprites = sprites;
        this.looping = looping;
    }

    animate(ctx, time)
    {
        if (this.time + this.interval <= time)
        {
            this.time = time;
            this.currentFrame += 1;
            
            if (this.looping) {this.currentFrame %= this.numberOfFrames}
            else {this.currentFrame = Math.min(this.currentFrame, this.numberOfFrames - 1)}
        }

        ctx.imageSmoothingEnabled = false;

        if (this.spriteSheet) 
        {
            ctx.drawImage(
                            this.spriteSheet,                                                               // sprite sheet
                            Math.floor(this.spriteSheet.width / this.numberOfFrames) * this.currentFrame,   // source x
                            0,                                                                              // source y
                            Math.floor(this.spriteSheet.width / this.numberOfFrames),                       // source width
                            this.spriteSheet.height,                                                        // source height
                            this.x,                                                                         // destination x
                            this.y,                                                                         // destination y
                            this.width * this.scale,                                                        // destination width
                            this.height * this.scale                                                        // destination height
                        );
        }
        else
        {
            ctx.drawImage(
                            this.sprites[this.currentFrame],  // sprite
                            this.x,                           // destination x
                            this.y,                           // destination y
                            this.width * this.scale,          // destination width
                            this.height * this.scale          // destination height
                        );
        }
    }
}

function drawScrollingBackground(ctx, background, x, y, width, height)
{
    let adjustedBackgroundWidth = background.width * (height / background.height); // scale the width to fit the canvas height
    x %= adjustedBackgroundWidth;
    ctx.imageSmoothingEnabled = false;
    for (let frameX = 0;  frameX <= width + adjustedBackgroundWidth;  frameX += adjustedBackgroundWidth)
    {
        ctx.drawImage(background, -x + frameX, y, adjustedBackgroundWidth, height);
    }
}

function colorRect(ctx, x, y, width, height, color)
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function colorRectBorder(ctx, x, y, width, height, thickness, color)
{
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.strokeRect(x, y, width, height)
}

function randomInt(min, max)
{
    return Math.floor(min + (Math.random() * (max - min)));
}

class Sound
{
    constructor (src)
    {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        // check if it works without the line below
        // document.body.appendChild(this.sound);
    }

    play()
    {
        this.sound.play();
    }

    stop()
    {
        this.sound.pause();
    }
    
    loop()
    {
        this.sound.loop = true;
    }

    mute()
    {
        this.sound.muted = true;
    }

    unmute()
    {
        this.sound.muted = false;
    }

}