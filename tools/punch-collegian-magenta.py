"""Remove the hot-pink chroma key from every Collegian PNG."""

from __future__ import annotations

from pathlib import Path

import time

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "apps" / "web" / "public" / "art" / "characters"


def punch(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    raw = bytearray(rgba.tobytes())
    changed = False
    for index in range(0, len(raw), 4):
        red = raw[index]
        green = raw[index + 1]
        blue = raw[index + 2]
        alpha = raw[index + 3]
        if (
            alpha >= 8
            and green <= 55
            and (red - 219) ** 2 + (green - 4) ** 2 + (blue - 96) ** 2 <= 70**2
        ):
            raw[index + 3] = 0
            changed = True
    if not changed:
        return rgba
    return Image.frombytes("RGBA", rgba.size, bytes(raw))


def main() -> None:
    paths = sorted(ART.rglob("*.png"))
    changed = 0
    for path in paths:
        image = Image.open(path)
        punched = punch(image)
        if punched.tobytes() != image.convert("RGBA").tobytes():
            tmp = path.with_name(path.stem + ".punched.png")
            punched.save(tmp, format="PNG")
            for attempt in range(6):
                try:
                    tmp.replace(path)
                    break
                except OSError:
                    if attempt == 5:
                        raise
                    time.sleep(0.25 * (attempt + 1))
            changed += 1
            print(path.relative_to(ART), flush=True)
    print(f"punched {changed} of {len(paths)} files", flush=True)


if __name__ == "__main__":
    main()
