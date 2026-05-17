import { render } from "./render.js";
import { startGlitch } from "./glitch.js";
import { animations } from "./animations.js";
import { playTransitionEffect } from "./transition.js";

const screen = document.getElementById("screen");
const crt = document.getElementById("crt");
const glowLeft = document.getElementById("glow-left");
const glowRight = document.getElementById("glow-right");

// Keyboard side partitions configuration
const LEFT_HAND_KEYS = [
    "q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v", "b",
    "1", "2", "3", "4", "5", "`", "tab", "capslock", "shiftleft", "controlleft", "altleft"
];

const RIGHT_HAND_KEYS = [
    "y", "u", "i", "o", "p", "[", "]", "\\", "h", "j", "k", "l", ";", "'", "enter",
    "n", "m", ",", ".", "/", "6", "7", "8", "9", "0", "-", "=", "backspace", 
    "shiftright", "controlright", "altright"
];

/* =========================================================
   STATE MACHINE CONFIGURATION
========================================================= */
let state = {
    owner: "boot", // "boot" | "default" | "idle" | "timer" | "transition" | "end"
    shiftDown: false,
    passwordBuffer: [], // Used as a sliding array queue (max 3 items)
    countdownInterval: null,
    animTimeout: null,
    currentMode: null,
    currentAnimName: null,
    transitionActive: false // Flag to block conflicting inputs during transition animations
};

const MODES = {
    "111": {
        timerLength: 5,
        defaultAnimation: "eyesClosed", // Baseline single animation
        endAnimation: "eyesClosed",
        endAnimationTime: 3000,
        idle: {
            pool: ["eyeOpen"], // Idle choices
            minDelay: 3000,             // Countdown range to trigger an idle breakout
            maxDelay: 10000
        }
    },
    "444": {
        timerLength: 10,
        defaultAnimation: "textPulse",
        endAnimation: "eyeOpen",
        endAnimationTime: 2000,
        idle: {
            pool: ["eat", "eyeOpen"],
            minDelay: 4000,
            maxDelay: 8000
        }
    }
};

startGlitch(crt);
//setupDebugOverlay();

/* =========================================================
   HARD OVERRIDE AND CLEANUP
========================================================= */
function killAllActiveLoops() {
    if (state.animTimeout) {
        clearTimeout(state.animTimeout);
        state.animTimeout = null;
    }
}

function clearIdleTimeout() {
    if (state.countdownInterval) {
        clearTimeout(state.countdownInterval);
        state.countdownInterval = null;
    }
}

/* =========================================================
   FLASH EFFECTS ENGINE
========================================================= */
function triggerSideGlow(e) {
    if (!e || !e.key) return;
    
    const keyLower = e.key.toLowerCase();
    const codeLower = e.code.toLowerCase();

    glowLeft.style.transition = "none";
    glowRight.style.transition = "none";
    glowLeft.style.opacity = "0";
    glowRight.style.opacity = "0";
    
    void glowLeft.offsetWidth; 

    const isLeftKey = LEFT_HAND_KEYS.includes(keyLower) || LEFT_HAND_KEYS.includes(codeLower);
    const isRightKey = RIGHT_HAND_KEYS.includes(keyLower) || RIGHT_HAND_KEYS.includes(codeLower);

    if (isLeftKey) {
        glowLeft.style.opacity = "1";
        setTimeout(() => {
            glowLeft.style.transition = "opacity 0.4s ease-out";
            glowLeft.style.opacity = "0";
        }, 50);
    } else if (isRightKey) {
        glowRight.style.opacity = "1";
        setTimeout(() => {
            glowRight.style.transition = "opacity 0.4s ease-out";
            glowRight.style.opacity = "0";
        }, 50);
    }
}

