// ============================================
// UI MANAGEMENT
// ============================================

const UI = {
    elements: {},
    highScore: 0,
    tiltEnabled: false, // Tracks whether tilt is active

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

        // Show initial tilt dialogue
        this.showTiltDialog();
    },

    setupButtons() {
        this.elements.startButton.addEventListener('click', () => {
            Game.start();
        });
        this.elements.pauseButton.addEventListener('click', () => Game.pause());
        this.elements.resumeButton.addEventListener('click', () => Game.resume());
        this.elements.quitButton.addEventListener('click', () => Game.quit());
        this.elements.tryAgainButton.addEventListener('click', () => Game.restart());
        this.elements.gameOverQuitButton.addEventListener('click', () => Game.quit());
    },

    // =============================
    // Tilt Dialog
    // =============================
    showTiltDialog() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'tiltDialog';
        overlay.className = 'modal';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = 300;

        // Content box
        const box = document.createElement('div');
        box.className = 'modal-content';
        box.style.borderRadius = '0'; // Bauhaus square edges
        box.style.background = 'linear-gradient(180deg, #ff77ff, #77ffff)';
        box.style.padding = '30px';
        box.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = 'Enable Tilt Controls?';
        title.style.color = '#fff';
        title.style.marginBottom = '20px';
        title.style.fontFamily = "'Arial Black', sans-serif";
        box.appendChild(title);

        const button = document.createElement('button');
        button.textContent = 'Enable Tilt';
        button.className = 'menu-button';
        button.style.borderRadius = '0';
        button.style.background = 'linear-gradient(180deg, #ff88ff, #88ffcc)';
        button.style.color = '#000';
        button.style.fontWeight = 'bold';
        button.style.fontSize = 'clamp(18px,5vw,28px)';
        button.addEventListener('click', async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            if (response === 'granted') {
                Input.enableTilt();
                this.tiltEnabled = true;
            } else {
                alert('Tilt permission denied.');
            }
        } catch (err) {
            console.error(err);
            alert('Tilt permission request failed.');
        }
    } else {
        // Non-iOS or old devices
        Input.enableTilt();
        this.tiltEnabled = true;
    }
    overlay.remove();
});

        box.appendChild(button);

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    },

    // =============================
    // Existing functions (menus, score, health)
    // =============================
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
