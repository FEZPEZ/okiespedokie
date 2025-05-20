// audio.js
let audioCtx = null;
let churchClapBuffer = null;
let churchClapSource = null;
let catMeowBuffer = null;

async function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
}

async function loadAudioBuffer(url) {
    await initAudioContext();

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error(`Failed to load audio from ${url}:`, e);
        return null;
    }
}

export async function loadBuffers() {
    if (!churchClapBuffer) {
        churchClapBuffer = await loadAudioBuffer('../audio/churchclap.mp3');
    }
    if (!catMeowBuffer) {
        catMeowBuffer = await loadAudioBuffer('../audio/catmeow.wav');
    }
}

export async function playChurchClapLoop() {
    if (!churchClapBuffer || !audioCtx) return;
    if (churchClapSource) return; // already playing

    churchClapSource = audioCtx.createBufferSource();
    churchClapSource.buffer = churchClapBuffer;
    churchClapSource.loop = true;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.9;

    churchClapSource.connect(gainNode).connect(audioCtx.destination);
    churchClapSource.start(0);
}

export function stopChurchClapLoop() {
    if (churchClapSource) {
        churchClapSource.stop();
        churchClapSource.disconnect();
        churchClapSource = null;
    }
}

export function playCatMeow() {
    if (!catMeowBuffer || !audioCtx) return;

    const source = audioCtx.createBufferSource();
    source.buffer = catMeowBuffer;
    source.playbackRate.value = 1 + (Math.random() * 0.06 - 0.03);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.4;

    source.connect(gainNode).connect(audioCtx.destination);
    source.start(0);
}
