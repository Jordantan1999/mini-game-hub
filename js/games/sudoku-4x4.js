/**
 * Sudoku 4x4 Game
 * A simplified Sudoku puzzle with 4x4 grid
 */
class Sudoku4x4 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.puzzles = [
            {
                initial: [
                    [1, 0, 0, 4],
                    [0, 0, 3, 0],
                    [0, 2, 0, 0],
                    [3, 0, 0, 2]
                ],
                solution: [
                    [1, 3, 2, 4],
                    [4, 1, 3, 2],
                    [2, 4, 1, 3],
                    [3, 2, 4, 1]
                ]
            },
            {
                initial: [
                    [0, 4, 0, 0],
                    [1, 0, 0, 3],
                    [0, 0, 2, 0],
                    [0, 1, 0, 4]
                ],
                solution: [
                    [3, 4, 1, 2],
                    [1, 2, 4, 3],
                    [4, 3, 2, 1],
                    [2, 1, 3, 4]
                ]
            },
            {
                initial: [
                    [0, 0, 4, 1],
                    [4, 1, 0, 0],
                    [0, 0, 1, 4],
                    [1, 4, 0, 0]
                ],
                solution: [
                    [2, 3, 4, 1],
                    [4, 1, 2, 3],
                    [3, 2, 1, 4],
                    [1, 4, 3, 2]
                ]
            }
        ];
        
        this.currentPuzzle = this.getRandomPuzzle();
        this.grid = this.currentPuzzle.initial.map(row => [...row]);
        this.message = 'ℹ️ Fill each row, column, and 2×2 box with numbers 1–4.';
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    getRandomPuzzle() {
        return this.puzzles[Math.floor(Math.random() * this.puzzles.length)];
    }
    
    render() {
        this.container.innerHTML = `
            <div class="sudoku-game">
                <div class="game-header">
                    <h3>🧩 Sudoku 4×4</h3>
                    <p class="game-message" id="game-message">${this.message}</p>
                </div>
                
                <div class="sudoku-grid">
                    ${this.grid.map((row, r) => `
                        <div class="sudoku-row">
                            ${row.map((cell, c) => `
                                <input type="text" 
                                       class="sudoku-cell ${this.currentPuzzle.initial[r][c] !== 0 ? 'prefilled' : ''}"
                                       data-row="${r}" 
                                       data-col="${c}"
                                       value="${cell === 0 ? '' : cell}"
                                       maxlength="1"
                                       ${this.currentPuzzle.initial[r][c] !== 0 ? 'readonly' : ''}>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                
                <div class="game-controls">
                    <button class="btn check-btn" id="check-btn">✅ Check Solution</button>
                    <button class="btn new-puzzle-btn" id="new-puzzle-btn">🔄 New Puzzle</button>
                    <button class="btn hint-btn" id="hint-btn">💡 Hint</button>
                </div>
                
                <div class="game-instructions">
                    <h4>Rules:</h4>
                    <ul>
                        <li>🔢 Fill each row with numbers 1-4 (no repeats)</li>
                        <li>📊 Fill each column with numbers 1-4 (no repeats)</li>
                        <li>📦 Fill each 2×2 box with numbers 1-4 (no repeats)</li>
                        <li>🔒 Gray cells are pre-filled and cannot be changed</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const cells = this.container.querySelectorAll('.sudoku-cell:not(.prefilled)');
        const checkBtn = this.container.querySelector('#check-btn');
        const newPuzzleBtn = this.container.querySelector('#new-puzzle-btn');
        const hintBtn = this.container.querySelector('#hint-btn');
        
        cells.forEach(cell => {
            cell.addEventListener('input', (e) => this.handleCellInput(e));
            cell.addEventListener('keydown', (e) => this.handleCellKeydown(e));
        });
        
        checkBtn.addEventListener('click', () => this.checkSolution());
        newPuzzleBtn.addEventListener('click', () => this.newPuzzle());
        hintBtn.addEventListener('click', () => this.showHint());
    }
    
    handleCellInput(event) {
        const input = event.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const value = input.value;
        
        // Only allow numbers 1-4 or empty
        if (value === '' || /^[1-4]$/.test(value)) {
            this.grid[row][col] = value === '' ? 0 : parseInt(value, 10);
            
            // Validate the current input
            if (value !== '') {
                const isValid = this.isValidMove(row, col, parseInt(value, 10));
                input.classList.toggle('invalid', !isValid);
                
                if (!isValid) {
                    this.updateMessage('❌ Invalid move! Check the rules.', 'error');
                } else {
                    this.updateMessage('ℹ️ Fill each row, column, and 2×2 box with numbers 1–4.', 'info');
                }
            } else {
                input.classList.remove('invalid');
            }
        } else {
            input.value = this.grid[row][col] === 0 ? '' : this.grid[row][col];
        }
    }
    
    handleCellKeydown(event) {
        const input = event.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        // Navigate with arrow keys
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.focusCell(Math.max(0, row - 1), col);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.focusCell(Math.min(3, row + 1), col);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.focusCell(row, Math.max(0, col - 1));
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.focusCell(row, Math.min(3, col + 1));
                break;
        }
    }
    
    focusCell(row, col) {
        const cell = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell && !cell.readOnly) {
            cell.focus();
            cell.select();
        }
    }
    
    isValidMove(row, col, value) {
        // Check row
        for (let c = 0; c < 4; c++) {
            if (c !== col && this.grid[row][c] === value) {
                return false;
            }
        }
        
        // Check column
        for (let r = 0; r < 4; r++) {
            if (r !== row && this.grid[r][col] === value) {
                return false;
            }
        }
        
        // Check 2x2 box
        const boxRow = Math.floor(row / 2) * 2;
        const boxCol = Math.floor(col / 2) * 2;
        
        for (let r = boxRow; r < boxRow + 2; r++) {
            for (let c = boxCol; c < boxCol + 2; c++) {
                if ((r !== row || c !== col) && this.grid[r][c] === value) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    checkSolution() {
        // Check if grid is complete
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.grid[r][c] === 0) {
                    this.updateMessage('❌ Please fill in all cells first!', 'error');
                    return;
                }
            }
        }
        
        // Check if solution is correct
        const isCorrect = JSON.stringify(this.grid) === JSON.stringify(this.currentPuzzle.solution);
        
        if (isCorrect) {
            this.updateMessage('🎉 Congratulations! You solved the puzzle!', 'success');
            this.highlightCompletion();
        } else {
            this.updateMessage('❌ Some cells are incorrect. Keep trying!', 'error');
        }
    }
    
    highlightCompletion() {
        const cells = this.container.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            cell.classList.add('completed');
        });
    }
    
    showHint() {
        // Find an empty cell and show the correct value
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.grid[r][c] === 0) {
                    const correctValue = this.currentPuzzle.solution[r][c];
                    this.grid[r][c] = correctValue;
                    
                    const cell = this.container.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    if (cell) {
                        cell.value = correctValue;
                        cell.classList.add('hint-cell');
                        setTimeout(() => cell.classList.remove('hint-cell'), 2000);
                    }
                    
                    this.updateMessage(`💡 Hint: Cell (${r + 1}, ${c + 1}) = ${correctValue}`, 'hint');
                    return;
                }
            }
        }
        
        this.updateMessage('🎉 Puzzle is already complete!', 'success');
    }
    
    newPuzzle() {
        this.currentPuzzle = this.getRandomPuzzle();
        this.grid = this.currentPuzzle.initial.map(row => [...row]);
        this.message = 'ℹ️ Fill each row, column, and 2×2 box with numbers 1–4.';
        
        this.render();
        this.attachEventListeners();
    }
    
    updateMessage(text, type) {
        this.message = text;
        const messageElement = this.container.querySelector('#game-message');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.className = `game-message ${type}`;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sudoku4x4;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.Sudoku4x4 = Sudoku4x4;
}