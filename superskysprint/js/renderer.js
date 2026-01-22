// ============================================
// RENDERING
// ============================================

const Renderer = {
    canvas: null,
    ctx: null,
    screen: { width: 0, height: 0 },
    
    // Background crossfade state
    currentBg: null,
    targetBg: null,
    bgFadeProgress: 1,
    bgFadeTime: 0,
    
    // Disco ball state
    discoFrame: 0,
    discoAnimTime: 0,
    discoFlashOpacity: 0,
    discoFlashTime: 0,
    discoHue: 0,

    // Funny GIF state
    gifFrames: {
        'cat-fu': 0,
        'cheetah': 0,
        'dancing-cat': 0
    },
    gifAnimTimes: {
        'cat-fu': 0,
        'cheetah': 0,
        'dancing-cat': 0
    },

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const container = document.getElementById('gameContainer');
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate portrait dimensions
        let gameWidth, gameHeight;
        
        // On mobile (portrait), use full screen
        if (windowWidth < windowHeight) {
            gameWidth = windowWidth;
            gameHeight = windowHeight;
        } else {
            // On desktop/landscape, constrain to portrait aspect ratio
            gameHeight = windowHeight;
            gameWidth = Math.min(gameHeight * CONFIG.PORTRAIT_ASPECT_RATIO, CONFIG.MAX_GAME_WIDTH);
        }
        
        // Apply dimensions to container
        container.style.width = `${gameWidth}px`;
        container.style.height = `${gameHeight}px`;
        
        // Set canvas dimensions
        this.canvas.width = gameWidth;
        this.canvas.height = gameHeight;
        this.screen = {
            width: gameWidth,
            height: gameHeight
        };
    },

    getScreen() {
        return this.screen;
    },

    setBackground(healthState) {
        let newBg;
        switch (healthState) {
            case 0: newBg = 'bg-limbo'; break;
            case 2: newBg = 'bg-hyper'; break;
            default: newBg = 'bg-normal';
        }

        if (newBg !== this.targetBg) {
            this.currentBg = this.targetBg || newBg;
            this.targetBg = newBg;
            this.bgFadeProgress = 0;
            this.bgFadeTime = 0;
            
            // Trigger disco ball flash
            this.discoFlashOpacity = CONFIG.DISCO_FLASH_OPACITY;
            this.discoFlashTime = 0;
        }
    },

    updateBackgroundFade(deltaTime) {
        if (this.bgFadeProgress < 1) {
            this.bgFadeTime += deltaTime * 1000;
            this.bgFadeProgress = Math.min(this.bgFadeTime / CONFIG.BG_CROSSFADE_TIME, 1);
        }
        
        // Update disco flash
        if (this.discoFlashOpacity > 0) {
            this.discoFlashTime += deltaTime * 1000;
            this.discoFlashOpacity = CONFIG.DISCO_FLASH_OPACITY * 
                (1 - this.discoFlashTime / CONFIG.DISCO_FLASH_FADE_TIME);
            if (this.discoFlashOpacity < 0) this.discoFlashOpacity = 0;
        }
    },

    updateDiscoRainbow(deltaTime, isMaxHealth) {
        if (isMaxHealth) {
            this.discoHue = (this.discoHue + CONFIG.DISCO_RAINBOW_SPEED * deltaTime) % 360;
        }
    },

    drawBackground() {
        const ctx = this.ctx;
        const { width, height } = this.screen;

        // Draw current background
        if (this.currentBg) {
            const img = Sprites.get(this.currentBg);
            if (img) {
                ctx.globalAlpha = 1 - this.bgFadeProgress;
                ctx.drawImage(img, 0, 0, width, height);
            }
        }

        // Draw target background
        if (this.targetBg) {
            const img = Sprites.get(this.targetBg);
            if (img) {
                ctx.globalAlpha = this.bgFadeProgress;
                ctx.drawImage(img, 0, 0, width, height);
            }
        }

        ctx.globalAlpha = 1;
    },

    updateDiscoAnimation(deltaTime) {
        this.discoAnimTime += deltaTime;
        const frameTime = 1 / CONFIG.DISCO_ANIM_FPS;
        if (this.discoAnimTime >= frameTime) {
            this.discoAnimTime -= frameTime;
            this.discoFrame += CONFIG.DISCO_ANIM_DIRECTION;
            if (this.discoFrame >= CONFIG.DISCO_TOTAL_FRAMES) {
                this.discoFrame = 0;
            } else if (this.discoFrame < 0) {
                this.discoFrame = CONFIG.DISCO_TOTAL_FRAMES - 1;
            }
        }
    },

    drawDiscoBall(playerX, healthState, isMaxHealth) {
        const ctx = this.ctx;
        const { height } = this.screen;
        
        const x = playerX + CONFIG.DISCO_OFFSET_X;
        const y = height - (height * CONFIG.DISCO_OFFSET_Y_PCT);

        let spriteName;
        switch (healthState) {
            case 0: spriteName = 'disco-ball-limbo'; break;
            case 2: spriteName = 'disco-ball-hyper'; break;
            default: spriteName = 'disco-ball-normal';
        }

        const img = Sprites.get(spriteName);
        if (!img) return { x, y };

        const frameWidth = img.width / CONFIG.DISCO_COLS;
        const frameHeight = img.height / CONFIG.DISCO_ROWS;
        const col = this.discoFrame % CONFIG.DISCO_COLS;
        const row = Math.floor(this.discoFrame / CONFIG.DISCO_COLS);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(CONFIG.DISCO_ROTATION_DEG * Math.PI / 180);

        // Apply rainbow hue rotation if max health
        if (isMaxHealth) {
            ctx.filter = `hue-rotate(${this.discoHue}deg)`;
        }

        ctx.drawImage(
            img,
            col * frameWidth, row * frameHeight,
            frameWidth, frameHeight,
            -frameWidth * CONFIG.DISCO_SCALE / 2, -frameHeight * CONFIG.DISCO_SCALE / 2,
            frameWidth * CONFIG.DISCO_SCALE, frameHeight * CONFIG.DISCO_SCALE
        );

        ctx.restore();

        return { x, y };
    },

    updateFunnyGifs(deltaTime) {
        const gifs = [
            { key: 'cat-fu', config: CONFIG.GIF_CAT_FU },
            { key: 'cheetah', config: CONFIG.GIF_CHEETAH },
            { key: 'dancing-cat', config: CONFIG.GIF_DANCING_CAT }
        ];

        gifs.forEach(gif => {
            this.gifAnimTimes[gif.key] += deltaTime;
            const frameTime = 1 / gif.config.fps;
            if (this.gifAnimTimes[gif.key] >= frameTime) {
                this.gifAnimTimes[gif.key] -= frameTime;
                this.gifFrames[gif.key] = (this.gifFrames[gif.key] + 1) % gif.config.frames;
            }
        });
    },

    drawFunnyGifs() {
        const ctx = this.ctx;
        const { width, height } = this.screen;

        const gifs = [
            { key: 'cat-fu', sprite: 'gif-cat-fu', config: CONFIG.GIF_CAT_FU },
            { key: 'cheetah', sprite: 'gif-cheetah', config: CONFIG.GIF_CHEETAH },
            { key: 'dancing-cat', sprite: 'gif-dancing-cat', config: CONFIG.GIF_DANCING_CAT }
        ];

        gifs.forEach(gif => {
            const x = width * gif.config.x;
            const y = height * (1 - gif.config.y);

            Sprites.drawFrame(
                ctx,
                gif.sprite,
                this.gifFrames[gif.key],
                x, y,
                gif.config.cols, gif.config.rows,
                gif.config.scale
            );
        });
    },

    drawDebugInfo(screen, playerStep, playerX, playerInOOB) {
        if (!CONFIG.DEBUG_MODE) return;

        const ctx = this.ctx;
        const stepBoundaries = Utils.getStepBoundaries(screen);
        const collisionY = screen.height * CONFIG.BOTTOM_LINE_Y_PCT;

        ctx.save();
        
        // Draw collision line
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, collisionY);
        ctx.lineTo(screen.width, collisionY);
        ctx.stroke();

        // Draw step boundaries at collision line
        stepBoundaries.forEach((step, i) => {
            // Draw step box
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(step.left, collisionY - 20, step.right - step.left, 40);
            
            // Highlight player step and margin steps
            const margin = CONFIG.COLLISION_STEP_MARGIN;
            if (i >= playerStep - margin && i <= playerStep + margin && !playerInOOB) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.fillRect(step.left, collisionY - 20, step.right - step.left, 40);
            }
            
            // Draw step number
            ctx.fillStyle = 'red';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), step.center, collisionY + 35);
        });

        // Draw bread centers at collision line
        BreadManager.breads.forEach(bread => {
            if (bread.z >= 0.9) {
                const pos = bread.getScreenPosition(screen);
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw player position indicator
        ctx.fillStyle = playerInOOB ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(playerX, collisionY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw OOB zones
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(0, 0, marginX, screen.height);
        ctx.fillRect(screen.width - marginX, 0, marginX, screen.height);

        ctx.restore();
    },

    clear() {
        this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
    },

    render(gameState) {
        this.clear();

        const { healthState, isMaxHealth, playerX, isPaused, isGameOver } = gameState;

        // Draw background
        this.drawBackground();

        // Draw funny GIFs if at max health
        if (isMaxHealth) {
            this.drawFunnyGifs();
        }

        // Draw action lines if at max health
        if (isMaxHealth) {
            ActionLines.draw(this.ctx, this.screen.width, this.screen.height);
        }

        // Draw speed lines
        SpeedLines.draw(this.ctx, this.screen.width, this.screen.height, healthState);

        // Draw breads
        BreadManager.draw(this.ctx, this.screen, healthState);

        // Draw disco ball and get position
        const discoPos = this.drawDiscoBall(playerX, healthState, isMaxHealth);

        // Draw player
        Player.draw(this.ctx, this.screen, healthState, discoPos.x, discoPos.y);

        // Draw particles
        ParticleSystem.draw(this.ctx);

        // Draw floating text
        FloatingTextSystem.draw(this.ctx);

        // Draw damage flash
        DamageFlash.draw(this.ctx, this.screen.width, this.screen.height);

        // Draw debug info
        const playerStep = Player.getStep(this.screen);
        const playerInOOB = Player.isInOOB(this.screen);
        this.drawDebugInfo(this.screen, playerStep, playerX, playerInOOB);
    },

    resetState() {
        this.currentBg = null;
        this.targetBg = null;
        this.bgFadeProgress = 1;
        this.discoFrame = 0;
        this.discoFlashOpacity = 0;
        this.discoHue = 0;
        
        Object.keys(this.gifFrames).forEach(key => {
            this.gifFrames[key] = 0;
            this.gifAnimTimes[key] = 0;
        });
    },

    // Force clear everything (for game reset)
    forceClear() {
        this.clear();
        this.resetState();
    }
};