// ============================================
// UI MANAGEMENT
// ============================================

const UI = {
    elements: {},
    highScore: 0,
    tiltEnabled: false,
    currentDisplayState: 'normal',
    previousDisplayState: 'normal',

    init() {
        this.elements = {
            mainMenu: document.getElementById('mainMenu'),
            gameScreen: document.getElementById('gameScreen'),
            pauseModal: document.getElementById('pauseModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            healthFill: document.getElementById('healthFill'),
            healthBarContainer: document.getElementById('healthBarContainer'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            scoreValue: document.getElementById('scoreValue'),
            highScoreDisplay: document.getElementById('highScoreDisplay'),
            readyText: document.getElementById('readyText'),
            countdownText: document.getElementById('countdownText'),
            finalScore: document.getElementById('finalScore'),
            startButton: document.getElementById('startButton'),
            pauseButton: document.getElementById('pauseButton'),
            resumeButton: document.getElementById('resumeButton'),
            quitButton: document.getElementById('quitButton'),
            tryAgainButton: document.getElementById('tryAgainButton'),
            gameOverQuitButton: document.getElementById('gameOverQuitButton'),
            stateNameHeader: document.getElementById('stateNameHeader'),
            stateAnnouncement: document.getElementById('stateAnnouncement')
        };

        this.highScore = parseInt(localStorage.getItem('breadHighScore')) || 0;
        this.updateHighScoreDisplay();
        this.setupButtons();
        this.showTiltDialog();
    },

    setupButtons() {
        this.elements.startButton.addEventListener('click', () => Game.start());
        this.elements.pauseButton.addEventListener('click', () => Game.pause());
        this.elements.resumeButton.addEventListener('click', () => Game.resume());
        this.elements.quitButton.addEventListener('click', () => Game.quit());
        this.elements.tryAgainButton.addEventListener('click', () => Game.restart());
        this.elements.gameOverQuitButton.addEventListener('click', () => Game.quit());
    },

    showTiltDialog() {
        const overlay = document.createElement('div');
        overlay.id = 'tiltDialog';
        overlay.className = 'modal';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = 300;

        const box = document.createElement('div');
        box.className = 'modal-content';
        box.style.background = 'linear-gradient(180deg, #ff77ff, #77ffff)';
        box.style.padding = '30px';
        box.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = 'Tilt Your Phone to Collect Toast!';
        title.style.color = '#fff';
        title.style.marginBottom = '20px';
        title.style.fontFamily = CONFIG.FONT_HEADER;
        box.appendChild(title);

        const button = document.createElement('button');
        button.textContent = 'GET THE BREAD';
        button.className = 'menu-button';
        button.style.background = 'linear-gradient(180deg, #ff88ff, #88ffcc)';
        button.style.color = '#000';
        button.addEventListener('click', async () => {
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                try {
                    const response = await DeviceMotionEvent.requestPermission();
                    if (response === 'granted') {
                        Input.enableTilt();
                        this.tiltEnabled = true;
                    }
                } catch (err) {
                    console.error(err);
                }
            } else {
                Input.enableTilt();
                this.tiltEnabled = true;
            }
            overlay.remove();
        });

        box.appendChild(button);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    },

    getDisplayState(healthState, isMaxHealth) {
        if (isMaxHealth) return 'ultra';
        switch (healthState) {
            case 0: return 'limbo';
            case 2: return 'hyper';
            default: return 'normal';
        }
    },

    updateStateDisplay(healthState, isMaxHealth) {
        const newState = this.getDisplayState(healthState, isMaxHealth);
        const oldState = this.currentDisplayState;

        // Update header
        this.updateStateNameHeader(newState);

        // Check for announcement trigger
        if (newState !== oldState) {
            this.previousDisplayState = oldState;
            this.currentDisplayState = newState;

            // Determine if we should show announcement
            let showAnnouncement = false;
            let isGoingUp = false;

            const stateOrder = ['limbo', 'normal', 'hyper', 'ultra'];
            const oldIndex = stateOrder.indexOf(oldState);
            const newIndex = stateOrder.indexOf(newState);

            if (newIndex > oldIndex) {
                isGoingUp = true;
                // Only show for hyper and ultra going UP
                if (newState === 'hyper' || newState === 'ultra') {
                    showAnnouncement = true;
                }
            } else {
                isGoingUp = false;
                // Only show for limbo going DOWN
                if (newState === 'limbo') {
                    showAnnouncement = true;
                }
            }

            if (showAnnouncement) {
                this.showStateAnnouncement(newState, isGoingUp);
            }

            // Toggle limbo B&W
            if (newState === 'limbo') {
                this.elements.gameScreen.classList.add('limbo-ui');
            } else {
                this.elements.gameScreen.classList.remove('limbo-ui');
            }
        }
    },

    updateStateNameHeader(state) {
        const header = this.elements.stateNameHeader;
        header.innerHTML = '';

        if (state === 'ultra') {
            const letters = 'ULTRA'.split('');
            const colors = CONFIG.STATE_NAME_COLORS.ultra;
            letters.forEach((letter, i) => {
                const span = document.createElement('span');
                span.textContent = letter;
                span.style.color = colors[i % colors.length];
                header.appendChild(span);
            });
        } else {
            header.textContent = state.toUpperCase();
            header.style.color = CONFIG.STATE_NAME_COLORS[state] || '#fff';
        }
    },

    showStateAnnouncement(state, isGoingUp) {
        const el = this.elements.stateAnnouncement;
        
        // Remove previous animations
        el.classList.remove('animate-grow', 'animate-drop', 'hidden');
        el.innerHTML = '';

        // Set position
        el.style.top = `${CONFIG.STATE_ANNOUNCE_VERTICAL_OFFSET_PCT * 100}%`;

        // Set CSS custom properties
        el.style.setProperty('--initial-size', CONFIG.STATE_ANNOUNCE_INITIAL_SIZE + 'px');
        el.style.setProperty('--final-size', CONFIG.STATE_ANNOUNCE_FINAL_SIZE + 'px');
        el.style.setProperty('--fade-duration', CONFIG.STATE_ANNOUNCE_FADE_TIME + 'ms');

        // Set content with colors
        if (state === 'ultra') {
            const letters = 'ULTRA'.split('');
            const colors = CONFIG.STATE_NAME_COLORS.ultra;
            letters.forEach((letter, i) => {
                const span = document.createElement('span');
                span.textContent = letter;
                span.style.color = colors[i % colors.length];
                el.appendChild(span);
            });
        } else {
            el.textContent = state.toUpperCase();
            el.style.color = CONFIG.STATE_NAME_COLORS[state] || '#fff';
        }

        el.style.fontSize = CONFIG.STATE_ANNOUNCE_INITIAL_SIZE + 'px';

        // Force reflow
        void el.offsetWidth;

        // Apply animation
        if (state === 'limbo') {
            el.classList.add('animate-drop');
        } else {
            el.classList.add('animate-grow');
        }

        // Hide after animation
        setTimeout(() => {
            el.classList.add('hidden');
            el.classList.remove('animate-grow', 'animate-drop');
        }, CONFIG.STATE_ANNOUNCE_FADE_TIME);
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
        this.elements.gameScreen.classList.remove('limbo-ui');
        this.currentDisplayState = 'normal';
        this.previousDisplayState = 'normal';
        this.updateStateNameHeader('normal');
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
        this.elements.scoreValue.textContent = score;
    },

    updateHealthBar(health, maxHealth, healthState, isMaxed) {
        const percentage = isMaxed ? 100 : (health / maxHealth) * 100;
        this.elements.healthFill.style.width = `${percentage}%`;
        this.elements.healthFill.classList.remove('limbo', 'normal', 'hyper', 'ultra');
        if (isMaxed) {
            this.elements.healthFill.classList.add('ultra');
        } else {
            switch (healthState) {
                case 0: this.elements.healthFill.classList.add('limbo'); break;
                case 1: this.elements.healthFill.classList.add('normal'); break;
                case 2: this.elements.healthFill.classList.add('hyper'); break;
            }
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