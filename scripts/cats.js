const catGifs = [
    "https://media1.giphy.com/media/gh38GGyKPFff36j6aE/200w.gif",
    "https://media3.giphy.com/media/jUKBVRKJwoB9fC8g8p/200.gif",
    "https://media3.giphy.com/media/tRoH9EYLs3lok/200w.gif",
    "https://www.cutecatgifs.com/wp-content/uploads/2021/02/wow.gif",
    "https://i.pinimg.com/originals/9a/3c/3f/9a3c3fb5f73822af8514df07f6676392.gif",
    "https://i.pinimg.com/originals/3c/99/31/3c99312b3e1bf81197f6f95848761b83.gif",
    "https://media3.giphy.com/media/H4DjXQXamtTiIuCcRU/200w.gif",
    "https://i.pinimg.com/originals/f2/ab/1a/f2ab1af79d72d94a114bc9fe5a891835.gif",
    "https://i.chzbgr.com/full/9320913920/h8598A467/cute-gif-of-a-tiny-kitten",
    "https://img.buzzfeed.com/buzzfeed-static/static/2017-08/9/17/asset/buzzfeed-prod-web-10/anigif_sub-buzz-8427-1502313524-1.gif",
    "https://media.tenor.com/Fr1Rd7pazC8AAAAM/nice-cat.gif",
    "https://www.icegif.com/wp-content/uploads/2023/10/icegif-84.gif",
    "https://s1.r29static.com/bin/entry/215/x/1600093/image.gif",
    "https://res.cloudinary.com/jerrick/image/upload/v1514493943/teqcyxcn1hboqpuwifcq.gif"
];

let audioCtx = null;
let churchClapBuffer = null;
let churchClapSource = null;
let catMeowBuffer = null;

let originalDescText = null;

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

async function loadBuffers() {
    if (!churchClapBuffer) {
        churchClapBuffer = await loadAudioBuffer('../audio/churchclap.mp3');
    }
    if (!catMeowBuffer) {
        catMeowBuffer = await loadAudioBuffer('../audio/catmeow.wav');
    }
}

function playChurchClapLoop() {
    if (!churchClapBuffer || !audioCtx) return;
    if (churchClapSource) return; // already playing

    churchClapSource = audioCtx.createBufferSource();
    churchClapSource.buffer = churchClapBuffer;
    churchClapSource.loop = true;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.9; // 50% volume

    churchClapSource.connect(gainNode).connect(audioCtx.destination);
    churchClapSource.start(0);
}

function stopChurchClapLoop() {
    if (churchClapSource) {
        churchClapSource.stop();
        churchClapSource.disconnect();
        churchClapSource = null;
    }
}

function playCatMeow() {
    if (!catMeowBuffer || !audioCtx) return;

    const source = audioCtx.createBufferSource();
    source.buffer = catMeowBuffer;

    // Randomize pitch ±50 cents (±~3%)
    source.playbackRate.value = 1 + (Math.random() * 0.06 - 0.03);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.4; // 40% volume

    source.connect(gainNode).connect(audioCtx.destination);
    source.start(0);
}

async function updateEffectState(active) {
    const img = document.getElementById('thumbnail');
    const desc = document.getElementById('description');

    await initAudioContext();

    if (active) {
        img.classList.add('crazy-flash');
        desc.classList.remove('normal');
        desc.classList.add('crazy-flash');

        if (originalDescText === null) {
            originalDescText = desc.textContent;
        }
        desc.textContent = "itsa...CUTE!!!";

        await loadBuffers();
        playChurchClapLoop();
    } else {
        img.classList.remove('crazy-flash');
        desc.classList.remove('crazy-flash');
        desc.classList.add('normal');

        stopChurchClapLoop();

        if (originalDescText !== null) {
            desc.textContent = originalDescText;
            originalDescText = null;
        }
    }
}

function spawnCatGif(x, y) {
    playCatMeow();

    const gif = document.createElement('img');
    gif.src = catGifs[Math.floor(Math.random() * catGifs.length)];
    gif.className = 'cat-gif';
    gif.style.left = `${x - 50}px`;
    gif.style.top = `${y - 50}px`;
    document.body.appendChild(gif);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let posX = x - 50;
    let posY = y - 50;
    let velX = 0;
    let velY = 0;

    updateEffectState(true);

    function animate() {
        const dx = posX + 50 - centerX;
        const dy = posY + 50 - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const accel = 0.0005 * dist;
        const norm = dist || 1;

        velX += (dx / norm) * accel;
        velY += (dy / norm) * accel;

        posX += velX;
        posY += velY;

        gif.style.left = `${posX}px`;
        gif.style.top = `${posY}px`;

        if (
            posX < -250 || posX > window.innerWidth + 250 ||
            posY < -250 || posY > window.innerHeight + 250
        ) {
            gif.remove();
            if (!document.querySelector('.cat-gif')) {
                updateEffectState(false);
            }
        } else {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

document.addEventListener('click', e => {
    spawnCatGif(e.clientX, e.clientY);
});
