"""Punch edge-connected paper white from object plates. Leave painted silk."""

from __future__ import annotations

import time
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OBJECTS = ROOT / "apps" / "web" / "public" / "art" / "objects"


def is_paper(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha < 8:
        return False
    low = min(red, green, blue)
    high = max(red, green, blue)
    return low >= 242 and high - low <= 12


def punch(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    seen: set[tuple[int, int]] = set()
    queue: list[tuple[int, int]] = []
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    changed = False
    while queue:
        x, y = queue.pop()
        if (x, y) in seen or x < 0 or y < 0 or x >= width or y >= height:
            continue
        seen.add((x, y))
        red, green, blue, alpha = pixels[x, y]
        if not is_paper(red, green, blue, alpha):
            continue
        pixels[x, y] = (red, green, blue, 0)
        changed = True
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return rgba if changed else image.convert("RGBA")


def replace(path: Path, image: Image.Image) -> None:
    tmp = path.with_name(path.stem + ".punched.png")
    image.save(tmp, format="PNG", optimize=True, compress_level=9)
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
    for path in sorted(OBJECTS.glob("*.png")):
        scanned += 1
        image = Image.open(path)
        punched = punch(image)
        if punched.tobytes() != image.convert("RGBA").tobytes():
            replace(path, punched)
            changed += 1
            print(path.name, flush=True)
    print(f"punched {changed} of {scanned} files", flush=True)


if __name__ == "__main__":
    main()
