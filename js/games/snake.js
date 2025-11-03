/**
 * Snake Game
 * Classic grid-based snake with keyboard + touch controls
 * BOARD_SIZE and cell sizes are set to scale across screens
 */
class SnakeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.BOARD_SIZE = 12; // moderate size for responsive display
        this.INITIAL_SNAKE = [[6, 6]];
        
        this.snake = [...this.INITIAL_SNAKE];
        this.food = this.generateFood(this.snake);
        this.direction = [0, 1]; // moving right initially
        this.gameOver = false;
        this.score = 0;
        this.speed = 220;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
        this.startGameLoop();
    }
    
    render() {
        // Calculate responsive cell size
        const cellSize = Math.max(14, Math.floor(Math.min(320 / this.BOARD_SIZE, 420 / this.BOARD_SIZE)));
        
        this.container.innerHTML = `
            <div class="snake-game">
                <div class="game-header">
                    <h2>Snake Game</h2>
                    <h5>Score: <span id="score">${this.score}</span></h5>
                </div>
                
                <div class="game-board-container">
                    <div class="snake-board" id="snake-board" style="
                        display: inline-block;
                        border-radius: 6px;
                        overflow: hidden;
                        padding: 6px;
                        background: #fff;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    ">
                        ${this.renderBoard(cellSize)}
                    </div>
                </div>
                
                ${this.gameOver ? '<h4 class="game-over-text">Game Over!</h4>' : ''}
                
                <div class="game-controls">
                    <button class="btn btn-secondary" id="restart-btn">Restart</button>
                </div>
                
                <!-- Touch Controls for Mobile -->
                <div class="touch-controls">
                    <div class="touch-row">
                        <button class="btn btn-primary touch-btn" data-direction="-1,0">↑</button>
                    </div>
                    <div class="touch-row">
                        <button class="btn btn-primary touch-btn" data-direction="0,-1">←</button>
                        <button class="btn btn-primary touch-btn" data-direction="0,1">→</button>
                    </div>
                    <div class="touch-row">
                        <button class="btn btn-primary touch-btn" data-direction="1,0">↓</button>
                    </div>
                </div>
                
                <div class="game-instructions">
                    <p>🎮 Use arrow keys or WASD to control the snake</p>
                    <p>🍎 Eat the red food to grow and increase your score</p>
                    <p>💀 Don't hit the walls or yourself!</p>
                </div>
            </div>
        `;
    }
    
    renderBoard(cellSize) {
        let boardHTML = '';
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            boardHTML += '<div style="display: flex;">';
            
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const isSnake = this.snake.some(([x, y]) => x === row && y === col);
                const isFood = this.food[0] === row && this.food[1] === col;
                
                let backgroundColor = '#e9ecef'; // default
                if (isSnake) backgroundColor = '#198754'; // green for snake
                if (isFood) backgroundColor = '#dc3545'; // red for food
                
                boardHTML += `
                    <div style="
                        width: ${cellSize}px;
                        height: ${cellSize}px;
                        border: 1px solid rgba(0,0,0,0.08);
                        background-color: ${backgroundColor};
                    "></div>
                `;
            }
            
            boardHTML += '</div>';
        }
        
        return boardHTML;
    }
    
    attachEventListeners() {
        const restartBtn = this.container.querySelector('#restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.handleReset());
        }
        
        // Touch controls
        const touchBtns = this.container.querySelectorAll('.touch-btn');
        touchBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const [dx, dy] = btn.dataset.direction.split(',').map(Number);
                this.handleTouchDirection(dx, dy);
            });
        });
        
        // Keyboard controls - bind to instance method for proper cleanup
        this.keyHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyHandler);
    }
    
    handleKeyPress(event) {
        if (this.gameOver) return;
        
        const dirs = {
            'ArrowUp': [-1, 0],
            'ArrowDown': [1, 0],
            'ArrowLeft': [0, -1],
            'ArrowRight': [0, 1],
            'w': [-1, 0],
            's': [1, 0],
            'a': [0, -1],
            'd': [0, 1]
        };
        
        const newDirection = dirs[event.key];
        if (newDirection) {
            const [dx, dy] = newDirection;
            
            // Prevent reversing into itself
            if (this.snake.length > 1 &&
                this.snake[0][0] + dx === this.snake[1][0] &&
                this.snake[0][1] + dy === this.snake[1][1]) {
                return;
            }
            
            this.direction = [dx, dy];
        }
    }
    
    handleTouchDirection(dx, dy) {
        if (this.gameOver) return;
        
        // Prevent reversing into itself
        if (this.snake.length > 1 &&
            this.snake[0][0] + dx === this.snake[1][0] &&
            this.snake[0][1] + dy === this.snake[1][1]) {
            return;
        }
        
        this.direction = [dx, dy];
    }
    
    startGameLoop() {
        if (this.gameOver) return;
        
        this.gameLoop = setInterval(() => {
            this.moveSnake();
        }, this.speed);
    }
    
    handleReset() {
        // Clear existing game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Reset game state
        this.snake = [...this.INITIAL_SNAKE];
        this.food = this.generateFood(this.snake);
        this.direction = [0, 1];
        this.gameOver = false;
        this.score = 0;
        this.speed = 220;
        
        // Re-render and restart
        this.render();
        this.attachEventListeners();
        this.startGameLoop();
    }
    
    moveSnake() {
        if (this.gameOver) return;
        
        const newHead = [
            this.snake[0][0] + this.direction[0], 
            this.snake[0][1] + this.direction[1]
        ];
        
        // Check collisions
        if (newHead[0] < 0 || 
            newHead[0] >= this.BOARD_SIZE || 
            newHead[1] < 0 || 
            newHead[1] >= this.BOARD_SIZE ||
            this.snake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
            
            this.gameOver = true;
            clearInterval(this.gameLoop);
            this.render();
            this.attachEventListeners();
            return;
        }
        
        const newSnake = [newHead, ...this.snake];
        
        // Check if food eaten
        if (newHead[0] === this.food[0] && newHead[1] === this.food[1]) {
            this.food = this.generateFood(newSnake);
            this.score += 1;
            
            // Increase speed slightly
            if (this.speed > 60) {
                this.speed -= 12;
                clearInterval(this.gameLoop);
                this.startGameLoop();
            }
        } else {
            newSnake.pop();
        }
        
        this.snake = newSnake;
        this.render();
        this.attachEventListeners();
    }
    
    generateFood(snake) {
        let food;
        do {
            food = [
                Math.floor(Math.random() * this.BOARD_SIZE),
                Math.floor(Math.random() * this.BOARD_SIZE)
            ];
        } while (snake.some(([x, y]) => x === food[0] && y === food[1]));
        
        return food;
    }
    
    destroy() {
        // Clean up game loop and event listeners
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.gameRunning = false;
        
        // Remove keyboard event listener
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeGame;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SnakeGame = SnakeGame;
}