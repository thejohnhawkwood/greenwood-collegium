"""Fit quest-plate slice 1 and punch one chroma-key magenta: #EE3173.

Does not touch the East Watch file lists.
"""

from __future__ import annotations

from pathlib import Path

import importlib.util

from PIL import Image

_spec = importlib.util.spec_from_file_location(
    "prepare_east_watch_plates",
    Path(__file__).with_name("prepare-east-watch-plates.py"),
)
_east = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_east)
cover = _east.cover
fit_keyed = _east.fit_keyed

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art" / "sources"
ROOMS = ROOT / "apps" / "web" / "public" / "art" / "rooms"
NPCS = ROOT / "apps" / "web" / "public" / "art" / "characters" / "npcs"
OBJECTS = ROOT / "apps" / "web" / "public" / "art" / "objects"

ROOMS_MAP = {
    "osier-camp.png": "room_osier-camp__v001__comic-ink.png",
}
NPCS_MAP = {
    "npc-collegian-quire.png": "character_npc-collegian-quire__v002__comic-ink.png",
    "shellington.png": "character_shellington__v002__comic-ink.png",
    "npc-stairkeeper-vane.png": "character_npc-stairkeeper-vane__v001__comic-ink.png",
    "npc-scout-tern.png": "character_npc-scout-tern__v003__comic-ink.png",
    "archive-bat.png": "character_archive-bat__v001__comic-ink.png",
    "withy-sentry.png": "character_withy-sentry__v001__comic-ink.png",
    "college-raider.png": "character_college-raider__v002__comic-ink.png",
}
OBJECTS_MAP = {
    "pressed-mask.png": "object_pressed-mask__v002__comic-ink.png",
    "object-tally-slate.png": "object_object-tally-slate__v001__comic-ink.png",
    "object-drying-frames.png": "object_object-drying-frames__v001__comic-ink.png",
    "borrowed-ink.png": "object_borrowed-ink__v001__comic-ink.png",
    "quires-focus-ring.png": "object_quires-focus-ring__v001__comic-ink.png",
    "vanes-wick-tin.png": "object_vanes-wick-tin__v001__comic-ink.png",
    "shellington-diary.png": "object_shellington-diary__v001__comic-ink.png",
    "cellar-lavender.png": "object_cellar-lavender__v001__comic-ink.png",
    "oak-and-bronze-book.png": "object_oak-and-bronze-book__v001__comic-ink.png",
    "withy-ring.png": "object_withy-ring__v001__comic-ink.png",
    "terns-copied-column.png": "object_terns-copied-column__v001__comic-ink.png",
    "fold-tally-page.png": "object_fold-tally-page__v001__comic-ink.png",
    "raiders-token.png": "object_raiders-token__v001__comic-ink.png",
}


def save(image: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest, format="PNG")
    print(dest.relative_to(ROOT), image.size, dest.stat().st_size)


def main() -> None:
    for name, source_name in ROOMS_MAP.items():
        save(cover(Image.open(SOURCE / source_name), (1600, 900)), ROOMS / name)
    for name, source_name in NPCS_MAP.items():
        save(fit_keyed(Image.open(SOURCE / source_name), (512, 768), bottom=True), NPCS / name)
    for name, source_name in OBJECTS_MAP.items():
        save(fit_keyed(Image.open(SOURCE / source_name), (512, 640), bottom=False), OBJECTS / name)


if __name__ == "__main__":
    main()
