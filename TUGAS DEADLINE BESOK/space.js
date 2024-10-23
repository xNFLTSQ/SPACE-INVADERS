let tileSize = 30;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows; 
let context;

// space.js

// Function to start the game
function startGame() {
    // Hide buttons and show the game board
    document.getElementById('startButton').style.display = "none";
    document.getElementById('highScoresButton').style.display = "none";
    document.getElementById('creditsButton').style.display = "none";

    // Display a message indicating the game is starting
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = "Game is starting...";
    messageDiv.style.display = "block";

    // Here you would add the logic to initialize and start the game
    // For example, you might call a function that sets up the game state
    // initializeGame();
}

// Function to display high scores
function viewHighScores() {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = "High Scores: \n1. Player1 - 1000\n2. Player2 - 800";
    messageDiv.style.display = "block";
}

// Function to display credits
function viewCredits() {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = "Credits: \nDeveloped by Your Name";
    messageDiv.style.display = "block";

// Ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
};

let shipImg;
let shipVelocityX = tileSize; // Ship speed

// Alien
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; 
let alienVelocityX = 1; // Alien speed

// Bullets
let bulletArray = [];
let bulletVelocityY = -10; // Bullet speed

let score = 0;
let gameOver = false;
let gameStarted = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); 

    // Load assets
    shipImg = new Image();
    shipImg.src = "spaceship.png";
    alienImg = new Image();
    alienImg.src = "./alien.png";

    document.getElementById("start-button").addEventListener("click", startGame);
}

function startGame() {
    document.getElementById("start-screen").classList.add('hidden');
    gameStarted = true;
    createAliens();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    if (!gameStarted || gameOver) {
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Draw ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Draw aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // If alien touches border
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                // Move all aliens down
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
                alert("Game Over! Your score: " + score);
            }
        }
    }

    // Draw bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Remove used bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // Remove the first element from the array
    }

    // Level up
    if (alienCount == 0) {
        score += alienColumns * alienRows * 100; // Bonus points
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4); 
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; 
        } else {
            alienVelocityX -= 0.2; 
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Display score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText("Score: " + score, 5, 20);
}

function moveShip(e) {
    if (!gameStarted || gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; 
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; 
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (!gameStarted || gameOver) {
        return;
    }

    if (e.code == "Space") {
        // Shoot
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;  
}