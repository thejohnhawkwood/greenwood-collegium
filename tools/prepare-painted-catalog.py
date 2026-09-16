"""Punch backgrounds and stamp paper-doll overlays from the painted catalog."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ASSETS = Path(r"C:\Users\Papa\.cursor\projects\c-Users-Papa-Desktop-greenwood\assets")
ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "apps" / "web" / "public" / "art"
SIZE = (512, 768)

SPECIES = [
    "mouse",
    "hare",
    "badger",
    "otter",
    "squirrel",
    "mole",
    "hedgehog",
    "fox",
    "stoat",
    "owl",
    "toad",
]
BUILDS = ("slender", "rounded", "sturdy")
GENDERS = ("female", "male")
LOOKS = ("fern", "indigo", "russet")
FITS = ("small", "medium", "stocky", "tall", "winged", "amphibian")
ROOMS = [
    "lantern-court",
    "great-hall",
    "west-cloister",
    "east-gate",
    "south-orchard",
    "north-quad",
    "observatory",
    "music-loft",
    "clock-tower",
    "library-stacks",
    "scriptorium",
    "archive-cellar",
    "lecture-theatre",
    "refectory",
    "kitchens",
    "porter-lodge",
    "infirmary",
    "dormitory-oak",
    "dormitory-willow",
    "east-meadow",
    "herb-garden",
    "greenhouse",
    "quiet-chapel",
    "pottery-shed",
    "river-landing",
]
CLOTHING = {
    "fern": (75, 120, 102, 120),
    "indigo": (98, 109, 158, 120),
    "russet": (168, 96, 75, 120),
}


def is_backdrop(red: int, green: int, blue: int) -> bool:
    magenta = red > 140 and blue > 140 and green < 130 and red + blue - 2 * green > 80
    white = red > 220 and green > 220 and blue > 220
    pale = red > 200 and green > 200 and blue > 200 and abs(red - green) < 22
    return magenta or white or pale


def punch(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    seen = set()
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
        if not is_backdrop(red, green, blue):
            continue
        pixels[x, y] = (red, green, blue, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha and is_backdrop(red, green, blue):
                pixels[x, y] = (red, green, blue, 0)
    return rgba.filter(ImageFilter.SMOOTH)


def fit_canvas(image: Image.Image) -> Image.Image:
    fitted = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    copy = image.copy()
    copy.thumbnail(SIZE, Image.Resampling.LANCZOS)
    left = (SIZE[0] - copy.width) // 2
    top = SIZE[1] - copy.height
    fitted.paste(copy, (left, max(0, top)))
    return fitted


def save(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def blob(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], color: tuple[int, int, int, int]) -> None:
    draw.ellipse(box, fill=color)


def clothing_layer(fit: str, color: tuple[int, int, int, int]) -> Image.Image:
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    scale = {
        "small": 0.72,
        "medium": 1.0,
        "stocky": 1.16,
        "tall": 1.08,
        "winged": 0.94,
        "amphibian": 0.86,
    }[fit]
    torso_w = int(72 * scale)
    torso_h = int(118 * scale)
    cx, cy = 256, 468 if fit != "tall" else 440
    draw.rounded_rectangle(
        (cx - torso_w, cy - torso_h // 2, cx + torso_w, cy + torso_h // 2),
        radius=int(28 * scale),
        fill=color,
    )
    sleeve = int(30 * scale)
    draw.ellipse(
        (cx - torso_w - sleeve + 10, cy - torso_h // 2, cx - torso_w + 18, cy - torso_h // 2 + int(32 * scale)),
        fill=color,
    )
    draw.ellipse(
        (cx + torso_w - 18, cy - torso_h // 2, cx + torso_w + sleeve - 10, cy - torso_h // 2 + int(32 * scale)),
        fill=color,
    )
    belt = (max(0, color[0] - 18), max(0, color[1] - 18), max(0, color[2] - 18), min(160, color[3] + 10))
    draw.rectangle((cx - int(torso_w * 0.72), cy - 3, cx + int(torso_w * 0.72), cy + 6), fill=belt)
    return layer.filter(ImageFilter.GaussianBlur(0.8))


def accessory_layer(kind: str) -> Image.Image:
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    if kind == "scarf":
        blob(draw, (170, 250, 350, 330), (219, 185, 102, 220))
        draw.polygon([(300, 300), (340, 310), (320, 430), (280, 410)], fill=(219, 185, 102, 220))
    elif kind == "satchel":
        draw.line((180, 260, 340, 470), fill=(212, 194, 142, 230), width=10)
        draw.rounded_rectangle((300, 430, 390, 520), radius=12, fill=(156, 111, 73, 230))
    else:
        blob(draw, (190, 70, 330, 150), (122, 90, 58, 230))
        draw.ellipse((170, 130, 350, 175), fill=(96, 70, 44, 230))
    return layer.filter(ImageFilter.SMOOTH)


def marking_layer(kind: str) -> Image.Image:
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cream = (229, 214, 176, 72)
    dusk = (48, 40, 36, 64)
    if kind == "blaze":
        draw.polygon([(252, 168), (262, 168), (266, 236), (257, 246), (248, 236)], fill=cream)
    elif kind == "freckles":
        for x, y in ((214, 246), (228, 258), (286, 246), (300, 258), (242, 268), (276, 268)):
            blob(draw, (x, y, x + 5, y + 5), cream)
    elif kind == "mask":
        blob(draw, (198, 208, 232, 236), dusk)
        blob(draw, (280, 208, 314, 236), dusk)
    else:
        for x, y in ((210, 230), (236, 288), (292, 224), (312, 278), (250, 318)):
            blob(draw, (x, y, x + 8, y + 6), cream)
    return layer.filter(ImageFilter.GaussianBlur(1.4))


def muzzle_layer(kind: str) -> Image.Image:
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    color = (90, 60, 48, 190)
    box = {"short": (236, 248, 276, 278), "tapered": (232, 246, 280, 292), "broad": (220, 248, 292, 286)}[
        kind
    ]
    blob(draw, box, color)
    return layer


def ear_layer(kind: str) -> Image.Image:
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    fur = (168, 121, 86, 200)
    if kind == "neat":
        blob(draw, (150, 110, 210, 190), fur)
        blob(draw, (300, 110, 360, 190), fur)
    elif kind == "tufted":
        blob(draw, (145, 90, 215, 195), fur)
        blob(draw, (295, 90, 365, 195), fur)
        draw.polygon([(160, 90), (180, 40), (200, 100)], fill=fur)
        draw.polygon([(310, 90), (330, 40), (350, 100)], fill=fur)
    else:
        blob(draw, (155, 20, 205, 210), fur)
        blob(draw, (305, 20, 355, 210), fur)
    return layer.filter(ImageFilter.SMOOTH)


def face_layer(kind: str) -> Image.Image:
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    ink = (21, 37, 30, 220)
    if kind == "calm":
        draw.arc((190, 200, 230, 230), 200, 340, fill=ink, width=4)
        draw.arc((280, 200, 320, 230), 200, 340, fill=ink, width=4)
    else:
        blob(draw, (196, 204, 226, 236), ink)
        blob(draw, (286, 204, 316, 236), ink)
        if kind == "keen":
            draw.line((186, 190, 226, 198), fill=ink, width=4)
            draw.line((286, 198, 326, 190), fill=ink, width=4)
    return layer


def main() -> None:
    for species in SPECIES:
        for gender in GENDERS:
            punched = fit_canvas(punch(Image.open(ASSETS / f"body-{species}-{gender}.png")))
            for build in BUILDS:
                save(punched, ART / "characters" / "bodies" / f"{species}-{gender}-{build}.png")
            for look in LOOKS:
                save(
                    fit_canvas(punch(Image.open(ASSETS / f"look-{species}-{gender}-{look}.png"))),
                    ART / "characters" / "looks" / f"{species}-{gender}-{look}.png",
                )

    for fit in FITS:
        for name, color in CLOTHING.items():
            save(clothing_layer(fit, color), ART / "characters" / "clothing" / f"{fit}-{name}.png")

    for accessory in ("scarf", "satchel", "hat"):
        save(accessory_layer(accessory), ART / "characters" / "accessories" / f"{accessory}.png")
    for marking in ("blaze", "freckles", "mask", "speckled"):
        save(marking_layer(marking), ART / "characters" / "markings" / f"{marking}.png")
    for muzzle in ("short", "tapered", "broad"):
        save(muzzle_layer(muzzle), ART / "characters" / "muzzles" / f"shared-{muzzle}.png")
    for ears in ("neat", "tufted", "long"):
        save(ear_layer(ears), ART / "characters" / "ears" / f"shared-{ears}.png")
    for face in ("bright", "calm", "keen"):
        save(face_layer(face), ART / "characters" / "faces" / f"{face}.png")

    for room in ROOMS:
        shutil.copyfile(ASSETS / f"room-{room}.png", ART / "rooms" / f"{room}.png")


if __name__ == "__main__":
    main()
