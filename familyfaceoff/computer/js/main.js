import { render } from "./render.js";
import { startGlitch } from "./glitch.js";
import { animations } from "./animations.js";
import { playTransitionEffect } from "./transition.js";

const screen = document.getElementById("screen");
const crt = document.getElementById("crt");
const glowLeft = document.getElementById("glow-left");
const glowRight = document.getElementById("glow-right");

// Keyboard side partitions configuration
const LEFT_HAND_KEYS = ["KeyR"];
const RIGHT_HAND_KEYS = ["KeyB"];

/* =========================================================
   CHARACTER SWAP GLITCH REGISTRY FOR "iCouldDoThat"
========================================================= */
const MIN_SWAP_EFFECT_DELAY = 150;
const MAX_SWAP_EFFECT_DELAY = 550;
const MIN_SWAP_EFFECT_HOLD = 150;
const MAX_SWAP_EFFECT_HOLD = 700;
const MIN_SWAP_BATCH_COUNT = 5;
const MAX_SWAP_BATCH_COUNT = 25;

const SWAP_CHARACTER_SET = {
    "$": ["S", "E"],
    "8": ["S", "O", "9"],
    "Y": ["U", "V", "V"],
    "M": ["W", "E", "N"],
    "[": ["I", "i", "]", "1", "]", "]"],
    ",": [".", "_"],
    "c": ["o", ">", "u"],
    "\"": ["'"],
    "'": ["\""],
    ";": [":", "|", "i", "I", "!"],
    ":": [";", "|", "i", "I", "!"],
    ".": [",", "_"],
};

let activeSwaps = []; // Array of { index, original, replacement }
let characterSwapInterval = null;

let isICouldDoThatPrimed = false;

const activePressedKeys = new Set();

/* =========================================================
   STATE MACHINE CONFIGURATION
========================================================= */
let state = {
    owner: "boot", // "boot" | "default" | "idle" | "timer" | "transition" | "end"
    shiftDown: false,
    passwordBuffer: [], // Used as a sliding array queue (max 3 items)
    countdownInterval: null,
    timerInterval: null,
    animTimeout: null,
    sequenceToken: 0,
    currentMode: null,
    currentAnimName: null,
    transitionActive: false // Flag to block conflicting inputs during transition animations
};

const MODES = {
    "rrrr": {
        timerLength: 20,
        defaultAnimation: "blank",
        endAnimation: "blank",
        endAnimationTime: 3000,
        sideGlowEnabled: false,
        interruptEnabled: false, 
    },
    "rrrb": {
        timerLength: 20,
        introAnimation: "OSBootup",
        defaultAnimation: "familyFaceOff",
        endAnimation: "familyFaceOff",
        endAnimationTime: 3000,
        sideGlowEnabled: false,
        interruptEnabled: false, 
    },
    "rrbb": {
        timerLength: 3,
        defaultAnimation: "oneTicketPlease",
        endAnimation: "oneTicketPleaseEnd",
        endAnimationTime: 2000,
        sideGlowEnabled: true,
        interruptEnabled: false, 
    },
    "rbbb": {
        timerLength: 10,
        defaultAnimation: "iCouldDoThat",
        endAnimation: "iCouldDoThatFail",
        endAnimationTime: 5000,
        sideGlowEnabled: false,
        interruptEnabled: true,          
        interruptAnimation: "iCouldDoThatSuccess",   
        interruptAnimationTime: 5000,    
    },
    "bbbb": {
        timerLength: 60,
        defaultAnimation: "deadlyDinner",
        endAnimation: "deadlyDinnerEnd",
        endAnimationTime: 9000,
        sideGlowEnabled: false,
        interruptEnabled: false, 
    },
    "rbrb": { 
        timerLength: 20,
        defaultAnimation: "familyFaceOff",
        endAnimation: "familyFaceOff",
        endAnimationTime: 3000,
        sideGlowEnabled: false,
        interruptEnabled: false, 
    }
};

startGlitch(crt);
//setupDebugOverlay();


