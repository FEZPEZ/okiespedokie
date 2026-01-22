const Input = {
    currentX: 0,
    isActive: false,
    canvas: null,
    screenWidth: 0,
    maxTilt: 30,          // maximum tilt in degrees to map
    tiltEnabled: false,   // flag to track if tilt is active

    init(canvas) {
        this.canvas = canvas;
        this.screenWidth = canvas.width;
        this.reset(this.screenWidth);

        // ------------------
        // Mouse events
        // ------------------
        canvas.addEventListener('mousemove', (e) => this.handleMove(e.clientX));
        canvas.addEventListener('mouseenter', () => this.isActive = true);
        canvas.addEventListener('mouseleave', () => this.isActive = false);

        // ------------------
        // Touch events
        // ------------------
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isActive = true;
            if (e.touches.length > 0) this.handleMove(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) this.handleMove(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Keep last position
        }, { passive: false });

        // ------------------
        // Tilt controls
        // ------------------
        this.initTilt();
    },

    // Request tilt permission on iOS Safari
    initTilt() {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            
            // iOS 13+ requires user gesture
            const button = document.createElement('button');
            button.innerText = "Enable Tilt Controls";
            Object.assign(button.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px 40px',
                fontSize: '18px',
                zIndex: 1000,
                cursor: 'pointer'
            });
            document.body.appendChild(button);

            button.addEventListener('click', async () => {
                try {
                    const response = await DeviceOrientationEvent.requestPermission();
                    if (response === 'granted') {
                        this.tiltEnabled = true;
                        window.addEventListener('deviceorientation', (e) => this.handleTilt(e.gamma), true);
                    }
                } catch (err) {
                    console.warn("Tilt permission denied", err);
                }
                button.remove();
            });

        } else if (window.DeviceOrientationEvent) {
            // Non-iOS or older iOS versions: no permission needed
            this.tiltEnabled = true;
            window.addEventListener('deviceorientation', (e) => this.handleTilt(e.gamma), true);
        }
    },

    handleMove(clientX) {
        const rect = this.canvas.getBoundingClientRect();
        this.currentX = clientX - rect.left;
        this.isActive = true;
    },

    handleTilt(gamma) {
        if (gamma === null || !this.tiltEnabled) return;

        // Clamp tilt
        const clamped = Math.max(-this.maxTilt, Math.min(this.maxTilt, gamma));
        // Map tilt to screen X (0 → screenWidth)
        const normalized = (clamped + this.maxTilt) / (this.maxTilt * 2);
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
