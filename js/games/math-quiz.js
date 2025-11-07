/**
 * Math Quiz Game
 * Timed random arithmetic problems
 */
class MathQuiz {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.score = 0;
        this.timeLeft = 60;
        this.currentProblem = null;
        this.gameActive = false;
        this.timerInterval = null;
        this.problems = [];
        this.streak = 0;
        this.bestStreak = localStorage.getItem('math-quiz-streak') || 0;
        
        this.init();
    }
    
    init() {
        this.generateProblem();
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="math-quiz-game">
                <div class="game-header">
                    <h3>Math Quiz</h3>
                    <div class="game-stats">
                        <div class="stat">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="score">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="time">${this.timeLeft}s</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Streak:</span>
                            <span class="stat-value" id="streak">${this.streak}</span>
                        </div>
                    </div>
                </div>
                
                <div class="math-problem-area">
                    <div class="problem-display">
                        <h2 id="problem">${this.currentProblem ? this.currentProblem.question : 'Click Start to begin!'}</h2>
                    </div>
                    
                    <div class="answer-input-area">
                        <input type="number" 
                               id="answer-input" 
                               placeholder="Your answer..."
                               ${!this.gameActive ? 'disabled' : ''}
                               autocomplete="off">
                        <button class="btn" id="submit-btn" ${!this.gameActive ? 'disabled' : ''}>Submit</button>
                    </div>
                    
                    <div class="feedback-area" id="feedback-area">
                        ${!this.gameActive ? '<p>Ready to test your math skills?</p>' : ''}
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="start-btn">${this.gameActive ? 'Stop Game' : 'Start Game'}</button>
                    <button class="btn" id="skip-btn" ${!this.gameActive ? 'disabled' : ''}>Skip Problem</button>
                </div>
                
                <div class="game-instructions">
                    <p>🧮 Solve as many math problems as you can in 60 seconds</p>
                    <p>⚡ Correct answers increase your streak and score</p>
                    <p>🎯 Try to beat your best streak: ${this.bestStreak}</p>
                </div>
                
                ${this.problems.length > 0 ? this.renderHistory() : ''}
            </div>
        `;
    }
    
    renderHistory() {
        const recent = this.problems.slice(-5);
        return `
            <div class="problem-history">
                <h4>Recent Problems:</h4>
                <div class="history-list">
                    ${recent.map(problem => `
                        <div class="history-item ${problem.correct ? 'correct' : 'incorrect'}">
                            ${problem.question} = ${problem.userAnswer} 
                            ${problem.correct ? '✓' : `✗ (${problem.correctAnswer})`}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const startBtn = this.container.querySelector('#start-btn');
        const submitBtn = this.container.querySelector('#submit-btn');
        const skipBtn = this.container.querySelector('#skip-btn');
        const answerInput = this.container.querySelector('#answer-input');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleGame());
        }
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswer());
        }
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipProblem());
        }
        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
        }
    }
    
    toggleGame() {
        if (this.gameActive) {
            this.stopGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = 60;
        this.streak = 0;
        this.problems = [];
        
        this.generateProblem();
        this.render();
        this.attachEventListeners();
        
        // Focus on input
        setTimeout(() => {
            const input = this.container.querySelector('#answer-input');
            if (input) input.focus();
        }, 100);
        
        // Start timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    stopGame() {
        this.gameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.render();
        this.attachEventListeners();
    }
    
    generateProblem() {
        const operations = ['+', '-', '*', '/'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch (operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 25;
                num2 = Math.floor(Math.random() * 25) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
            case '/':
                // Ensure clean division
                answer = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                num1 = answer * num2;
                break;
        }
        
        this.currentProblem = {
            question: `${num1} ${operation} ${num2}`,
            answer: answer,
            num1: num1,
            num2: num2,
            operation: operation
        };
    }
    
    submitAnswer() {
        if (!this.gameActive || !this.currentProblem) return;
        
        const input = this.container.querySelector('#answer-input');
        const userAnswer = parseInt(input.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number!', 'warning');
            return;
        }
        
        const correct = userAnswer === this.currentProblem.answer;
        
        // Record the problem
        this.problems.push({
            question: this.currentProblem.question,
            correctAnswer: this.currentProblem.answer,
            userAnswer: userAnswer,
            correct: correct
        });
        
        if (correct) {
            this.streak++;
            this.score += (this.streak > 5 ? 15 : 10); // Bonus for streaks
            this.showFeedback('Correct! 🎉', 'success');
            
            if (this.streak > this.bestStreak) {
                this.bestStreak = this.streak;
                localStorage.setItem('math-quiz-streak', this.bestStreak);
            }
        } else {
            this.streak = 0;
            this.showFeedback(`Wrong! The answer was ${this.currentProblem.answer}`, 'error');
        }
        
        // Generate next problem
        setTimeout(() => {
            this.generateProblem();
            this.updateDisplay();
            input.value = '';
            input.focus();
        }, 1000);
    }
    
    skipProblem() {
        if (!this.gameActive) return;
        
        this.streak = 0;
        this.showFeedback('Problem skipped', 'info');
        
        setTimeout(() => {
            this.generateProblem();
            this.updateDisplay();
            const input = this.container.querySelector('#answer-input');
            if (input) {
                input.value = '';
                input.focus();
            }
        }, 500);
    }
    
    showFeedback(message, type) {
        const feedbackArea = this.container.querySelector('#feedback-area');
        if (feedbackArea) {
            feedbackArea.innerHTML = `<p class="feedback-${type}">${message}</p>`;
        }
    }
    
    updateDisplay() {
        const scoreElement = this.container.querySelector('#score');
        const timeElement = this.container.querySelector('#time');
        const streakElement = this.container.querySelector('#streak');
        const problemElement = this.container.querySelector('#problem');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (timeElement) timeElement.textContent = this.timeLeft + 's';
        if (streakElement) streakElement.textContent = this.streak;
        if (problemElement && this.currentProblem) {
            problemElement.textContent = this.currentProblem.question;
        }
    }
    
    endGame() {
        this.gameActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const correct = this.problems.filter(p => p.correct).length;
        const total = this.problems.length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        setTimeout(() => {
            alert(`🧮 Time's up!\n\nScore: ${this.score}\nProblems solved: ${correct}/${total}\nAccuracy: ${accuracy}%\nBest streak: ${this.streak}`);
            this.render();
            this.attachEventListeners();
        }, 100);
    }
    
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathQuiz;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MathQuiz = MathQuiz;
}