/* =========================================================
   ICOULDDOTHAT HELPER FUNCTIONS
   ========================================================= */
function checkICouldDoThatChords() {
    const hasHomeOrIns = activePressedCodes.has("Home") || activePressedCodes.has("Insert");
    const hasEscOrBacktick = activePressedCodes.has("Escape") || activePressedCodes.has("Backquote");
    return hasHomeOrIns && hasEscOrBacktick;
}

function isReadyToStart() {
    return state.owner === "default" || state.owner === "idle" || state.owner === "intro";
}

/* =========================================================
   HARD OVERRIDE AND CLEANUP
========================================================= */
function killAllActiveLoops() {
    if (state.animTimeout) {
        clearTimeout(state.animTimeout);
        state.animTimeout = null;
    }
    stopCharacterSwapLoop(); 
}

function stopCharacterSwapLoop() {
    if (characterSwapInterval) {
        clearTimeout(characterSwapInterval);
        characterSwapInterval = null;
    }
    activeSwaps = [];
}

function clearIdleTimeout() {
    if (state.countdownInterval) {
        clearTimeout(state.countdownInterval);
        state.countdownInterval = null;
    }
}

/* =========================================================
   KEYBOARD PARTITION HELPER FUNCTIONS
========================================================= */
function checkHandArrays() {
    const hasLeft = activePressedCodes.has("KeyR");
    const hasRight = activePressedCodes.has("KeyB");
    return { hasLeft, hasRight };
}

