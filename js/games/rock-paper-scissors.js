/**
 * Rock Paper Scissors Game
 * Classic game with animated choices and scoreboard
 */
class RockPaperScissors {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.choices = [
            { name: 'Rock', icon: '✊', emoji: '🪨' },
            { name: 'Paper', icon: '✋', emoji: '📄' },
            { name: 'Scissors', icon: '✌️', emoji: '✂️' }
        ];
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = '';
        this.score = { player: 0, computer: 0 };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="rps-game">
                <div class="game-header">
                    <h3>🎮 Rock Paper Scissors</h3>
                </div>
                
                <!-- Scoreboard -->
                <div class="scoreboard">
                    <div class="score-card">
                        <h6>You</h6>
                        <h3 id="player-score">${this.score.player}</h3>
                    </div>
                    <div class="score-card">
                        <h6>Computer</h6>
                        <h3 id="computer-score">${this.score.computer}</h3>
                    </div>
                </div>
                
                <!-- Choice buttons -->
                <div class="choices-container">
                    ${this.choices.map(choice => `
                        <button class="choice-btn" data-choice="${choice.name}">
                            <div class="choice-icon">${choice.icon}</div>
                            <div class="choice-name">${choice.name}</div>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Results area -->
                <div class="results-area" id="results-area" style="display: none;">
                    <div class="battle-display">
                        <div class="player-choice">
                            <h6>You</h6>
                            <div class="choice-display" id="player-display"></div>
                        </div>
                        <div class="vs-text">VS</div>
                        <div class="computer-choice">
                            <h6>Computer</h6>
                            <div class="choice-display" id="computer-display">🤔</div>
                        </div>
                    </div>
                    <h4 class="result-text" id="result-text"></h4>
                </div>
                
                <div class="game-controls">
                    <button class="btn reset-btn" id="reset-btn">Reset Game</button>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const choiceBtns = this.container.querySelectorAll('.choice-btn');
        const resetBtn = this.container.querySelector('#reset-btn');
        
        choiceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choiceName = e.currentTarget.dataset.choice;
                const choice = this.choices.find(c => c.name === choiceName);
                this.play(choice);
            });
        });
        
        resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    play(playerChoice) {
        this.playerChoice = playerChoice;
        const computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        
        // Show results area
        const resultsArea = this.container.querySelector('#results-area');
        resultsArea.style.display = 'block';
        
        // Show player choice immediately
        const playerDisplay = this.container.querySelector('#player-display');
        playerDisplay.innerHTML = `
            <div class="choice-icon">${playerChoice.icon}</div>
            <div class="choice-name">${playerChoice.name}</div>
        `;
        
        // Animate computer "thinking"
        const computerDisplay = this.container.querySelector('#computer-display');
        computerDisplay.textContent = '🤔';
        
        // Show computer choice after delay
        setTimeout(() => {
            this.computerChoice = computerChoice;
            computerDisplay.innerHTML = `
                <div class="choice-icon">${computerChoice.icon}</div>
                <div class="choice-name">${computerChoice.name}</div>
            `;
            
            // Determine and show result
            this.determineWinner();
        }, 800);
    }
    
    determineWinner() {
        if (!this.playerChoice || !this.computerChoice) {
            console.error('Player or computer choice is null');
            return;
        }
        
        const player = this.playerChoice.name;
        const computer = this.computerChoice.name;
        const resultText = this.container.querySelector('#result-text');
        
        if (player === computer) {
            this.result = "It's a Draw!";
            resultText.className = 'result-text draw';
        } else if (
            (player === 'Rock' && computer === 'Scissors') ||
            (player === 'Paper' && computer === 'Rock') ||
            (player === 'Scissors' && computer === 'Paper')
        ) {
            this.result = 'You Win! 🎉';
            this.score.player++;
            resultText.className = 'result-text win';
        } else {
            this.result = 'You Lose! 😔';
            this.score.computer++;
            resultText.className = 'result-text lose';
        }
        
        resultText.textContent = this.result;
        this.updateScore();
    }
    
    updateScore() {
        this.container.querySelector('#player-score').textContent = this.score.player;
        this.container.querySelector('#computer-score').textContent = this.score.computer;
    }
    
    resetGame() {
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = '';
        this.score = { player: 0, computer: 0 };
        
        const resultsArea = this.container.querySelector('#results-area');
        resultsArea.style.display = 'none';
        
        this.updateScore();
    }
    
    destroy() {
        // Clean up any event listeners
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RockPaperScissors;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.RockPaperScissors = RockPaperScissors;
}