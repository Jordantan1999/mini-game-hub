/**
 * Balloon Pop Game
 * Pop balloons that float up
 */
class BalloonPop {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.score = 0;
        this.timeLeft = 60;
        this.balloons = [];
        this.gameLoop = null;
        this.spawnInterval = null;
        this.timerInterval = null;
        
        // Game settings
        this.balloonSpeed = 1;
        this.spawnRate = 1000; // milliseconds
        this.balloonColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="balloon-pop-game">
                <div class="game-header">
                    <h3>Balloon Pop</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="time">${this.timeLeft}s</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-canvas-container">
                    <canvas id="balloon-canvas" width="400" height="300"></canvas>
                    ${!this.gameRunning ? `
                        <div class="game-overlay" id="game-overlay">
                            <div class="overlay-content">
                                <h2>Balloon Pop</h2>
                                <p>Pop as many balloons as you can in 60 seconds!</p>
                                <button class="btn" id="start-btn">Start Game</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="start-stop-btn">${this.gameRunning ? 'Stop Game' : 'Start Game'}</button>
                    <button class="btn" id="reset-btn">Reset</button>
                </div>
                
                <div class="game-instructions">
                    <p>🎈 Click on balloons to pop them before they float away!</p>
                    <p>⏱️ You have 60 seconds to score as many points as possible</p>
                    <p>🎯 Different colored balloons give different points</p>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#balloon-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.gameRunning) {
            this.drawBackground();
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
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
    }
    
    toggleGame() {
        if (this.gameRunning) {
            this.stopGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 60;
        this.balloons = [];
        
        // Hide overlay
        const overlay = this.container.querySelector('#game-overlay');
        if (overlay) overlay.style.display = 'none';
        
        // Start game loops
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        this.spawnInterval = setInterval(() => this.spawnBalloon(), this.spawnRate);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        this.render();
    }
    
    stopGame() {
        this.gameRunning = false;
        this.clearIntervals();
        this.balloons = [];
        this.render();
    }
    
    resetGame() {
        this.stopGame();
        this.score = 0;
        this.timeLeft = 60;
        this.render();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update balloon positions
        this.balloons.forEach(balloon => {
            balloon.y -= this.balloonSpeed;
        });
        
        // Remove balloons that have floated off screen
        this.balloons = this.balloons.filter(balloon => balloon.y + balloon.size > 0);
        
        this.draw();
    }
    
    spawnBalloon() {
        if (!this.gameRunning) return;
        
        const balloon = {
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: this.canvas.height + 20,
            size: Math.random() * 20 + 20,
            color: this.balloonColors[Math.floor(Math.random() * this.balloonColors.length)],
            points: Math.floor(Math.random() * 5) + 1
        };
        
        this.balloons.push(balloon);
    }
    
    handleCanvasClick(event) {
        if (!this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Check if click hit any balloon
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            const distance = Math.sqrt(
                Math.pow(clickX - balloon.x, 2) + Math.pow(clickY - balloon.y, 2)
            );
            
            if (distance <= balloon.size) {
                // Balloon popped!
                this.score += balloon.points;
                this.balloons.splice(i, 1);
                this.updateScore();
                
                // Create pop effect
                this.createPopEffect(balloon.x, balloon.y);
                break;
            }
        }
    }
    
    createPopEffect(x, y) {
        // Simple visual feedback - could be enhanced with particles
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('POP!', x, y);
        
        setTimeout(() => {
            if (this.gameRunning) this.draw();
        }, 100);
    }
    
    draw() {
        this.drawBackground();
        
        // Draw balloons
        this.balloons.forEach(balloon => {
            this.drawBalloon(balloon);
        });
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(50, 50, 30);
        this.drawCloud(200, 30, 25);
        this.drawCloud(320, 60, 35);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x - size * 0.3, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawBalloon(balloon) {
        // Balloon body
        this.ctx.fillStyle = balloon.color;
        this.ctx.beginPath();
        this.ctx.arc(balloon.x, balloon.y, balloon.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Balloon highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(balloon.x - balloon.size * 0.3, balloon.y - balloon.size * 0.3, 
                    balloon.size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Balloon string
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(balloon.x, balloon.y + balloon.size);
        this.ctx.lineTo(balloon.x, balloon.y + balloon.size + 20);
        this.ctx.stroke();
        
        // Points indicator
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(balloon.points, balloon.x, balloon.y + 4);
    }
    
    updateTimer() {
        if (!this.gameRunning) return;
        
        this.timeLeft--;
        const timeElement = this.container.querySelector('#time');
        if (timeElement) {
            timeElement.textContent = this.timeLeft + 's';
        }
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }
    
    updateScore() {
        const scoreElement = this.container.querySelector('#score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.clearIntervals();
        
        setTimeout(() => {
            alert(`🎈 Game Over! Your score: ${this.score} points!`);
            this.render();
        }, 100);
    }
    
    clearIntervals() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    destroy() {
        this.clearIntervals();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BalloonPop;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.BalloonPop = BalloonPop;
}