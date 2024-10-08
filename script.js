const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const welcomePopup = document.getElementById('welcomePopup');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const overlay = document.getElementById('overlay');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const crab = {
    x: 50,
    y: canvas.height - 100,
    width: 60,  // Reduced width
    height: 45, // Reduced height
    speed: 5
};

let obstacles = [];
let score = 0;
let gameOver = false;
let gameSpeed = 5; // Increased initial game speed
let gameStarted = false;
let isPaused = false;

const bubbles = Array(20).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 5 + 2,
    speed: Math.random() * 2 + 1
}));

const keys = {
    ArrowUp: false,
    ArrowDown: false
};

function drawCrab() {
    const centerX = crab.x + crab.width / 2;
    const centerY = crab.y + crab.height / 2;
    
    // Body
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, crab.width / 2, crab.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY - 8, 4, 0, Math.PI * 2);
    ctx.arc(centerX + 12, centerY - 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Claws
    ctx.fillStyle = '#FF6347';
    // Left claw
    ctx.beginPath();
    ctx.moveTo(centerX - crab.width / 2, centerY);
    ctx.lineTo(centerX - crab.width / 2 - 15, centerY - 10);
    ctx.lineTo(centerX - crab.width / 2 - 15, centerY + 10);
    ctx.closePath();
    ctx.fill();
    // Right claw
    ctx.beginPath();
    ctx.moveTo(centerX + crab.width / 2, centerY);
    ctx.lineTo(centerX + crab.width / 2 + 15, centerY - 10);
    ctx.lineTo(centerX + crab.width / 2 + 15, centerY + 10);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#FF6347';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        // Left legs
        ctx.beginPath();
        ctx.moveTo(centerX - crab.width / 3, centerY + i * 8 - 8);
        ctx.lineTo(centerX - crab.width / 2 - 12, centerY + i * 15 - 15);
        ctx.stroke();
        // Right legs
        ctx.beginPath();
        ctx.moveTo(centerX + crab.width / 3, centerY + i * 8 - 8);
        ctx.lineTo(centerX + crab.width / 2 + 12, centerY + i * 15 - 15);
        ctx.stroke();
    }
}

function drawSeaweed(obstacle) {
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(obstacle.x, canvas.height);
    for (let i = 0; i < 3; i++) {
        ctx.quadraticCurveTo(
            obstacle.x + 25 * Math.sin(i * 0.5 + obstacle.x * 0.1),
            canvas.height - (i + 1) * obstacle.height / 3,
            obstacle.x,
            canvas.height - (i + 1) * obstacle.height / 3
        );
    }
    ctx.lineTo(obstacle.x + obstacle.width, canvas.height - obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw highlights
    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 10, canvas.height);
    for (let i = 0; i < 3; i++) {
        ctx.quadraticCurveTo(
            obstacle.x + 35 * Math.sin(i * 0.5 + obstacle.x * 0.1),
            canvas.height - (i + 1) * obstacle.height / 3,
            obstacle.x + 10,
            canvas.height - (i + 1) * obstacle.height / 3
        );
    }
    ctx.stroke();
}

