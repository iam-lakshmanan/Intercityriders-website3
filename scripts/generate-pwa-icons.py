from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "images" / "car-logo3-transparent.png"
OUTPUT = ROOT / "public" / "icons"
BACKGROUND = (32, 15, 7, 255)


def render(name: str, size: int, coverage: float) -> None:
    logo = Image.open(SOURCE).convert("RGBA")
    logo.thumbnail((int(size * coverage), int(size * coverage)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), BACKGROUND)
    position = ((size - logo.width) // 2, (size - logo.height) // 2)
    canvas.alpha_composite(logo, position)
    canvas.convert("RGB").save(OUTPUT / name, "PNG", optimize=True)


OUTPUT.mkdir(parents=True, exist_ok=True)
render("icon-192.png", 192, 0.90)
render("icon-512.png", 512, 0.90)
render("maskable-512.png", 512, 0.72)
render("apple-touch-icon.png", 180, 0.84)
render("favicon-32.png", 32, 0.88)
