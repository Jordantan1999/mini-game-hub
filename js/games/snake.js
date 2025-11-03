/**
 * Snake Game
 * Classic snake game where you eat food and grow longer
 */
class SnakeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.tileCount = 20;
        
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupCanvas();
        this.attachEventListeners();
        this.draw();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="snake-game">
                <div class="game-header">
                    <h3>Snake Game</h3>
                    <div class="game-info">
                        <div class="score">Score: <span id="score">0</span></div>
                        <div class="high-score">High Score: <span id="high-score">${this.getHighScore()}</span></div>
                    </div>
                </div>
                <div class="game-canvas-container">
                    <canvas id="snake-canvas" width="400" height="400"></canvas>
                    <div class="game-overlay" id="game-overlay">
                        <div class="overlay-content">
                            <h4>Snake Game</h4>
                            <p>Use arrow keys or WASD to move</p>
                            <button class="btn start-btn" id="start-btn">Start Game</button>
                        </div>
                    </div>
                </div>
                <div class="game-controls">
                    <button class="btn" id="pause-btn" disabled>Pause</button>
                    <button class="btn" id="restart-btn">Restart</button>
                </div>
                <div class="game-instructions">
                    <p>🎮 Use arrow keys or WASD to control the snake</p>
                    <p>🍎 Eat the red food to grow and increase your score</p>
                    <p>💀 Don't hit the walls or yourself!</p>
                </div>
            </div>
        `;
    }
    
    setupCanvas() {
        this.canvas = this.container.querySelector('#snake-canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const pauseBtn = this.container.querySelector('#pause-btn');
        const restartBtn = this.container.querySelector('#restart-btn');
        
        startBtn.addEventListener('click', () => this.startGame());
        pauseBtn.addEventListener('click', () => this.togglePause());
        restartBtn.addEventListener('click', () => this.restartGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(event) {
        if (!this.gameRunning) return;
        
        const key = event.key.toLowerCase();
        
        // Prevent reverse direction
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.hideOverlay();
        this.container.querySelector('#start-btn').disabled = true;
        this.container.querySelector('#pause-btn').disabled = false;
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 150);
    }
    
    togglePause() {
        const pauseBtn = this.container.querySelector('#pause-btn');
        
        if (this.gameRunning) {
            this.gameRunning = false;
            clearInterval(this.gameLoop);
            pauseBtn.textContent = 'Resume';
            this.showOverlay('Game Paused', 'Click Resume to continue');
        } else {
            this.gameRunning = true;
            this.hideOverlay();
            pauseBtn.textContent = 'Pause';
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, 150);
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        this.updateScore();
        
        this.container.querySelector('#start-btn').disabled = false;
        this.container.querySelector('#pause-btn').disabled = true;
        this.container.querySelector('#pause-btn').textContent = 'Pause';
        
        this.showOverlay('Snake Game', 'Use arrow keys or WASD to move');
        this.draw();
    }
    
    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head is slightly different color
                this.ctx.fillStyle = '#66BB6A';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Make sure food doesn't spawn on snake
        if (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y)) {
            this.generateFood();
        }
    }
    
    updateScore() {
        const scoreElement = this.container.querySelector('#score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        // Update high score
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            this.setHighScore(this.score);
            this.container.querySelector('#high-score').textContent = this.score;
        }
        
        this.showOverlay('Game Over!', `Final Score: ${this.score}`);
        this.container.querySelector('#start-btn').disabled = false;
        this.container.querySelector('#pause-btn').disabled = true;
    }
    
    showOverlay(title, message) {
        const overlay = this.container.querySelector('#game-overlay');
        const content = overlay.querySelector('.overlay-content');
        content.innerHTML = `
            <h4>${title}</h4>
            <p>${message}</p>
            <button class="btn start-btn" id="start-btn">Start Game</button>
        `;
        overlay.style.display = 'flex';
        
        // Re-attach start button listener
        const startBtn = content.querySelector('#start-btn');
        startBtn.addEventListener('click', () => this.startGame());
    }
    
    hideOverlay() {
        const overlay = this.container.querySelector('#game-overlay');
        overlay.style.display = 'none';
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('snake-high-score') || '0');
    }
    
    setHighScore(score) {
        localStorage.setItem('snake-high-score', score.toString());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeGame;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SnakeGame = SnakeGame;
}