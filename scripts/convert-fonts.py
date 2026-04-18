"""Convert .ttf/.otf fonts to .woff2 (compressed with brotli)."""
from fontTools.ttLib import TTFont
from pathlib import Path
import sys

SRC_DIR = Path(__file__).parent.parent / "public" / "fonts" / "downloaded"

FONTS = [
    "CeraPro-Light.ttf",
    "CeraPro-Regular.ttf",
    "CeraPRO-Medium.ttf",
    "Cera Pro Bold.ttf",
]

def convert(path: Path) -> Path:
    font = TTFont(path)
    font.flavor = "woff2"
    out = path.with_suffix(".woff2")
    font.save(out)
    return out

if __name__ == "__main__":
    total_before = 0
    total_after = 0
    for name in FONTS:
        src = SRC_DIR / name
        if not src.exists():
            print(f"MISSING: {src}")
            continue
        out = convert(src)
        before = src.stat().st_size
        after = out.stat().st_size
        total_before += before
        total_after += after
        print(f"{name}: {before//1024}kb -> {out.name} {after//1024}kb ({100 - int(100*after/before)}% smaller)")
    print(f"\nTOTAL: {total_before//1024}kb -> {total_after//1024}kb")
