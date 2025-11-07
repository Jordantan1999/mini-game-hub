/**
 * Reaction Time Tester
 * Measure how fast you can click when the color changes
 */
class ReactionTime {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.state = 'waiting'; // waiting, ready, go, result
        this.startTime = 0;
        this.reactionTime = 0;
        this.attempts = [];
        this.timeout = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        const averageTime = this.attempts.length > 0 
            ? Math.round(this.attempts.reduce((a, b) => a + b, 0) / this.attempts.length)
            : 0;
        
        const bestTime = this.attempts.length > 0 
            ? Math.min(...this.attempts)
            : 0;
        
        this.container.innerHTML = `
            <div class="reaction-time-game">
                <div class="game-header">
                    <h3>Reaction Time Tester</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Last:</span>
                            <span class="stat-value" id="last-time">${this.reactionTime || '-'}ms</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Average:</span>
                            <span class="stat-value" id="avg-time">${averageTime || '-'}ms</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Best:</span>
                            <span class="stat-value" id="best-time">${bestTime || '-'}ms</span>
                        </div>
                    </div>
                </div>
                
                <div class="reaction-area ${this.state}" id="reaction-area">
                    <div class="reaction-content">
                        ${this.getStateContent()}
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="reset-btn">Reset Stats</button>
                    <button class="btn" id="start-btn">Start Test</button>
                </div>
                
                <div class="game-instructions">
                    <p>🔴 Wait for the red area to turn green</p>
                    <p>🟢 Click as soon as it turns green!</p>
                    <p>⚡ Test your reflexes and improve your reaction time</p>
                </div>
                
                ${this.attempts.length > 0 ? this.renderHistory() : ''}
            </div>
        `;
    }
    
    getStateContent() {
        switch (this.state) {
            case 'waiting':
                return `
                    <h2>Click "Start Test" to begin</h2>
                    <p>Get ready to test your reaction time!</p>
                `;
            case 'ready':
                return `
                    <h2>Wait for GREEN...</h2>
                    <p>Don't click yet! Wait for the color to change.</p>
                `;
            case 'go':
                return `
                    <h2>CLICK NOW!</h2>
                    <p>Click as fast as you can!</p>
                `;
            case 'too-early':
                return `
                    <h2>Too Early!</h2>
                    <p>You clicked before it turned green. Try again!</p>
                `;
            case 'result':
                return `
                    <h2>${this.reactionTime}ms</h2>
                    <p>${this.getReactionRating()}</p>
                `;
            default:
                return '';
        }
    }
    
    getReactionRating() {
        if (this.reactionTime < 200) return '🚀 Lightning fast!';
        if (this.reactionTime < 250) return '⚡ Excellent reflexes!';
        if (this.reactionTime < 300) return '👍 Good reaction time!';
        if (this.reactionTime < 400) return '👌 Average reaction time';
        return '🐌 Room for improvement!';
    }
    
    renderHistory() {
        const recent = this.attempts.slice(-5).reverse();
        return `
            <div class="reaction-history">
                <h4>Recent Results:</h4>
                <div class="history-list">
                    ${recent.map((time, index) => `
                        <span class="history-item">${time}ms</span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const resetBtn = this.container.querySelector('#reset-btn');
        const startBtn = this.container.querySelector('#start-btn');
        const reactionArea = this.container.querySelector('#reaction-area');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetStats());
        }
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startTest());
        }
        if (reactionArea) {
            reactionArea.addEventListener('click', () => this.handleClick());
        }
    }
    
    startTest() {
        this.state = 'ready';
        this.render();
        this.attachEventListeners();
        
        // Wait random time between 2-6 seconds
        const waitTime = Math.random() * 4000 + 2000;
        
        this.timeout = setTimeout(() => {
            if (this.state === 'ready') {
                this.state = 'go';
                this.startTime = Date.now();
                this.render();
                this.attachEventListeners();
                
                // Auto-timeout after 5 seconds
                this.timeout = setTimeout(() => {
                    if (this.state === 'go') {
                        this.state = 'waiting';
                        this.render();
                        this.attachEventListeners();
                    }
                }, 5000);
            }
        }, waitTime);
    }
    
    handleClick() {
        switch (this.state) {
            case 'ready':
                // Clicked too early
                this.state = 'too-early';
                this.clearTimeout();
                this.render();
                this.attachEventListeners();
                
                setTimeout(() => {
                    this.state = 'waiting';
                    this.render();
                    this.attachEventListeners();
                }, 2000);
                break;
                
            case 'go':
                // Good click - measure reaction time
                this.reactionTime = Date.now() - this.startTime;
                this.attempts.push(this.reactionTime);
                this.state = 'result';
                this.clearTimeout();
                this.render();
                this.attachEventListeners();
                
                setTimeout(() => {
                    this.state = 'waiting';
                    this.render();
                    this.attachEventListeners();
                }, 3000);
                break;
                
            case 'waiting':
            case 'result':
            case 'too-early':
                // Start new test
                this.startTest();
                break;
        }
    }
    
    resetStats() {
        this.attempts = [];
        this.reactionTime = 0;
        this.state = 'waiting';
        this.clearTimeout();
        this.render();
        this.attachEventListeners();
    }
    
    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    
    destroy() {
        this.clearTimeout();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReactionTime;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ReactionTime = ReactionTime;
}