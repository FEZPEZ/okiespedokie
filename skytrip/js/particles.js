class Particle {
    constructor(x, y, color, isRainbow = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isRainbow = isRainbow;
        this.hue = Math.random() * 360;
        this.size = Utils.random(CONFIG.PARTICLE_SIZE_MIN, CONFIG.PARTICLE_SIZE_MAX);
        
        const angle = Utils.random(0, Math.PI * 2);
        const speed = Utils.random(CONFIG.PARTICLE_SPEED_MIN, CONFIG.PARTICLE_SPEED_MAX);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.lifetime = CONFIG.PARTICLE_LIFETIME;
        this.age = 0;
        this.alive = true;
        this.currentSize = this.size;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.alive = false;
            return;
        }

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += 300 * deltaTime;
        
        const progress = this.age / this.lifetime;
        this.currentSize = this.size * (1 - progress);
        
        if (this.isRainbow) {
            this.hue = (this.hue + 720 * deltaTime) % 360;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        const alpha = 1 - (this.age / this.lifetime);
        ctx.save();
        ctx.globalAlpha = alpha;
        
        if (this.isRainbow) {
            const rgb = Utils.hslToRgb(this.hue, 100, 60);
            ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const ParticleSystem = {
    particles: [],

    spawn(x, y, count = CONFIG.PARTICLE_COUNT, isRainbow = false, colors = null) {
        const colorArray = colors || (isRainbow ? CONFIG.PARTICLE_COLORS_ULTRA : CONFIG.PARTICLE_COLORS_NORMAL);
        for (let i = 0; i < count; i++) {
            const color = Utils.randomPick(colorArray);
            this.particles.push(new Particle(x, y, color, isRainbow));
        }
    },

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    },

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    },

    clear() {
        this.particles = [];
    }
};