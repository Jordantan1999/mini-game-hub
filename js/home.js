/**
 * Game Hub Home Page
 * Manages game tile selection and fullscreen game experience
 */
class GameHub {
    constructor() {
        this.games = [
            {
                id: 'tic-tac-toe',
                title: 'Tic Tac Toe',
                description: 'Classic strategy game',
                icon: '⭕',
                color: '#e74c3c',
                className: 'TicTacToe'
            },
            {
                id: 'snake',
                title: 'Snake Game',
                description: 'Eat and grow longer',
                icon: '🐍',
                color: '#27ae60',
                className: 'SnakeGame'
            },
            {
                id: 'memory',
                title: 'Memory Game',
                description: 'Match the pairs',
                icon: '🧠',
                color: '#9b59b6',
                className: 'MemoryGame'
            },
            {
                id: 'rps',
                title: 'Rock Paper Scissors',
                description: 'Beat the computer',
                icon: '✂️',
                color: '#f39c12',
                className: 'RockPaperScissors'
            },
            {
                id: 'guess',
                title: 'Guess Number',
                description: 'Find the secret number',
                icon: '🎲',
                color: '#3498db',
                className: 'GuessNumber'
            },
            {
                id: 'sudoku',
                title: 'Sudoku 4×4',
                description: 'Solve the puzzle',
                icon: '🧩',
                color: '#e67e22',
                className: 'Sudoku4x4'
            },
            {
                id: 'typing',
                title: 'Typing Test',
                description: 'Test your speed',
                icon: '⌨️',
                color: '#1abc9c',
                className: 'TypingSpeedTest'
            },
            {
                id: '2048',
                title: '2048',
                description: 'Combine tiles to reach 2048',
                icon: '🔢',
                color: '#f39c12',
                className: 'Game2048'
            },
            {
                id: 'whack-a-mole',
                title: 'Whack-a-Mole',
                description: 'Click moles before they disappear',
                icon: '🐹',
                color: '#8b4513',
                className: 'WhackAMole'
            },
            {
                id: 'reaction-time',
                title: 'Reaction Time',
                description: 'Test your reflexes',
                icon: '⚡',
                color: '#e74c3c',
                className: 'ReactionTime'
            },
            {
                id: 'flappy-bird',
                title: 'Flappy Bird',
                description: 'Avoid obstacles to keep flying',
                icon: '🐦',
                color: '#3498db',
                className: 'FlappyBird'
            },
            {
                id: 'balloon-pop',
                title: 'Balloon Pop',
                description: 'Pop balloons that float up',
                icon: '🎈',
                color: '#e91e63',
                className: 'BalloonPop'
            },
            {
                id: 'math-quiz',
                title: 'Math Quiz',
                description: 'Timed arithmetic problems',
                icon: '🧮',
                color: '#9c27b0',
                className: 'MathQuiz'
            },
            {
                id: 'color-match',
                title: 'Color Match',
                description: 'Stroop effect challenge',
                icon: '🎨',
                color: '#ff5722',
                className: 'ColorMatch'
            },
            {
                id: 'sliding-puzzle',
                title: 'Sliding Puzzle',
                description: 'Arrange tiles in order',
                icon: '🧩',
                color: '#607d8b',
                className: 'SlidingPuzzle'
            },
            {
                id: 'breakout',
                title: 'Breakout',
                description: 'Break bricks with paddle and ball',
                icon: '🧱',
                color: '#795548',
                className: 'Breakout'
            },
            {
                id: 'dodge-blocks',
                title: 'Dodge Blocks',
                description: 'Avoid falling obstacles',
                icon: '🏃',
                color: '#ff9800',
                className: 'DodgeBlocks'
            }
        ];
        
        this.currentGame = null;
        this.currentGameInstance = null;
        this.isFullscreen = false;
        
        this.init();
    }
    
    init() {
        this.renderGameTiles();
        this.setupEventListeners();
        this.setupFullscreenAPI();
    }
    
