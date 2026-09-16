"""Remove leftover chroma-key magenta from NPC and object plates."""

from __future__ import annotations

import time
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "apps" / "web" / "public" / "art" / "characters" / "npcs",
    ROOT / "apps" / "web" / "public" / "art" / "objects",
]


def is_key(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha < 8:
        return False
    # Generated plates often used ~ (238, 49, 115), slightly greener than #DB0068.
    if red >= 150 and green <= 72 and blue >= 70 and red - green >= 90 and blue > green + 10:
        return True
    return red >= 130 and green <= 40 and blue >= 50 and red - green >= 80


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
    if not changed:
        return rgba
    return Image.frombytes("RGBA", rgba.size, bytes(raw))


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
