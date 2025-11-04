/**
 * Whack-a-Mole Game
 * Click moles before they disappear
 */
class WhackAMole {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.moles = Array(9).fill(false);
        this.gameInterval = null;
        this.moleInterval = null;
        this.activeMoles = new Set();
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="whack-a-mole-game">
                <div class="game-header">
                    <h3>Whack-a-Mole</h3>
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
                
                <div class="mole-grid" id="mole-grid">
                    ${Array(9).fill(0).map((_, index) => `
                        <div class="mole-hole" data-index="${index}">
                            <div class="mole ${this.moles[index] ? 'active' : ''}" id="mole-${index}">
                                🐹
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="start-btn">${this.gameActive ? 'Stop Game' : 'Start Game'}</button>
                    <button class="btn" id="reset-btn">Reset</button>
                </div>
                
                <div class="game-instructions">
                    <p>🐹 Click the moles as they pop up!</p>
                    <p>⏱️ You have 30 seconds to score as many points as possible</p>
                    <p>🎯 Each mole is worth 10 points</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        const moleGrid = this.container.querySelector('#mole-grid');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleGame());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }
        if (moleGrid) {
            moleGrid.addEventListener('click', (e) => this.handleMoleClick(e));
        }
    }
    
    toggleGame() {
        if (this.gameActive) {
            this.stopGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.gameActive = true;
        this.timeLeft = 30;
        this.score = 0;
        this.activeMoles.clear();
        
        // Start timer
        this.gameInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Start spawning moles
        this.spawnMoles();
        this.render();
    }
    
    stopGame() {
        this.gameActive = false;
        this.clearIntervals();
        this.activeMoles.clear();
        this.moles.fill(false);
        this.render();
    }
    
    endGame() {
        this.gameActive = false;
        this.clearIntervals();
        this.activeMoles.clear();
        this.moles.fill(false);
        
        setTimeout(() => {
            alert(`🎉 Game Over! Your score: ${this.score} points!`);
            this.render();
        }, 100);
    }
    
    resetGame() {
        this.stopGame();
        this.score = 0;
        this.timeLeft = 30;
        this.render();
    }
    
    spawnMoles() {
        if (!this.gameActive) return;
        
        // Spawn a new mole every 800-1500ms
        const spawnDelay = Math.random() * 700 + 800;
        
        setTimeout(() => {
            if (this.gameActive) {
                this.showRandomMole();
                this.spawnMoles();
            }
        }, spawnDelay);
    }
    
    showRandomMole() {
        // Don't spawn if too many moles are active
        if (this.activeMoles.size >= 3) return;
        
        // Find available holes
        const availableHoles = [];
        for (let i = 0; i < 9; i++) {
            if (!this.activeMoles.has(i)) {
                availableHoles.push(i);
            }
        }
        
        if (availableHoles.length === 0) return;
        
        const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        this.activeMoles.add(randomHole);
        this.moles[randomHole] = true;
        
        // Update display
        const moleElement = this.container.querySelector(`#mole-${randomHole}`);
        if (moleElement) {
            moleElement.classList.add('active');
        }
        
        // Hide mole after 1-2 seconds
        const hideDelay = Math.random() * 1000 + 1000;
        setTimeout(() => {
            this.hideMole(randomHole);
        }, hideDelay);
    }
    
    hideMole(index) {
        this.activeMoles.delete(index);
        this.moles[index] = false;
        
        const moleElement = this.container.querySelector(`#mole-${index}`);
        if (moleElement) {
            moleElement.classList.remove('active');
        }
    }
    
    handleMoleClick(event) {
        if (!this.gameActive) return;
        
        const mole = event.target.closest('.mole');
        if (!mole || !mole.classList.contains('active')) return;
        
        const index = parseInt(mole.id.split('-')[1]);
        
        // Score points
        this.score += 10;
        this.updateDisplay();
        
        // Hide the mole
        this.hideMole(index);
        
        // Visual feedback
        mole.style.transform = 'scale(1.2)';
        setTimeout(() => {
            if (mole) mole.style.transform = '';
        }, 150);
    }
    
    updateDisplay() {
        const scoreElement = this.container.querySelector('#score');
        const timeElement = this.container.querySelector('#time');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (timeElement) timeElement.textContent = this.timeLeft + 's';
    }
    
    clearIntervals() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        if (this.moleInterval) {
            clearInterval(this.moleInterval);
            this.moleInterval = null;
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
    module.exports = WhackAMole;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.WhackAMole = WhackAMole;
}