// ============================================
// GAME STATE & MAIN LOOP
// ============================================

const Game = {
    running: false,
    paused: false,
    gameOver: false,
    initialized: false,
    
    lastTime: 0,
    gameTime: 0,
    startTime: 0,
    
    score: 0,
    health: 0,
    healthState: 1,
    isMaxHealth: false,
    
    countdownActive: false,
    countdownValue: 0,
    countdownTime: 0,
    
    gameOverPauseTime: 0,
    gameOverModalShown: false,

    // Track previous state for announcements
    prevHealthState: 1,
    prevIsMaxHealth: false,

    init() {
        UI.init();
        Renderer.init(document.getElementById('gameCanvas'));
        Input.init(document.getElementById('gameCanvas'));
        ActionLines.init();
        
        Sprites.load(() => {
            this.initialized = true;
            UI.showMainMenu();
        });
    },

    async start() {
		this.reset();
		UI.showGameScreen();
	
		Renderer.forceClear();
		this.renderClearFrame();
	
		await document.fonts.load("700 8rem Teko");
	
		UI.showReadyText('Ready?');
	
		setTimeout(() => {
			UI.showReadyText('GO!');
			setTimeout(() => {
				UI.hideReadyText();
				this.running = true;
				this.startTime = performance.now();
				this.lastTime = this.startTime;
				requestAnimationFrame(t => this.loop(t));
			}, CONFIG.GO_DISPLAY_TIME);
		}, CONFIG.READY_GO_DELAY);
	},

    renderClearFrame() {
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
        this.prevHealthState = CONFIG.STARTING_STATE;
        this.prevIsMaxHealth = false;

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

    getParticleColors() {
        if (this.isMaxHealth) {
            return CONFIG.PARTICLE_COLORS_ULTRA;
        }
        switch (this.healthState) {
            case 0: return CONFIG.PARTICLE_COLORS_LIMBO;
            case 2: return CONFIG.PARTICLE_COLORS_HYPER;
            default: return CONFIG.PARTICLE_COLORS_NORMAL;
        }
    },

    handleCollision(bread) {
        const screen = Renderer.getScreen();
        const playerStep = Player.getStep(screen);
        const breadPos = bread.getScreenPosition(screen);

        // Simple step-based collision: compare lane indices
        const stepDiff = Math.abs(bread.step - playerStep);
        const isHit = stepDiff <= CONFIG.COLLISION_STEP_MARGIN;

        // Get tier-specific health values
        const tier = BreadManager.currentTier;
        let healthGain, healthLoss;
        switch (tier) {
            case 2:
                healthGain = CONFIG.TIER_2_HEALTH_GAIN;
                healthLoss = CONFIG.TIER_2_HEALTH_LOSS;
                break;
            case 3:
                healthGain = CONFIG.TIER_3_HEALTH_GAIN;
                healthLoss = CONFIG.TIER_3_HEALTH_LOSS;
                break;
            default:
                healthGain = CONFIG.TIER_1_HEALTH_GAIN;
                healthLoss = CONFIG.TIER_1_HEALTH_LOSS;
        }

        if (isHit) {
            bread.collect();
            this.score++;
            this.addHealth(healthGain);

            const particleColors = this.getParticleColors();
            ParticleSystem.spawn(breadPos.x, breadPos.y, CONFIG.PARTICLE_COUNT, this.isMaxHealth, particleColors);

            if (this.isMaxHealth && Math.random() < 0.25) {
                FloatingTextSystem.spawnMaxHealthText(
                    Player.x,
                    screen.height * CONFIG.BOTTOM_LINE_Y_PCT
                );
            }
        } else {
            bread.miss();
            this.removeHealth(healthLoss);
            Player.triggerDamage();
            DamageFlash.trigger();
            FloatingTextSystem.spawnDamageText(
                Player.x,
                screen.height * CONFIG.BOTTOM_LINE_Y_PCT
            );
        }

        UI.updateScore(this.score);
    },

    checkStateChange() {
        const stateChanged = (this.healthState !== this.prevHealthState) || 
                            (this.isMaxHealth !== this.prevIsMaxHealth);
        
        if (stateChanged) {
            UI.updateStateDisplay(this.healthState, this.isMaxHealth);
            this.prevHealthState = this.healthState;
            this.prevIsMaxHealth = this.isMaxHealth;
        }
    },

    addHealth(amount) {
        if (this.isMaxHealth) return;
        
        this.health += amount;
        
        if (this.health >= CONFIG.MAX_HEALTH) {
            if (this.healthState < 2) {
                this.healthState++;
                this.health = this.health - CONFIG.MAX_HEALTH;
                Renderer.setBackground(this.healthState);
                
                if (this.healthState === 2 && this.health >= CONFIG.MAX_HEALTH) {
                    this.health = CONFIG.MAX_HEALTH;
                    this.isMaxHealth = true;
                }
            } else {
                this.health = CONFIG.MAX_HEALTH;
                this.isMaxHealth = true;
            }
        }
        
        UI.updateHealthBar(this.health, CONFIG.MAX_HEALTH, this.healthState, this.isMaxHealth);
        this.checkStateChange();
    },

    removeHealth(amount) {
        if (this.isMaxHealth) {
            this.isMaxHealth = false;
        }
        
        this.health -= amount;
        
        if (this.health <= 0) {
            if (this.healthState > 0) {
                this.healthState--;
                this.health = CONFIG.MAX_HEALTH + this.health;
                Renderer.setBackground(this.healthState);
            } else {
                this.health = 0;
                this.triggerGameOver();
            }
        }
        
        UI.updateHealthBar(this.health, CONFIG.MAX_HEALTH, this.healthState, this.isMaxHealth);
        this.checkStateChange();
    },

    triggerGameOver() {
        this.gameOver = true;
        this.gameOverPauseTime = 0;
        this.gameOverModalShown = false;
        Player.triggerGameOver();
        UI.updateHighScore(this.score);
    },

    update(deltaTime) {
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

        this.gameTime += deltaTime;
        const speed = this.getCurrentSpeed();

        Player.setTargetX(Input.getX());
        Player.update(deltaTime);

        const collisions = BreadManager.update(
            deltaTime, this.gameTime,
            speed.travelTime, speed.spawnInterval, speed.animSpeedMult,
            this.score
        );
        collisions.forEach(bread => this.handleCollision(bread));

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