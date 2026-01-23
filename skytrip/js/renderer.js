// ============================================
// RENDERING
// ============================================

const Renderer = {
    canvas: null,
    ctx: null,
    screen: { width: 0, height: 0 },
    
    currentBg: null,
    targetBg: null,
    bgFadeProgress: 1,
    bgFadeTime: 0,
    
    discoFrame: 0,
    discoAnimTime: 0,
    discoFlashOpacity: 0,
    discoFlashTime: 0,
    discoHue: 0,

    gifFrames: { 'cat-fu': 0, 'cheetah': 0, 'dancing-cat': 0 },
    gifAnimTimes: { 'cat-fu': 0, 'cheetah': 0, 'dancing-cat': 0 },

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
        
        let gameWidth, gameHeight;
        
        if (windowWidth < windowHeight) {
            gameWidth = windowWidth;
            gameHeight = windowHeight;
        } else {
            gameHeight = windowHeight;
            gameWidth = Math.min(gameHeight * CONFIG.PORTRAIT_ASPECT_RATIO, CONFIG.MAX_GAME_WIDTH);
        }
        
        container.style.width = `${gameWidth}px`;
        container.style.height = `${gameHeight}px`;
        
        this.canvas.width = gameWidth;
        this.canvas.height = gameHeight;
        this.screen = { width: gameWidth, height: gameHeight };
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
            this.discoFlashOpacity = CONFIG.DISCO_FLASH_OPACITY;
            this.discoFlashTime = 0;
        }
    },

    updateBackgroundFade(deltaTime) {
        if (this.bgFadeProgress < 1) {
            this.bgFadeTime += deltaTime * 1000;
            this.bgFadeProgress = Math.min(this.bgFadeTime / CONFIG.BG_CROSSFADE_TIME, 1);
        }
        
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

        if (this.currentBg) {
            const img = Sprites.get(this.currentBg);
            if (img) {
                ctx.globalAlpha = 1 - this.bgFadeProgress;
                ctx.drawImage(img, 0, 0, width, height);
            }
        }

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
                ctx, gif.sprite,
                this.gifFrames[gif.key],
                x, y,
                gif.config.cols, gif.config.rows,
                gif.config.scale
            );
        });
    },

    drawDebugInfo(screen, playerStep, playerX) {
        if (!CONFIG.DEBUG_MODE) return;

        const ctx = this.ctx;
        const stepBoundaries = Utils.getStepBoundaries(screen);
        const collisionY = screen.height * CONFIG.BOTTOM_LINE_Y_PCT;
        const minSpawnStep = CONFIG.MARGIN_STEPS;
        const maxSpawnStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;

        ctx.save();
        
        // Draw collision line
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, collisionY);
        ctx.lineTo(screen.width, collisionY);
        ctx.stroke();

        // Draw all lanes
        stepBoundaries.forEach((step, i) => {
            const isMargin = i < minSpawnStep || i > maxSpawnStep;
            
            // Lane boundary rectangles
            ctx.strokeStyle = isMargin ? 'rgba(255, 100, 0, 0.7)' : 'rgba(0, 200, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(step.left, collisionY - 20, step.right - step.left, 40);
            
            // Shade margin lanes across full height
            if (isMargin) {
                ctx.fillStyle = 'rgba(255, 100, 0, 0.1)';
                ctx.fillRect(step.left, 0, step.right - step.left, screen.height);
            }
            
            // Highlight collision margin around player
            const margin = CONFIG.COLLISION_STEP_MARGIN;
            if (i >= playerStep - margin && i <= playerStep + margin) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
                ctx.fillRect(step.left, collisionY - 20, step.right - step.left, 40);
            }
            
            // Lane numbers
            ctx.fillStyle = isMargin ? '#ff8800' : '#00ccff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), step.center, collisionY + 35);
        });

        // Draw bread positions near collision line
        BreadManager.breads.forEach(bread => {
            if (bread.z >= 0.9) {
                const pos = bread.getScreenPosition(screen);
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Show bread step number
                ctx.fillStyle = 'yellow';
                ctx.font = '9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`s${bread.step}`, pos.x, pos.y - 10);
            }
        });

        // Draw player position
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(playerX, collisionY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Player step label
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Step: ${playerStep}`, playerX, collisionY - 15);

        // Draw spawnable range indicator at top
        const spawnLeft = stepBoundaries[minSpawnStep].left;
        const spawnRight = stepBoundaries[maxSpawnStep].right;
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(spawnLeft, 5, spawnRight - spawnLeft, 15);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Spawn: ${minSpawnStep}-${maxSpawnStep}`, (spawnLeft + spawnRight) / 2, 16);

        ctx.restore();
    },

    clear() {
        this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);
    },

    render(gameState) {
        this.clear();

        const { healthState, isMaxHealth, playerX, isPaused, isGameOver } = gameState;

        this.drawBackground();

        if (isMaxHealth) {
            this.drawFunnyGifs();
            ActionLines.draw(this.ctx, this.screen.width, this.screen.height);
        }

        SpeedLines.draw(this.ctx, this.screen.width, this.screen.height, healthState);
        BreadManager.draw(this.ctx, this.screen, healthState);

        const discoPos = this.drawDiscoBall(playerX, healthState, isMaxHealth);
        Player.draw(this.ctx, this.screen, healthState, discoPos.x, discoPos.y);

        ParticleSystem.draw(this.ctx);
        FloatingTextSystem.draw(this.ctx);
        DamageFlash.draw(this.ctx, this.screen.width, this.screen.height);

        const playerStep = Player.getStep(this.screen);
        this.drawDebugInfo(this.screen, playerStep, playerX);
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

    forceClear() {
        this.clear();
        this.resetState();
    }
};