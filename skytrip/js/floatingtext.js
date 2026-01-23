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
        this.fontFamily = config.fontFamily || CONFIG.FONT_REACTION;
        
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
		ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		
		if (this.isRainbow) {
			const rgb = Utils.hslToRgb(this.hue, 100, 60);
			ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			// Reduced shadow blur from 15 to 5
			ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
			ctx.shadowBlur = 5;
			ctx.fillText(this.text, this.x, this.y);
		} else {
			ctx.fillStyle = this.color;
			// Add subtle shadow for non-rainbow text
			ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
			ctx.shadowBlur = 3;
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
            isRainbow: false,
            fontFamily: CONFIG.FONT_REACTION
        }));
    },

    spawnMaxHealthText(x, y) {
        const text = Utils.randomPick(CONFIG.FLOAT_TEXT_MAX_TEXTS);
        this.texts.push(new FloatingText(x, y + CONFIG.FLOAT_TEXT_MAX_OFFSET_Y, text, {
            fontSize: CONFIG.FLOAT_TEXT_MAX_FONT_SIZE,
            riseDistance: CONFIG.FLOAT_TEXT_MAX_RISE_DISTANCE,
            duration: CONFIG.FLOAT_TEXT_MAX_DURATION,
            isRainbow: true,
            rainbowSpeed: CONFIG.FLOAT_TEXT_MAX_RAINBOW_SPEED,
            fontFamily: CONFIG.FONT_REACTION
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