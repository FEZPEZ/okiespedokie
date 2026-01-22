// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Ease-in function (power-based)
     */
    easeIn(t, power = 2) {
        return Math.pow(t, power);
    },

    /**
     * Ease-out function (power-based)
     */
    easeOut(t, power = 2) {
        return 1 - Math.pow(1 - t, power);
    },

    /**
     * Ease-in-out function
     */
    easeInOut(t, power = 2) {
        return t < 0.5 
            ? Math.pow(2, power - 1) * Math.pow(t, power)
            : 1 - Math.pow(-2 * t + 2, power) / 2;
    },

    /**
     * Get screen dimensions accounting for mobile address bar
     */
    getScreenDimensions() {
        const container = document.getElementById('gameContainer');
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    },

    /**
     * Calculate play field boundaries
     */
    getPlayField() {
        const screen = this.getScreenDimensions();
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        
        return {
            left: marginX,
            right: screen.width - marginX,
            width: screen.width - 2 * marginX,
            screenWidth: screen.width,
            screenHeight: screen.height
        };
    },

    /**
     * Convert normalized u (0-1) to screen X at a given z depth
     */
    uToScreenX(u, z, screen) {
        // Top line (far)
        const topWidth = screen.width * CONFIG.TOP_LINE_WIDTH_PCT;
        const topLeft = (screen.width - topWidth) / 2;
        const topRight = topLeft + topWidth;
        const xTop = this.lerp(topLeft, topRight, u);

        // Bottom line (close)
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        const bottomLeft = marginX;
        const bottomRight = screen.width - marginX;
        const xBottom = this.lerp(bottomLeft, bottomRight, u);

        // Interpolate based on z
        return this.lerp(xTop, xBottom, z);
    },

    /**
     * Convert z to screen Y
     */
    zToScreenY(z, screen) {
        const topY = screen.height * CONFIG.TOP_LINE_Y_PCT;
        const bottomY = screen.height * CONFIG.BOTTOM_LINE_Y_PCT;
        return this.lerp(topY, bottomY, z);
    },

    /**
     * Get scale factor at given z depth
     */
    getScaleAtZ(z) {
        const t = Math.pow(z, CONFIG.SCALE_POWER);
        return this.lerp(CONFIG.SCALE_FAR, CONFIG.SCALE_NEAR, t);
    },

    /**
     * Convert step index to normalized u value
     */
    stepToU(step) {
        return (step + 0.5) / CONFIG.NUM_STEPS;
    },

    /**
     * Convert screen X to step index
     */
    screenXToStep(x, screen) {
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        const playWidth = screen.width - 2 * marginX;
        const relativeX = x - marginX;
        const u = relativeX / playWidth;
        return Math.floor(Utils.clamp(u, 0, 0.9999) * CONFIG.NUM_STEPS);
    },

    /**
     * Check if screen X is in OOB zone
     */
    isInOOBZone(x, screen) {
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        return x < marginX || x > screen.width - marginX;
    },

    /**
     * Convert continuous player X to normalized u (0-1)
     */
    screenXToU(x, screen) {
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        const playWidth = screen.width - 2 * marginX;
        const relativeX = x - marginX;
        return Utils.clamp(relativeX / playWidth, 0, 1);
    },

    /**
     * Get step boundaries for collision line
     */
    getStepBoundaries(screen) {
        const marginX = screen.width * CONFIG.OOB_MARGIN_PERCENT;
        const playWidth = screen.width - 2 * marginX;
        const stepWidth = playWidth / CONFIG.NUM_STEPS;
        const y = screen.height * CONFIG.BOTTOM_LINE_Y_PCT;
        
        const steps = [];
        for (let i = 0; i < CONFIG.NUM_STEPS; i++) {
            steps.push({
                left: marginX + i * stepWidth,
                right: marginX + (i + 1) * stepWidth,
                center: marginX + (i + 0.5) * stepWidth,
                y: y
            });
        }
        return steps;
    },

    /**
     * Random number in range
     */
    random(min, max) {
        return min + Math.random() * (max - min);
    },

    /**
     * Random integer in range (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },

    /**
     * Pick random element from array
     */
    randomPick(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * HSL to RGB conversion
     */
    hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
};