/**
 * Guess the Number Game
 * A number guessing game with limited attempts and progress tracking
 */
class GuessNumber {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.number = this.generateNumber();
        this.guess = '';
        this.message = 'Guess a number between 1 and 100!';
        this.attempts = 0;
        this.maxAttempts = 10;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    generateNumber() {
        return Math.floor(Math.random() * 100) + 1;
    }
    
    render() {
        const progress = Math.max(0, ((this.maxAttempts - this.attempts) / this.maxAttempts) * 100);
        
        this.container.innerHTML = `
            <div class="guess-number-game">
                <div class="game-header">
                    <h3>🎯 Guess the Number</h3>
                    <p>Try to guess the number between 1 and 100!</p>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p class="attempts-text">Attempts left: <strong>${this.maxAttempts - this.attempts}</strong></p>
                </div>
                
                <div class="guess-input-container">
                    <input type="number" 
                           id="guess-input" 
                           class="guess-input" 
                           placeholder="Enter your guess"
                           min="1" 
                           max="100"
                           value="${this.guess}"
                           ${this.gameOver ? 'disabled' : ''}>
                    <button class="btn submit-btn" 
                            id="submit-btn" 
                            ${this.gameOver ? 'disabled' : ''}>
                        Submit
                    </button>
                </div>
                
                <div class="message-container">
                    <p class="game-message ${this.gameOver ? 'game-over' : ''}" id="game-message">
                        ${this.message}
                    </p>
                </div>
                
                <div class="game-controls">
                    <button class="btn restart-btn" id="restart-btn">🔄 Restart</button>
                </div>
                
                <div class="game-instructions">
                    <h4>How to Play:</h4>
                    <ul>
                        <li>🎯 Guess a number between 1 and 100</li>
                        <li>📊 You have ${this.maxAttempts} attempts to find it</li>
                        <li>📈 Higher means your guess is too low</li>
                        <li>📉 Lower means your guess is too high</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const guessInput = this.container.querySelector('#guess-input');
        const submitBtn = this.container.querySelector('#submit-btn');
        const restartBtn = this.container.querySelector('#restart-btn');
        
        submitBtn.addEventListener('click', () => this.handleGuess());
        restartBtn.addEventListener('click', () => this.handleRestart());
        
        guessInput.addEventListener('input', (e) => {
            this.guess = e.target.value;
        });
        
        guessInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleGuess();
            }
        });
    }
    
    handleGuess() {
        if (this.gameOver) return;
        
        if (this.guess.trim() === '') {
            this.updateMessage('⚠️ Please enter a number!', 'warning');
            return;
        }
        
        const num = parseInt(this.guess, 10);
        if (isNaN(num) || num < 1 || num > 100) {
            this.updateMessage('⚠️ Please enter a valid number between 1 and 100!', 'warning');
            return;
        }
        
        this.attempts++;
        
        if (num === this.number) {
            this.updateMessage(`🎉 Correct! The number was ${this.number}. You won in ${this.attempts} attempts!`, 'success');
            this.gameOver = true;
        } else if (this.attempts >= this.maxAttempts) {
            this.updateMessage(`💀 Game Over! The number was ${this.number}. Better luck next time!`, 'failure');
            this.gameOver = true;
        } else if (num < this.number) {
            this.updateMessage('📈 Too low! Try a higher number.', 'hint');
        } else {
            this.updateMessage('📉 Too high! Try a lower number.', 'hint');
        }
        
        this.guess = '';
        this.render();
        this.attachEventListeners();
        
        // Focus back on input if game is not over
        if (!this.gameOver) {
            setTimeout(() => {
                const input = this.container.querySelector('#guess-input');
                if (input) input.focus();
            }, 100);
        }
    }
    
    updateMessage(text, type) {
        this.message = text;
        const messageElement = this.container.querySelector('#game-message');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.className = `game-message ${type}`;
        }
    }
    
    handleRestart() {
        this.number = this.generateNumber();
        this.guess = '';
        this.message = 'Guess a number between 1 and 100!';
        this.attempts = 0;
        this.gameOver = false;
        
        this.render();
        this.attachEventListeners();
        
        // Focus on input
        setTimeout(() => {
            const input = this.container.querySelector('#guess-input');
            if (input) input.focus();
        }, 100);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuessNumber;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.GuessNumber = GuessNumber;
}