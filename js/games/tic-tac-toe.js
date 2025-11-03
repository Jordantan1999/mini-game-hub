/**
 * Tic Tac Toe Game
 * A classic 3x3 grid game for two players
 */
class TicTacToe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="tic-tac-toe-game">
                <div class="game-header">
                    <h3>Tic Tac Toe</h3>
                    <div class="game-status" id="game-status">Player X's turn</div>
                </div>
                <div class="game-board" id="game-board">
                    ${this.board.map((cell, index) => 
                        `<button class="cell" data-index="${index}" ${!this.gameActive ? 'disabled' : ''}>${cell}</button>`
                    ).join('')}
                </div>
                <div class="game-controls">
                    <button class="btn reset-btn" id="reset-btn">Reset Game</button>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const cells = this.container.querySelectorAll('.cell');
        const resetBtn = this.container.querySelector('#reset-btn');
        
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    handleCellClick(event) {
        const index = parseInt(event.target.dataset.index);
        
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.board[index] = this.currentPlayer;
        event.target.textContent = this.currentPlayer;
        event.target.disabled = true;
        
        if (this.checkWinner()) {
            this.gameActive = false;
            this.updateStatus(`Player ${this.currentPlayer} wins! 🎉`);
            this.highlightWinningCells();
        } else if (this.board.every(cell => cell !== '')) {
            this.gameActive = false;
            this.updateStatus("It's a tie! 🤝");
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus(`Player ${this.currentPlayer}'s turn`);
        }
    }
    
    checkWinner() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }
    
    highlightWinningCells() {
        this.winningConditions.forEach(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                const cells = this.container.querySelectorAll('.cell');
                cells[a].classList.add('winning-cell');
                cells[b].classList.add('winning-cell');
                cells[c].classList.add('winning-cell');
            }
        });
    }
    
    updateStatus(message) {
        const statusElement = this.container.querySelector('#game-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.render();
        this.attachEventListeners();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicTacToe;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.TicTacToe = TicTacToe;
}