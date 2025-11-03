/**
 * Memory Game - Clean Rewrite
 * Classic memory matching game with simple, reliable logic
 */
class MemoryGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Initial set of pairs (8 pairs = 16 cards)
        this.initialCards = ['🍎', '🍎', '🍌', '🍌', '🍇', '🍇', '🍓', '🍓', 
                            '🍊', '🍊', '🥝', '🥝', '🍒', '🍒', '🥭', '🥭'];
        
        // Game state
        this.cards = this.shuffle([...this.initialCards]);
        this.flipped = []; // indices currently flipped
        this.matched = []; // matched indices
        this.attempts = 0;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    // Simple shuffle function
    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    
    render() {
        this.container.innerHTML = `
            <div class="memory-game-container">
                <div class="game-header">
                    <h3>Memory Game</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Attempts:</span>
                            <span class="stat-value" id="attempts">${this.attempts}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Pairs:</span>
                            <span class="stat-value" id="pairs">${this.matched.length / 2}/8</span>
                        </div>
                    </div>
                </div>
                
                <div class="memory-grid" id="memory-grid">
                    ${this.cards.map((card, index) => `
                        <button class="memory-card-btn" 
                                data-index="${index}"
                                aria-label="Memory card ${index + 1}">
                            ${this.flipped.includes(index) || this.matched.includes(index) ? card : '❓'}
                        </button>
                    `).join('')}
                </div>
                
                ${this.matched.length === this.cards.length ? 
                    '<h3 class="win-message">🎉 Congratulations! You Won!</h3>' : ''
                }
                
                <div class="game-controls">
                    <button class="btn" id="reset-btn">New Game</button>
                    <button class="btn" id="hint-btn">Hint</button>
                </div>
                
                <div class="game-instructions">
                    <p>🧠 Click cards to flip them over</p>
                    <p>🎯 Match pairs of identical symbols</p>
                    <p>🏆 Complete the game in the fewest attempts!</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const grid = this.container.querySelector('#memory-grid');
        const resetBtn = this.container.querySelector('#reset-btn');
        const hintBtn = this.container.querySelector('#hint-btn');
        
        if (grid) {
            grid.addEventListener('click', (e) => this.handleCardClick(e));
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
    }
    
    handleCardClick(event) {
        const button = event.target.closest('.memory-card-btn');
        if (!button) return;
        
        const index = parseInt(button.dataset.index);
        this.handleClick(index);
    }
    
    handleClick(index) {
        // Can't click if already flipped or matched
        if (this.flipped.includes(index) || this.matched.includes(index)) {
            return;
        }
        
        // Can't flip more than 2 cards
        if (this.flipped.length >= 2) {
            return;
        }
        
        // Add to flipped array
        const newFlipped = [...this.flipped, index];
        this.flipped = newFlipped;
        
        // Update display immediately
        this.updateCardDisplay(index);
        
        // Check for match when 2 cards are flipped
        if (newFlipped.length === 2) {
            this.attempts++;
            this.updateAttempts();
            
            const [first, second] = newFlipped;
            
            if (this.cards[first] === this.cards[second]) {
                // Match found!
                this.matched = [...this.matched, first, second];
                this.flipped = [];
                this.updatePairs();
                
                // Check for win
                if (this.matched.length === this.cards.length) {
                    setTimeout(() => this.render(), 100);
                }
            } else {
                // No match - flip back after delay
                setTimeout(() => {
                    this.flipped = [];
                    this.updateCardDisplay(first);
                    this.updateCardDisplay(second);
                }, 750);
            }
        }
    }
    
    updateCardDisplay(index) {
        const button = this.container.querySelector(`[data-index="${index}"]`);
        if (button) {
            const shouldShow = this.flipped.includes(index) || this.matched.includes(index);
            button.textContent = shouldShow ? this.cards[index] : '❓';
            
            // Add visual feedback
            if (this.matched.includes(index)) {
                button.classList.add('matched');
            } else {
                button.classList.remove('matched');
            }
        }
    }
    
    updateAttempts() {
        const attemptsSpan = this.container.querySelector('#attempts');
        if (attemptsSpan) {
            attemptsSpan.textContent = this.attempts;
        }
    }
    
    updatePairs() {
        const pairsSpan = this.container.querySelector('#pairs');
        if (pairsSpan) {
            pairsSpan.textContent = `${this.matched.length / 2}/8`;
        }
    }
    
    handleReset() {
        this.cards = this.shuffle([...this.initialCards]);
        this.flipped = [];
        this.matched = [];
        this.attempts = 0;
        this.render();
        this.attachEventListeners();
    }
    
    showHint() {
        // Find two unmatched cards with the same symbol
        const unmatched = [];
        for (let i = 0; i < this.cards.length; i++) {
            if (!this.matched.includes(i) && !this.flipped.includes(i)) {
                unmatched.push(i);
            }
        }
        
        // Find a matching pair
        for (let i = 0; i < unmatched.length; i++) {
            for (let j = i + 1; j < unmatched.length; j++) {
                if (this.cards[unmatched[i]] === this.cards[unmatched[j]]) {
                    // Highlight the pair briefly
                    const btn1 = this.container.querySelector(`[data-index="${unmatched[i]}"]`);
                    const btn2 = this.container.querySelector(`[data-index="${unmatched[j]}"]`);
                    
                    if (btn1 && btn2) {
                        btn1.classList.add('hint-highlight');
                        btn2.classList.add('hint-highlight');
                        
                        setTimeout(() => {
                            btn1.classList.remove('hint-highlight');
                            btn2.classList.remove('hint-highlight');
                        }, 1500);
                    }
                    return;
                }
            }
        }
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryGame;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MemoryGame = MemoryGame;
}