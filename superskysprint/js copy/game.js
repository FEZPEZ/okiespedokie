// ============================================
// GAME STATE & MAIN LOOP
// ============================================

const Game = {
    // State
    running: false,
    paused: false,
    gameOver: false,
    initialized: false,
    
    // Timing
    lastTime: 0,
    gameTime: 0,
    startTime: 0,
    
    // Score & Health
    score: 0,
    health: 0,
    healthState: 1,
    isMaxHealth: false,
    
    // Countdown state
    countdownActive: false,
    countdownValue: 0,
    countdownTime: 0,
    
    // Game over state
    gameOverPauseTime: 0,
    gameOverModalShown: false,

    init() {
        UI.init();
        Renderer.init(document.getElementById('gameCanvas'));
        Input.init(document.getElementById('gameCanvas'));
        ActionLines.init();
        
        // Load sprites then show menu
        Sprites.load(() => {
            this.initialized = true;
            UI.showMainMenu();
        });
    },

    start() {
        this.reset();
        UI.showGameScreen();
        
        // Force clear the canvas before showing Ready
        Renderer.forceClear();
        this.renderClearFrame();
        
        // Show "Ready?"
        UI.showReadyText('Ready?');
        
        setTimeout(() => {
            UI.showReadyText('GO!');
            setTimeout(() => {
                UI.hideReadyText();
                this.running = true;
                this.startTime = performance.now();
                this.lastTime = this.startTime;
                requestAnimationFrame((t) => this.loop(t));
            }, CONFIG.GO_DISPLAY_TIME);
        }, CONFIG.READY_GO_DELAY);
    },

    renderClearFrame() {
        // Render just the background with no game elements
        Renderer.setBackground(this.healthState);
        Renderer.clear();
        Renderer.drawBackground();
    },

    reset() {
        this.running = false;
        this.paused = false;
        this.gameOver = false;
        this.gameTime = 0;
        this.score = 0;
        this.healthState = CONFIG.STARTING_STATE;
        this.health = CONFIG.MAX_HEALTH * CONFIG.STARTING_HEALTH_PCT;
        this.isMaxHealth = false;
        this.countdownActive = false;
        this.gameOverPauseTime = 0;
        this.gameOverModalShown = false;

        const screen = Renderer.getScreen();
        Player.init(screen.width);
        Input.reset(screen.width);
        BreadManager.clear();
        ParticleSystem.clear();
        SpeedLines.clear();
        FloatingTextSystem.clear();
        DamageFlash.reset();
        ActionLines.reset();
        Renderer.resetState();
        Renderer.setBackground(this.healthState);

        UI.updateScore(0);
        UI.updateHealthBar(this.health, CONFIG.MAX_HEALTH, this.healthState, false);
        UI.hideGameOverModal();
        UI.hideCountdown();
    },

    pause() {
        if (this.gameOver) return;
        this.paused = true;
        UI.showPauseModal();
    },

    resume() {
        UI.hidePauseModal();
        this.countdownActive = true;
        this.countdownValue = CONFIG.RESUME_COUNTDOWN_SECONDS;
        this.countdownTime = 0;
        UI.showCountdown(this.countdownValue);
    },

    quit() {
        UI.updateHighScore(this.score);
        this.running = false;
        UI.showMainMenu();
    },

    restart() {
        UI.hideGameOverModal();
        this.start();
    },

    getCurrentSpeed() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const progress = Math.min(elapsed / CONFIG.SPEED_RAMP_TIME, 1);
        return {
            travelTime: Utils.lerp(CONFIG.BREAD_TRAVEL_TIME, CONFIG.MIN_TRAVEL_TIME, progress),
            spawnInterval: Utils.lerp(CONFIG.INITIAL_SPAWN_INTERVAL, CONFIG.FINAL_SPAWN_INTERVAL, progress),
            animSpeedMult: Utils.lerp(CONFIG.ANIM_SPEED_MULT_START, CONFIG.ANIM_SPEED_MULT_END, progress)
        };
    },

    handleCollision(bread) {
    const screen = Renderer.getScreen();
    const playerStep = Player.getStep(screen);
    const playerInOOB = Player.isInOOB(screen);

    // Get bread position for particles/text
    const breadPos = bread.getScreenPosition(screen);

    const stepBoundaries = Utils.getStepBoundaries(screen);
    const totalSteps = stepBoundaries.length;

    // === EDGE BUFFER (number of steps auto-collected in margins) ===
    const EDGE_BUFFER_STEPS = 3; // change this value as needed

    const leftEdgeMaxStep = EDGE_BUFFER_STEPS - 1;
    const rightEdgeMinStep = totalSteps - EDGE_BUFFER_STEPS;

    let isHit = false;

    if (!playerInOOB) {
        // Normal in-bounds collision
        const stepDiff = Math.abs(bread.step - playerStep);
        isHit = stepDiff <= CONFIG.COLLISION_STEP_MARGIN;
    } else {
        // Margin behavior with buffer
        if (playerStep < 0) {
            // Left margin → collect leftmost N breads
            isHit = bread.step <= leftEdgeMaxStep;
        } else {
            // Right margin → collect rightmost N breads
            isHit = bread.step >= rightEdgeMinStep;
        }
    }

    if (isHit) {
        // Collect!
        bread.collect();
        this.score++;
        this.addHealth(CONFIG.HEALTH_GAIN_PER_COLLECT);

        ParticleSystem.spawn(
            breadPos.x,
            breadPos.y,
            CONFIG.PARTICLE_COUNT,
            this.isMaxHealth
        );

        if (this.isMaxHealth && Math.random() < 0.25) {
			FloatingTextSystem.spawnMaxHealthText(
				Player.x,
				screen.height * CONFIG.BOTTOM_LINE_Y_PCT
			);
		}

    } else {
        // Miss!
        bread.miss();
        this.removeHealth(CONFIG.HEALTH_LOSS_PER_MISS);
        Player.triggerDamage();
        DamageFlash.trigger();
        FloatingTextSystem.spawnDamageText(
            Player.x,
            screen.height * CONFIG.BOTTOM_LINE_Y_PCT
        );
    }

    UI.updateScore(this.score);
},

    addHealth(amount) {
        // Don't add health if already at max
        if (this.isMaxHealth) return;
        
        this.health += amount;
        
        if (this.health >= CONFIG.MAX_HEALTH) {
            if (this.healthState < 2) {
                // Level up
                this.healthState++;
                this.health = this.health - CONFIG.MAX_HEALTH;
                Renderer.setBackground(this.healthState);
                
                // Check if now at max state with full health
                if (this.healthState === 2 && this.health >= CONFIG.MAX_HEALTH) {
                    this.health = CONFIG.MAX_HEALTH;
                    this.isMaxHealth = true;
                }
            } else {
                // At max state - cap health and set max flag
                this.health = CONFIG.MAX_HEALTH;
                this.isMaxHealth = true;
            }
        }
        
        UI.updateHealthBar(this.health, CONFIG.MAX_HEALTH, this.healthState, this.isMaxHealth);
    },

    removeHealth(amount) {
        // If at max health, remove the max flag first
        if (this.isMaxHealth) {
            this.isMaxHealth = false;
        }
        
        this.health -= amount;
        
        if (this.health <= 0) {
            if (this.healthState > 0) {
                // Level down
                this.healthState--;
                this.health = CONFIG.MAX_HEALTH + this.health;
                Renderer.setBackground(this.healthState);
            } else {
                // Game over
                this.health = 0;
                this.triggerGameOver();
            }
        }
        
        UI.updateHealthBar(this.health, CONFIG.MAX_HEALTH, this.healthState, this.isMaxHealth);
    },

    triggerGameOver() {
        this.gameOver = true;
        this.gameOverPauseTime = 0;
        this.gameOverModalShown = false;
        Player.triggerGameOver();
        UI.updateHighScore(this.score);
    },

    update(deltaTime) {
        // Handle countdown
        if (this.countdownActive) {
            this.countdownTime += deltaTime * 1000;
            if (this.countdownTime >= 1000) {
                this.countdownTime -= 1000;
                this.countdownValue--;
                if (this.countdownValue > 0) {
                    UI.showCountdown(this.countdownValue);
                } else {
                    UI.hideCountdown();
                    this.countdownActive = false;
                    this.paused = false;
                }
            }
            return;
        }

        // Handle game over delay
        if (this.gameOver) {
            this.gameOverPauseTime += deltaTime * 1000;
            Player.update(deltaTime);
            FloatingTextSystem.update(deltaTime);
            DamageFlash.update(deltaTime);
            
            if (!this.gameOverModalShown && this.gameOverPauseTime >= CONFIG.GAME_OVER_PAUSE_TIME) {
                this.gameOverModalShown = true;
                UI.showGameOverModal(this.score);
            }
            return;
        }

        if (this.paused) return;

        // Update game time
        this.gameTime += deltaTime;

        // Get current speed
        const speed = this.getCurrentSpeed();

        // Update player input
        Player.setTargetX(Input.getX());
        Player.update(deltaTime);

        // Update bread
        const collisions = BreadManager.update(
            deltaTime, 
            this.gameTime, 
            speed.travelTime, 
            speed.spawnInterval,
            speed.animSpeedMult
        );
        collisions.forEach(bread => this.handleCollision(bread));

        // Update effects
        ParticleSystem.update(deltaTime);
        SpeedLines.update(deltaTime, Renderer.getScreen().width, Renderer.getScreen().height, speed.animSpeedMult, this.healthState);
        FloatingTextSystem.update(deltaTime);
        DamageFlash.update(deltaTime);
        Renderer.updateBackgroundFade(deltaTime);
        Renderer.updateDiscoAnimation(deltaTime);
        Renderer.updateDiscoRainbow(deltaTime, this.isMaxHealth);
        
        if (this.isMaxHealth) {
            Renderer.updateFunnyGifs(deltaTime);
            ActionLines.update(deltaTime);
        }
    },

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.update(deltaTime);

        Renderer.render({
            healthState: this.healthState,
            isMaxHealth: this.isMaxHealth,
            playerX: Player.x,
            score: this.score,
            health: this.health,
            isPaused: this.paused,
            isGameOver: this.gameOver
        });

        requestAnimationFrame((t) => this.loop(t));
    }
};