/* =========================================================
   ANIMATION CORNER
========================================================= */
function playEngineAnimation(name, targetOwnerState, onCompleteCycle) {
    const anim = animations[name];
    if (!anim) return;

    // Token system prevents cross-animation interference
    const token = Symbol(name);
    state.animToken = token;

    state.owner = targetOwnerState;
    state.currentAnimName = name;
    //updateDebug();

    let i = 0;

    function renderFrame(frame) {
        screen.textContent = applyFrameMargins(
            frame.content,
            anim.margin,
            frame.margin
        );
    }

    function scheduleNext(delay, fn) {
        state.animTimeout = setTimeout(() => {
            if (state.animToken !== token) return;
            fn();
        }, delay);
    }

    // SINGLE FRAME HANDLING
    if (anim.frames.length === 1) {
        const frame = anim.frames[0];

        renderFrame(frame);

        const hold = frame.hold ?? 0;

        if (onCompleteCycle) {
            scheduleNext(hold, onCompleteCycle);
        }

        return;
    }

    // MULTI FRAME LOOP
    function loop() {
        if (state.animToken !== token) return;

        const frame = anim.frames[i];
        renderFrame(frame);

        const delay = frame.hold ?? 100;

        i++;

        if (i >= anim.frames.length) {
            i = 0;

            if (onCompleteCycle) {
                scheduleNext(delay, onCompleteCycle);
                return;
            }
        }

        scheduleNext(delay, loop);
    }

    loop();
}

function startDefaultOrIdleCycle() {
    const mode = state.currentMode;
    
    // 1. Play standard baseline loop
    playEngineAnimation(mode.defaultAnimation, "default");

    // Clear any loose trailing cycles before assigning a clean loop
    clearIdleTimeout();

    // 2. Set up the random countdown interval for breakout
    const config = mode.idle;
    const randomDelay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;

    state.countdownInterval = setTimeout(() => {
        if (state.owner !== "default") return;

        // 3. Select random idle animation
        const selectedIdle = config.pool[Math.floor(Math.random() * config.pool.length)];

        // 4. Play idle once, then route recursion back to standard default tracking
        playEngineAnimation(selectedIdle, "idle", () => {
            startDefaultOrIdleCycle();
        });

    }, randomDelay);
}

/* =========================================================
   TIMER CONTROL
========================================================= */
function startTimer(seconds) {
    killAllActiveLoops();
    clearIdleTimeout();
    state.owner = "timer";
    state.currentAnimName = "NONE (TIMER RUNNING)";
    updateDebug();

    let count = seconds;
    screen.textContent = render(String(count).padStart(2, "0"));

    let timerInterval = setInterval(async () => {
        if (state.owner !== "timer") {
            clearInterval(timerInterval);
            return;
        }

        count--;
        if (count > 0) {
            screen.textContent = render(String(count).padStart(2, "0"));
        } else {
            clearInterval(timerInterval);
            await runEndSequence();
        }
    }, 1000);
}

/* =========================================================
   SEQUENCING & ROUTING TRANSITIONS
========================================================= */
async function changeStateWithTransition(nextState, actionCallback) {
    killAllActiveLoops();
    clearIdleTimeout();
    state.owner = "transition";
    state.currentAnimName = "NONE (TRANSITIONING)";
    state.transitionActive = true;
    updateDebug();
    
    screen.textContent = "";
    await playTransitionEffect();
    
    state.transitionActive = false;
    state.owner = nextState;
    actionCallback();
    updateDebug();
}

async function runEndSequence() {
    await changeStateWithTransition("end", () => {
        const mode = state.currentMode;
        const anim = mode.endAnimation;
        const duration = mode.endAnimationTime;
        const startTime = Date.now();

        playEngineAnimation(anim, "end", () => {
            if (Date.now() - startTime >= duration) {
                startDefaultOrIdleCycle();
            }
        });
        
        state.animTimeout = setTimeout(() => {
            if (state.owner === "end") {
                startDefaultOrIdleCycle();
            }
        }, duration);
    });
}

function initDefaultMode() {
    if (!state.currentMode) {
        const initialKey = Object.keys(MODES)[0];
        state.currentMode = structuredClone(MODES[initialKey]);
    }
}

/* =========================================================
   USER INPUTS INTERFACES
========================================================= */
async function handleActionTrigger(eventObj = null) {
    if (state.transitionActive) return;

    const isInitialActivationPress = (state.owner === "default" || state.owner === "idle" || state.owner === "end");

    if (eventObj && isInitialActivationPress) {
        triggerSideGlow(eventObj);
    }

    if (state.owner === "end") {
        await changeStateWithTransition("timer", () => {
            startTimer(state.currentMode.timerLength);
        });
        return;
    }

    if (state.owner !== "default" && state.owner !== "idle") return;

    await changeStateWithTransition("timer", () => {
        startTimer(state.currentMode.timerLength);
    });
}

