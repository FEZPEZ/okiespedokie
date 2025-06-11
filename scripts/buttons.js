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

// --- Animation variables ---
let chaseInterval = null;
let chaseIndex = 0;

// --- Chasing animation ---
function startChase() {
    if (chaseInterval) return;

    chaseIndex = 0;
    chaseInterval = setInterval(() => {
        buttons.forEach((btn, idx) => {
            btn.classList.remove("bg-pink-600");
            btn.classList.add("bg-pink-400");
        });

        const current = buttons[chaseIndex % buttons.length];
        current.classList.remove("bg-pink-400");
        current.classList.add("bg-pink-600");

        chaseIndex++;
    }, 100); // Adjust speed here
}

function stopChase() {
    if (chaseInterval) {
        clearInterval(chaseInterval);
        chaseInterval = null;
    }
    // Restore all buttons to base color
    buttons.forEach(btn => {
        btn.classList.remove("bg-pink-600");
        btn.classList.add("bg-pink-400");
    });
}

// --- Keypad logic ---
function handleKey(key) {
    buffer += key;
    if (buffer.length > 10) buffer = buffer.slice(-10);

    let matched = false;
    for (const code in validCodes) {
        if (buffer.endsWith(code)) {
            messageEl.textContent = validCodes[code];
            matched = true;
            art.start();
            startChase();
            return;
        }
    }

    messageEl.textContent = "";
    art.stop();
    stopChase();
}

// --- Input listeners ---
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

// --- Prevent double-tap zoom on mobile ---
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
