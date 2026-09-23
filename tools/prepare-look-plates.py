"""Fit the comic-ink Collegian looks and punch one chroma key: #EE3173.

Reads art/sources. Does not edit tools/prepare-east-watch-plates.py or its file lists.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "art" / "sources"
LOOKS = ROOT / "apps" / "web" / "public" / "art" / "characters" / "looks"
SIZE = (512, 768)

SPECIES = (
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
)
GENDERS = ("female", "male")
CLOTHING = ("fern", "indigo", "russet")
MASTERS = {
    ("mouse", "female", "fern"): "character_mouse-female-fern_look__v007__comic-ink.png",
    ("hare", "female", "fern"): "character_hare-female-fern_look__v005__comic-ink.png",
}


def east_watch():
    path = ROOT / "tools" / "prepare-east-watch-plates.py"
    spec = importlib.util.spec_from_file_location("east_watch_plates", path)
    if spec is None or spec.loader is None:
        raise SystemExit("missing prepare-east-watch-plates.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def source_name(species: str, gender: str, look: str) -> str:
    return MASTERS.get(
        (species, gender, look),
        f"character_{species}-{gender}-{look}_look__v001__comic-ink.png",
    )


def main() -> None:
    module = east_watch()
    plates = [
        (species, gender, look, source_name(species, gender, look))
        for species in SPECIES
        for gender in GENDERS
        for look in CLOTHING
    ]
    if len(plates) != 66:
        raise SystemExit(f"expected 66 looks, got {len(plates)}")
    for species, gender, look, name in plates:
        source = SOURCES / name
        if not source.exists():
            raise SystemExit(f"missing {source}")
        fitted = module.fit_keyed(Image.open(source), SIZE, True)
        if fitted.size != SIZE or fitted.mode != "RGBA":
            raise SystemExit(f"{name} fitted to {fitted.mode} {fitted.size}")
        dest = LOOKS / f"{species}-{gender}-{look}.png"
        fitted.save(dest, format="PNG")
        print(dest.relative_to(ROOT), fitted.mode, fitted.size, dest.stat().st_size)


if __name__ == "__main__":
    main()
