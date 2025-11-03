/**
 * Game Hub Diagnostics
 * Helps identify issues with game loading and functionality
 */
class GameHubDiagnostics {
    constructor() {
        this.results = [];
        this.runDiagnostics();
    }
    
    log(test, status, message) {
        const result = { test, status, message, timestamp: new Date().toISOString() };
        this.results.push(result);
        console.log(`[${status.toUpperCase()}] ${test}: ${message}`);
    }
    
    runDiagnostics() {
        console.log('🔍 Running Game Hub Diagnostics...');
        
        this.checkDOMElements();
        this.checkGameClasses();
        this.checkCSS();
        this.checkEventListeners();
        
        this.generateReport();
    }
    
    checkDOMElements() {
        // Check required DOM elements
        const requiredElements = [
            'games-grid',
            'fullscreen-game',
            'game-content-area',
            'back-btn',
            'fullscreen-btn',
            'current-game-title'
        ];
        
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.log('DOM Elements', 'pass', `Element #${id} found`);
            } else {
                this.log('DOM Elements', 'fail', `Element #${id} not found`);
            }
        });
    }
    
    checkGameClasses() {
        const expectedClasses = [
            'TicTacToe',
            'SnakeGame',
            'MemoryGame',
            'RockPaperScissors',
            'GuessNumber',
            'Sudoku4x4',
            'TypingSpeedTest'
        ];
        
        expectedClasses.forEach(className => {
            if (typeof window[className] === 'function') {
                this.log('Game Classes', 'pass', `${className} class available`);
                
                // Test instantiation with dummy container
                try {
                    const testDiv = document.createElement('div');
                    testDiv.id = 'test-' + className.toLowerCase();
                    document.body.appendChild(testDiv);
                    
                    const instance = new window[className]('test-' + className.toLowerCase());
                    
                    if (instance) {
                        this.log('Game Classes', 'pass', `${className} can be instantiated`);
                        
                        // Check if it has destroy method
                        if (typeof instance.destroy === 'function') {
                            this.log('Game Classes', 'pass', `${className} has destroy method`);
                            instance.destroy();
                        } else {
                            this.log('Game Classes', 'warning', `${className} missing destroy method`);
                        }
                    }
                    
                    document.body.removeChild(testDiv);
                } catch (error) {
                    this.log('Game Classes', 'fail', `${className} instantiation failed: ${error.message}`);
                }
            } else {
                this.log('Game Classes', 'fail', `${className} class not found`);
            }
        });
    }
    
    checkCSS() {
        // Check if required CSS files are loaded
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const requiredCSS = ['styles.css', 'games.css', 'home.css'];
        
        requiredCSS.forEach(cssFile => {
            const found = stylesheets.some(link => link.href.includes(cssFile));
            if (found) {
                this.log('CSS Files', 'pass', `${cssFile} is loaded`);
            } else {
                this.log('CSS Files', 'fail', `${cssFile} not found`);
            }
        });
        
        // Check if game-specific CSS classes exist
        const testElement = document.createElement('div');
        testElement.className = 'game-container';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        if (computedStyle.padding !== '0px') {
            this.log('CSS Classes', 'pass', 'Game container styles are applied');
        } else {
            this.log('CSS Classes', 'warning', 'Game container styles may not be loaded');
        }
        
        document.body.removeChild(testElement);
    }
    
    checkEventListeners() {
        // Check if GameHub instance exists
        if (typeof window.gameHub === 'object' && window.gameHub) {
            this.log('Event Listeners', 'pass', 'GameHub instance exists');
            
            // Check if games array is populated
            if (window.gameHub.games && Array.isArray(window.gameHub.games)) {
                this.log('Event Listeners', 'pass', `${window.gameHub.games.length} games configured`);
            } else {
                this.log('Event Listeners', 'fail', 'Games array not found or empty');
            }
        } else {
            this.log('Event Listeners', 'fail', 'GameHub instance not found');
        }
        
        // Check if game tiles are rendered
        const gameTiles = document.querySelectorAll('.game-tile');
        if (gameTiles.length > 0) {
            this.log('Event Listeners', 'pass', `${gameTiles.length} game tiles rendered`);
        } else {
            this.log('Event Listeners', 'fail', 'No game tiles found');
        }
    }
    
    generateReport() {
        const passCount = this.results.filter(r => r.status === 'pass').length;
        const failCount = this.results.filter(r => r.status === 'fail').length;
        const warningCount = this.results.filter(r => r.status === 'warning').length;
        const total = this.results.length;
        
        console.log('\n📊 Diagnostics Summary:');
        console.log(`✅ Passed: ${passCount}/${total}`);
        console.log(`⚠️ Warnings: ${warningCount}/${total}`);
        console.log(`❌ Failed: ${failCount}/${total}`);
        console.log(`📈 Success Rate: ${Math.round((passCount / total) * 100)}%`);
        
        if (failCount > 0) {
            console.log('\n❌ Critical Issues:');
            this.results
                .filter(r => r.status === 'fail')
                .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
        }
        
        if (warningCount > 0) {
            console.log('\n⚠️ Warnings:');
            this.results
                .filter(r => r.status === 'warning')
                .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
        }
        
        // Store results globally for debugging
        window.diagnosticsResults = this.results;
    }
}

// Auto-run diagnostics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.gameDiagnostics = new GameHubDiagnostics();
    }, 2000); // Wait 2 seconds for everything to load
});

// Make available globally
if (typeof window !== 'undefined') {
    window.GameHubDiagnostics = GameHubDiagnostics;
}