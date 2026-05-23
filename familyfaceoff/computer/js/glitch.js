export function startGlitch(layer) {
    // We no longer need an infinite recursive setTimeout loop!
    // Simply add a hardware-accelerated class to the layer.
    layer.classList.add("gpu-glitch");
}