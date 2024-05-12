


const ws = new WebSocket("wss://localhost:9999/wss");




let players = {};

//listen for messages from the server
ws.addEventListener("message", (event) => {
    //parse the message
    // check if its a ping message

    const data = JSON.parse(event.data);
    //update the player's position in the players object
    // players[data.id] = data;
    if (!players[data.id]) {
        players[data.id] = data;
        players[data.id].currentAnimation = null;
    } else {
        Object.keys(data).forEach((key) => {
            players[data.id][key] = data[key];
            // set the time the message was received
            players[data.id].lastMessage = Date.now();
        });
    }

    if (data.CID === "True") {
        // remove the player from the players object
        delete players[data.id];
    }

});

let lastmove = [];
let move = [];


document.addEventListener("keydown", (event) => {

    // if the keydown isnt 87, 83, 65, or 68



    if (document.hasFocus()) {
    
    
    switch (event.keyCode) {
        case 87:
            if (move.includes("up")) {
                return;
            }
            move.push("up");
            break;
        case 83:
            if (move.includes("down")) {
                return;
            }
            move.push("down");
            break;
        case 65:
            if (move.includes("left")) {
                return;
            }
            move.push("left");
            break;
        case 68:
            if (move.includes("right")) {
                return;
            }
            move.push("right");
            break;
    }
    
    ws.send(JSON.stringify({ move }));



    
    }
    
});

window.addEventListener("keyup", (event) => {


        switch (event.keyCode) {
            case 87:
                move = move.filter((m) => m !== "up");
                break;
            case 83:
                move = move.filter((m) => m !== "down");
                break;
            case 65:
                move = move.filter((m) => m !== "left");
                break;
            case 68:
                move = move.filter((m) => m !== "right");
                break;
        }
    
    ws.send(JSON.stringify({ move }));
    
});


let bounds = [11, 10, 789, 575];

function moveLoop() {
    console.log(move)
    // foreach player in the players object
    for (const id in players) {
        const player = players[id];
        //foreach move in the player's move array
        player.x += player.velocity[0] * player.speed * 1/120;
        player.y += player.velocity[1] * player.speed * 1/120;
        if (player.x < bounds[0]) {
            player.x = bounds[0];
        }
        if (player.y < bounds[1]) {
            player.y = bounds[1];
        }
        if (player.x > bounds[2]) {
            player.x = bounds[2];
        }
        if (player.y > bounds[3]) {
            player.y = bounds[3];
        }
    }
    
}

function killLoop() {
    // if the player has not sent a message in the last 5 seconds
    Object.keys(players).forEach((id) => {
        if (players[id].lastMessage === undefined) {
            players[id].lastMessage = Date.now();
        }
        if (Date.now() - players[id].lastMessage > 5000) {
            players[id].CID = "True";
            
        }
    });
}


setInterval(killLoop, 1000 / 120);

setInterval(moveLoop, 1000 / 120);


const Application = PIXI.Application;
const Assets = PIXI.Assets;


const apple = new Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb
});

//add the canvas that pixi automatically created for you to the html document
document.body.appendChild(apple.view);
// center the canvas
apple.view.style.position = "absolute";
apple.view.style.left = "50%";
apple.view.style.top = "50%";
apple.view.style.transform = "translate(-50%, -50%)";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;





PIXI.Assets.load([
    "assets/final/color1.json"
]).then(() => {

    const animations = PIXI.Assets.cache.get("assets/final/color1.json").data.animations;

    function SetAnimation(character, animation) {
        character.textures = PIXI.AnimatedSprite.fromFrames(animations[animation]).textures;
        character.play();
    }

    apple.ticker.add(delta => {

        Object.keys(players).forEach((id) => {
            // check to see if the player has a sprite
            if (!players[id].sprite) {
                //create a new sprite
                const sprite = PIXI.AnimatedSprite.fromFrames(animations["Down/Idle"]);

                players[id].sprite = sprite;
                //set the sprite's anchor to the center
                players[id].sprite.anchor.set(0.5);
                //add the sprite to the stage
                players[id].sprite.play();
                players[id].sprite.animationSpeed = 1 / 24;  
                players[id].sprite.scale.set(2);
                apple.stage.addChild(players[id].sprite);
                

                
                
                
            }
            //update the sprite's position
            if (`${players[id].direction}/${players[id].animation}` !== players[id].currentAnimation) {
                SetAnimation(players[id].sprite, `${players[id].direction}/${players[id].animation}`);
                players[id].currentAnimation = `${players[id].direction}/${players[id].animation}`;
            }
            if (players[id].CID === "True") {
                apple.stage.removeChild(players[id].sprite);
                delete players[id];
                return;
            }
            players[id].sprite.x = players[id].x;
            players[id].sprite.y = players[id].y;

        });

    });




});













