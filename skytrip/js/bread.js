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
    lastSpawnedStep: -1,
    currentMaxColumnDistance: 3,

    init() {
        this.breads = [];
        this.spawnTimer = 0;
        this.currentTier = 1;
        this.lastSpawnedStep = -1;
        this.currentMaxColumnDistance = CONFIG.TIER_3_MAX_COLUMN_DISTANCE;
        this.generatePattern();
    },

    getCurrentTier(spawnInterval) {
        if (spawnInterval >= CONFIG.TIER_2_SPAWN_THRESHOLD) return 1;
        if (spawnInterval >= CONFIG.TIER_3_SPAWN_THRESHOLD) return 2;
        return 3;
    },

    updateMaxColumnDistance(score) {
        // Start with base distance
        let maxDist = CONFIG.TIER_3_MAX_COLUMN_DISTANCE;
        // Check distance tiers from highest to lowest
        for (let i = CONFIG.DISTANCE_TIERS.length - 1; i >= 0; i--) {
            if (score >= CONFIG.DISTANCE_TIERS[i].score) {
                maxDist = CONFIG.DISTANCE_TIERS[i].maxColumnDistance;
                break;
            }
        }
        this.currentMaxColumnDistance = maxDist;
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
            case 0: this.genSequential(len, 1); break;
            case 1: this.genZigzag(len, CONFIG.TIER_1_ZIGZAG_STEP); break;
            case 2: this.genClusters(len, CONFIG.TIER_1_CLUSTER_SIZE); break;
            case 3: this.genRandomBurst(CONFIG.TIER_1_RANDOM_BURST_LENGTH); break;
        }
    },

    generateTier2Pattern() {
        const len = Utils.randomInt(CONFIG.TIER_2_PATTERN_MIN_LENGTH, CONFIG.TIER_2_PATTERN_MAX_LENGTH);
        const patternType = Utils.randomInt(0, 1);

        switch (patternType) {
            case 0: this.genSequential(len, 1); break;
            case 1: this.genSteppingClusters(len, CONFIG.TIER_2_CLUSTER_LENGTH, CONFIG.TIER_2_CLUSTER_STEP); break;
        }
    },

    generateTier3Pattern() {
        const len = Utils.randomInt(CONFIG.TIER_3_PATTERN_MIN_LENGTH, CONFIG.TIER_3_PATTERN_MAX_LENGTH);
        const patternType = Utils.randomInt(0, 1);

        switch (patternType) {
            case 0: this.genSequentialWideJump(len); break;
            case 1: this.genClusters(len, CONFIG.TIER_3_CLUSTER_SIZE); break;
        }
    },

    // === Pattern generators ===
    // All generators produce steps within spawnable range: [MARGIN_STEPS, NUM_STEPS - MARGIN_STEPS - 1]

    genSequential(length, stepSize) {
        const minStep = CONFIG.MARGIN_STEPS;
        const maxStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;
        let pos = Utils.randomInt(minStep + 1, maxStep - 1);
        let dir = Math.random() < 0.5 ? 1 : -1;
        for (let i = 0; i < length; i++) {
            this.currentPattern.push(pos);
            pos += dir * stepSize;
            if (pos < minStep || pos > maxStep) {
                dir = -dir;
                pos += dir * stepSize * 2;
            }
            pos = Utils.clamp(pos, minStep, maxStep);
        }
    },

    genZigzag(length, stepSize) {
        const minStep = CONFIG.MARGIN_STEPS;
        const maxStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;
        let col = Utils.randomInt(minStep + stepSize, maxStep - stepSize);
        let dir = Math.random() < 0.5 ? 1 : -1;
        for (let i = 0; i < length; i++) {
            this.currentPattern.push(col);
            col += dir * stepSize;
            if (col <= minStep) {
                col = minStep;
                dir = 1;
            } else if (col >= maxStep) {
                col = maxStep;
                dir = -1;
            }
        }
    },

    genClusters(totalLength, clusterSize) {
        const minStep = CONFIG.MARGIN_STEPS;
        const maxStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;
        let count = 0;
        while (count < totalLength) {
            const halfSize = Math.floor(clusterSize / 2);
            const center = Utils.randomInt(
                Math.max(minStep, minStep + halfSize),
                Math.min(maxStep, maxStep - halfSize)
            );
            for (let j = -halfSize; j <= halfSize && count < totalLength; j++) {
                const step = Utils.clamp(center + j, minStep, maxStep);
                this.currentPattern.push(step);
                count++;
            }
        }
    },

    genRandomBurst(length) {
        const minStep = CONFIG.MARGIN_STEPS;
        const maxStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;
        for (let i = 0; i < length; i++) {
            this.currentPattern.push(Utils.randomInt(minStep, maxStep));
        }
    },

    genSteppingClusters(totalLength, clusterLength, clusterStep) {
        const minStep = CONFIG.MARGIN_STEPS;
        const maxStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;
        let count = 0;
        while (count < totalLength) {
            let pos = Utils.randomInt(minStep + 2, maxStep - 2);
            let dir = Math.random() < 0.5 ? 1 : -1;
            for (let i = 0; i < clusterLength && count < totalLength; i++) {
                if (pos + dir * clusterStep < minStep || pos + dir * clusterStep > maxStep) {
                    dir = -dir;
                }
                this.currentPattern.push(pos);
                pos += dir * clusterStep;
                pos = Utils.clamp(pos, minStep, maxStep);
                count++;
            }
        }
    },

    genSequentialWideJump(length) {
        const minStep = CONFIG.MARGIN_STEPS;
        const maxStep = CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1;
        let pos = Utils.randomInt(minStep + 2, maxStep - 2);
        let dir = Math.random() < 0.5 ? 1 : -1;
        let useWideJump = false;

        for (let i = 0; i < length; i++) {
            this.currentPattern.push(pos);

            let stepSize = useWideJump ? CONFIG.TIER_3_WIDE_JUMP_SIZE : 1;
            let nextPos = pos + dir * stepSize;

            if (nextPos < minStep || nextPos > maxStep) {
                dir = -dir;
                useWideJump = Math.random() < CONFIG.TIER_3_WIDE_JUMP_CHANCE;
                stepSize = useWideJump ? CONFIG.TIER_3_WIDE_JUMP_SIZE : 1;
                nextPos = pos + dir * stepSize;
            }

            // Enforce max column distance within pattern
            const dist = Math.abs(nextPos - pos);
            if (dist > this.currentMaxColumnDistance) {
                nextPos = pos + dir * this.currentMaxColumnDistance;
            }

            nextPos = Utils.clamp(nextPos, minStep, maxStep);
            pos = nextPos;
        }
    },

    getNextStep(spawnInterval, score) {
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
            this.updateMaxColumnDistance(score);
            const maxDist = this.currentMaxColumnDistance;
            const minStep = Math.max(CONFIG.MARGIN_STEPS, this.lastSpawnedStep - maxDist);
            const maxStep = Math.min(CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1, this.lastSpawnedStep + maxDist);
            step = Utils.clamp(step, minStep, maxStep);
        }

        // Final safety clamp to spawnable range
        step = Utils.clamp(step, CONFIG.MARGIN_STEPS, CONFIG.NUM_STEPS - CONFIG.MARGIN_STEPS - 1);

        this.lastSpawnedStep = step;
        return step;
    },

    update(deltaTime, gameTime, travelDuration, spawnInterval, animSpeedMult, score) {
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= spawnInterval) {
            this.spawnTimer -= spawnInterval;
            const step = this.getNextStep(spawnInterval, score);
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
        this.currentMaxColumnDistance = CONFIG.TIER_3_MAX_COLUMN_DISTANCE;
    }
};