"""Fit the east-moor and south-river plates. One chroma key: #EE3173.

Does not edit tools/prepare-east-watch-plates.py or its file lists.
"""

from __future__ import annotations

import importlib.util
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(r"C:\Users\Papa\.cursor\projects\c-Users-Papa-Desktop-greenwood\assets")
SOURCES = ROOT / "art" / "sources"
ROOMS = ROOT / "apps" / "web" / "public" / "art" / "rooms"
NPCS = ROOT / "apps" / "web" / "public" / "art" / "characters" / "npcs"
OBJECTS = ROOT / "apps" / "web" / "public" / "art" / "objects"

# (source filename in the generator folder, live id, kind)
PLATES: list[tuple[str, str, str]] = [
    ("room_wool-shed__v001__comic-ink.png", "wool-shed", "room"),
    ("room_croft-byre__v001__comic-ink.png", "croft-byre", "room"),
    ("room_mist-lane__v001__comic-ink.png", "mist-lane", "room"),
    ("room_reed-mere__v001__comic-ink.png", "reed-mere", "room"),
    ("room_lintel-field__v001__comic-ink.png", "lintel-field", "room"),
    ("room_salt-grass__v001__comic-ink.png", "salt-grass", "room"),
    ("room_black-ditch__v001__comic-ink.png", "black-ditch", "room"),
    ("room_crow-stile__v001__comic-ink.png", "crow-stile", "room"),
    ("room_willow-bend__v001__comic-ink.png", "willow-bend", "room"),
    ("room_osier-holt__v001__comic-ink.png", "osier-holt", "room"),
    ("room_reed-bank__v001__comic-ink.png", "reed-bank", "room"),
    ("room_otter-slip__v001__comic-ink.png", "otter-slip", "room"),
    ("room_flood-store__v001__comic-ink.png", "flood-store", "room"),
    ("room_skiff-line__v001__comic-ink.png", "skiff-line", "room"),
    ("room_mill-race__v001__comic-ink.png", "mill-race", "room"),
    ("room_rope-island__v001__comic-ink.png", "rope-island", "room"),
    ("room_heron-post__v001__comic-ink.png", "heron-post", "room"),
    ("room_pirate-camp__v001__comic-ink.png", "pirate-camp", "room"),
    ("room_cargo-hollow__v001__comic-ink.png", "cargo-hollow", "room"),
    ("room_black-mooring__v001__comic-ink.png", "black-mooring", "room"),
    ("character_npc-foldhand-hobb__v003__comic-ink.png", "npc-foldhand-hobb", "npc"),
    ("character_npc-reedcutter-sile__v001__comic-ink.png", "npc-reedcutter-sile", "npc"),
    ("character_npc-stoneward-kern__v001__comic-ink.png", "npc-stoneward-kern", "npc"),
    ("character_npc-skipper-marram__v001__comic-ink.png", "npc-skipper-marram", "npc"),
    ("character_npc-deckhand-nett__v001__comic-ink.png", "npc-deckhand-nett", "npc"),
    ("character_npc-heron-midge__v001__comic-ink.png", "npc-heron-midge", "npc"),
    ("character_fold-hound__v003__comic-ink.png", "fold-hound", "npc"),
    ("character_reed-wisp__v001__comic-ink.png", "reed-wisp", "npc"),
    ("character_ditch-lurker__v002__comic-ink.png", "ditch-lurker", "npc"),
    ("character_deck-hand__v001__comic-ink.png", "deck-hand", "npc"),
    ("character_rope-sentry__v001__comic-ink.png", "rope-sentry", "npc"),
    ("character_river-captain__v001__comic-ink.png", "river-captain", "npc"),
    ("character_race-pike__v001__comic-ink.png", "race-pike", "npc"),
    ("object_object-wool-pegs__v001__comic-ink.png", "object-wool-pegs", "object"),
    ("object_object-empty-stall__v001__comic-ink.png", "object-empty-stall", "object"),
    ("object_object-lane-mist__v001__comic-ink.png", "object-lane-mist", "object"),
    ("object_object-still-water__v001__comic-ink.png", "object-still-water", "object"),
    ("object_object-scratch-stone__v001__comic-ink.png", "object-scratch-stone", "object"),
    ("object_object-pale-grass__v001__comic-ink.png", "object-pale-grass", "object"),
    ("object_object-black-water__v001__comic-ink.png", "object-black-water", "object"),
    ("object_object-stile-stone__v001__comic-ink.png", "object-stile-stone", "object"),
    ("object_object-cut-painter__v001__comic-ink.png", "object-cut-painter", "object"),
    ("object_object-withy-bundles__v001__comic-ink.png", "object-withy-bundles", "object"),
    ("object_object-reed-bundles__v001__comic-ink.png", "object-reed-bundles", "object"),
    ("object_object-empty-ring__v001__comic-ink.png", "object-empty-ring", "object"),
    ("object_object-biscuit-shelf__v001__comic-ink.png", "object-biscuit-shelf", "object"),
    ("object_object-thief-knot__v001__comic-ink.png", "object-thief-knot", "object"),
    ("object_object-still-wheel__v001__comic-ink.png", "object-still-wheel", "object"),
    ("object_object-rope-coil__v001__comic-ink.png", "object-rope-coil", "object"),
    ("object_object-whistle-post__v001__comic-ink.png", "object-whistle-post", "object"),
    ("object_object-turnip-tins__v001__comic-ink.png", "object-turnip-tins", "object"),
    ("object_object-biscuit-crate__v001__comic-ink.png", "object-biscuit-crate", "object"),
    ("object_object-tarred-post__v001__comic-ink.png", "object-tarred-post", "object"),
    ("object_porters-cord__v001__comic-ink.png", "porters-cord", "object"),
    ("object_hearth-biscuit__v001__comic-ink.png", "hearth-biscuit", "object"),
    ("object_ink-rag__v001__comic-ink.png", "ink-rag", "object"),
    ("object_fold-mitts__v001__comic-ink.png", "fold-mitts", "object"),
    ("object_reed-cloak__v001__comic-ink.png", "reed-cloak", "object"),
    ("object_lintel-band__v001__comic-ink.png", "lintel-band", "object"),
    ("object_river-boots__v001__comic-ink.png", "river-boots", "object"),
    ("object_biscuit-tin__v001__comic-ink.png", "biscuit-tin", "object"),
    ("object_skipper-whistle__v001__comic-ink.png", "skipper-whistle", "object"),
    ("object_boarding-oar__v001__comic-ink.png", "boarding-oar", "object"),
    ("object_fold-bell__v001__comic-ink.png", "fold-bell", "object"),
    ("object_wisp-glass__v001__comic-ink.png", "wisp-glass", "object"),
    ("object_ditch-nail__v001__comic-ink.png", "ditch-nail", "object"),
    ("object_deck-token__v002__comic-ink.png", "deck-token", "object"),
    ("object_cut-rope__v001__comic-ink.png", "cut-rope", "object"),
    ("object_captain-coat__v001__comic-ink.png", "captain-coat", "object"),
    ("object_river-stone__v001__comic-ink.png", "river-stone", "object"),
    ("object_crow-pin__v001__comic-ink.png", "crow-pin", "object"),
    ("object_peat-nail__v001__comic-ink.png", "peat-nail", "object"),
    ("object_cut-iron__v001__comic-ink.png", "cut-iron", "object"),
]

