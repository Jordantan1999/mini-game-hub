/**
 * Flappy Bird Clone
 * Avoid obstacles to keep flying
 */
class FlappyBird {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.gameStarted = false;
        
        // Game state
        this.bird = { x: 50, y: 200, velocity: 0, size: 20 };
        this.pipes = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('flappy-best') || 0;
        
        // Game settings
        this.gravity = 0.5;
        this.jumpStrength = -8;
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 2;
        
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="flappy-bird-game">
                <div class="game-header">
                    <h3>Flappy Bird</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Best:</span>
                            <span class="stat-value" id="best">${this.bestScore}</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-canvas-container">
                    <canvas id="flappy-canvas" width="400" height="300"></canvas>
                    <div class="game-overlay" id="game-overlay">
                        <div class="overlay-content">
                            <h2>${this.gameStarted ? 'Game Over!' : 'Flappy Bird'}</h2>
                            <p>${this.gameStarted ? `Score: ${this.score}` : 'Click or press Space to start flying!'}</p>
                            <button class="btn" id="start-btn">${this.gameStarted ? 'Play Again' : 'Start Game'}</button>
                        </div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="jump-btn">🐦 Flap</button>
                </div>
                
                <div class="game-instructions">
                    <p>🐦 Click, press Space, or tap "Flap" to fly</p>
                    <p>🚫 Avoid the pipes and don't hit the ground!</p>
                    <p>🏆 Try to beat your best score</p>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#flappy-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.gameRunning) {
            this.drawStartScreen();
        }
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const jumpBtn = this.container.querySelector('#jump-btn');
        const overlay = this.container.querySelector('#game-overlay');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (jumpBtn) {
            jumpBtn.addEventListener('click', () => this.jump());
        }
        if (this.canvas) {
            this.canvas.addEventListener('click', () => this.jump());
        }
        
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }
    
    handleKeyPress(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            if (this.gameRunning) {
                this.jump();
            } else {
                this.startGame();
            }
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameStarted = true;
        this.score = 0;
        
        // Reset bird
        this.bird = { x: 50, y: 200, velocity: 0, size: 20 };
        this.pipes = [];
        
        // Hide overlay
        const overlay = this.container.querySelector('#game-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        
        // Generate first pipe
        setTimeout(() => this.generatePipe(), 1500);
    }
    
    jump() {
        if (this.gameRunning) {
            this.bird.velocity = this.jumpStrength;
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update bird physics
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update pipes
        this.pipes.forEach(pipe => {
            pipe.x -= this.pipeSpeed;
        });
        
        // Remove off-screen pipes and add score
        this.pipes = this.pipes.filter(pipe => {
            if (pipe.x + this.pipeWidth < 0) {
                if (!pipe.scored) {
                    this.score++;
                    this.updateScore();
                    pipe.scored = true;
                }
                return false;
            }
            return true;
        });
        
        // Generate new pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < 200) {
            this.generatePipe();
        }
        
        // Check collisions
        if (this.checkCollisions()) {
            this.endGame();
            return;
        }
        
        this.draw();
    }
    
    generatePipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    }
    
    checkCollisions() {
        // Check ground and ceiling
        if (this.bird.y + this.bird.size > this.canvas.height || this.bird.y < 0) {
            return true;
        }
        
        // Check pipe collisions
        for (let pipe of this.pipes) {
            if (this.bird.x + this.bird.size > pipe.x && 
                this.bird.x < pipe.x + this.pipeWidth) {
                
                if (this.bird.y < pipe.topHeight || 
                    this.bird.y + this.bird.size > pipe.bottomY) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#228B22';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, 
                             this.canvas.height - pipe.bottomY);
        });
        
        // Draw bird
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.size, this.bird.size);
        
        // Draw score
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
    
    drawStartScreen() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.size, this.bird.size);
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Flappy Bird', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click to start!', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.textAlign = 'left';
    }
    
    updateScore() {
        const scoreElement = this.container.querySelector('#score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappy-best', this.bestScore);
            const bestElement = this.container.querySelector('#best');
            if (bestElement) {
                bestElement.textContent = this.bestScore;
            }
        }
    }
    
    endGame() {
        this.gameRunning = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Show overlay
        const overlay = this.container.querySelector('#game-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const content = overlay.querySelector('.overlay-content');
            if (content) {
                content.innerHTML = `
                    <h2>Game Over!</h2>
                    <p>Score: ${this.score}</p>
                    ${this.score === this.bestScore && this.score > 0 ? '<p>🏆 New Best Score!</p>' : ''}
                    <button class="btn" onclick="window.currentFlappyGame.startGame()">Play Again</button>
                `;
            }
        }
        
        // Store reference for restart
        window.currentFlappyGame = this;
    }
    
    destroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlappyBird;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.FlappyBird = FlappyBird;
}