/* =========================================================
   FLASH EFFECTS ENGINE
========================================================= */
function triggerSideGlow(e) {
    if (!e || !e.code) return;
    
    const mode = state.currentMode;
    if (!mode?.sideGlowEnabled) return;

    glowLeft.style.transition = "none";
    glowRight.style.transition = "none";
    glowLeft.style.opacity = "0";
    glowRight.style.opacity = "0";
    
    void glowLeft.offsetWidth; 

    const isLeftKey = (e.code === "KeyR");
    const isRightKey = (e.code === "KeyB");

    if (isLeftKey) {
        glowLeft.style.opacity = "1";
        setTimeout(() => {
            glowLeft.style.transition = "opacity 3s ease-out";
            glowLeft.style.opacity = "0";
        }, 50);
    } else if (isRightKey) {
        glowRight.style.opacity = "1";
        setTimeout(() => {
            glowRight.style.transition = "opacity 3s ease-out";
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

    const token = Symbol(name);
    state.animToken = token;

    state.owner = targetOwnerState;
    state.currentAnimName = name;

    let i = 0;

    function renderFrame(frame) {
        if (name === "iCouldDoThat") {
            screen.textContent = applyActiveSwaps(frame.content);
        } else {
            screen.textContent = frame.content;
        }
    }

    function scheduleNext(delay, fn) {
        state.animTimeout = setTimeout(() => {
            if (state.animToken !== token) return;
            fn();
        }, delay);
    }

    if (name === "iCouldDoThat") {
        startCharacterSwapLoop(token);
    } else {
        stopCharacterSwapLoop();
    }

    if (anim.frames.length === 1) {
        const frame = anim.frames[0];
        renderFrame(frame);
        const hold = frame.hold ?? 0;

        if (onCompleteCycle) {
            scheduleNext(hold, onCompleteCycle);
        }
        return;
    }

    function loop() {
        if (state.animToken !== token) return;

        const frame = anim.frames[i];
        renderFrame(frame);

        const delay = frame.hold ?? 100;
        i++;

        if (i >= anim.frames.length) {
            i = 0;
            if (onCompleteCycle) {
                setTimeout(() => {
                    if (state.animToken === token) onCompleteCycle();
                }, delay);
            }
        }
        scheduleNext(delay, loop);
    }
    loop();
}

function startDefaultOrIdleCycle() {
    const mode = state.currentMode;
    
    if (mode.introAnimation && !mode.introPlayed) {
        mode.introPlayed = true;
        playEngineAnimation(mode.introAnimation, "intro", () => {
            startDefaultOrIdleCycle();
        });
        return;
    }
    
    // Play the stable loop/default baseline graphic
    playEngineAnimation(mode.defaultAnimation, "default");
    clearIdleTimeout();

    // IDLE ANIMATIONS DISABLED ENTIRELY
    // The previous setTimeout block that scheduled config.pool variants has been removed.
}

/* =========================================================
   DYNAMIC CHARACTER SWAP EFFECT LOGIC
========================================================= */
function startCharacterSwapLoop(token) {
    stopCharacterSwapLoop();

    function scheduleNextSwap() {
        if (state.animToken !== token || state.currentAnimName !== "iCouldDoThat") return;

        const anim = animations["iCouldDoThat"];
        if (anim && anim.frames.length > 0) {
            const contentString = anim.frames[0].content;
            
            if (contentString.length > 0) {
                const batchSize = Math.floor(Math.random() * (MAX_SWAP_BATCH_COUNT - MIN_SWAP_BATCH_COUNT + 1)) + MIN_SWAP_BATCH_COUNT;
                let didApplyAtLeastOneSwap = false;

                for (let b = 0; b < batchSize; b++) {
                    const targetIndex = Math.floor(Math.random() * contentString.length);
                    const frameChar = contentString[targetIndex];

                    if (SWAP_CHARACTER_SET.hasOwnProperty(frameChar) && !activeSwaps.some(s => s.index === targetIndex)) {
                        const targetCharacters = SWAP_CHARACTER_SET[frameChar];
                        
                        const swapObj = {
                            index: targetIndex,
                            original: frameChar,
                            replacement: targetCharacters[Math.floor(Math.random() * targetCharacters.length)]
                        };

                        activeSwaps.push(swapObj);
                        didApplyAtLeastOneSwap = true;

                        const holdTime = Math.random() * (MAX_SWAP_EFFECT_HOLD - MIN_SWAP_EFFECT_HOLD) + MIN_SWAP_EFFECT_HOLD;
                        setTimeout(() => {
                            activeSwaps = activeSwaps.filter(s => s !== swapObj);
                            triggerFrameRefresh();
                        }, holdTime);
                    }
                }

                if (didApplyAtLeastOneSwap) {
                    triggerFrameRefresh();
                }
            }
        }

        const nextDelay = Math.random() * (MAX_SWAP_EFFECT_DELAY - MIN_SWAP_EFFECT_DELAY) + MIN_SWAP_EFFECT_DELAY;
        characterSwapInterval = setTimeout(scheduleNextSwap, nextDelay);
    }

    const initialDelay = Math.random() * (MAX_SWAP_EFFECT_DELAY - MIN_SWAP_EFFECT_DELAY) + MIN_SWAP_EFFECT_DELAY;
    characterSwapInterval = setTimeout(scheduleNextSwap, initialDelay);
}

function applyActiveSwaps(baseContent) {
    if (activeSwaps.length === 0) return baseContent;
    
    let charArray = baseContent.split("");
    for (const swap of activeSwaps) {
        if (charArray[swap.index] === swap.original) {
            charArray[swap.index] = swap.replacement;
        }
    }
    return charArray.join("");
}

function triggerFrameRefresh() {
    if (state.currentAnimName === "iCouldDoThat") {
        const anim = animations["iCouldDoThat"];
        if (anim && anim.frames[0]) {
            screen.textContent = applyActiveSwaps(anim.frames[0].content);
        }
    }
}


/* =========================================================
   TIMER CONTROL
========================================================= */
function startTimer(seconds) {
    state.sequenceToken++;
    killAllActiveLoops();
    clearIdleTimeout();
    
    if (state.animTimeout) {
        clearTimeout(state.animTimeout);
        state.animTimeout = null;
    }

    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    state.owner = "timer";
    state.currentAnimName = "NONE (TIMER RUNNING)";
    updateDebug();

    let count = seconds;
    screen.textContent = render(String(count).padStart(1, "0"));

    state.timerInterval = setInterval(async () => {
        if (state.owner !== "timer") {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
            return;
        }

        count--;

        if (count > 0) {
            screen.textContent = render(String(count).padStart(1, "0"));
        } else {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
            if (state.currentMode?.defaultAnimation === "iCouldDoThat") {
                screen.textContent = render("1");
                
                setTimeout(async () => {
                    if (state.owner === "timer" || state.owner === "end") {
                        await runEndSequence();
                    }
                }, 700);
            } else {
                await runEndSequence();
            }
        }
    }, 1000);
}

/* =========================================================
   SEQUENCING & ROUTING TRANSITIONS
========================================================= */
async function changeStateWithTransition(nextState, actionCallback) {
    state.sequenceToken++;
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
    
    return state.sequenceToken;
}

async function runEndSequence() {
    const token = await changeStateWithTransition("end", () => {
        const mode = state.currentMode;
        const anim = mode.endAnimation;
        const duration = mode.endAnimationTime;
        const startTime = Date.now();

        playEngineAnimation(anim, "end", () => {
            if (state.sequenceToken !== token) return;
            if (Date.now() - startTime >= duration) {
                startDefaultOrIdleCycle();
            }
        });

        state.animTimeout = setTimeout(() => {
            if (state.sequenceToken !== token) return;
            if (state.owner === "end") {
                startDefaultOrIdleCycle();
            }
        }, duration);
    });
}

async function runInterruptSequence() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    const token = await changeStateWithTransition("interrupt", () => {
        const mode = state.currentMode;
        const anim = mode.interruptAnimation || mode.defaultAnimation;
        const duration = mode.interruptAnimationTime || 2000;
        const startTime = Date.now();

        playEngineAnimation(anim, "interrupt", () => {
            if (state.sequenceToken !== token) return;
            if (Date.now() - startTime >= duration) {
                startDefaultOrIdleCycle();
            }
        });

        state.animTimeout = setTimeout(() => {
            if (state.sequenceToken !== token) return;
            if (state.owner === "interrupt") {
                startDefaultOrIdleCycle();
            }
        }, duration);
    });
}

function initDefaultMode() {
    if (!state.currentMode) {
        const initialKey = "rrrr";
        state.currentMode = structuredClone(MODES[initialKey]);
    }
}

/* =========================================================
   USER INPUTS INTERFACES
========================================================= */
async function handleActionTrigger(eventObj = null) {
    if (state.transitionActive) return;
    if (state.owner === "end" || state.owner === "interrupt") return;
    
    if (state.owner === "timer" && state.currentMode?.interruptEnabled) {
        const currentKeys = Array.from(activePressedCodes);
        const hasSetA = currentKeys.some(code => code === "KeyR");
        let hasSetB = currentKeys.some(code => code === "KeyB");
        
        if (eventObj) {
            if (eventObj.shiftKey || eventObj.ctrlKey || eventObj.altKey || eventObj.metaKey) {
                hasSetB = true;
            }
        }
    
        if (hasSetA && hasSetB) {
            activePressedCodes.clear(); 
            await runInterruptSequence();
        }
        return;
    }

    const isInitialActivationPress = (state.owner === "default" || state.owner === "idle" || state.owner === "end" || state.owner === "intro");

    if (eventObj && isInitialActivationPress) {
        triggerSideGlow(eventObj);
    }

    if (state.owner === "end" || state.owner === "interrupt") {
        await changeStateWithTransition("timer", () => {
            startTimer(state.currentMode.timerLength);
        });
        return;
    }

    if (state.owner !== "default" && state.owner !== "idle" && state.owner !== "intro") return;

    await changeStateWithTransition("timer", () => {
        startTimer(state.currentMode.timerLength);
    });
}

async function forceSwitchMode(configKey) {
    state.sequenceToken++;
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

/* =========================================================
   EVENT WIREUP
========================================================= */
const keyPressTimestamps = new Map();
const MAX_KEY_HOLD_DURATION = 30000; 

function purgeStaleKeys() {
    const now = Date.now();
    let changed = false;

    for (const [key, timestamp] of keyPressTimestamps.entries()) {
        if (key === "1") continue;

        if (now - timestamp > MAX_KEY_HOLD_DURATION) {
            activePressedKeys.delete(key);
            keyPressTimestamps.delete(key);
            changed = true;
        }
    }

    if (changed) {
        if (state.currentMode?.defaultAnimation === "iCouldDoThat" && isICouldDoThatPrimed) {
            const { hasLeft, hasRight } = checkHandArrays();
            if (!hasLeft || !hasRight) {
                isICouldDoThatPrimed = false;
                handleActionTrigger();
                screen.classList.remove("screen-holding-pulse");
            }
        }
    }
}

window.addEventListener("keydown", e => {
    if (e.repeat) return; 

    purgeStaleKeys();
    
    // Normalize keys immediately to lowercase to catch iPad auto-caps
    const cleanKey = e.key.toLowerCase();

    if (e.key !== "CapsLock") {
        activePressedKeys.add(cleanKey);
        keyPressTimestamps.set(cleanKey, Date.now()); 
    }

    // 1. If '1' is pressed and modifier isn't active yet, turn it on
    if (cleanKey === "1" && !state.shiftDown) {
        state.shiftDown = true;
        resetPassword();
        return;
    }

    if (!state.shiftDown) {
        if (state.currentMode?.defaultAnimation === "iCouldDoThat") {
            const { hasLeft, hasRight } = checkHandArrays();

            if (state.owner === "timer" && state.currentMode?.interruptEnabled) {
                if (hasLeft && hasRight) {
                    activePressedKeys.clear(); 
                    keyPressTimestamps.clear();
                    runInterruptSequence();
                }
                return;
            }

            if (isReadyToStart()) {
                if (hasLeft && hasRight) {
                    screen.classList.add("screen-holding-pulse");
                    isICouldDoThatPrimed = true;
                }
                return;
            }
        }
        
        handleActionTrigger(cleanKey); 
        return;
    }

    // 2. Capture letter patterns while "1" is held down
    if (cleanKey !== "1") {
        state.passwordBuffer.push(cleanKey);
        
        if (state.passwordBuffer.length > 4) {
            state.passwordBuffer.shift();
        }

        if (state.passwordBuffer.length === 4) {
            const matchStr = state.passwordBuffer.join("");
            if (MODES[matchStr]) {
                isICouldDoThatPrimed = false;
                forceSwitchMode(matchStr);
            }
        }
    }
}, { capture: true });

window.addEventListener("keyup", e => {
    const cleanKey = e.key.toLowerCase();
    activePressedKeys.delete(cleanKey);
    keyPressTimestamps.delete(cleanKey);

    if (state.currentMode?.defaultAnimation === "iCouldDoThat" && isICouldDoThatPrimed) {
        const { hasLeft, hasRight } = checkHandArrays();

        if (!hasLeft || !hasRight) {
            isICouldDoThatPrimed = false; 
            handleActionTrigger(cleanKey);
            screen.classList.remove("screen-holding-pulse");
        }
    }

    if (cleanKey === "1") {
        state.shiftDown = false;
        resetPassword();
    }
}, { capture: true });

window.addEventListener("blur", () => {
    activePressedKeys.clear();
    keyPressTimestamps.clear();
    isICouldDoThatPrimed = false; 
    if (state.shiftDown) {
        state.shiftDown = false;
        resetPassword();
    }
    screen.classList.remove("screen-holding-pulse");
});

window.addEventListener("mousedown", () => {
    if (state.shiftDown) return;
    handleActionTrigger();
}, { capture: true });

window.addEventListener("touchstart", () => {
    if (state.shiftDown) return;
    handleActionTrigger();
}, { capture: true });

/* =========================================================
   DEBUGGING CONSOLE COMPONENT (DUAL PANELS)
========================================================= */
function setupDebugOverlay() {
    let debugLeft = document.getElementById("terminal-debug-left");
    if (!debugLeft) {
        debugLeft = document.createElement("div");
        debugLeft.id = "terminal-debug-left";
        Object.assign(debugLeft.style, {
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
            lineHeight: "1.4",
            width: "280px"
        });
        document.body.appendChild(debugLeft);
    }

    let debugRight = document.getElementById("terminal-debug-right");
    if (!debugRight) {
        debugRight = document.createElement("div");
        debugRight.id = "terminal-debug-right";
        Object.assign(debugRight.style, {
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(0, 0, 0, 0.85)",
            color: "#ff3366",
            fontFamily: "monospace",
            fontSize: "12px",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ff3366",
            zIndex: "10000",
            pointerEvents: "none",
            lineHeight: "1.4",
            width: "280px"
        });
        document.body.appendChild(debugRight);
    }
}

function updateDebug() {
    const debugLeft = document.getElementById("terminal-debug-left");
    const debugRight = document.getElementById("terminal-debug-right");
    if (!debugLeft || !debugRight) return;

    const pressedLeft = Array.from(activePressedCodes).filter(code => code === "KeyR");
    const pressedRight = Array.from(activePressedCodes).filter(code => code === "KeyB");

    const codeBufferDisplay = state.passwordBuffer.length > 0 
        ? `[ ${state.passwordBuffer.join(", ")} ]` 
        : "EMPTY";

    let challengeState = "INACTIVE";
    if (state.currentMode?.defaultAnimation === "iCouldDoThat") {
        if (state.owner === "timer") {
            challengeState = "TIMER RUNNING (ARMED FOR INTERRUPT)";
        } else if (isICouldDoThatPrimed) {
            challengeState = "PRIMED: WAITING FOR KEY RELEASE";
        } else if (isReadyToStart()) {
            challengeState = "WAITING FOR CHORD (BOTH SIDES)";
        }
    }

    debugLeft.innerHTML = `
        <strong>⚙️ LEFT SYSTEM PANEL</strong><br>
        -----------------------------------<br>
        STATE OWNER   : <span style="color:#fff">${state.owner.toUpperCase()}</span><br>
        ANIMATION     : <span style="color:#fff">${state.currentAnimName || 'NONE'}</span><br>
        SHIFT MODIFIER: ${state.shiftDown ? '<span style="color:#ff3333;font-weight:bold">HELD (1)</span>' : 'RELEASED'}<br>
        SLIDING QUEUE : <span style="color:#ffff33">${codeBufferDisplay}</span><br>
        TRANSITION LOCK: ${state.transitionActive ? 'ACTIVE' : 'READY'}<br>
        CURRENT MODE  : <span style="color:#33ffff">${state.currentMode ? Object.keys(MODES).find(k => MODES[k].timerLength === state.currentMode.timerLength) : 'NONE'}</span><br>
        -----------------------------------<br>
        <strong>⬅️ LEFT PRESSED KEY LOG</strong><br>
        ${pressedLeft.length > 0 ? `<span style="color:#fff">${pressedLeft.join(", ")}</span>` : '<span style="color:#666">NO KEYS PRESSED</span>'}
    `;

    debugRight.innerHTML = `
        <strong>🎯 CHALLENGE MATRIX</strong><br>
        -----------------------------------<br>
        CHALLENGE     : <span style="color:#fff">iCouldDoThat</span><br>
        STATUS        : <span style="color:#fff; font-weight:bold;">${challengeState}</span><br>
        LEFT ARY STATE: ${pressedLeft.length > 0 ? '<span style="color:#00ffaa;font-weight:bold">ENGAGED</span>' : '<span style="color:#ff3366">EMPTY</span>'}<br>
        RIGHT ARY STATE: ${pressedRight.length > 0 ? '<span style="color:#00ffaa;font-weight:bold">ENGAGED</span>' : '<span style="color:#ff3366">EMPTY</span>'}<br>
        -----------------------------------<br>
        <strong>➡️ RIGHT PRESSED KEY LOG</strong><br>
        ${pressedRight.length > 0 ? `<span style="color:#fff">${pressedRight.join(", ")}</span>` : '<span style="color:#666">NO KEYS PRESSED</span>'}
    `;
}

initDefaultMode();
startDefaultOrIdleCycle();