function drawStarfish(obstacle) {
    const centerX = obstacle.x + obstacle.width / 2;
    const centerY = obstacle.y + obstacle.height / 2;
    const outerRadius = (obstacle.width / 2) * obstacle.pulseFactor;
    const innerRadius = outerRadius / 2;

    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const outerAngle = i * 4 * Math.PI / 5;
        const innerAngle = outerAngle + Math.PI / 5;
        
        ctx.lineTo(
            centerX + Math.cos(outerAngle) * outerRadius,
            centerY + Math.sin(outerAngle) * outerRadius
        );
        ctx.lineTo(
            centerX + Math.cos(innerAngle) * innerRadius,
            centerY + Math.sin(innerAngle) * innerRadius
        );
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add texture
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = i * 4 * Math.PI / 5;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * outerRadius,
            centerY + Math.sin(angle) * outerRadius
        );
    }
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawJellyfish(obstacle) {
    const centerX = obstacle.x + obstacle.width / 2;
    const centerY = obstacle.y + obstacle.height / 7;  // Adjusted for taller jellyfish
    
    // Draw body
    ctx.beginPath();
    ctx.moveTo(centerX - obstacle.width / 2, centerY);
    ctx.quadraticCurveTo(centerX, centerY - obstacle.height / 3, centerX + obstacle.width / 2, centerY);
    ctx.quadraticCurveTo(centerX, centerY + obstacle.height / 6, centerX - obstacle.width / 2, centerY);
    ctx.fillStyle = 'rgba(255, 182, 193, 0.7)';
    ctx.fill();

    // Draw tentacles
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const startX = centerX - obstacle.width / 2 + (i + 1) * obstacle.width / 6;
        ctx.moveTo(startX, centerY);
        ctx.quadraticCurveTo(
            startX + 10 * Math.sin(Date.now() * 0.01 + i),
            centerY + obstacle.height / 2,
            startX + 5 * Math.sin(Date.now() * 0.01 + i),
            obstacle.y + obstacle.height  // Extend tentacles to full height
        );
    }
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        switch(obstacle.type) {
            case 'seaweed':
                drawSeaweed(obstacle);
                break;
            case 'starfish':
                drawStarfish(obstacle);
                break;
            case 'jellyfish':
                drawJellyfish(obstacle);
                break;
        }
    });
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
        if (obstacle.type === 'starfish') {
            if (!obstacle.pulseOffset) {
                obstacle.pulseOffset = Math.random() * Math.PI * 2; // Random start point for the pulse
            }
            obstacle.pulseFactor = Math.sin(Date.now() * 0.005 + obstacle.pulseOffset) * 0.1 + 1; // Oscillates between 0.9 and 1.1
        }
    });

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
        const obstacleTypes = ['seaweed', 'starfish', 'jellyfish'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        let newObstacle;

        switch(type) {
            case 'seaweed':
                newObstacle = {
                    x: canvas.width,
                    y: canvas.height - 70,  // Place seaweed at the bottom, above the increased sand height
                    width: 50,
                    height: 300 + Math.random() * 100,
                    type: 'seaweed'
                };
                break;
            case 'starfish':
                newObstacle = {
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 170) + 10,  // Adjust for bigger starfish
                    width: 125,  // Increased starfish width
                    height: 125,  // Increased starfish height
                    type: 'starfish'
                };
                break;
            case 'jellyfish':
                newObstacle = {
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 300),  // Adjusted for taller jellyfish
                    width: 80,
                    height: 200,  // Increased jellyfish height
                    type: 'jellyfish'
                };
                break;
        }
        obstacles.push(newObstacle);
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    return obstacles.some(obstacle => {
        let crabHitbox = {
            x: crab.x ,
            y: crab.y ,
            width: crab.width ,
            height: crab.height
        };

        if (obstacle.type === 'jellyfish') {
            // Create two hitboxes for jellyfish: one for body and one for tentacles
            let jellyfishBodyHitbox = {
                x: obstacle.x + obstacle.width * 0.25,
                y: obstacle.y,
                width: obstacle.width * 0.5,
                height: obstacle.height
            };
            let jellyfishTentaclesHitbox = {
                x: obstacle.x,
                y: obstacle.y + obstacle.height * 0.4,
                width: obstacle.width,
                height: obstacle.height * 0.6
            };

            // Check collision with jellyfish body
            if (crabHitbox.x < jellyfishBodyHitbox.x + jellyfishBodyHitbox.width &&
                crabHitbox.x + crabHitbox.width > jellyfishBodyHitbox.x &&
                crabHitbox.y < jellyfishBodyHitbox.y + jellyfishBodyHitbox.height &&
                crabHitbox.y + crabHitbox.height > jellyfishBodyHitbox.y) {
                return true;
            }

            // Check collision with jellyfish tentacles
            if (crabHitbox.x < jellyfishTentaclesHitbox.x + jellyfishTentaclesHitbox.width &&
                crabHitbox.x + crabHitbox.width > jellyfishTentaclesHitbox.x &&
                crabHitbox.y < jellyfishTentaclesHitbox.y + jellyfishTentaclesHitbox.height &&
                crabHitbox.y + crabHitbox.height > jellyfishTentaclesHitbox.y) {
                return true;
            }

            return false;
        }

        if (obstacle.type === 'starfish') {
            let starfishHitbox = {
                x: (obstacle.x + obstacle.width * (1 - obstacle.pulseFactor) / 2),
                y: (obstacle.y + obstacle.height * (1 - obstacle.pulseFactor) / 2),
                width: (obstacle.width * obstacle.pulseFactor),
                height: obstacle.height * obstacle.pulseFactor
            };

            return crabHitbox.x < starfishHitbox.x + starfishHitbox.width &&
                   crabHitbox.x + crabHitbox.width > starfishHitbox.x &&
                   crabHitbox.y < starfishHitbox.y + starfishHitbox.height &&
                   crabHitbox.y + crabHitbox.height > starfishHitbox.y;
        }

        let obstacleHitbox = {
            x: obstacle.x,
            y: obstacle.y,
            width: obstacle.width,
            height: obstacle.height
        };

        if (obstacle.type === 'seaweed') {
            obstacleHitbox.y = canvas.height - obstacle.height;
        }

        return crabHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
               crabHitbox.x + crabHitbox.width > obstacleHitbox.x &&
               crabHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
               crabHitbox.y + crabHitbox.height > obstacleHitbox.y;
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 40);
}

function drawBackground() {
    ctx.fillStyle = '#F4A460';
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70);  // Increased sand height to 70px

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        bubble.y -= bubble.speed;
        if (bubble.y + bubble.radius < 0) {
            bubble.y = canvas.height + bubble.radius;
            bubble.x = Math.random() * canvas.width;
        }
    });
}

function updateDifficulty() {
    gameSpeed = 5 + Math.floor(score / 500) * 0.5; // Adjusted base speed
    crab.speed = 6 + Math.floor(score / 1000); // Increased crab speed
}

