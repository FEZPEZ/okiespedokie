// ============================================
// SPRITE MANAGEMENT
// ============================================

const Sprites = {
    images: {},
    loaded: false,
    loadCount: 0,
    totalCount: 0,

    manifest: {
        // Backgrounds
        'bg-limbo': 'assets/bg-limbo.png',
        'bg-normal': 'assets/bg-normal.png',
        'bg-hyper': 'assets/bg-hyper.png',
        
        // Bread spritesheets
        'bread-limbo': 'assets/bread-limbo-3x5.png',
        'bread-normal': 'assets/bread-normal-3x5.png',
        'bread-hyper': 'assets/bread-hyper-3x5.png',
        
        // Disco ball spritesheets
        'disco-ball-limbo': 'assets/disco-ball-limbo-3x4.png',
        'disco-ball-normal': 'assets/disco-ball-normal-3x4.png',
        'disco-ball-hyper': 'assets/disco-ball-hyper-3x4.png',
        
        // Funny GIFs
        'gif-cat-fu': 'assets/gif-cat-fu-4x5.png',
        'gif-cheetah': 'assets/gif-cheetah-3x2.png',
        'gif-dancing-cat': 'assets/gif-dancing-cat-3x6.png',
        
        // Player spritesheets
        'player-run': 'assets/player-run-1x8.png',
        'player-damage-hold': 'assets/player-damage-hold-1x8.png',
        'player-damage-recover': 'assets/player-damage-recover-1x8.png',
        'player-defeat-knee': 'assets/player-defeat-knee-1x11.png'
    },

    load(onComplete) {
        const keys = Object.keys(this.manifest);
        this.totalCount = keys.length;
        this.loadCount = 0;

        if (keys.length === 0) {
            this.loaded = true;
            onComplete && onComplete();
            return;
        }

        keys.forEach(key => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                this.loadCount++;
                if (this.loadCount >= this.totalCount) {
                    this.loaded = true;
                    onComplete && onComplete();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${key}`);
                this.loadCount++;
                if (this.loadCount >= this.totalCount) {
                    this.loaded = true;
                    onComplete && onComplete();
                }
            };
            img.src = this.manifest[key];
        });
    },

    get(name) {
        return this.images[name] || null;
    },

    /**
     * Draw a frame from a spritesheet
     */
    drawFrame(ctx, spriteName, frame, x, y, cols, rows, scale = 1, rotation = 0) {
        const img = this.get(spriteName);
        if (!img) return;

        const frameWidth = img.width / cols;
        const frameHeight = img.height / rows;
        const col = frame % cols;
        const row = Math.floor(frame / cols);

        ctx.save();
        ctx.translate(x, y);
        if (rotation !== 0) {
            ctx.rotate(rotation * Math.PI / 180);
        }
        ctx.drawImage(
            img,
            col * frameWidth, row * frameHeight,
            frameWidth, frameHeight,
            -frameWidth * scale / 2, -frameHeight * scale / 2,
            frameWidth * scale, frameHeight * scale
        );
        ctx.restore();
    },

    /**
     * Get frame dimensions
     */
    getFrameSize(spriteName, cols, rows) {
        const img = this.get(spriteName);
        if (!img) return { width: 0, height: 0 };
        return {
            width: img.width / cols,
            height: img.height / rows
        };
    }
};