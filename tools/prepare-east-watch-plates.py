"""Fit East Watch plates and punch one chroma-key magenta: #EE3173."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\Papa\.cursor\projects\c-Users-Papa-Desktop-greenwood\assets")
ROOMS = ROOT / "apps" / "web" / "public" / "art" / "rooms"
NPCS = ROOT / "apps" / "web" / "public" / "art" / "characters" / "npcs"
OBJECTS = ROOT / "apps" / "web" / "public" / "art" / "objects"

# One key only. Unify generator pinks to this, then punch this.
KEY = (238, 49, 115)
KEY_DIST = 58

ROOM_FILES = [
    "moor-track.png",
    "wren-croft.png",
    "sheepfold.png",
    "standing-stones.png",
    "peat-cut.png",
    "barrow-mouth.png",
    "barrow-nave.png",
    "fog-hollow.png",
]
NPC_FILES = [
    "npc-shepherd-wren.png",
    "mist-crow.png",
    "barrow-guard.png",
    "fog-walker.png",
    "peat-adder.png",
]
OBJECT_FILES = [
    "object-holm-wrapping.png",
    "object-colm-aftermath.png",
    "object-wool-wrap.png",
    "object-colms-crook.png",
    "object-empty-peg.png",
    "object-empty-fold.png",
    "object-waystone.png",
    "object-abbey-mark.png",
    "object-new-stone.png",
    "object-abbey-bronze.png",
    "object-shed-skin.png",
    "object-no-footprints.png",
    "object-peat-water.png",
    "wren-wool-charm.png",
    "wren-hearth-charm.png",
    "abbey-mark-rubbing.png",
    "object-kitchen-initials.png",
]


def key_dist(red: int, green: int, blue: int) -> int:
    return (red - KEY[0]) ** 2 + (green - KEY[1]) ** 2 + (blue - KEY[2]) ** 2


def is_chroma_magenta(red: int, green: int, blue: int) -> bool:
    """Hot-pink generator backgrounds, plus the canonical key neighbourhood."""
    if key_dist(red, green, blue) <= KEY_DIST**2:
        return True
    hue, sat, val = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    return sat >= 0.50 and val >= 0.40 and 0.78 <= hue <= 0.98


def unify_to_key(image: Image.Image) -> Image.Image:
    """Flood edge-connected chroma magenta to #EE3173 so punch has one colour."""
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    queue: list[tuple[int, int]] = []
    seen = bytearray(width * height)

    def try_add(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if seen[index]:
            return
        red, green, blue = pixels[x, y]
        if not is_chroma_magenta(red, green, blue):
            return
        seen[index] = 1
        queue.append((x, y))

    for x in range(width):
        try_add(x, 0)
        try_add(x, height - 1)
    for y in range(height):
        try_add(0, y)
        try_add(width - 1, y)

    while queue:
        x, y = queue.pop()
        pixels[x, y] = KEY
        try_add(x + 1, y)
        try_add(x - 1, y)
        try_add(x, y + 1)
        try_add(x, y - 1)

    raw = bytearray(rgb.tobytes())
    for index in range(0, len(raw), 3):
        if is_chroma_magenta(raw[index], raw[index + 1], raw[index + 2]):
            raw[index] = KEY[0]
            raw[index + 1] = KEY[1]
            raw[index + 2] = KEY[2]
    return Image.frombytes("RGB", rgb.size, bytes(raw))


def is_resize_fringe(red: int, green: int, blue: int) -> bool:
    """LANCZOS mixes #EE3173 into subject edges; catch that halo only."""
    if key_dist(red, green, blue) <= (KEY_DIST + 36) ** 2:
        return True
    hue, sat, val = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    return sat >= 0.18 and val >= 0.28 and 0.80 <= hue <= 0.97


def punch_key(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    alpha = bytearray(width * height)
    queue: list[tuple[int, int]] = []
    seen = bytearray(width * height)

    def try_add(x: int, y: int, require_fringe: bool) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        index = y * width + x
        if seen[index]:
            return
        red, green, blue = pixels[x, y]
        if require_fringe:
            if not is_resize_fringe(red, green, blue):
                return
        elif key_dist(red, green, blue) > KEY_DIST**2:
            return
        seen[index] = 1
        queue.append((x, y))

    for y in range(height):
        for x in range(width):
            red, green, blue = pixels[x, y]
            if key_dist(red, green, blue) <= KEY_DIST**2:
                try_add(x, y, False)

    while queue:
        x, y = queue.pop()
        pixels[x, y] = (0, 0, 0)
        alpha[y * width + x] = 0
        try_add(x + 1, y, True)
        try_add(x - 1, y, True)
        try_add(x, y + 1, True)
        try_add(x, y - 1, True)

    for index in range(len(alpha)):
        if not seen[index]:
            alpha[index] = 255

    punched = rgb.convert("RGBA")
    punched.putalpha(Image.frombytes("L", (width, height), bytes(alpha)))
    return punched


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.convert("RGB")
    width, height = copy.size
    target_w, target_h = size
    scale = max(target_w / width, target_h / height)
    resized = copy.resize(
        (max(1, round(width * scale)), max(1, round(height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def fit_keyed(image: Image.Image, size: tuple[int, int], bottom: bool) -> Image.Image:
    unified = unify_to_key(image)
    unified.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, KEY)
    left = (size[0] - unified.width) // 2
    top = size[1] - unified.height if bottom else (size[1] - unified.height) // 2
    canvas.paste(unified, (left, max(0, top)))
    return punch_key(canvas)


def save(image: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, format="PNG")
    print(dest.relative_to(ROOT), image.size, dest.stat().st_size)


def main() -> None:
    for name in ROOM_FILES:
        save(cover(Image.open(SOURCE / name), (1600, 900)), ROOMS / name)
    for name in NPC_FILES:
        save(fit_keyed(Image.open(SOURCE / name), (512, 768), bottom=True), NPCS / name)
    for name in OBJECT_FILES:
        save(fit_keyed(Image.open(SOURCE / name), (512, 640), bottom=False), OBJECTS / name)


if __name__ == "__main__":
    main()
