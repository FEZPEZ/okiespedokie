// ============================================
// DAMAGE FLASH EFFECT
// ============================================

const DamageFlash = {
    active: false,
    time: 0,
    duration: CONFIG.DAMAGE_FLASH_DURATION,

    trigger() {
        this.active = true;
        this.time = 0;
    },

    update(deltaTime) {
        if (!this.active) return;
        
        this.time += deltaTime * 1000;
        if (this.time >= this.duration) {
            this.active = false;
        }
    },

    draw(ctx, screenWidth, screenHeight) {
        if (!this.active) return;

        const progress = this.time / this.duration;
        const currentOpacity = Utils.lerp(CONFIG.DAMAGE_FLASH_MAX_OPACITY, 0, progress);
        
        if (currentOpacity <= 0) return;

        const gradientHeight = screenHeight * CONFIG.DAMAGE_FLASH_HEIGHT_PCT;
        const gradientY = screenHeight - gradientHeight;

        const gradient = ctx.createLinearGradient(0, screenHeight, 0, gradientY);
        const [r, g, b] = CONFIG.DAMAGE_FLASH_COLOR;
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${CONFIG.DAMAGE_FLASH_MIN_OPACITY * currentOpacity})`);

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, gradientY, screenWidth, gradientHeight);
        ctx.restore();
    },

    reset() {
        this.active = false;
        this.time = 0;
    }
};