ROOM_IDS = [live for _source, live, kind in PLATES if kind == "room"]


def east_watch():
    path = ROOT / "tools" / "prepare-east-watch-plates.py"
    spec = importlib.util.spec_from_file_location("east_watch_plates", path)
    if spec is None or spec.loader is None:
        raise SystemExit("missing prepare-east-watch-plates.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def strip_borrowed_visual_state() -> None:
    for room_id in ROOM_IDS:
        path = ROOT / "packages" / "content" / "rooms" / f"{room_id}.json"
        text = path.read_text(encoding="utf-8")
        needle = None
        for line in text.splitlines(keepends=True):
            if line.strip().startswith('"visualState"'):
                needle = line
                break
        if needle is None:
            raise SystemExit(f"{room_id} has no visualState")
        path.write_text(text.replace(needle, "", 1), encoding="utf-8")


def main() -> None:
    module = east_watch()
    SOURCES.mkdir(parents=True, exist_ok=True)
    if len(PLATES) != 73:
        raise SystemExit(f"expected 73 plates, got {len(PLATES)}")
    for source_name, live, kind in PLATES:
        source = ASSETS / source_name
        if not source.exists():
            raise SystemExit(f"missing {source}")
        kept = SOURCES / source_name
        if not kept.exists():
            shutil.copyfile(source, kept)
        image = Image.open(kept)
        if kind == "room":
            fitted = module.cover(image, (1600, 900))
            dest = ROOMS / f"{live}.png"
        elif kind == "npc":
            fitted = module.fit_keyed(image, (512, 768), True)
            dest = NPCS / f"{live}.png"
        else:
            fitted = module.fit_keyed(image, (512, 640), False)
            dest = OBJECTS / f"{live}.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        fitted.save(dest, format="PNG")
        print(dest.relative_to(ROOT), fitted.mode, fitted.size)
    strip_borrowed_visual_state()


if __name__ == "__main__":
    main()
