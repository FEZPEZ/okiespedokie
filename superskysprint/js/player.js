// ============================================
// PLAYER STATE & ANIMATION
// ============================================

const Player = {
    x: 0,
    targetX: 0,
    
    // Animation state
    state: 'run',
    animFrame: 0,
    animTime: 0,
    damageLoopCount: 0,
    damageLoopsCompleted: 0,
    
    // State flags
    isGameOver: false,
    
    init(screenWidth) {
        this.x = screenWidth / 2;
        this.targetX = this.x;
        this.state = 'run';
        this.animFrame = 0;
        this.animTime = 0;
        this.damageLoopCount = 0;
        this.damageLoopsCompleted = 0;
        this.isGameOver = false;
    },

    setTargetX(x) {
        this.targetX = x;
    },

    update(deltaTime) {
        // Smooth movement toward target
        const smoothing = 0.15;
        this.x += (this.targetX - this.x) * smoothing;

        // Update animation
        this.updateAnimation(deltaTime);
    },

    updateAnimation(deltaTime) {
        let fps, totalFrames;
        
        switch (this.state) {
            case 'run':
                fps = CONFIG.PLAYER_RUN_FPS;
                totalFrames = CONFIG.PLAYER_RUN_FRAMES;
                break;
            case 'damage-hold':
                fps = CONFIG.PLAYER_DAMAGE_HOLD_FPS;
                totalFrames = CONFIG.PLAYER_DAMAGE_HOLD_FRAMES;
                break;
            case 'damage-recover':
                fps = CONFIG.PLAYER_DAMAGE_RECOVER_FPS;
                totalFrames = CONFIG.PLAYER_DAMAGE_RECOVER_FRAMES;
                break;
            case 'defeat':
                fps = CONFIG.PLAYER_DEFEAT_KNEE_FPS;
                totalFrames = CONFIG.PLAYER_DEFEAT_KNEE_FRAMES;
                break;
            default:
                return;
        }

        this.animTime += deltaTime;
        const frameTime = 1 / fps;
        
        while (this.animTime >= frameTime) {
            this.animTime -= frameTime;
            this.animFrame++;

            // Handle animation completion/looping
            if (this.animFrame >= totalFrames) {
                switch (this.state) {
                    case 'run':
                        this.animFrame = 0;
                        break;
                    case 'damage-hold':
                        this.damageLoopsCompleted++;
                        if (this.damageLoopsCompleted >= CONFIG.PLAYER_DAMAGE_HOLD_LOOPS) {
                            // Switch to recover animation
                            this.state = 'damage-recover';
                            this.animFrame = 0;
                            this.animTime = 0;
                            this.damageLoopsCompleted = 0;
                        } else {
                            this.animFrame = 0;
                        }
                        break;
                    case 'damage-recover':
                        // Return to run
                        this.state = 'run';
                        this.animFrame = 0;
                        this.animTime = 0;
                        break;
                    case 'defeat':
                        this.animFrame = totalFrames - 1; // Hold on last frame
                        break;
                }
            }
        }
    },

    triggerDamage() {
        if (this.state === 'defeat') return;
        
        if (this.state === 'damage-hold') {
            // Reset loop counter if already in damage
            this.damageLoopsCompleted = 0;
        } else {
            // Start damage hold animation
            this.state = 'damage-hold';
            this.animFrame = 0;
            this.animTime = 0;
            this.damageLoopsCompleted = 0;
        }
    },

    triggerGameOver() {
        this.isGameOver = true;
        this.state = 'defeat';
        this.animFrame = 0;
        this.animTime = 0;
    },

    getStep(screen) {
        return Utils.screenXToStep(this.x, screen);
    },

    isInOOB(screen) {
        return Utils.isInOOBZone(this.x, screen);
    },

    draw(ctx, screen, healthState, discoX, discoY) {
        let spriteName, offsetX, offsetY, cols, rows;
        
        switch (this.state) {
            case 'run':
                spriteName = 'player-run';
                offsetX = CONFIG.PLAYER_RUN_OFFSET_X;
                offsetY = CONFIG.PLAYER_RUN_OFFSET_Y;
                cols = 8; rows = 1;
                break;
            case 'damage-hold':
                spriteName = 'player-damage-hold';
                offsetX = CONFIG.PLAYER_DAMAGE_HOLD_OFFSET_X;
                offsetY = CONFIG.PLAYER_DAMAGE_HOLD_OFFSET_Y;
                cols = 8; rows = 1;
                break;
            case 'damage-recover':
                spriteName = 'player-damage-recover';
                offsetX = CONFIG.PLAYER_DAMAGE_RECOVER_OFFSET_X;
                offsetY = CONFIG.PLAYER_DAMAGE_RECOVER_OFFSET_Y;
                cols = 8; rows = 1;
                break;
            case 'defeat':
                spriteName = 'player-defeat-knee';
                offsetX = CONFIG.PLAYER_DEFEAT_KNEE_OFFSET_X;
                offsetY = CONFIG.PLAYER_DEFEAT_KNEE_OFFSET_Y;
                cols = 11; rows = 1;
                break;
        }

        const x = discoX + CONFIG.PLAYER_UNIVERSAL_OFFSET_X + offsetX;
        const y = discoY + screen.height * CONFIG.PLAYER_UNIVERSAL_OFFSET_Y_PCT + offsetY;

        Sprites.drawFrame(
            ctx,
            spriteName,
            this.animFrame,
            x, y,
            cols, rows,
            CONFIG.PLAYER_SCALE
        );
    }
};