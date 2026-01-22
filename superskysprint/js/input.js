// ============================================
// INPUT HANDLING (Mouse, Touch, Tilt)
// ============================================

const Input = {
    currentX: 0,
    isActive: false,
    canvas: null,
    tiltEnabled: false,
    maxTilt: 30, // max degrees left/right mapped to screen edges

    init(canvas) {
        this.canvas = canvas;
        this.reset(canvas.width);

        // Mouse events
        canvas.addEventListener('mousemove', (e) => this.handleMove(e.clientX));
        canvas.addEventListener('mouseenter', () => this.isActive = true);
        canvas.addEventListener('mouseleave', () => this.isActive = false);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isActive = true;
            if (e.touches.length > 0) {
                this.handleMove(e.touches[0].clientX);
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                this.handleMove(e.touches[0].clientX);
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            // keep last position
        }, { passive: false });
    },

    handleMove(clientX) {
        const rect = this.canvas.getBoundingClientRect();
        this.currentX = clientX - rect.left;
        this.isActive = true;
    },

    getX() {
        return this.currentX;
    },

    reset(screenWidth) {
        this.currentX = screenWidth / 2;
        this.isActive = false;
    },

    // Called from UI's "Enable Tilt" button
    enableTilt() {
        if (this.tiltEnabled) return;
        this.tiltEnabled = true;

        window.addEventListener('deviceorientation', (e) => {
            if (!this.tiltEnabled) return;

            // gamma = left/right tilt, map -maxTilt..maxTilt to canvas width
            const gamma = e.gamma || 0; 
            const rect = this.canvas.getBoundingClientRect();
            const clamped = Math.max(-this.maxTilt, Math.min(this.maxTilt, gamma));
            const pct = (clamped + this.maxTilt) / (this.maxTilt * 2);
            this.currentX = pct * rect.width;
        }, true);
    }
};
