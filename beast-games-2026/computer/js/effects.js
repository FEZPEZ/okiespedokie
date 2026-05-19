const crt = document.getElementById("crt");
   const layer = document.getElementById("layer");

function random(min, max) {
  return Math.random() * (max - min) + min;
}

/* CRT DRIFT + GLITCH (restored original feel) */
export function startGlitch() {
  function loop() {
    const x = random(-1, 1);
    const y = random(-2, 2);
    const r = random(-0.25, 0.25);
    const s = random(0.997, 1.006);

    crt.style.transform = `
      translate(${x}px, ${y}px)
      rotate(${r}deg)
      scale(${s})
    `;

    crt.style.filter = `
      hue-rotate(${random(-6, 6)}deg)
      contrast(${random(0.98, 1.04)})
      saturate(${random(0.9, 1.15)})
    `;

    if (Math.random() < 0.18) {
      crt.style.clipPath = `inset(${random(0,5)}% 0 ${random(0,5)}% 0)`;
      setTimeout(() => (crt.style.clipPath = ""), 60);
    }

    setTimeout(loop, random(35, 140));
  }

  loop();
}

/* subtle layer wobble (this was missing entirely) */
export function startLayerDrift() {
  let t = 0;

  function loop() {
    t += 0.01;

    layer.style.transform = `
      rotateX(5.5deg)
      scale(1.02)
      translateY(${Math.sin(t) * 0.6}px)
    `;

    requestAnimationFrame(loop);
  }

  loop();
}

/* scanlines toggle hook (kept CSS-driven but controllable) */
export function enableScanlines() {
  document.getElementById("crt").classList.add("scanlines");
}