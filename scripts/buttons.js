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

// --- Persistence ---

function saveState(lastMessage = "") {
    localStorage.setItem('usedCodes', JSON.stringify(Array.from(usedCodes)));
    if (lastMessage !== undefined) {
        localStorage.setItem('lastMessage', lastMessage);
    }
}


function loadState() {
    const savedUsed = localStorage.getItem('usedCodes');
    if (savedUsed) {
        try {
            usedCodes = new Set(JSON.parse(savedUsed));
        } catch {
            usedCodes = new Set();
        }
    }

    // Enable circle buttons for persisted codes WITHOUT animation
    for (const code of usedCodes) {
        if (validCodes[code]) {
            enableCircleButton(code, validCodes[code], true);
        }
    }
}

// --- Circle Button Activation ---
function enableCircleButton(code, data, skipAnimation = false) {
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

    if (!skipAnimation) {
        btn.classList.add("pop");
        setTimeout(() => btn.classList.remove("pop"), 800);
    }

    // Save state to persist this activation
    if (!skipAnimation) saveState(data.message);
}

// --- Message Display ---
function showMessage(text, skipAnimation = false) {
    if (!contentEl) return;
    contentEl.textContent = text;

    if (!skipAnimation) {
        contentEl.classList.remove("animate-pop");
        void contentEl.offsetWidth; // trigger reflow
        contentEl.classList.add("animate-pop");
    }

    // Save current message so it persists
    if (!skipAnimation) saveState(text);
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
    const handlePress = () => {
        const msg = btn.dataset.message;
        if (msg) {
            showMessage(msg);
        }
        art.stop();
        stopChase();
    };

    btn.addEventListener("touchstart", handlePress, { passive: true });
    btn.addEventListener("click", handlePress); // covers desktop and mouse input
});


// --- Prevent mobile zoom ---
let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, false);

// --- Fetch code data and load persisted state ---
(async () => {
    validCodes = await fetchCodes();

    // Assuming fetchCodes returns an object like:
    // { "1111": { message: "...", buttonIndex: 0 }, ... }

    loadState();
})();
