import { CircleArt } from './circle-art.js';
import { fetchCodes } from './code-loader.js';

lucide.createIcons();

// DOM References
const messageEl = document.getElementById("message");
const contentEl = messageEl.querySelector(".message-content");
const buttons = document.querySelectorAll(".btn");
const circleButtons = document.querySelectorAll(".circle-btn");

// State
let validCodes = {};
let usedCodes = new Set();
let buffer = "";
let codeToButton = {};
const art = new CircleArt("bgCanvas");

// --- Animation: Keypad Chase ---
let chaseInterval = null;
let chaseIndex = 0;

function startChase() {
    if (chaseInterval) return;

    chaseIndex = 0;
    chaseInterval = setInterval(() => {
        buttons.forEach(btn => {
            btn.classList.remove("bg-pink-600");
            btn.classList.add("bg-pink-400");
        });

        const current = buttons[chaseIndex % buttons.length];
        current.classList.remove("bg-pink-400");
        current.classList.add("bg-pink-600");

        chaseIndex++;
    }, 100);
}

function stopChase() {
    if (chaseInterval) {
        clearInterval(chaseInterval);
        chaseInterval = null;
    }
    buttons.forEach(btn => {
        btn.classList.remove("bg-pink-600");
        btn.classList.add("bg-pink-400");
    });
}

// --- Circle Button Activation ---
function enableCircleButton(code, data) {
    if (codeToButton[code]) return;

    const btnIndex = data.buttonIndex;
    if (btnIndex == null || btnIndex < 0 || btnIndex >= circleButtons.length) return;

    const btn = circleButtons[btnIndex];
    if (!btn || btn.classList.contains("enabled")) return;

    btn.classList.add("enabled");
    btn.disabled = false;
    btn.dataset.code = code;
    btn.dataset.message = data.message;
    codeToButton[code] = btn;

    // Flash animation
    btn.classList.add("pop");
    setTimeout(() => btn.classList.remove("pop"), 800);
}


// --- Message Display ---
function showMessage(text) {
    if (!contentEl) return;
    contentEl.textContent = text;

    contentEl.classList.remove("animate-pop");
    void contentEl.offsetWidth; // trigger reflow
    contentEl.classList.add("animate-pop");
}

// --- Keypad Entry ---
function handleKey(key) {
    buffer += key;
    if (buffer.length > 10) buffer = buffer.slice(-10);

    for (const code in validCodes) {
        if (buffer.endsWith(code) && !usedCodes.has(code)) {
            enableCircleButton(code, validCodes[code]);
            usedCodes.add(code);
            showMessage(validCodes[code].message);
            buffer = "";

            art.start();
            startChase();
            return;
        }
    }

    contentEl.textContent = "";
    art.stop();
    stopChase();
}

// --- Button Events ---
buttons.forEach((btn, i) => {
    const key = String(i + 1);
    btn.addEventListener("touchstart", e => {
        e.preventDefault();
        handleKey(key);
    }, { passive: false });

    btn.addEventListener("mousedown", () => handleKey(key));
});

circleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const msg = btn.dataset.message;
        if (msg) {
            showMessage(msg);
        }
        art.stop();
        stopChase();
    });
});

// --- Prevent mobile zoom ---
let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, false);

// --- Fetch code data ---
(async () => {
    validCodes = await fetchCodes();
})();
