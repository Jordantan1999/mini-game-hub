/**
 * Sliding Puzzle Game
 * Arrange tiles to form a complete picture
 */
class SlidingPuzzle {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.size = 3; // 3x3 or 4x4
        this.tiles = [];
        this.emptyPos = { row: this.size - 1, col: this.size - 1 };
        this.moves = 0;
        this.startTime = null;
        this.gameCompleted = false;
        this.timerInterval = null;
        this.elapsedTime = 0;
        
        this.init();
    }
    
    init() {
        this.initializeTiles();
        this.render();
        this.attachEventListeners();
    }
    
    initializeTiles() {
        this.tiles = [];
        for (let i = 0; i < this.size; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.size; j++) {
                if (i === this.size - 1 && j === this.size - 1) {
                    this.tiles[i][j] = 0; // Empty space
                } else {
                    this.tiles[i][j] = i * this.size + j + 1;
                }
            }
        }
    }
    
    render() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.container.innerHTML = `
            <div class="sliding-puzzle-game">
                <div class="game-header">
                    <h3>Sliding Puzzle</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Moves:</span>
                            <span class="stat-value" id="moves">${this.moves}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="time">${timeDisplay}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Size:</span>
                            <span class="stat-value">${this.size}×${this.size}</span>
                        </div>
                    </div>
                </div>
                
                <div class="puzzle-board" id="puzzle-board" data-size="${this.size}">
                    ${this.tiles.map((row, i) => 
                        row.map((tile, j) => `
                            <div class="puzzle-tile ${tile === 0 ? 'empty' : ''}" 
                                 data-row="${i}" 
                                 data-col="${j}"
                                 data-number="${tile}">
                                ${tile === 0 ? '' : tile}
                            </div>
                        `).join('')
                    ).join('')}
                </div>
                
                ${this.gameCompleted ? `
                    <div class="win-message">
                        🎉 Puzzle Solved! 
                        <br>Moves: ${this.moves} | Time: ${timeDisplay}
                    </div>
                ` : ''}
                
                <div class="game-controls">
                    <button class="btn" id="shuffle-btn">Shuffle</button>
                    <button class="btn" id="size-btn">Switch to ${this.size === 3 ? '4×4' : '3×3'}</button>
                    <button class="btn" id="solve-btn">Auto Solve</button>
                </div>
                
                <div class="game-instructions">
                    <p>🧩 Click tiles next to the empty space to move them</p>
                    <p>🎯 Arrange numbers in order from 1 to ${this.size * this.size - 1}</p>
                    <p>⏱️ Try to solve it in the fewest moves and fastest time!</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const puzzleBoard = this.container.querySelector('#puzzle-board');
        const shuffleBtn = this.container.querySelector('#shuffle-btn');
        const sizeBtn = this.container.querySelector('#size-btn');
        const solveBtn = this.container.querySelector('#solve-btn');
        
        if (puzzleBoard) {
            puzzleBoard.addEventListener('click', (e) => this.handleTileClick(e));
        }
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shufflePuzzle());
        }
        if (sizeBtn) {
            sizeBtn.addEventListener('click', () => this.changeSize());
        }
        if (solveBtn) {
            solveBtn.addEventListener('click', () => this.autoSolve());
        }
    }
    
    handleTileClick(event) {
        if (this.gameCompleted) return;
        
        const tile = event.target.closest('.puzzle-tile');
        if (!tile || tile.classList.contains('empty')) return;
        
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        
        if (this.canMoveTile(row, col)) {
            this.moveTile(row, col);
            this.moves++;
            
            if (!this.startTime) {
                this.startTime = Date.now();
                this.startTimer();
            }
            
            this.updateDisplay();
            
            if (this.checkWin()) {
                this.gameCompleted = true;
                this.stopTimer();
                setTimeout(() => this.render(), 100);
            }
        }
    }
    
    canMoveTile(row, col) {
        const emptyRow = this.emptyPos.row;
        const emptyCol = this.emptyPos.col;
        
        return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
               (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    }
    
    moveTile(row, col) {
        const emptyRow = this.emptyPos.row;
        const emptyCol = this.emptyPos.col;
        
        // Swap tile with empty space
        this.tiles[emptyRow][emptyCol] = this.tiles[row][col];
        this.tiles[row][col] = 0;
        
        // Update empty position
        this.emptyPos = { row, col };
    }
    
    shufflePuzzle() {
        this.gameCompleted = false;
        this.moves = 0;
        this.elapsedTime = 0;
        this.startTime = null;
        this.stopTimer();
        
        // Perform random valid moves to shuffle
        for (let i = 0; i < 1000; i++) {
            const possibleMoves = this.getPossibleMoves();
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.moveTile(randomMove.row, randomMove.col);
            }
        }
        
        this.moves = 0; // Reset move counter after shuffle
        this.render();
        this.attachEventListeners();
    }
    
    getPossibleMoves() {
        const moves = [];
        const { row: emptyRow, col: emptyCol } = this.emptyPos;
        
        // Check all four directions
        const directions = [
            { row: emptyRow - 1, col: emptyCol }, // Up
            { row: emptyRow + 1, col: emptyCol }, // Down
            { row: emptyRow, col: emptyCol - 1 }, // Left
            { row: emptyRow, col: emptyCol + 1 }  // Right
        ];
        
        directions.forEach(pos => {
            if (pos.row >= 0 && pos.row < this.size && 
                pos.col >= 0 && pos.col < this.size) {
                moves.push(pos);
            }
        });
        
        return moves;
    }
    
    changeSize() {
        this.size = this.size === 3 ? 4 : 3;
        this.emptyPos = { row: this.size - 1, col: this.size - 1 };
        this.gameCompleted = false;
        this.moves = 0;
        this.elapsedTime = 0;
        this.startTime = null;
        this.stopTimer();
        
        this.initializeTiles();
        this.shufflePuzzle();
    }
    
    autoSolve() {
        this.gameCompleted = false;
        this.moves = 0;
        this.elapsedTime = 0;
        this.startTime = null;
        this.stopTimer();
        
        this.initializeTiles();
        this.render();
        this.attachEventListeners();
        
        setTimeout(() => {
            this.gameCompleted = true;
            this.render();
            this.attachEventListeners();
        }, 500);
    }
    
    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const expectedValue = (i === this.size - 1 && j === this.size - 1) ? 0 : i * this.size + j + 1;
                if (this.tiles[i][j] !== expectedValue) {
                    return false;
                }
            }
        }
        return true;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        const movesElement = this.container.querySelector('#moves');
        const timeElement = this.container.querySelector('#time');
        
        if (movesElement) {
            movesElement.textContent = this.moves;
        }
        
        if (timeElement) {
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    destroy() {
        this.stopTimer();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlidingPuzzle;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SlidingPuzzle = SlidingPuzzle;
}