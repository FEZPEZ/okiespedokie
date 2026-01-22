// ============================================
// INPUT HANDLING (Mouse & Touch)
// ============================================

const Input = {
    currentX: 0,
    isActive: false,
    canvas: null,

    init(canvas) {
        this.canvas = canvas;
        
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
            // Keep last position, don't deactivate
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
    }
};