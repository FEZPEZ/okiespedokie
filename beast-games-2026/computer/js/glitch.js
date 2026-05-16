export function startGlitch(crt) {

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function loop() {

        crt.style.transform = `
            translate(${random(-1, 1)}px, ${random(-2, 2)}px)
            rotate(${random(-0.2, 0.2)}deg)
            scale(${random(0.997, 1.005)})
        `;

        crt.style.filter = `
            hue-rotate(${random(-5, 5)}deg)
            contrast(${random(0.99, 1.03)})
            saturate(${random(0.92, 1.12)})
        `;

        if (Math.random() < 0.2) {
            crt.style.clipPath = `inset(${random(0,5)}% 0 ${random(0,5)}% 0)`;

            setTimeout(() => {
                crt.style.clipPath = "";
            }, 80);
        }

        setTimeout(loop, random(40, 180));
    }

    loop();
}