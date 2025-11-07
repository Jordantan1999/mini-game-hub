/**
 * Color Match Game (Stroop Effect)
 * Match the text color with the written color
 */
class ColorMatch {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.score = 0;
        this.timeLeft = 60;
        this.gameActive = false;
        this.currentChallenge = null;
        this.timerInterval = null;
        this.streak = 0;
        
        this.colors = [
            { name: 'RED', color: '#FF0000' },
            { name: 'BLUE', color: '#0000FF' },
            { name: 'GREEN', color: '#00AA00' },
            { name: 'YELLOW', color: '#FFD700' },
            { name: 'PURPLE', color: '#800080' },
            { name: 'ORANGE', color: '#FFA500' }
        ];
        
        this.init();
    }
    
    init() {
        this.generateChallenge();
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="color-match-game">
                <div class="game-header">
                    <h3>Color Match</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="time">${this.timeLeft}s</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Streak:</span>
                            <span class="stat-value" id="streak">${this.streak}</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-area">
                    <div class="word-display">
                        <h2 id="color-word" style="color: ${this.currentChallenge ? this.currentChallenge.displayColor : '#000'}">
                            ${this.currentChallenge ? this.currentChallenge.word : 'Click Start!'}
                        </h2>
                    </div>
                    
                    <div class="instruction">
                        <p><strong>What COLOR is this text?</strong></p>
                        <p>(Not what it says, but what color it appears in)</p>
                    </div>
                    
                    <div class="color-buttons" id="color-buttons">
                        ${this.colors.map(color => `
                            <button class="color-btn" 
                                    data-color="${color.name}" 
                                    style="background-color: ${color.color}"
                                    ${!this.gameActive ? 'disabled' : ''}>
                                ${color.name}
                            </button>
                        `).join('')}
                    </div>
                    
                    <div class="feedback-area" id="feedback-area">
                        ${!this.gameActive ? '<p>Test your ability to ignore what you read and focus on color!</p>' : ''}
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="start-btn">${this.gameActive ? 'Stop Game' : 'Start Game'}</button>
                </div>
                
                <div class="game-instructions">
                    <p>🎨 Click the button that matches the TEXT COLOR (not the word)</p>
                    <p>🧠 This tests the Stroop effect - your brain wants to read the word!</p>
                    <p>⚡ Answer quickly for bonus points</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const colorButtons = this.container.querySelectorAll('.color-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleGame());
        }
        
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleColorChoice(e));
        });
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
        this.score = 0;
        this.timeLeft = 60;
        this.streak = 0;
        this.challengeStartTime = Date.now();
        
        this.generateChallenge();
        this.render();
        this.attachEventListeners();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    stopGame() {
        this.gameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.render();
        this.attachEventListeners();
    }
    
    generateChallenge() {
        const wordColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const displayColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        this.currentChallenge = {
            word: wordColor.name,
            wordColor: wordColor.name,
            displayColor: displayColor.color,
            correctAnswer: displayColor.name
        };
        
        this.challengeStartTime = Date.now();
    }
    
    handleColorChoice(event) {
        if (!this.gameActive || !this.currentChallenge) return;
        
        const chosenColor = event.target.dataset.color;
        const correct = chosenColor === this.currentChallenge.correctAnswer;
        const responseTime = Date.now() - this.challengeStartTime;
        
        if (correct) {
            this.streak++;
            let points = 10;
            
            // Bonus for quick responses
            if (responseTime < 1000) points += 5;
            if (responseTime < 500) points += 5;
            
            // Streak bonus
            if (this.streak > 5) points += 5;
            
            this.score += points;
            this.showFeedback(`Correct! +${points} points`, 'success');
        } else {
            this.streak = 0;
            this.showFeedback(`Wrong! It was ${this.currentChallenge.correctAnswer}`, 'error');
        }
        
        setTimeout(() => {
            this.generateChallenge();
            this.updateDisplay();
        }, 800);
    }
    
    showFeedback(message, type) {
        const feedbackArea = this.container.querySelector('#feedback-area');
        if (feedbackArea) {
            feedbackArea.innerHTML = `<p class="feedback-${type}">${message}</p>`;
        }
    }
    
    updateDisplay() {
        const scoreElement = this.container.querySelector('#score');
        const timeElement = this.container.querySelector('#time');
        const streakElement = this.container.querySelector('#streak');
        const wordElement = this.container.querySelector('#color-word');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (timeElement) timeElement.textContent = this.timeLeft + 's';
        if (streakElement) streakElement.textContent = this.streak;
        
        if (wordElement && this.currentChallenge) {
            wordElement.textContent = this.currentChallenge.word;
            wordElement.style.color = this.currentChallenge.displayColor;
        }
    }
    
    endGame() {
        this.gameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        setTimeout(() => {
            alert(`🎨 Time's up!\n\nFinal Score: ${this.score}\nBest Streak: ${this.streak}\n\nGreat job fighting the Stroop effect!`);
            this.render();
            this.attachEventListeners();
        }, 100);
    }
    
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorMatch;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ColorMatch = ColorMatch;
}