from PIL import Image
import os

TARGET_COLOR = (0, 255, 170)  # #00ffaa

files = [
    "food-countdown/assets/fork.png",
    "food-countdown/assets/spoon.png",
]

def recolor_image(path):
    img = Image.open(path).convert("RGBA")
    pixels = img.load()

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]

            # skip fully transparent pixels
            if a == 0:
                continue

            # preserve alpha, replace RGB
            pixels[x, y] = (TARGET_COLOR[0], TARGET_COLOR[1], TARGET_COLOR[2], a)

    img.save(path)

for f in files:
    if os.path.exists(f):
        recolor_image(f)
    else:
        print(f"Missing: {f}")