/**
 * Memory Card Game
 * Match pairs of cards by flipping them over
 */
class MemoryGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.startTime = null;
        
        // Card symbols (emojis)
        this.symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎪', '🎸'];
        
        this.init();
    }
    
    init() {
        this.setupCards();
        this.render();
        this.attachEventListeners();
    }
    
    setupCards() {
        // Create pairs of cards
        const cardSymbols = [...this.symbols, ...this.symbols];
        
        // Shuffle the cards
        for (let i = cardSymbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]];
        }
        
        // Create card objects
        this.cards = cardSymbols.map((symbol, index) => ({
            id: index,
            symbol: symbol,
            isFlipped: false,
            isMatched: false
        }));
    }
    
    render() {
        this.container.innerHTML = `
            <div class="memory-game">
                <div class="game-header">
                    <h3>Memory Game</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Moves:</span>
                            <span class="stat-value" id="moves">0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="timer">00:00</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Pairs:</span>
                            <span class="stat-value" id="pairs">${this.matchedPairs}/${this.symbols.length}</span>
                        </div>
                    </div>
                </div>
                <div class="game-board" id="game-board">
                    ${this.cards.map(card => `
                        <div class="memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}" 
                             data-id="${card.id}"
                             tabindex="0"
                             role="button"
                             aria-label="Memory card">
                            <div class="card-front">?</div>
                            <div class="card-back">${card.symbol}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="game-controls">
                    <button class="btn" id="new-game-btn">New Game</button>
                    <button class="btn" id="hint-btn">Hint</button>
                </div>
                <div class="game-instructions">
                    <p>🧠 Click cards to flip them over</p>
                    <p>🎯 Match pairs of identical symbols</p>
                    <p>⏱️ Complete the game in the fewest moves and fastest time!</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const gameBoard = this.container.querySelector('#game-board');
        const newGameBtn = this.container.querySelector('#new-game-btn');
        const hintBtn = this.container.querySelector('#hint-btn');
        
        gameBoard.addEventListener('click', (e) => this.handleCardClick(e));
        gameBoard.addEventListener('keydown', (e) => this.handleCardKeydown(e));
        newGameBtn.addEventListener('click', () => this.newGame());
        hintBtn.addEventListener('click', () => this.showHint());
    }
    
    handleCardClick(event) {
        const cardElement = event.target.closest('.memory-card');
        if (!cardElement) return;
        
        this.flipCard(cardElement);
    }
    
    handleCardKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const cardElement = event.target.closest('.memory-card');
            if (cardElement) {
                this.flipCard(cardElement);
            }
        }
    }
    
    flipCard(cardElement) {
        const cardId = parseInt(cardElement.dataset.id);
        const card = this.cards[cardId];
        
        // Can't flip if already flipped, matched, or game completed
        if (card.isFlipped || card.isMatched || this.gameCompleted) {
            return;
        }
        
        // Start timer on first move
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
            this.startTimer();
        }
        
        // Can't flip more than 2 cards at once
        if (this.flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(card);
        
        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMoves();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }
    
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found
            card1.isMatched = true;
            card2.isMatched = true;
            
            const card1Element = this.container.querySelector(`[data-id="${card1.id}"]`);
            const card2Element = this.container.querySelector(`[data-id="${card2.id}"]`);
            
            card1Element.classList.add('matched');
            card2Element.classList.add('matched');
            
            this.matchedPairs++;
            this.updatePairs();
            
            // Check if game is completed
            if (this.matchedPairs === this.symbols.length) {
                this.gameCompleted = true;
                this.gameWon();
            }
        } else {
            // No match, flip cards back
            card1.isFlipped = false;
            card2.isFlipped = false;
            
            const card1Element = this.container.querySelector(`[data-id="${card1.id}"]`);
            const card2Element = this.container.querySelector(`[data-id="${card2.id}"]`);
            
            card1Element.classList.remove('flipped');
            card2Element.classList.remove('flipped');
        }
        
        this.flippedCards = [];
    }
    
    showHint() {
        if (this.gameCompleted) return;
        
        // Find two unmatched cards with the same symbol
        const unmatchedCards = this.cards.filter(card => !card.isMatched && !card.isFlipped);
        
        for (let i = 0; i < unmatchedCards.length; i++) {
            for (let j = i + 1; j < unmatchedCards.length; j++) {
                if (unmatchedCards[i].symbol === unmatchedCards[j].symbol) {
                    // Briefly highlight the matching pair
                    const card1Element = this.container.querySelector(`[data-id="${unmatchedCards[i].id}"]`);
                    const card2Element = this.container.querySelector(`[data-id="${unmatchedCards[j].id}"]`);
                    
                    card1Element.classList.add('hint');
                    card2Element.classList.add('hint');
                    
                    setTimeout(() => {
                        card1Element.classList.remove('hint');
                        card2Element.classList.remove('hint');
                    }, 1500);
                    
                    return;
                }
            }
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameCompleted) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                
                const timerElement = this.container.querySelector('#timer');
                if (timerElement) {
                    timerElement.textContent = `${minutes}:${seconds}`;
                }
            }
        }, 1000);
    }
    
    updateMoves() {
        const movesElement = this.container.querySelector('#moves');
        if (movesElement) {
            movesElement.textContent = this.moves;
        }
    }
    
    updatePairs() {
        const pairsElement = this.container.querySelector('#pairs');
        if (pairsElement) {
            pairsElement.textContent = `${this.matchedPairs}/${this.symbols.length}`;
        }
    }
    
    gameWon() {
        clearInterval(this.timerInterval);
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        setTimeout(() => {
            alert(`🎉 Congratulations! You won!\n\nMoves: ${this.moves}\nTime: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 500);
    }
    
    newGame() {
        // Reset game state
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.startTime = null;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Setup new cards and render
        this.setupCards();
        this.render();
        this.attachEventListeners();
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