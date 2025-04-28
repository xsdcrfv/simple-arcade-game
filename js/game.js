const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Make canvas responsive
function resizeCanvas() {
    const container = canvas.parentElement;
    const targetWidth = Math.min(container.clientWidth, 800);
    const scale = targetWidth / 800;
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${600 * scale}px`;
    canvas.width = 800;
    canvas.height = 600;
}

// Set initial canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    color: '#00ff00'
};

let obstacles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let animationId = null;
let isGameOver = false;
let touchStartX = null;

// Game controls
const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// Touch controls
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (touchStartX === null) return;
    
    const touch = e.touches[0];
    const moveX = touch.clientX - touchStartX;
    const canvasRect = canvas.getBoundingClientRect();
    const scale = canvas.width / canvasRect.width;
    
    player.x += moveX * scale;
    
    // Keep player within bounds
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    
    touchStartX = touch.clientX;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchStartX = null;
    if (isGameOver) {
        restartGame();
    }
}, { passive: false });

// Existing keyboard controls
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
    if (e.code === 'Space' && isGameOver) {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

// Game functions
function createObstacle() {
    const width = Math.random() * 50 + 20;
    obstacles.push({
        x: Math.random() * (canvas.width - width),
        y: -20,
        width: width,
        height: 20,
        speed: Math.random() * 2 + 2,
        color: `hsl(${Math.random() * 360}, 50%, 50%)`
    });
}

function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed;
        
        // Check collision
        if (checkCollision(player, obstacles[i])) {
            gameOver();
        }
        
        // Remove obstacles that are off screen
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            updateScore();
        }
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    if (isGameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function updateScore() {
    document.getElementById('scoreValue').textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScoreValue').textContent = highScore;
    }
}

function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
}

function restartGame() {
    score = 0;
    obstacles = [];
    isGameOver = false;
    player.x = canvas.width / 2;
    updateScore();
    document.getElementById('highScoreValue').textContent = highScore;
    animationId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!isGameOver) {
        updatePlayer();
        updateObstacles();
        
        // Create new obstacles
        if (Math.random() < 0.02) {
            createObstacle();
        }
        
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start the game
animationId = requestAnimationFrame(gameLoop);