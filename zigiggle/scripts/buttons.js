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

let unlockSequence = [];
let unlockMessage = "";
let userCircleSequence = [];



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
        if (buffer.endsWith(code)) {
            const data = validCodes[code];
            const hasCircleButton = data.buttonIndex != null && data.buttonIndex >= 0 && data.buttonIndex < circleButtons.length;

            // If code has already been used and it triggers a circle button, skip it
            if (hasCircleButton && usedCodes.has(code)) {
                continue;
            }

            // Show the message
            showMessage(data.message);

            // Only enable circle button and mark as used if it has a valid circle button
            if (hasCircleButton) {
                enableCircleButton(code, data);
                usedCodes.add(code);
            }

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
    btn.addEventListener("pointerdown", e => {
        if (e.pointerType === "mouse" || e.pointerType === "touch") {
            handleKey(key);
        }
    });
});

circleButtons.forEach((btn, index) => {
    btn.addEventListener("pointerdown", e => {
        if (e.pointerType === "mouse" || e.pointerType === "touch") {
            const msg = btn.dataset.message;
            if (msg) {
                showMessage(msg);
            }

            // Track input for unlock sequence
            if (unlockSequence.length > 0) {
                userCircleSequence.push(index);

                // Keep buffer within max length
                if (userCircleSequence.length > unlockSequence.length) {
                    userCircleSequence.shift();
                }

                // Check if last N entries match the unlock sequence
                const matched = unlockSequence.every(
                    (val, i) => userCircleSequence[i] === val
                );

                if (matched) {
                    showMessage(unlockMessage);
                    userCircleSequence = [];
                    triggerFinalSequence();
                }
            }

            art.stop();
            stopChase();
        }
    });
});


// --- Prevent mobile zoom ---
let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, false);


function triggerFinalSequence() {
    // 1. Disable all buttons
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = "none";
    });
    circleButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = "none";
    });

    // 2. Fade out all circle buttons
    circleButtons.forEach(btn => {
        btn.style.transition = "opacity 0.8s ease";
        btn.style.opacity = "0";
    });

    // 3. Flatten each main button one-by-one
    buttons.forEach((btn, i) => {
        setTimeout(() => {
            btn.style.transition = "transform 0.4s ease, opacity 0.4s ease";
            btn.style.transform = "scaleX(0)";
            btn.style.opacity = "0";
        }, i * 120);
    });

    // 4. Fade background to black and message to white
    document.body.classList.add("fade-to-black");
    contentEl.classList.add("fade-to-white");
}




// --- Fetch code data and load persisted state ---
(async () => {
    const { codes, circleUnlock } = await fetchCodes();
    validCodes = codes;

    loadState();

    // Setup circle sequence unlock
    if (
        circleUnlock &&
        Array.isArray(circleUnlock.sequence) &&
        circleUnlock.sequence.length >= 4
    ) {
        unlockSequence = circleUnlock.sequence;
        unlockMessage = circleUnlock.message;
    }
})();

