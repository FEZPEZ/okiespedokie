// ============================================
// SPEED LINES OVERLAY EFFECT
// ============================================

class SpeedLine {
    constructor(y, screenHeight) {
        this.y = y;
        this.screenHeight = screenHeight;
        this.startY = y;
        this.alive = true;
    }

    update(deltaTime, speed, animSpeedMult) {
        // Accelerate as it moves down
        const progress = (this.y - this.startY) / (this.screenHeight - this.startY);
        const acceleration = Math.pow(progress + 0.1, CONFIG.SPEEDLINE_ACCEL_POWER);
        this.y += speed * acceleration * deltaTime * animSpeedMult;

        // Die when off screen
        if (this.y > this.screenHeight) {
            this.alive = false;
        }
    }

    draw(ctx, screenWidth, screenHeight, healthState) {
        if (!this.alive) return;

        // Get state-specific colors
        let colorConfig;
        switch (healthState) {
            case 0: colorConfig = CONFIG.SPEEDLINE_LIMBO; break;
            case 2: colorConfig = CONFIG.SPEEDLINE_HYPER; break;
            default: colorConfig = CONFIG.SPEEDLINE_NORMAL;
        }

        // Calculate progress (0 at spawn, 1 at bottom)
        const totalDistance = screenHeight - this.startY;
        const traveled = this.y - this.startY;
        const progress = Utils.clamp(traveled / totalDistance, 0, 1);

        // Interpolate color
        const r = Utils.lerp(colorConfig.startColor[0], colorConfig.endColor[0], progress);
        const g = Utils.lerp(colorConfig.startColor[1], colorConfig.endColor[1], progress);
        const b = Utils.lerp(colorConfig.startColor[2], colorConfig.endColor[2], progress);
        const alpha = Utils.lerp(colorConfig.startOpacity, colorConfig.endOpacity, progress);

        // Interpolate thickness
        const thickness = Utils.lerp(CONFIG.SPEEDLINE_INITIAL_THICKNESS, CONFIG.SPEEDLINE_FINAL_THICKNESS, progress);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter'; // Additive blend
        ctx.strokeStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(0, this.y);
        ctx.lineTo(screenWidth, this.y);
        ctx.stroke();
        ctx.restore();
    }
}

const SpeedLines = {
    lines: [],
    lastSpawnY: 0,
    initialized: false,

    init(screenHeight) {
        this.lines = [];
        this.lastSpawnY = screenHeight * (1 - CONFIG.SPEEDLINE_SPAWN_Y_PCT);
        this.initialized = true;
    },

    update(deltaTime, screenWidth, screenHeight, animSpeedMult, healthState) {
        if (!this.initialized) {
            this.init(screenHeight);
        }

        const speed = CONFIG.SPEEDLINE_BASE_SPEED;
        const spawnY = screenHeight * (1 - CONFIG.SPEEDLINE_SPAWN_Y_PCT);

        // Update existing lines
        for (let i = this.lines.length - 1; i >= 0; i--) {
            this.lines[i].update(deltaTime, speed, animSpeedMult);
            if (!this.lines[i].alive) {
                this.lines.splice(i, 1);
            }
        }

        // Check if we need to spawn a new line
        let highestLineY = screenHeight;
        this.lines.forEach(line => {
            if (line.y < highestLineY) {
                highestLineY = line.y;
            }
        });

        // Spawn new line if the highest one has moved enough
        if (highestLineY > spawnY + CONFIG.SPEEDLINE_SPAWN_DISTANCE || this.lines.length === 0) {
            this.lines.push(new SpeedLine(spawnY, screenHeight));
        }
    },

    draw(ctx, screenWidth, screenHeight, healthState) {
        this.lines.forEach(line => line.draw(ctx, screenWidth, screenHeight, healthState));
    },

    clear() {
        this.lines = [];
        this.initialized = false;
    }
};