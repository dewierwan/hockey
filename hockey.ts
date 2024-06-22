<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Table Hockey</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        .game-container {
            width: 400px;
            height: 400px;
            margin: 20px auto;
            position: relative;
            border: 2px solid #000;
            overflow: hidden;
        }
        .puck {
            width: 20px;
            height: 20px;
            background-color: black;
            border-radius: 50%;
            position: absolute;
        }
        .player {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            position: absolute;
        }
        .player.player1 { background-color: blue; }
        .player.player2 { background-color: red; }
        .controller {
            margin-top: 20px;
        }
        .controller button {
            margin-right: 10px;
            padding: 10px 20px;
            font-size: 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
        .controller button:hover {
            background-color: #45a049;
        }
        #scoreBoard {
            font-size: 24px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Table Hockey</h1>
    <div class="game-container" id="gameContainer">
        <div class="puck" id="puck"></div>
        <div class="player player1" id="player1"></div>
        <div class="player player2" id="player2"></div>
    </div>
    <div class="controller">
        <button id="startButton">Start Game</button>
        <button id="resetButton">Reset Game</button>
    </div>
    <div id="scoreBoard">
        <span id="player1Score">0</span> - <span id="player2Score">0</span>
    </div>

    <script>
        const gameContainer = document.getElementById('gameContainer');
        const puck = document.getElementById('puck');
        const player1 = document.getElementById('player1');
        const player2 = document.getElementById('player2');
        const startButton = document.getElementById('startButton');
        const resetButton = document.getElementById('resetButton');
        const player1ScoreElement = document.getElementById('player1Score');
        const player2ScoreElement = document.getElementById('player2Score');

        let isGameStarted = false;
        let player1Score = 0;
        let player2Score = 0;
        let puckVelocity = { x: 0, y: 0 };
        let lastTimestamp = 0;

        const CONTAINER_WIDTH = 400;
        const CONTAINER_HEIGHT = 400;
        const PLAYER_SIZE = 50;
        const PUCK_SIZE = 20;

        function initializePositions() {
            puck.style.left = `${CONTAINER_WIDTH / 2 - PUCK_SIZE / 2}px`;
            puck.style.top = `${CONTAINER_HEIGHT / 2 - PUCK_SIZE / 2}px`;
            player1.style.left = '10px';
            player1.style.top = '10px';
            player2.style.left = `${CONTAINER_WIDTH - PLAYER_SIZE - 10}px`;
            player2.style.top = `${CONTAINER_HEIGHT - PLAYER_SIZE - 10}px`;
        }

        function startGame() {
            if (!isGameStarted) {
                isGameStarted = true;
                puckVelocity = { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 };
                requestAnimationFrame(gameLoop);
            }
        }

        function resetGame() {
            isGameStarted = false;
            initializePositions();
            updateScore();
        }

        function gameLoop(timestamp) {
            if (!isGameStarted) return;

            const deltaTime = (timestamp - lastTimestamp) / 16; // Normalize to ~60 FPS
            lastTimestamp = timestamp;

            movePuck(deltaTime);
            movePlayer2(deltaTime);
            checkCollisions();
            checkScore();

            requestAnimationFrame(gameLoop);
        }

        function movePuck(deltaTime) {
            let left = parseFloat(puck.style.left);
            let top = parseFloat(puck.style.top);

            left += puckVelocity.x * deltaTime;
            top += puckVelocity.y * deltaTime;

            // Bounce off walls
            if (left <= 0 || left >= CONTAINER_WIDTH - PUCK_SIZE) {
                puckVelocity.x *= -1;
                left = Math.max(0, Math.min(left, CONTAINER_WIDTH - PUCK_SIZE));
            }
            if (top <= 0 || top >= CONTAINER_HEIGHT - PUCK_SIZE) {
                puckVelocity.y *= -1;
                top = Math.max(0, Math.min(top, CONTAINER_HEIGHT - PUCK_SIZE));
            }

            puck.style.left = `${left}px`;
            puck.style.top = `${top}px`;
        }

        function movePlayer1(event) {
            if (!isGameStarted) return;
            const speed = 10;
            let left = parseFloat(player1.style.left);
            let top = parseFloat(player1.style.top);

            switch (event.key) {
                case 'ArrowLeft': left = Math.max(0, left - speed); break;
                case 'ArrowRight': left = Math.min(CONTAINER_WIDTH - PLAYER_SIZE, left + speed); break;
                case 'ArrowUp': top = Math.max(0, top - speed); break;
                case 'ArrowDown': top = Math.min(CONTAINER_HEIGHT - PLAYER_SIZE, top + speed); break;
            }

            player1.style.left = `${left}px`;
            player1.style.top = `${top}px`;
        }

        function movePlayer2(deltaTime) {
            const speed = 3 * deltaTime;
            let left = parseFloat(player2.style.left);
            let top = parseFloat(player2.style.top);
            const puckLeft = parseFloat(puck.style.left);
            const puckTop = parseFloat(puck.style.top);

            if (puckLeft < left) left = Math.max(0, left - speed);
            if (puckLeft > left) left = Math.min(CONTAINER_WIDTH - PLAYER_SIZE, left + speed);
            if (puckTop < top) top = Math.max(0, top - speed);
            if (puckTop > top) top = Math.min(CONTAINER_HEIGHT - PLAYER_SIZE, top + speed);

            player2.style.left = `${left}px`;
            player2.style.top = `${top}px`;
        }

        function checkCollisions() {
            const puckRect = puck.getBoundingClientRect();
            const player1Rect = player1.getBoundingClientRect();
            const player2Rect = player2.getBoundingClientRect();

            if (isColliding(puckRect, player1Rect) || isColliding(puckRect, player2Rect)) {
                // Reverse puck direction and add some randomness
                puckVelocity.x *= -1.1;
                puckVelocity.y *= -1.1;
                puckVelocity.x += (Math.random() - 0.5) * 2;
                puckVelocity.y += (Math.random() - 0.5) * 2;
            }
        }

        function isColliding(rect1, rect2) {
            return !(rect1.right < rect2.left || 
                     rect1.left > rect2.right || 
                     rect1.bottom < rect2.top || 
                     rect1.top > rect2.bottom);
        }

        function checkScore() {
            const puckLeft = parseFloat(puck.style.left);
            const puckTop = parseFloat(puck.style.top);

            if (puckLeft <= 0) {
                player2Score++;
                endRound();
            } else if (puckLeft >= CONTAINER_WIDTH - PUCK_SIZE) {
                player1Score++;
                endRound();
            }
        }

        function endRound() {
            isGameStarted = false;
            updateScore();
            initializePositions();
        }

        function updateScore() {
            player1ScoreElement.textContent = player1Score;
            player2ScoreElement.textContent = player2Score;
        }

        // Event Listeners
        startButton.addEventListener('click', startGame);
        resetButton.addEventListener('click', resetGame);
        document.addEventListener('keydown', movePlayer1);

        // Initialize the game
        initializePositions();
    </script>
</body>
</html>