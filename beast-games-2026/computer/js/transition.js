const crt = document.getElementById("crt");
let transitionLayer = document.getElementById("transition-layer");

if (!transitionLayer) {
    transitionLayer = document.createElement("div");
    transitionLayer.id = "transition-layer";
    crt.appendChild(transitionLayer);
}

export const TRANSITION_CONFIG = {
    lineThickness: 16,
    lineSpeed: 25000, // px per sec
    color: "#00ffaa"
};

Object.assign(transitionLayer.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    overflow: "hidden",
    display: "none",
    zIndex: "999"
});

transitionLayer.innerHTML = ""; // Clear legacy elements
const line = document.createElement("div");

Object.assign(line.style, {
    position: "absolute",
    left: "0",
    width: "100%",
    background: TRANSITION_CONFIG.color,
    boxShadow: `
        0 0 10px ${TRANSITION_CONFIG.color},
        0 0 30px ${TRANSITION_CONFIG.color}
    `
});
transitionLayer.appendChild(line);

function setLineY(y) {
    line.style.transform = `translateY(${y}px)`;
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateLinear(from, to, duration) {
    return new Promise(resolve => {
        const start = performance.now();

        function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            const y = from + ((to - from) * t);
            setLineY(y);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(frame);
    });
}

export async function playTransitionEffect() {
    const h = window.innerHeight;
    const thickness = TRANSITION_CONFIG.lineThickness;

    line.style.height = `${thickness}px`;
    transitionLayer.style.display = "block";

    const middle = (h * 0.5) - (thickness * 0.5);
    setLineY(middle);
    await wait(18);

    const topTarget = -thickness;
    const upwardDistance = Math.abs(middle - topTarget);
    const upwardDuration = (upwardDistance / TRANSITION_CONFIG.lineSpeed) * 1000;

    await animateLinear(middle, topTarget, upwardDuration);

    const below = h + thickness;
    setLineY(below);
    await wait(8);

    const upwardDistance2 = Math.abs(below - middle);
    const upwardDuration2 = (upwardDistance2 / TRANSITION_CONFIG.lineSpeed) * 1000;

    await animateLinear(below, middle, upwardDuration2);
    transitionLayer.style.display = "none";
}