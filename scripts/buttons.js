import { CircleArt } from './circle-art.js';

lucide.createIcons();

const messageEl = document.getElementById("message");
const buttons = document.querySelectorAll(".btn");

const validCodes = {
    "1234": "look in the tree",
    "5678": "go under the deck",
    "1397": "feed the chickens"
};

let buffer = "";
const art = new CircleArt("bgCanvas");

function handleKey(key) {
    buffer += key;
    if (buffer.length > 10) buffer = buffer.slice(-10);

    let matched = false;
    for (const code in validCodes) {
        if (buffer.endsWith(code)) {
            messageEl.textContent = validCodes[code];
            matched = true;
            art.start();
            return;
        }
    }

    messageEl.textContent = "";
    art.stop();
}

buttons.forEach((btn, i) => {
    const key = String(i + 1);
    btn.addEventListener("touchstart", e => {
        e.preventDefault();
        handleKey(key);
    }, { passive: false });

    btn.addEventListener("mousedown", () => {
        handleKey(key);
    });
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
