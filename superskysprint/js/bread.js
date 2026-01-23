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
        
        this.animFrame = 0;
        this.animTime = 0;
        
        this.shakeTime = 0;
        this.shakeOffset = { x: 0, y: 0 };
    }

    update(deltaTime, travelDuration, animSpeedMult) {
        if (!this.alive) return false;

        this.travelTime += deltaTime;
        const rawProgress = this.travelTime / travelDuration;
        this.z = Utils.easeIn(Math.min(rawProgress, 1), CONFIG.Z_EASE_POWER);

        const fps = this.missed ? CONFIG.BREAD_MISS_ANIM_FPS : CONFIG.BREAD_ANIM_FPS;
        const effectiveFps = fps * animSpeedMult;
        this.animTime += deltaTime;
        if (this.animTime >= 1 / effectiveFps) {
            this.animTime -= 1 / effectiveFps;
            this.animFrame = (this.animFrame + 1) % CONFIG.BREAD_TOTAL_FRAMES;
        }

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

        if (this.z >= CONFIG.COLLISION_Z && !this.collected && !this.missed && !this.collisionChecked) {
            this.collisionChecked = true;
            return true;
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

        let spriteName;
        switch (healthState) {
            case 0: spriteName = 'bread-limbo'; break;
            case 2: spriteName = 'bread-hyper'; break;
            default: spriteName = 'bread-normal';
        }

        Sprites.drawFrame(
            ctx, spriteName, this.animFrame,
            pos.x, pos.y,
            CONFIG.BREAD_COLS, CONFIG.BREAD_ROWS, scale
        );
    }
}

