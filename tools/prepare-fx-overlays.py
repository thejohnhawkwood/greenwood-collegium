"""Punch magenta keys from combat FX overlays and fit them to 512x768."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\pbird\.cursor\projects\c-Users-pbird-OneDrive-Christ-the-Redeemer-Catholic-School-Board-Desktop-greenwood\assets"
)
DEST = ROOT / "apps" / "web" / "public" / "art" / "fx"
SIZE = (512, 768)

FX_FILES = [
    "weapon-sword.png",
    "weapon-staff.png",
    "weapon-sling.png",
    "weapon-fist.png",
    "impact-burst.png",
    "ember-burst.png",
    "cinder-snap.png",
    "thorn-bind.png",
    "briar-lash.png",
    "steel-strike.png",
    "steel-riposte.png",
    "stone-stomp.png",
    "keystone-blow.png",
    "stars-flare.png",
    "azimuth-point.png",
    "shade-fold.png",
    "ready-steel.png",
    "hearth-ward.png",
    "greenstitch.png",
    "stone-brace.png",
    "night-eye.png",
    "quiet-step.png",
    "veil-slip.png",
    "wound-shred.png",
    "wound-seep.png",
    "wound-blacken.png",
    "defeat-skull.png",
]

PAPER_PUNCH = {
    "wound-shred.png",
    "wound-seep.png",
    "wound-blacken.png",
    "ready-steel.png",
    "hearth-ward.png",
    "stone-brace.png",
}


def is_key(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha < 8:
        return False
    if red >= 150 and green <= 72 and blue >= 70 and red - green >= 90 and blue > green + 10:
        return True
    if red >= 130 and green <= 40 and blue >= 50 and red - green >= 80:
        return True
    if red >= 200 and blue >= 90 and green <= 140 and red - green >= 70 and blue > green:
        return True
    return red >= 180 and green <= 120 and blue >= 80 and red > green + 40 and blue >= green + 8


def is_cream(red: int, green: int, blue: int, alpha: int) -> bool:
    if alpha < 8:
        return False
    low = min(red, green, blue)
    high = max(red, green, blue)
    return red >= 198 and green >= 184 and blue >= 148 and red >= blue and high - low <= 72


def punch_key(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if is_key(red, green, blue, alpha):
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def punch_cream(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if is_cream(red, green, blue, alpha):
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def fit(image: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    copy = image.copy()
    copy.thumbnail(SIZE, Image.Resampling.LANCZOS)
    left = (SIZE[0] - copy.width) // 2
    top = (SIZE[1] - copy.height) // 2
    canvas.paste(copy, (left, top), copy)
    return canvas


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for name in FX_FILES:
        punched = punch_key(Image.open(SOURCE / name))
        if name in PAPER_PUNCH:
            punched = punch_cream(punched)
        fit(punched).save(DEST / name, format="PNG")
        print(name)


if __name__ == "__main__":
    main()
