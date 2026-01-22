// ============================================
// UI MANAGEMENT
// ============================================

const UI = {
    elements: {},
    highScore: 0,

    init() {
        this.elements = {
            mainMenu: document.getElementById('mainMenu'),
            gameScreen: document.getElementById('gameScreen'),
            pauseModal: document.getElementById('pauseModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            healthFill: document.getElementById('healthFill'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            highScoreDisplay: document.getElementById('highScoreDisplay'),
            readyText: document.getElementById('readyText'),
            countdownText: document.getElementById('countdownText'),
            finalScore: document.getElementById('finalScore'),
            startButton: document.getElementById('startButton'),
            pauseButton: document.getElementById('pauseButton'),
            resumeButton: document.getElementById('resumeButton'),
            quitButton: document.getElementById('quitButton'),
            tryAgainButton: document.getElementById('tryAgainButton'),
            gameOverQuitButton: document.getElementById('gameOverQuitButton')
        };

        // Load high score
        this.highScore = parseInt(localStorage.getItem('breadHighScore')) || 0;
        this.updateHighScoreDisplay();

        // Setup button handlers
        this.setupButtons();
    },

    setupButtons() {
        this.elements.startButton.addEventListener('click', () => Game.start());
        this.elements.pauseButton.addEventListener('click', () => Game.pause());
        this.elements.resumeButton.addEventListener('click', () => Game.resume());
        this.elements.quitButton.addEventListener('click', () => Game.quit());
        this.elements.tryAgainButton.addEventListener('click', () => Game.restart());
        this.elements.gameOverQuitButton.addEventListener('click', () => Game.quit());
    },

    showMainMenu() {
        this.elements.mainMenu.classList.remove('hidden');
        this.elements.gameScreen.classList.add('hidden');
        this.elements.pauseModal.classList.add('hidden');
        this.elements.gameOverModal.classList.add('hidden');
        this.updateHighScoreDisplay();
    },

    showGameScreen() {
        this.elements.mainMenu.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
        this.elements.pauseModal.classList.add('hidden');
        this.elements.gameOverModal.classList.add('hidden');
    },

    showPauseModal() {
        this.elements.pauseModal.classList.remove('hidden');
    },

    hidePauseModal() {
        this.elements.pauseModal.classList.add('hidden');
    },

    showGameOverModal(score) {
        this.elements.finalScore.textContent = `Score: ${score}`;
        this.elements.gameOverModal.classList.remove('hidden');
    },

    hideGameOverModal() {
        this.elements.gameOverModal.classList.add('hidden');
    },

    showReadyText(text) {
        this.elements.readyText.textContent = text;
        this.elements.readyText.classList.remove('hidden');
    },

    hideReadyText() {
        this.elements.readyText.classList.add('hidden');
    },

    showCountdown(number) {
        this.elements.countdownText.textContent = number;
        this.elements.countdownText.classList.remove('hidden');
    },

    hideCountdown() {
        this.elements.countdownText.classList.add('hidden');
    },

    updateScore(score) {
        this.elements.scoreDisplay.textContent = `Score: ${score}`;
    },

    updateHealthBar(health, maxHealth, healthState, isMaxed) {
        const percentage = isMaxed ? 100 : (health / maxHealth) * 100;
        this.elements.healthFill.style.width = `${percentage}%`;
        
        // Update class based on state
        this.elements.healthFill.classList.remove('limbo', 'normal', 'hyper');
        switch (healthState) {
            case 0: this.elements.healthFill.classList.add('limbo'); break;
            case 1: this.elements.healthFill.classList.add('normal'); break;
            case 2: this.elements.healthFill.classList.add('hyper'); break;
        }
    },

    updateHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('breadHighScore', this.highScore);
        }
    },

    updateHighScoreDisplay() {
        this.elements.highScoreDisplay.textContent = `High Score: ${this.highScore}`;
    }
};