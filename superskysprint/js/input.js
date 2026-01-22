const Input = {
    currentX: 0,
    isActive: false,
    canvas: null,
    screenWidth: 0,
    maxTilt: 30, // max tilt in degrees before clamping

    init(canvas) {
        this.canvas = canvas;
        this.screenWidth = canvas.width;

        // Initialize to center
        this.reset(this.screenWidth);

        // Mouse / touch fallback (optional)
        canvas.addEventListener('mousemove', (e) => this.handleMove(e.clientX));
        canvas.addEventListener('mouseenter', () => this.isActive = true);
        canvas.addEventListener('mouseleave', () => this.isActive = false);

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isActive = true;
            if (e.touches.length > 0) this.handleMove(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) this.handleMove(e.touches[0].clientX);
        }, { passive: false });

        // Tilt controls
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.handleTilt(e.gamma), true);
        }
    },

    handleMove(clientX) {
        const rect = this.canvas.getBoundingClientRect();
        this.currentX = clientX - rect.left;
        this.isActive = true;
    },

    handleTilt(gamma) {
        if (gamma === null) return;

        // gamma is device rotation around Y axis (left/right tilt), usually -90 to 90
        // Map gamma to screen X
        const clampedGamma = Math.max(-this.maxTilt, Math.min(this.maxTilt, gamma));
        const normalized = (clampedGamma + this.maxTilt) / (this.maxTilt * 2); // 0 to 1
        this.currentX = normalized * this.screenWidth;
        this.isActive = true;
    },

    getX() {
        return this.currentX;
    },

    reset(screenWidth) {
        this.screenWidth = screenWidth;
        this.currentX = screenWidth / 2;
        this.isActive = false;
    }
};
