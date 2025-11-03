/**
 * Typing Speed Test Game
 * Test your typing speed and accuracy with various paragraphs
 */
class TypingSpeedTest {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.paragraphs = [
            "Typing is an essential skill for programmers and writers alike. The faster and more accurately you can type, the more productive you become. Daily practice can significantly improve your typing speed over time.",
            "Learning React makes building user interfaces fun and efficient. By practicing small projects, you can master component-based architecture. Consistency in coding will boost your programming skills.",
            "Consistency is the key to improvement in every skill. Typing, like any skill, requires patience and repetition. Focused daily practice can bring noticeable improvements in speed and accuracy.",
            "JavaScript is a versatile programming language that powers the modern web. From simple scripts to complex applications, JavaScript enables developers to create interactive and dynamic user experiences.",
            "The art of programming lies not just in writing code, but in solving problems efficiently. Good programmers think before they code, plan their approach, and write clean, maintainable solutions."
        ];
        
        this.text = '';
        this.input = '';
        this.timeLeft = 60;
        this.started = false;
        this.finished = false;
        this.wpm = 0;
        this.cpm = 0;
        this.accuracy = 100;
        this.feedback = '';
        this.timerInterval = null;
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        this.text = this.getRandomParagraph();
        this.render();
        this.attachEventListeners();
    }
    
    getRandomParagraph() {
        return this.paragraphs[Math.floor(Math.random() * this.paragraphs.length)];
    }
    
    render() {
        const progress = Math.min((this.input.length / this.text.length) * 100, 100);
        const timeProgress = (this.timeLeft / 60) * 100;
        
        this.container.innerHTML = `
            <div class="typing-test-game">
                <div class="game-header">
                    <h3>⌨️ Typing Speed Test</h3>
                    <div class="timer-display">
                        <h5>Time Left: <span id="timer">${this.timeLeft}s</span></h5>
                        <div class="progress-bar">
                            <div class="progress-fill timer-progress" style="width: ${timeProgress}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="text-display-container">
                    <div class="text-display" id="text-display">
                        ${this.renderTextWithHighlight()}
                    </div>
                </div>
                
                <div class="input-container">
                    <textarea class="typing-input" 
                              id="typing-input"
                              placeholder="Start typing here..."
                              rows="5"
                              ${this.finished || this.timeLeft === 0 ? 'disabled' : ''}>${this.input}</textarea>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p class="progress-text">${Math.round(progress)}% Complete</p>
                </div>
                
                <div class="stats-container">
                    <div class="stat-card">
                        <h4>${this.wpm}</h4>
                        <p>WPM</p>
                    </div>
                    <div class="stat-card">
                        <h4>${this.cpm}</h4>
                        <p>CPM</p>
                    </div>
                    <div class="stat-card">
                        <h4>${this.accuracy}%</h4>
                        <p>Accuracy</p>
                    </div>
                </div>
                
                <div class="feedback-container">
                    <p class="feedback-text" id="feedback">${this.feedback}</p>
                </div>
                
                ${this.finished ? this.renderResults() : ''}
                
                <div class="game-controls">
                    ${!this.finished ? `
                        <button class="btn complete-btn" id="complete-btn">✅ Complete Test</button>
                    ` : ''}
                    <button class="btn restart-btn" id="restart-btn">🔄 Restart</button>
                </div>
                
                <div class="game-instructions">
                    <h4>Instructions:</h4>
                    <ul>
                        <li>⌨️ Type the text as accurately and quickly as possible</li>
                        <li>⏱️ You have 60 seconds to complete the test</li>
                        <li>📊 Your WPM (Words Per Minute) and accuracy will be calculated</li>
                        <li>🎯 Try to maintain high accuracy while increasing speed</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    renderTextWithHighlight() {
        let result = '';
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            if (i < this.input.length) {
                if (this.input[i] === char) {
                    result += `<span class="correct">${char}</span>`;
                } else {
                    result += `<span class="incorrect">${char}</span>`;
                }
            } else if (i === this.input.length) {
                result += `<span class="current">${char}</span>`;
            } else {
                result += char;
            }
        }
        return result;
    }
    
    renderResults() {
        return `
            <div class="results-container">
                <h4>🎉 Test Complete!</h4>
                <div class="final-stats">
                    <div class="final-stat">
                        <strong>Speed:</strong> ${this.wpm} WPM
                    </div>
                    <div class="final-stat">
                        <strong>Characters:</strong> ${this.cpm} CPM
                    </div>
                    <div class="final-stat">
                        <strong>Accuracy:</strong> ${this.accuracy}%
                    </div>
                    <div class="final-stat">
                        <strong>Time:</strong> ${60 - this.timeLeft}s
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const typingInput = this.container.querySelector('#typing-input');
        const completeBtn = this.container.querySelector('#complete-btn');
        const restartBtn = this.container.querySelector('#restart-btn');
        
        if (typingInput) {
            typingInput.addEventListener('input', (e) => this.handleInput(e));
            typingInput.addEventListener('focus', () => this.startTest());
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.finishTest());
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartTest());
        }
    }
    
    handleInput(event) {
        if (!this.started) {
            this.startTest();
        }
        
        this.input = event.target.value;
        this.calculateStats();
        this.updateDisplay();
    }
    
    startTest() {
        if (this.started || this.finished) return;
        
        this.started = true;
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.finishTest();
            }
        }, 1000);
    }
    
    calculateStats() {
        const timeElapsed = this.started ? (60 - this.timeLeft) / 60 : 1/60;
        const wordsTyped = this.input.trim() === '' ? 0 : this.input.trim().split(/\s+/).length;
        const charsTyped = this.input.length;
        
        this.wpm = Math.round(wordsTyped / timeElapsed);
        this.cpm = Math.round(charsTyped / timeElapsed);
        
        // Calculate accuracy
        let correctChars = 0;
        for (let i = 0; i < this.input.length; i++) {
            if (this.input[i] === this.text[i]) {
                correctChars++;
            }
        }
        
        this.accuracy = this.input.length === 0 ? 100 : Math.round((correctChars / this.input.length) * 100);
        
        // Generate feedback
        if (this.wpm < 20) {
            this.feedback = "⚡ Speed up! Keep practicing to improve your typing speed.";
        } else if (this.wpm < 40) {
            this.feedback = "👍 Good progress! You can go even faster with practice.";
        } else if (this.wpm < 60) {
            this.feedback = "🎉 Excellent speed! You're a fast typer!";
        } else {
            this.feedback = "🚀 Amazing! You're typing at professional speed!";
        }
        
        if (this.accuracy < 90) {
            this.feedback += " Focus on accuracy to improve your overall performance.";
        }
    }
    
    updateDisplay() {
        // Update text display with highlighting
        const textDisplay = this.container.querySelector('#text-display');
        if (textDisplay) {
            textDisplay.innerHTML = this.renderTextWithHighlight();
        }
        
        // Update stats
        const statCards = this.container.querySelectorAll('.stat-card h4');
        if (statCards.length >= 3) {
            statCards[0].textContent = this.wpm;
            statCards[1].textContent = this.cpm;
            statCards[2].textContent = this.accuracy + '%';
        }
        
        // Update feedback
        const feedbackElement = this.container.querySelector('#feedback');
        if (feedbackElement) {
            feedbackElement.textContent = this.feedback;
        }
        
        // Update progress
        const progress = Math.min((this.input.length / this.text.length) * 100, 100);
        const progressFill = this.container.querySelector('.progress-fill:not(.timer-progress)');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        const progressText = this.container.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = Math.round(progress) + '% Complete';
        }
    }
    
    updateTimer() {
        const timerElement = this.container.querySelector('#timer');
        if (timerElement) {
            timerElement.textContent = this.timeLeft + 's';
        }
        
        const timeProgress = (this.timeLeft / 60) * 100;
        const timerProgress = this.container.querySelector('.timer-progress');
        if (timerProgress) {
            timerProgress.style.width = timeProgress + '%';
        }
    }
    
    finishTest() {
        if (this.finished) return;
        
        this.finished = true;
        this.started = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.calculateStats();
        this.render();
        this.attachEventListeners();
    }
    
    restartTest() {
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Reset all properties
        this.text = this.getRandomParagraph();
        this.input = '';
        this.timeLeft = 60;
        this.started = false;
        this.finished = false;
        this.wpm = 0;
        this.cpm = 0;
        this.accuracy = 100;
        this.feedback = '';
        this.startTime = null;
        
        this.render();
        this.attachEventListeners();
        
        // Focus on input
        setTimeout(() => {
            const input = this.container.querySelector('#typing-input');
            if (input) input.focus();
        }, 100);
    }
    
    destroy() {
        // Clean up timer and event listeners
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TypingSpeedTest;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.TypingSpeedTest = TypingSpeedTest;
}