function moveCrab() {
    if (keys.ArrowUp && crab.y > 0) {
        crab.y -= crab.speed;
    }
    if (keys.ArrowDown && crab.y < canvas.height - crab.height - 70) {
        crab.y += crab.speed;
    }
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw "Paused" text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Paused', canvas.width / 2 - 86, canvas.height / 2 - 50);
    
    // Draw resume button
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 10, 120, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Resume', canvas.width / 2 - 40, canvas.height / 2 + 35);

    // Add this line to set a custom attribute for the resume button area
    canvas.setAttribute('data-resume-button', `${canvas.width / 2 - 40},${canvas.height / 2 + 10},120,40`);
}

function countdown() {
    return new Promise(resolve => {
        let count = 3;
        const countdownInterval = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            drawCrab();
            drawObstacles();
            drawScore();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 72px Arial';
            ctx.fillText(count, canvas.width / 2 - 20, canvas.height / 2);
            
            count--;
            if (count < 0) {
                clearInterval(countdownInterval);
                resolve();
            }
        }, 1000);
    });
}

async function togglePause() {
    if (!gameStarted || gameOver) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.innerHTML = '<i class="fas fa-play"></i>';
        drawPauseOverlay();
    } else {
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        await countdown();
        gameLoop();
    }
}

function gameLoop() {
    if (!gameStarted || gameOver || isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground(); // Keep drawing the background with bubbles
    moveCrab();  // Add this line to update crab position every frame
    drawCrab();
    drawObstacles();
    moveObstacles();
    drawScore();
    updateDifficulty();

    if (checkCollision()) {
        gameOver = true;
        showGameOver();
    } else {
        score++;
    }

    requestAnimationFrame(gameLoop); // Keep the game loop running while the game is active
}

function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 140, canvas.height / 2 - 50);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 90, canvas.height / 2);
    
    const buttonX = canvas.width / 2 - 60;
    const buttonY = canvas.height / 2 + 30;
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonRadius = 20;

    const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
    gradient.addColorStop(0, '#32CD32');
    gradient.addColorStop(1, '#228B22');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(buttonX + buttonRadius, buttonY);
    ctx.lineTo(buttonX + buttonWidth - buttonRadius, buttonY);
    ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + buttonRadius);
    ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - buttonRadius);
    ctx.quadraticCurveTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - buttonRadius, buttonY + buttonHeight);
    ctx.lineTo(buttonX + buttonRadius, buttonY + buttonHeight);
    ctx.quadraticCurveTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - buttonRadius);
    ctx.lineTo(buttonX, buttonY + buttonRadius);
    ctx.quadraticCurveTo(buttonX, buttonY, buttonX + buttonRadius, buttonY);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Draw the "Retry" text
    ctx.shadowColor = 'transparent';  
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Retry', buttonX + buttonWidth / 2 - 25, buttonY + buttonHeight / 2 + 7);

    pauseButton.style.display = 'none'; // Hide pause button when game is over
}

function resetGame() {
    obstacles = [];
    score = 0;
    gameOver = false;
    gameSpeed = 5;
    crab.y = canvas.height - 100;
    gameLoop();
}

function showWelcomeMessage() {
    welcomePopup.style.display = 'block';
    overlay.style.display = 'block';
}

function hideWelcomeMessage() {
    welcomePopup.style.display = 'none';
    overlay.style.display = 'none';
}

function bubbleAnimationLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawBackground(); 
    if (!gameStarted || gameOver || isPaused) {
        requestAnimationFrame(bubbleAnimationLoop); 
    }
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bubbleAnimationLoop(); // Start the bubble animation as soon as the page loads
    showWelcomeMessage();
    pauseButton.style.display = 'none'; // Hide pause button initially
}

function startGame() {
    hideWelcomeMessage();
    gameStarted = true;
    gameOver = false;
    obstacles = [];
    score = 0;
    gameSpeed = 5;
    crab.y = canvas.height - 100;
    pauseButton.style.display = 'block'; // Show pause button when game starts
    gameLoop();
}

canvas.addEventListener('click', (event) => {
    if (gameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is within retry button
        if (x > canvas.width / 2 - 60 && x < canvas.width / 2 + 60 &&
            y > canvas.height / 2 + 30 && y < canvas.height / 2 + 70) {
            startGame();
        }
    } else if (isPaused) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is within resume button
        if (x > canvas.width / 2 - 60 && x < canvas.width / 2 + 60 &&
            y > canvas.height / 2 + 10 && y < canvas.height / 2 + 50) {
            togglePause();
        }
    }
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPaused) {
        const [buttonX, buttonY, buttonWidth, buttonHeight] = canvas.getAttribute('data-resume-button').split(',').map(Number);
        
        if (x > buttonX && x < buttonX + buttonWidth &&
            y > buttonY && y < buttonY + buttonHeight) {
            canvas.classList.add('clickable');
        } else {
            canvas.classList.remove('clickable');
        }
    } else if (gameOver) {
        if (x > canvas.width / 2 - 60 && x < canvas.width / 2 + 60 &&
            y > canvas.height / 2 + 30 && y < canvas.height / 2 + 70) {
            canvas.classList.add('clickable');
        } else {
            canvas.classList.remove('clickable');
        }
    } else {
        canvas.classList.remove('clickable');
    }
});

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        keys[event.key] = false;
    }
});

init();