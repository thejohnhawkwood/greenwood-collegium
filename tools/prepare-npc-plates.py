"""Fit NPC plates to the Collegian catalog and punch the hot-pink key."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\pbird\.cursor\projects\c-Users-pbird-OneDrive-Christ-the-Redeemer-Catholic-School-Board-Desktop-greenwood\assets"
)
DEST = ROOT / "apps" / "web" / "public" / "art" / "characters" / "npcs"
SIZE = (512, 768)
PLATES = [
    "npc-porter-bramble.png",
    "npc-headmaster-alder.png",
    "npc-librarian-quill.png",
    "npc-healer-fen.png",
    "npc-groundskeeper-tansy.png",
    "npc-instructor-flint.png",
    "practice-dummy.png",
]


def is_key(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha < 8:
        return False
    return red >= 130 and green <= 40 and blue >= 50 and red - green >= 80


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
    while queue:
        x, y = queue.pop()
        if (x, y) in seen or x < 0 or y < 0 or x >= width or y >= height:
            continue
        seen.add((x, y))
        red, green, blue, alpha = pixels[x, y]
        if alpha < 8 or is_key(red, green, blue, alpha):
            if alpha >= 8:
                pixels[x, y] = (red, green, blue, 0)
            queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if is_key(red, green, blue, alpha):
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def fit(image: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    copy = image.copy()
    copy.thumbnail(SIZE, Image.Resampling.LANCZOS)
    left = (SIZE[0] - copy.width) // 2
    top = SIZE[1] - copy.height
    canvas.paste(copy, (left, max(0, top)), copy)
    return canvas


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for name in PLATES:
        punched = punch(Image.open(SOURCE / name))
        fit(punched).save(DEST / name, format="PNG")
        print(name)


if __name__ == "__main__":
    main()
