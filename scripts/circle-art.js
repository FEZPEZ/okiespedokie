export class CircleArt {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.circles = [];
        this.isAnimating = false;

        window.addEventListener("resize", () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createCircle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            r: Math.random() * 30 + 10,
            opacity: 1
        };
    }

    animate() {
        if (!this.isAnimating) return;

        this.circles.push(this.createCircle());

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.circles.forEach(c => {
            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
            this.ctx.fillStyle = `rgba(236, 72, 153, ${c.opacity})`;
            this.ctx.fill();
            c.opacity -= 0.01;
        });

        this.circles = this.circles.filter(c => c.opacity > 0);
        requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    stop() {
        this.isAnimating = false;
        this.circles = [];
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
