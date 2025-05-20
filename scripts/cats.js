import {
    loadBuffers,
    playChurchClapLoop,
    stopChurchClapLoop,
    playCatMeow
} from './audio.js';

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

let originalDescText = null;

async function updateEffectState(active) {
    const img = document.getElementById('thumbnail');
    const desc = document.getElementById('description');

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

const circleColors = [
    "#F19A8A", "#9ED5D9", "#B6D6EB", "#D7E5DB", "#68BAB3", "#89CAB5",
    "#E4A3B2", "#EFD1E2", "#C5B5D3", "#CD7D88", "#E57A81", "#778592", "#323F4B"
];

let circleAnimationRunning = false;

function spawnBackgroundCircle() {
    const container = document.getElementById('background-circles');
    const circle = document.createElement('div');

    const size = Math.random() * 80 + 20;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const color = circleColors[Math.floor(Math.random() * circleColors.length)];

    circle.style.position = 'absolute';
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = color;
    circle.style.opacity = '0.7';
    circle.style.zIndex = '1';

    container.appendChild(circle);

    // Fade and remove
    setTimeout(() => {
        circle.style.transition = 'opacity 2s ease-out';
        circle.style.opacity = '0';
        setTimeout(() => circle.remove(), 2000);
    }, 500);
}

function startBackgroundCircles() {
    if (circleAnimationRunning) return;
    circleAnimationRunning = true;

    function loop() {
        if (!circleAnimationRunning) return;
        spawnBackgroundCircle();
        requestAnimationFrame(loop);
    }

    loop();
}

function stopBackgroundCircles() {
    circleAnimationRunning = false;
}

// Update meter + background animation
function updateCutenessMeter() {
    const meterContainer = document.getElementById('cuteness-meter-container');
    const meterFill = document.getElementById('cuteness-meter-fill');
    const cats = document.querySelectorAll('.cat-gif').length;

    if (cats > 0) {
        meterContainer.style.display = 'block';
        const percentage = Math.min(100, (cats / 20) * 100);
        meterFill.style.width = `${percentage}%`;

        if (percentage >= 100) {
            startBackgroundCircles();
            meterFill.classList.add('crazy-flash');
        } else {
            stopBackgroundCircles();
            meterFill.classList.remove('crazy-flash');
        }
    } else {
        meterContainer.style.display = 'none';
        meterFill.style.width = '0%';
        stopBackgroundCircles();
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
    updateCutenessMeter();

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
            updateCutenessMeter();
        } else {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

document.addEventListener('click', e => {
    spawnCatGif(e.clientX, e.clientY);
});
