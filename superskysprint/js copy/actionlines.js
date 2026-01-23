// ============================================
// ANIME ACTION LINES (Max Health Effect)
// ============================================

const ActionLines = {
    angle: 0,
    lines: [],

    init() {
        this.lines = [];
        for (let i = 0; i < CONFIG.ACTION_LINES_COUNT; i++) {
            this.lines.push({
                angle: (i / CONFIG.ACTION_LINES_COUNT) * Math.PI * 2,
                length: Utils.random(CONFIG.ACTION_LINES_LENGTH_MIN, CONFIG.ACTION_LINES_LENGTH_MAX),
                hue: (i / CONFIG.ACTION_LINES_COUNT) * 360
            });
        }
    },

    update(deltaTime) {
        this.angle += (CONFIG.ACTION_LINES_SPEED * Math.PI / 180) * deltaTime;
        
        // Update hues
        this.lines.forEach(line => {
            line.hue = (line.hue + 180 * deltaTime) % 360;
        });
    },

    draw(ctx, screenWidth, screenHeight) {
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        const maxDimension = Math.max(screenWidth, screenHeight);

        ctx.save();
        ctx.globalAlpha = CONFIG.ACTION_LINES_OPACITY;
        ctx.lineWidth = CONFIG.ACTION_LINES_THICKNESS;
        ctx.lineCap = 'round';

        this.lines.forEach(line => {
            const angle = line.angle + this.angle;
            const length = line.length * screenHeight;
            
            // Start from edge of screen
            const startDist = maxDimension * 0.7;
            const startX = centerX + Math.cos(angle) * startDist;
            const startY = centerY + Math.sin(angle) * startDist;
            
            // End point (toward center)
            const endX = centerX + Math.cos(angle) * (startDist - length);
            const endY = centerY + Math.sin(angle) * (startDist - length);

            // Rainbow color
            const rgb = Utils.hslToRgb(line.hue, 100, 70);
            ctx.strokeStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        });

        ctx.restore();
    },

    reset() {
        this.angle = 0;
        this.init();
    }
};