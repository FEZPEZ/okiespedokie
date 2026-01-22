// ============================================
// BREAD ENTITY
// ============================================

class Bread {
    constructor(step) {
        this.step = step;
        this.u = Utils.stepToU(step);
        this.z = 0;
        this.travelTime = 0;
        this.alive = true;
        this.collected = false;
        this.missed = false;
        this.collisionChecked = false;
        
        // Animation
        this.animFrame = 0;
        this.animTime = 0;
        
        // Miss state
        this.shakeTime = 0;
        this.shakeOffset = { x: 0, y: 0 };
    }

    update(deltaTime, travelDuration, animSpeedMult) {
        if (!this.alive) return false;

        // Update travel progress
        this.travelTime += deltaTime;
        
        // Calculate raw progress (0 to 1)
        const rawProgress = this.travelTime / travelDuration;
        
        // Apply easing for z (accelerate toward player)
        this.z = Utils.easeIn(Math.min(rawProgress, 1), CONFIG.Z_EASE_POWER);

        // Update animation with speed multiplier
        const fps = this.missed ? CONFIG.BREAD_MISS_ANIM_FPS : CONFIG.BREAD_ANIM_FPS;
        const effectiveFps = fps * animSpeedMult;
        this.animTime += deltaTime;
        if (this.animTime >= 1 / effectiveFps) {
            this.animTime -= 1 / effectiveFps;
            this.animFrame = (this.animFrame + 1) % CONFIG.BREAD_TOTAL_FRAMES;
        }

        // Update shake if missed
        if (this.missed) {
            this.shakeTime += deltaTime * 1000;
            if (this.shakeTime < CONFIG.BREAD_SHAKE_TIME) {
                const intensity = CONFIG.BREAD_SHAKE_INTENSITY * (1 - this.shakeTime / CONFIG.BREAD_SHAKE_TIME);
                this.shakeOffset.x = (Math.random() - 0.5) * 2 * intensity;
                this.shakeOffset.y = (Math.random() - 0.5) * 2 * intensity;
            } else {
                this.alive = false;
            }
        }

        // Check if reached collision point (exactly once)
        if (this.z >= CONFIG.COLLISION_Z && !this.collected && !this.missed && !this.collisionChecked) {
            this.collisionChecked = true;
            return true; // Signal collision check needed
        }

        return false;
    }

    getScreenPosition(screen) {
        const x = Utils.uToScreenX(this.u, this.z, screen) + this.shakeOffset.x;
        const y = Utils.zToScreenY(this.z, screen) + this.shakeOffset.y;
        return { x, y };
    }

    getScale() {
        return Utils.getScaleAtZ(this.z);
    }

    collect() {
        this.collected = true;
        this.alive = false;
    }

    miss() {
        this.missed = true;
        this.shakeTime = 0;
    }

    draw(ctx, screen, healthState) {
        if (!this.alive) return;

        const pos = this.getScreenPosition(screen);
        const scale = this.getScale();

        // Determine sprite based on health state
        let spriteName;
        switch (healthState) {
            case 0: spriteName = 'bread-limbo'; break;
            case 2: spriteName = 'bread-hyper'; break;
            default: spriteName = 'bread-normal';
        }

        Sprites.drawFrame(
            ctx,
            spriteName,
            this.animFrame,
            pos.x, pos.y,
            CONFIG.BREAD_COLS, CONFIG.BREAD_ROWS,
            scale
        );
    }
}

const BreadManager = {
    breads: [],
    spawnTimer: 0,
    stagePatterns: [],
    currentPattern: [],
    patternIndex: 0,

    init() {
        this.breads = [];
        this.spawnTimer = 0;
        this.generatePattern();
    },

    generatePattern() {
        this.currentPattern = [];
        const patternLength = Utils.randomInt(20, 40);
        const patternType = Utils.randomInt(0, 3);
        
        switch (patternType) {
            case 0: // Sequential
                let pos = Utils.randomInt(0, CONFIG.NUM_STEPS - 1);
                let dir = Math.random() < 0.5 ? 1 : -1;
                for (let i = 0; i < patternLength; i++) {
                    this.currentPattern.push(pos);
                    pos += dir;
                    if (pos < 0 || pos >= CONFIG.NUM_STEPS) {
                        dir = -dir;
                        pos += dir * 2;
                    }
                }
                break;
                
            case 1: // Zigzag
                let col = Utils.randomInt(2, CONFIG.NUM_STEPS - 3);
                for (let i = 0; i < patternLength; i++) {
                    this.currentPattern.push(col);
                    col += (i % 2 === 0) ? 2 : -2;
                    col = Utils.clamp(col, 0, CONFIG.NUM_STEPS - 1);
                }
                break;
                
            case 2: // Clusters
                for (let i = 0; i < patternLength / 3; i++) {
                    const center = Utils.randomInt(1, CONFIG.NUM_STEPS - 2);
                    this.currentPattern.push(center - 1, center, center + 1);
                }
                break;
                
            default: // Random
                for (let i = 0; i < patternLength; i++) {
                    this.currentPattern.push(Utils.randomInt(0, CONFIG.NUM_STEPS - 1));
                }
        }
        
        this.patternIndex = 0;
    },

    getNextStep() {
        if (this.patternIndex >= this.currentPattern.length) {
            this.generatePattern();
        }
        return this.currentPattern[this.patternIndex++];
    },

    update(deltaTime, gameTime, travelDuration, spawnInterval, animSpeedMult) {
        // Spawn new bread
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer -= spawnInterval;
            const step = this.getNextStep();
            this.breads.push(new Bread(step));
        }

        // Update existing breads
        const collisions = [];
        for (let i = this.breads.length - 1; i >= 0; i--) {
            const bread = this.breads[i];
            const needsCollisionCheck = bread.update(deltaTime, travelDuration, animSpeedMult);
            
            if (needsCollisionCheck) {
                collisions.push(bread);
            }
            
            if (!bread.alive) {
                this.breads.splice(i, 1);
            }
        }

        return collisions;
    },

    draw(ctx, screen, healthState) {
        // Sort by z for proper depth ordering (far first)
        const sorted = [...this.breads].sort((a, b) => a.z - b.z);
        sorted.forEach(bread => bread.draw(ctx, screen, healthState));
    },

    clear() {
        this.breads = [];
        this.spawnTimer = 0;
        this.patternIndex = 0;
        this.currentPattern = [];
    }
};