const BreadManager = {
    breads: [],
    spawnTimer: 0,
    currentPattern: [],
    patternIndex: 0,
    currentTier: 1,
    lastSpawnedStep: -1, // Track last spawned step for tier 3 enforcement

    init() {
        this.breads = [];
        this.spawnTimer = 0;
        this.currentTier = 1;
        this.lastSpawnedStep = -1;
        this.generatePattern();
    },

    getCurrentTier(spawnInterval) {
        if (spawnInterval >= CONFIG.TIER_2_SPAWN_THRESHOLD) return 1;
        if (spawnInterval >= CONFIG.TIER_3_SPAWN_THRESHOLD) return 2;
        return 3;
    },

    generatePattern(tier) {
        tier = tier || this.currentTier;
        this.currentPattern = [];

        switch (tier) {
            case 1: this.generateTier1Pattern(); break;
            case 2: this.generateTier2Pattern(); break;
            case 3: this.generateTier3Pattern(); break;
            default: this.generateTier1Pattern();
        }

        this.patternIndex = 0;
    },

    generateTier1Pattern() {
        const len = Utils.randomInt(CONFIG.TIER_1_PATTERN_MIN_LENGTH, CONFIG.TIER_1_PATTERN_MAX_LENGTH);
        const patternType = Utils.randomInt(0, 3);

        switch (patternType) {
            case 0: // Sequential
                this.genSequential(len, 1);
                break;
            case 1: // Zigzag (drifting)
                this.genZigzag(len, CONFIG.TIER_1_ZIGZAG_STEP);
                break;
            case 2: // Clusters
                this.genClusters(len, CONFIG.TIER_1_CLUSTER_SIZE);
                break;
            case 3: // Random burst
                this.genRandomBurst(CONFIG.TIER_1_RANDOM_BURST_LENGTH);
                break;
        }
    },

    generateTier2Pattern() {
        const len = Utils.randomInt(CONFIG.TIER_2_PATTERN_MIN_LENGTH, CONFIG.TIER_2_PATTERN_MAX_LENGTH);
        const patternType = Utils.randomInt(0, 1);

        switch (patternType) {
            case 0: // Sequential
                this.genSequential(len, 1);
                break;
            case 1: // Stepping clusters
                this.genSteppingClusters(len, CONFIG.TIER_2_CLUSTER_LENGTH, CONFIG.TIER_2_CLUSTER_STEP);
                break;
        }
    },

    generateTier3Pattern() {
        const len = Utils.randomInt(CONFIG.TIER_3_PATTERN_MIN_LENGTH, CONFIG.TIER_3_PATTERN_MAX_LENGTH);
        const patternType = Utils.randomInt(0, 1);

        switch (patternType) {
            case 0: // Sequential with 2-lane jumps
                this.genSequentialWideJump(len);
                break;
            case 1: // Clusters (original style, tier 3 config)
                this.genClusters(len, CONFIG.TIER_3_CLUSTER_SIZE);
                break;
        }
    },

    // === Pattern generators ===

    genSequential(length, stepSize) {
        let pos = Utils.randomInt(1, CONFIG.NUM_STEPS - 2);
        let dir = Math.random() < 0.5 ? 1 : -1;
        for (let i = 0; i < length; i++) {
            this.currentPattern.push(pos);
            pos += dir * stepSize;
            if (pos < 0 || pos >= CONFIG.NUM_STEPS) {
                dir = -dir;
                pos += dir * stepSize * 2;
            }
            pos = Utils.clamp(pos, 0, CONFIG.NUM_STEPS - 1);
        }
    },

    genZigzag(length, stepSize) {
        let col = Utils.randomInt(stepSize + 1, CONFIG.NUM_STEPS - stepSize - 2);
        let dir = Math.random() < 0.5 ? 1 : -1;
        for (let i = 0; i < length; i++) {
            this.currentPattern.push(col);
            col += dir * stepSize;
            if (col <= 0) {
                col = 0;
                dir = 1;
            } else if (col >= CONFIG.NUM_STEPS - 1) {
                col = CONFIG.NUM_STEPS - 1;
                dir = -1;
            }
        }
    },

    genClusters(totalLength, clusterSize) {
        let count = 0;
        while (count < totalLength) {
            const halfSize = Math.floor(clusterSize / 2);
            const center = Utils.randomInt(
                Math.max(1, halfSize),
                Math.min(CONFIG.NUM_STEPS - 2, CONFIG.NUM_STEPS - 1 - halfSize)
            );
            for (let j = -halfSize; j <= halfSize && count < totalLength; j++) {
                const step = Utils.clamp(center + j, 0, CONFIG.NUM_STEPS - 1);
                this.currentPattern.push(step);
                count++;
            }
        }
    },

    genRandomBurst(length) {
        for (let i = 0; i < length; i++) {
            this.currentPattern.push(Utils.randomInt(1, CONFIG.NUM_STEPS - 2));
        }
    },

    genSteppingClusters(totalLength, clusterLength, clusterStep) {
        let count = 0;
        while (count < totalLength) {
            let pos = Utils.randomInt(2, CONFIG.NUM_STEPS - 3);
            let dir = Math.random() < 0.5 ? 1 : -1;
            for (let i = 0; i < clusterLength && count < totalLength; i++) {
                if (pos + dir * clusterStep < 0 || pos + dir * clusterStep >= CONFIG.NUM_STEPS) {
                    dir = -dir;
                }
                this.currentPattern.push(pos);
                pos += dir * clusterStep;
                pos = Utils.clamp(pos, 0, CONFIG.NUM_STEPS - 1);
                count++;
            }
        }
    },

    genSequentialWideJump(length) {
        let pos = Utils.randomInt(2, CONFIG.NUM_STEPS - 3);
        let dir = Math.random() < 0.5 ? 1 : -1;
        let useWideJump = false;

        for (let i = 0; i < length; i++) {
            this.currentPattern.push(pos);

            let stepSize = useWideJump ? CONFIG.TIER_3_WIDE_JUMP_SIZE : 1;
            let nextPos = pos + dir * stepSize;

            if (nextPos < 0 || nextPos >= CONFIG.NUM_STEPS) {
                dir = -dir;
                useWideJump = Math.random() < CONFIG.TIER_3_WIDE_JUMP_CHANCE;
                stepSize = useWideJump ? CONFIG.TIER_3_WIDE_JUMP_SIZE : 1;
                nextPos = pos + dir * stepSize;
            }

            // Enforce max column distance within pattern
            const dist = Math.abs(nextPos - pos);
            if (dist > CONFIG.TIER_3_MAX_COLUMN_DISTANCE) {
                nextPos = pos + dir * CONFIG.TIER_3_MAX_COLUMN_DISTANCE;
            }

            nextPos = Utils.clamp(nextPos, 0, CONFIG.NUM_STEPS - 1);
            pos = nextPos;
        }
    },

    getNextStep(spawnInterval) {
        const tier = this.getCurrentTier(spawnInterval);
        if (tier !== this.currentTier) {
            this.currentTier = tier;
            this.generatePattern(tier);
        }
        if (this.patternIndex >= this.currentPattern.length) {
            this.generatePattern(tier);
        }
        
        let step = this.currentPattern[this.patternIndex++];

        // TIER 3: Globally enforce max column distance between ANY two adjacent breads
        if (tier === 3 && this.lastSpawnedStep !== -1) {
            const maxDist = CONFIG.TIER_3_MAX_COLUMN_DISTANCE;
            const minStep = Math.max(0, this.lastSpawnedStep - maxDist);
            const maxStep = Math.min(CONFIG.NUM_STEPS - 1, this.lastSpawnedStep + maxDist);
            step = Utils.clamp(step, minStep, maxStep);
        }

        this.lastSpawnedStep = step;
        return step;
    },

    update(deltaTime, gameTime, travelDuration, spawnInterval, animSpeedMult) {
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer -= spawnInterval;
            const step = this.getNextStep(spawnInterval);
            this.breads.push(new Bread(step));
        }

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
        const sorted = [...this.breads].sort((a, b) => a.z - b.z);
        sorted.forEach(bread => bread.draw(ctx, screen, healthState));
    },

    clear() {
        this.breads = [];
        this.spawnTimer = 0;
        this.patternIndex = 0;
        this.currentPattern = [];
        this.currentTier = 1;
        this.lastSpawnedStep = -1;
    }
};