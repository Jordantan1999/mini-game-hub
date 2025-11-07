/**
 * 2048 Game
 * Combine tiles to reach 2048
 */
class Game2048 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('2048-best') || 0;
        this.gameWon = false;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.initBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.attachEventListeners();
    }
    
    initBoard() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
    }
    
    render() {
        this.container.innerHTML = `
            <div class="game-2048">
                <div class="game-header">
                    <h3>2048</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Best:</span>
                            <span class="stat-value" id="best">${this.bestScore}</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-board-2048" id="game-board">
                    ${this.board.map((row, i) => 
                        row.map((cell, j) => `
                            <div class="tile-2048 ${cell ? `tile-${cell}` : ''}" data-row="${i}" data-col="${j}">
                                ${cell || ''}
                            </div>
                        `).join('')
                    ).join('')}
                </div>
                
                ${this.gameWon ? '<div class="win-message">🎉 You reached 2048!</div>' : ''}
                ${this.gameOver ? '<div class="game-over-message">Game Over! No more moves.</div>' : ''}
                
                <div class="game-controls">
                    <button class="btn" id="new-game-btn">New Game</button>
                </div>
                
                <div class="game-instructions">
                    <p>🎯 Use arrow keys or swipe to move tiles</p>
                    <p>🔢 Combine tiles with the same number to reach 2048!</p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const newGameBtn = this.container.querySelector('#new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }
        
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Touch controls for mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        const board = this.container.querySelector('#game-board');
        let startX, startY;
        
        board.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        board.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) this.move('left');
                else this.move('right');
            } else {
                if (diffY > 0) this.move('up');
                else this.move('down');
            }
            
            startX = startY = null;
        });
    }
    
    handleKeyPress(event) {
        if (this.gameOver) return;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.move('right');
                break;
        }
    }
    
    move(direction) {
        const previousBoard = this.board.map(row => [...row]);
        let moved = false;
        
        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateScore();
            this.checkGameState();
            this.render();
            this.attachEventListeners();
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < this.size) {
                row.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== row[j]) {
                    moved = true;
                }
                this.board[i][j] = row[j];
            }
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < this.size) {
                row.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] !== row[j]) {
                    moved = true;
                }
                this.board[i][j] = row[j];
            }
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            while (column.length < this.size) {
                column.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== column[i]) {
                    moved = true;
                }
                this.board[i][j] = column[i];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== column[i]) {
                    moved = true;
                }
                this.board[i][j] = column[i];
            }
        }
        return moved;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    updateScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best', this.bestScore);
        }
    }
    
    checkGameState() {
        // Check for 2048 tile
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 2048 && !this.gameWon) {
                    this.gameWon = true;
                    return;
                }
            }
        }
        
        // Check for game over
        if (!this.canMove()) {
            this.gameOver = true;
        }
    }
    
    canMove() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) return true;
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.board[i][j];
                if ((i < this.size - 1 && this.board[i + 1][j] === current) ||
                    (j < this.size - 1 && this.board[i][j + 1] === current)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    newGame() {
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.initBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.attachEventListeners();
    }
    
    destroy() {
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game2048;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.Game2048 = Game2048;
}