// ============================================
// FLOATING TEXT SYSTEM
// ============================================

class FloatingText {
    constructor(x, y, text, config) {
        this.x = x;
        this.startY = y;
        this.y = y;
        this.text = text;
        this.color = config.color || '#FFFFFF';
        this.fontSize = config.fontSize || 32;
        this.riseDistance = config.riseDistance || 80;
        this.duration = config.duration || 800;
        this.isRainbow = config.isRainbow || false;
        this.rainbowSpeed = config.rainbowSpeed || 360;
        
        this.age = 0;
        this.alive = true;
        this.hue = Math.random() * 360;
    }

    update(deltaTime) {
        this.age += deltaTime * 1000;
        
        if (this.age >= this.duration) {
            this.alive = false;
            return;
        }

        const progress = this.age / this.duration;
        this.y = this.startY - (this.riseDistance * progress);
        
        if (this.isRainbow) {
            this.hue = (this.hue + this.rainbowSpeed * deltaTime) % 360;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        const progress = this.age / this.duration;
        const alpha = 1 - Utils.easeIn(progress, 2);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${this.fontSize}px Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.isRainbow) {
            // Rainbow effect with glow
            const rgb = Utils.hslToRgb(this.hue, 100, 60);
            ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
            ctx.shadowBlur = 15;
            
            // Draw multiple times for extra glow
            ctx.fillText(this.text, this.x, this.y);
            ctx.fillText(this.text, this.x, this.y);
        } else {
            // Normal text with outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.strokeText(this.text, this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        }
        
        ctx.restore();
    }
}

const FloatingTextSystem = {
    texts: [],

    spawnDamageText(x, y) {
        const text = Utils.randomPick(CONFIG.FLOAT_TEXT_DAMAGE_TEXTS);
        this.texts.push(new FloatingText(x, y + CONFIG.FLOAT_TEXT_DAMAGE_OFFSET_Y, text, {
            color: CONFIG.FLOAT_TEXT_DAMAGE_COLOR,
            fontSize: CONFIG.FLOAT_TEXT_DAMAGE_FONT_SIZE,
            riseDistance: CONFIG.FLOAT_TEXT_DAMAGE_RISE_DISTANCE,
            duration: CONFIG.FLOAT_TEXT_DAMAGE_DURATION,
            isRainbow: false
        }));
    },

    spawnMaxHealthText(x, y) {
        const text = Utils.randomPick(CONFIG.FLOAT_TEXT_MAX_TEXTS);
        this.texts.push(new FloatingText(x, y + CONFIG.FLOAT_TEXT_MAX_OFFSET_Y, text, {
            fontSize: CONFIG.FLOAT_TEXT_MAX_FONT_SIZE,
            riseDistance: CONFIG.FLOAT_TEXT_MAX_RISE_DISTANCE,
            duration: CONFIG.FLOAT_TEXT_MAX_DURATION,
            isRainbow: true,
            rainbowSpeed: CONFIG.FLOAT_TEXT_MAX_RAINBOW_SPEED
        }));
    },

    update(deltaTime) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            this.texts[i].update(deltaTime);
            if (!this.texts[i].alive) {
                this.texts.splice(i, 1);
            }
        }
    },

    draw(ctx) {
        this.texts.forEach(t => t.draw(ctx));
    },

    clear() {
        this.texts = [];
    }
};