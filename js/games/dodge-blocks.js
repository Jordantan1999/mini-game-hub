/**
 * Dodge the Blocks Game
 * Move your character to avoid falling obstacles
 */
class DodgeBlocks {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        
        // Game objects
        this.player = { x: 200, y: 250, width: 20, height: 20, speed: 5 };
        this.blocks = [];
        this.score = 0;
        this.gameSpeed = 2;
        this.spawnRate = 0.02;
        
        // Game settings
        this.blockWidth = 30;
        this.blockHeight = 30;
        this.blockSpeed = 2;
        
        this.gameLoop = null;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
        // Initialize player position after canvas is created
        if (this.canvas) {
            this.player.x = this.canvas.width / 2 - this.player.width / 2;
            this.player.y = this.canvas.height - this.player.height - 10;
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="dodge-blocks-game">
                <div class="game-header">
                    <h3>Dodge the Blocks</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Speed:</span>
                            <span class="stat-value" id="speed">${this.gameSpeed.toFixed(1)}x</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-canvas-container">
                    <canvas id="dodge-canvas" width="400" height="300"></canvas>
                    ${!this.gameRunning ? `
                        <div class="game-overlay" id="game-overlay">
                            <div class="overlay-content">
                                <h2>Dodge the Blocks</h2>
                                <p>Avoid the falling blocks for as long as possible!</p>
                                <button class="btn" id="start-btn">Start Game</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-controls">
                    <div class="mobile-controls">
                        <button class="control-btn" id="left-btn">←</button>
                        <button class="control-btn" id="right-btn">→</button>
                    </div>
                    <div class="game-buttons">
                        <button class="btn" id="start-stop-btn">${this.gameRunning ? 'Pause' : 'Start'}</button>
                        <button class="btn" id="reset-btn">Reset</button>
                    </div>
                </div>
                
                <div class="game-instructions">
                    <p>🏃 Use arrow keys or buttons to move left and right</p>
                    <p>🧱 Avoid the falling blocks - don't let them hit you!</p>
                    <p>⚡ Game gets faster as your score increases</p>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#dodge-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize canvas display
        if (!this.gameRunning && this.ctx) {
            this.drawStartScreen();
        }
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const startStopBtn = this.container.querySelector('#start-stop-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        const leftBtn = this.container.querySelector('#left-btn');
        const rightBtn = this.container.querySelector('#right-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (startStopBtn) {
            startStopBtn.addEventListener('click', () => this.toggleGame());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
                this.render();
                this.attachEventListeners();
            });
        }
        
        // Mobile controls
        if (leftBtn) {
            leftBtn.addEventListener('mousedown', () => this.keys['ArrowLeft'] = true);
            leftBtn.addEventListener('mouseup', () => this.keys['ArrowLeft'] = false);
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = true;
            });
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('mousedown', () => this.keys['ArrowRight'] = true);
            rightBtn.addEventListener('mouseup', () => this.keys['ArrowRight'] = false);
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = true;
            });
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
            });
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
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
        this.attachEventListeners();
    }
    
    pauseGame() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.render();
        this.attachEventListeners();
    }
    
    resetGame() {
        this.pauseGame();
        
        // Reset player
        this.player.x = (this.canvas ? this.canvas.width : 400) / 2 - this.player.width / 2;
        this.player.y = (this.canvas ? this.canvas.height : 300) - this.player.height - 10;
        
        // Reset game state
        this.blocks = [];
        this.score = 0;
        this.gameSpeed = 2;
        this.spawnRate = 0.02;
        
        // Only redraw if canvas exists, don't re-render entire component
        if (this.canvas && this.ctx) {
            this.drawStartScreen();
            this.updateDisplay();
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Move player
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Spawn blocks
        if (Math.random() < this.spawnRate) {
            this.spawnBlock();
        }
        
        // Update blocks
        this.blocks.forEach(block => {
            block.y += block.speed * this.gameSpeed;
        });
        
        // Remove blocks that are off screen and add score
        this.blocks = this.blocks.filter(block => {
            if (block.y > this.canvas.height) {
                this.score += 10;
                return false;
            }
            return true;
        });
        
        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver();
            return;
        }
        
        // Increase difficulty
        this.gameSpeed += 0.001;
        this.spawnRate = Math.min(0.05, this.spawnRate + 0.0001);
        
        this.draw();
        this.updateDisplay();
    }
    
    spawnBlock() {
        const block = {
            x: Math.random() * (this.canvas.width - this.blockWidth),
            y: -this.blockHeight,
            width: this.blockWidth,
            height: this.blockHeight,
            speed: this.blockSpeed,
            color: this.getRandomColor()
        };
        this.blocks.push(block);
    }
    
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    checkCollisions() {
        for (let block of this.blocks) {
            if (this.player.x < block.x + block.width &&
                this.player.x + this.player.width > block.x &&
                this.player.y < block.y + block.height &&
                this.player.y + this.player.height > block.y) {
                return true;
            }
        }
        return false;
    }
    
    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Player glow effect
        this.ctx.shadowColor = '#00FF00';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
        
        // Draw blocks
        this.blocks.forEach(block => {
            this.ctx.fillStyle = block.color;
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Block border
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        });
        
        // Draw score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        this.ctx.fillText(`Speed: ${this.gameSpeed.toFixed(1)}x`, 10, 45);
    }
    
    drawStartScreen() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sample player
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw sample blocks
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(50, 50, this.blockWidth, this.blockHeight);
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(150, 80, this.blockWidth, this.blockHeight);
        this.ctx.fillStyle = '#45B7D1';
        this.ctx.fillRect(250, 60, this.blockWidth, this.blockHeight);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Dodge the Blocks', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Use arrow keys to move!', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.textAlign = 'left';
    }
    
    updateDisplay() {
        const scoreElement = this.container.querySelector('#score');
        const speedElement = this.container.querySelector('#speed');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (speedElement) speedElement.textContent = this.gameSpeed.toFixed(1) + 'x';
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        setTimeout(() => {
            alert(`💥 Game Over!\n\nFinal Score: ${this.score}\nMax Speed: ${this.gameSpeed.toFixed(1)}x\n\nYou survived ${Math.floor(this.score / 10)} blocks!`);
            this.render();
            this.attachEventListeners();
        }, 100);
    }
    
    destroy() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DodgeBlocks;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DodgeBlocks = DodgeBlocks;
}