/**
 * Breakout Game
 * Paddle and ball destroy bricks
 */
class Breakout {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        
        // Game objects
        this.paddle = { x: 0, y: 0, width: 80, height: 10, speed: 6 };
        this.ball = { x: 0, y: 0, dx: 3, dy: -3, radius: 8 };
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Game settings
        this.brickRows = 5;
        this.brickCols = 8;
        this.brickWidth = 45;
        this.brickHeight = 20;
        this.brickPadding = 5;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 30;
        
        this.gameLoop = null;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="breakout-game">
                <div class="game-header">
                    <h3>Breakout</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Lives:</span>
                            <span class="stat-value" id="lives">${this.lives}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Level:</span>
                            <span class="stat-value" id="level">${this.level}</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-canvas-container">
                    <canvas id="breakout-canvas" width="400" height="300"></canvas>
                    ${!this.gameRunning ? `
                        <div class="game-overlay" id="game-overlay">
                            <div class="overlay-content">
                                <h2>Breakout</h2>
                                <p>Break all the bricks with the ball!</p>
                                <button class="btn" id="start-btn">Start Game</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="start-stop-btn">${this.gameRunning ? 'Pause' : 'Start'}</button>
                    <button class="btn" id="reset-btn">Reset</button>
                </div>
                
                <div class="game-instructions">
                    <p>🏓 Use arrow keys or mouse to move the paddle</p>
                    <p>🧱 Break all bricks to advance to the next level</p>
                    <p>❤️ Don't let the ball fall off the bottom!</p>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#breakout-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.initializeGame();
        if (!this.gameRunning) {
            this.drawStartScreen();
        }
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const startStopBtn = this.container.querySelector('#start-stop-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (startStopBtn) {
            startStopBtn.addEventListener('click', () => this.toggleGame());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mouse controls
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                if (this.gameRunning) {
                    this.paddle.x = mouseX - this.paddle.width / 2;
                    this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
                }
            });
        }
    }
    
    initializeGame() {
        // Initialize paddle
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.paddle.y = this.canvas.height - this.paddle.height - 10;
        
        // Initialize ball
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius;
        this.ball.dx = 3;
        this.ball.dy = -3;
        
        // Initialize bricks
        this.initializeBricks();
    }
    
    initializeBricks() {
        this.bricks = [];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        for (let r = 0; r < this.brickRows; r++) {
            this.bricks[r] = [];
            for (let c = 0; c < this.brickCols; c++) {
                this.bricks[r][c] = {
                    x: c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft,
                    y: r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop,
                    width: this.brickWidth,
                    height: this.brickHeight,
                    visible: true,
                    color: colors[r % colors.length],
                    points: (this.brickRows - r) * 10
                };
            }
        }
    }
    
    toggleGame() {
        if (this.gameRunning) {
            this.pauseGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.gameRunning = true;
        
        // Hide overlay
        const overlay = this.container.querySelector('#game-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        
        this.render();
    }
    
    pauseGame() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.render();
    }
    
    resetGame() {
        this.pauseGame();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.initializeGame();
        this.render();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Move paddle with keyboard
        if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        }
        
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with walls
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Ball collision with paddle
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            // Add some angle based on where ball hits paddle
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.dx = (hitPos - 0.5) * 6;
            this.ball.dy = -Math.abs(this.ball.dy);
        }
        
        // Ball falls off bottom
        if (this.ball.y > this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
        }
        
        // Ball collision with bricks
        this.checkBrickCollisions();
        
        // Check win condition
        if (this.allBricksDestroyed()) {
            this.nextLevel();
        }
        
        this.draw();
        this.updateDisplay();
    }
    
    checkBrickCollisions() {
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                const brick = this.bricks[r][c];
                if (brick.visible) {
                    if (this.ball.x + this.ball.radius > brick.x &&
                        this.ball.x - this.ball.radius < brick.x + brick.width &&
                        this.ball.y + this.ball.radius > brick.y &&
                        this.ball.y - this.ball.radius < brick.y + brick.height) {
                        
                        this.ball.dy = -this.ball.dy;
                        brick.visible = false;
                        this.score += brick.points;
                    }
                }
            }
        }
    }
    
    allBricksDestroyed() {
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                if (this.bricks[r][c].visible) {
                    return false;
                }
            }
        }
        return true;
    }
    
    nextLevel() {
        this.level++;
        this.initializeBricks();
        this.resetBall();
        
        // Increase ball speed slightly
        const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        const newSpeed = Math.min(speed + 0.5, 8);
        const angle = Math.atan2(this.ball.dy, this.ball.dx);
        this.ball.dx = Math.cos(angle) * newSpeed;
        this.ball.dy = Math.sin(angle) * newSpeed;
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius;
        this.ball.dx = 3;
        this.ball.dy = -3;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bricks
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                const brick = this.bricks[r][c];
                if (brick.visible) {
                    this.ctx.fillStyle = brick.color;
                    this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                    
                    // Brick border
                    this.ctx.strokeStyle = '#FFF';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
                }
            }
        }
        
        // Draw paddle
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawStartScreen() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Breakout', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click Start to play!', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.textAlign = 'left';
    }
    
    updateDisplay() {
        const scoreElement = this.container.querySelector('#score');
        const livesElement = this.container.querySelector('#lives');
        const levelElement = this.container.querySelector('#level');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (livesElement) livesElement.textContent = this.lives;
        if (levelElement) levelElement.textContent = this.level;
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        setTimeout(() => {
            alert(`🎮 Game Over!\n\nFinal Score: ${this.score}\nLevel Reached: ${this.level}`);
            this.render();
        }, 100);
    }
    
    destroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Breakout;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.Breakout = Breakout;
}