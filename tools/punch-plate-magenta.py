"""Remove leftover chroma-key magenta and edge-connected paper frames."""

from __future__ import annotations

import time
from pathlib import Path

import colorsys

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "apps" / "web" / "public" / "art" / "characters" / "npcs",
    ROOT / "apps" / "web" / "public" / "art" / "characters" / "looks",
    ROOT / "apps" / "web" / "public" / "art" / "characters" / "bodies",
    ROOT / "apps" / "web" / "public" / "art" / "objects",
]


def is_key(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha < 8:
        return False
    # Generated plates use several magentas: #EE3173, #DB0068, and pink-purple leftovers.
    if red >= 140 and green <= 100 and blue >= 55 and red - green >= 55 and blue + 20 >= green:
        return True
    hue, sat, val = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    if sat >= 0.45 and val >= 0.35 and 0.83 <= hue <= 0.95:
        return True
    return red >= 130 and green <= 40 and blue >= 50 and red - green >= 80


def is_paper(red: int, green: int, blue: int, alpha: int) -> bool:
    """Generation leftover: a cream/white card still attached to the plate edge."""
    if alpha < 8:
        return False
    return red >= 220 and green >= 218 and blue >= 208 and min(red, green, blue) >= 200


def has_paper_frame(rgba: Image.Image) -> bool:
    """True when a full-width paper-white row remains, as on mole-male-russet."""
    width, height = rgba.size
    pixels = rgba.load()
    for y in range(height):
        paper = 0
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if is_paper(red, green, blue, alpha):
                paper += 1
        if paper >= width - 2:
            return True
    return False


def punch_paper_frame(rgba: Image.Image) -> Image.Image:
    width, height = rgba.size
    pixels = rgba.load()
    queue: list[tuple[int, int]] = []
    seen = bytearray(width * height)

    def try_add(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if seen[index]:
            return
        red, green, blue, alpha = pixels[x, y]
        if not is_paper(red, green, blue, alpha):
            return
        seen[index] = 1
        queue.append((x, y))

    for x in range(width):
        try_add(x, 0)
        try_add(x, height - 1)
    for y in range(height):
        try_add(0, y)
        try_add(width - 1, y)

    if not queue:
        return rgba

    while queue:
        x, y = queue.pop()
        pixels[x, y] = (0, 0, 0, 0)
        try_add(x + 1, y)
        try_add(x - 1, y)
        try_add(x, y + 1)
        try_add(x, y - 1)
    return rgba


def punch(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    raw = bytearray(rgba.tobytes())
    changed = False
    for index in range(0, len(raw), 4):
        red = raw[index]
        green = raw[index + 1]
        blue = raw[index + 2]
        alpha = raw[index + 3]
        if is_key(red, green, blue, alpha):
            raw[index + 3] = 0
            changed = True
    keyed = Image.frombytes("RGBA", rgba.size, bytes(raw)) if changed else rgba
    if has_paper_frame(keyed):
        return punch_paper_frame(keyed)
    return keyed


def replace(path: Path, image: Image.Image) -> None:
    tmp = path.with_name(path.stem + ".punched.png")
    image.save(tmp, format="PNG")
    for attempt in range(6):
        try:
            tmp.replace(path)
            return
        except OSError:
            if attempt == 5:
                raise
            time.sleep(0.25 * (attempt + 1))


def main() -> None:
    changed = 0
    scanned = 0
    for folder in TARGETS:
        for path in sorted(folder.glob("*.png")):
            scanned += 1
            image = Image.open(path)
            punched = punch(image)
            if punched.tobytes() != image.convert("RGBA").tobytes():
                replace(path, punched)
                changed += 1
                print(path.relative_to(ROOT), flush=True)
    print(f"punched {changed} of {scanned} files", flush=True)


if __name__ == "__main__":
    main()