async function forceSwitchMode(configKey) {
    killAllActiveLoops(); 
    clearIdleTimeout();
    state.owner = "transition";
    state.currentAnimName = "NONE (OVERRIDE TRANSITION)";
    state.transitionActive = true;
    updateDebug();

    screen.textContent = "";
    await playTransitionEffect();

    state.transitionActive = false;
    state.currentMode = structuredClone(MODES[configKey]);
    resetPassword();
    startDefaultOrIdleCycle();
}

function resetPassword() {
    state.passwordBuffer = [];
    updateDebug();
}

function applyFrameMargins(content, globalMargin, frameMargin) {
    const top = (globalMargin?.top || 0) + (frameMargin?.top || 0);
    const left = (globalMargin?.left || 0) + (frameMargin?.left || 0);
    const lines = content.split("\n");
    const out = [];

    for (let i = 0; i < top; i++) out.push("");
    for (const line of lines) {
        out.push(" ".repeat(left) + line);
    }
    return out.join("\n");
}

/* =========================================================
   EVENT WIREUP
========================================================= */
window.addEventListener("keydown", e => {
    const pressedKey = e.key.toLowerCase();

    if (pressedKey === "b") {
        state.shiftDown = true;
        resetPassword();
        return;
    }

    if (!state.shiftDown) {
        if (e.key !== "F12" && e.key !== "R") e.preventDefault();
        handleActionTrigger(e); 
        return;
    }

    if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        
        state.passwordBuffer.push(e.key);
        if (state.passwordBuffer.length > 3) {
            state.passwordBuffer.shift();
        }
        updateDebug();

        if (state.passwordBuffer.length === 3) {
            const matchStr = state.passwordBuffer.join("");
            if (MODES[matchStr]) {
                forceSwitchMode(matchStr);
            }
        }
    }
}, { capture: true });

window.addEventListener("keyup", e => {
    if (e.key.toLowerCase() === "b") {
        state.shiftDown = false;
        resetPassword();
    }
}, { capture: true });

window.addEventListener("mousedown", e => {
    if (state.shiftDown) return;
    e.preventDefault();
    handleActionTrigger();
}, { capture: true });

window.addEventListener("touchstart", e => {
    if (state.shiftDown) return;
    e.preventDefault();
    handleActionTrigger();
}, { capture: true });

/* =========================================================
   DEBUGGING CONSOLE COMPONENT
========================================================= */
function setupDebugOverlay() {
    let debugDiv = document.getElementById("terminal-debug");
    if (!debugDiv) {
        debugDiv = document.createElement("div");
        debugDiv.id = "terminal-debug";
        Object.assign(debugDiv.style, {
            position: "absolute",
            bottom: "10px",
            left: "10px",
            background: "rgba(0, 0, 0, 0.85)",
            color: "#00ffaa",
            fontFamily: "monospace",
            fontSize: "12px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #00ffaa",
            zIndex: "10000",
            pointerEvents: "none",
            lineHeight: "1.4"
        });
        document.body.appendChild(debugDiv);
    }
}

function updateDebug() {
    const debugDiv = document.getElementById("terminal-debug");
    if (!debugDiv) return;

    const codeBufferDisplay = state.passwordBuffer.length > 0 
        ? `[ ${state.passwordBuffer.join(", ")} ]` 
        : "EMPTY";

    debugDiv.innerHTML = `
        <strong>⚙️ SYSTEM STATE DEBUGGER</strong><br>
        -----------------------------------<br>
        STATE OWNER    : <span style="color:#fff">${state.owner.toUpperCase()}</span><br>
        ANIMATION      : <span style="color:#fff">${state.currentAnimName || 'NONE'}</span><br>
        SHIFT MODIFIER : ${state.shiftDown ? '<span style="color:#ff3333;font-weight:bold">HELD</span>' : 'RELEASED'}<br>
        SLIDING QUEUE  : <span style="color:#ffff33">${codeBufferDisplay}</span><br>
        TRANSITION LOCK: ${state.transitionActive ? 'ACTIVE' : 'READY'}<br>
        CURRENT MODE   : <span style="color:#33ffff">${state.currentMode ? Object.keys(MODES).find(k => MODES[k].timerLength === state.currentMode.timerLength) : 'NONE'}</span>
    `;
}

// Entry Point Init
initDefaultMode();
startDefaultOrIdleCycle();