    renderGameTiles() {
        const gamesGrid = document.getElementById('games-grid');
        if (!gamesGrid) return;
        
        gamesGrid.innerHTML = this.games.map(game => `
            <div class="game-tile" 
                 data-game-id="${game.id}"
                 style="--game-color: ${game.color}"
                 role="button"
                 tabindex="0"
                 aria-label="Play ${game.title}">
                <div class="game-tile-content">
                    <div class="game-icon">${game.icon}</div>
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-description">${game.description}</p>
                    <div class="play-overlay">
                        <span class="play-text">▶ PLAY</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Game tile clicks
        document.addEventListener('click', (e) => {
            const gameTile = e.target.closest('.game-tile');
            if (gameTile) {
                const gameId = gameTile.dataset.gameId;
                this.playGame(gameId);
            }
        });
        
        // Keyboard navigation for tiles
        document.addEventListener('keydown', (e) => {
            const gameTile = e.target.closest('.game-tile');
            if (gameTile && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                const gameId = gameTile.dataset.gameId;
                this.playGame(gameId);
            }
        });
        
        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.exitGame());
        }
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Escape key to exit game
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentGame) {
                this.exitGame();
            }
        });
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // About section navigation
        const aboutLinks = document.querySelectorAll('a[href="#about"]');
        aboutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAbout();
            });
        });
    }
    
    showAbout() {
        const aboutSection = document.getElementById('about');
        const mainContent = document.getElementById('main-content');
        
        if (aboutSection) aboutSection.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    hideAbout() {
        const aboutSection = document.getElementById('about');
        const mainContent = document.getElementById('main-content');
        
        if (aboutSection) aboutSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    setupFullscreenAPI() {
        // Check if fullscreen is supported
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (!this.isFullscreenSupported()) {
            if (fullscreenBtn) {
                fullscreenBtn.style.display = 'none';
            }
        }
    }
    
    playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        
        this.currentGame = game;
        
        // Show fullscreen container
        const fullscreenContainer = document.getElementById('fullscreen-game');
        const gamesGrid = document.querySelector('.games-grid-section');
        const hero = document.querySelector('.hero');
        
        if (fullscreenContainer) fullscreenContainer.style.display = 'block';
        if (gamesGrid) gamesGrid.style.display = 'none';
        if (hero) hero.style.display = 'none';
        
        // Update title
        const titleElement = document.getElementById('current-game-title');
        if (titleElement) {
            titleElement.textContent = game.title;
        }
        
        // Initialize the game
        this.initializeGame(game);
        
        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'game_start', {
                'game_name': game.id,
                'event_category': 'games'
            });
        }
        
        // Add body class for styling
        document.body.classList.add('game-active');
    }
    
    initializeGame(game) {
        const gameContentArea = document.getElementById('game-content-area');
        if (!gameContentArea) return;
        
        // Clear previous game
        gameContentArea.innerHTML = `
            <div class="game-container">
                <div id="current-game-container"></div>
            </div>
        `;
        
        // Wait a moment for DOM to update, then create game instance
        setTimeout(() => {
            try {
                const GameClass = window[game.className];
                if (GameClass) {
                    console.log(`Initializing ${game.className}...`);
                    this.currentGameInstance = new GameClass('current-game-container');
                    console.log(`${game.className} initialized successfully`);
                } else {
                    console.error(`Game class ${game.className} not found`);
                    this.showGameError(game, 'Game class not found');
                }
            } catch (error) {
                console.error('Error initializing game:', error);
                this.showGameError(game, error.message);
            }
        }, 100);
    }
    
    showGameError(game, errorMessage) {
        const gameContentArea = document.getElementById('game-content-area');
        if (gameContentArea) {
            gameContentArea.innerHTML = `
                <div class="game-error">
                    <h3>Error loading ${game.title}</h3>
                    <p>There was a problem loading the game: ${errorMessage}</p>
                    <button class="btn" onclick="gameHub.exitGame()">Back to Games</button>
                </div>
            `;
        }
    }
    
    exitGame() {
        // Clean up current game
        if (this.currentGameInstance && typeof this.currentGameInstance.destroy === 'function') {
            this.currentGameInstance.destroy();
        }
        this.currentGameInstance = null;
        
        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        // Show game selection
        const fullscreenContainer = document.getElementById('fullscreen-game');
        const gamesGrid = document.querySelector('.games-grid-section');
        const hero = document.querySelector('.hero');
        
        if (fullscreenContainer) fullscreenContainer.style.display = 'none';
        if (gamesGrid) gamesGrid.style.display = 'block';
        if (hero) hero.style.display = 'block';
        
        // Remove body class
        document.body.classList.remove('game-active');
        
        // Track analytics before clearing currentGame
        if (typeof gtag !== 'undefined' && this.currentGame) {
            gtag('event', 'game_exit', {
                'game_name': this.currentGame.id,
                'event_category': 'games'
            });
        }
        
        this.currentGame = null;
    }
    
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        const element = document.getElementById('fullscreen-game');
        if (!element) return;
        
        const requestFullscreen = element.requestFullscreen || 
                                element.webkitRequestFullscreen || 
                                element.mozRequestFullScreen || 
                                element.msRequestFullscreen;
        
        if (requestFullscreen) {
            requestFullscreen.call(element);
        }
    }
    
    exitFullscreen() {
        const exitFullscreen = document.exitFullscreen || 
                             document.webkitExitFullscreen || 
                             document.mozCancelFullScreen || 
                             document.msExitFullscreen;
        
        if (exitFullscreen) {
            exitFullscreen.call(document);
        }
    }
    
    handleFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement || 
                             document.msFullscreenElement);
        
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.textContent = this.isFullscreen ? '⛶' : '⛶';
            fullscreenBtn.setAttribute('aria-label', 
                this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
        }
        
        // Update body class for fullscreen styling
        document.body.classList.toggle('fullscreen-active', this.isFullscreen);
    }
    
    isFullscreenSupported() {
        return !!(document.fullscreenEnabled || 
                 document.webkitFullscreenEnabled || 
                 document.mozFullScreenEnabled || 
                 document.msFullscreenEnabled);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Game Hub...');
    try {
        window.gameHub = new GameHub();
        console.log('Game Hub initialized successfully');
    } catch (error) {
        console.error('Error initializing Game Hub:', error);
    }
});

// Make available globally
if (typeof window !== 'undefined') {
    window.GameHub = GameHub;
    window.hideAbout = function() {
        if (window.gameHub) {
            window.gameHub.hideAbout();
        }
    };
}