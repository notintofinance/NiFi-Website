from pathlib import Path
import sys

from PIL import Image, ImageDraw


source = Path(sys.argv[1])
output = Path(sys.argv[2])
columns = int(sys.argv[3]) if len(sys.argv) > 3 else 4
files = sorted(source.glob("*.png"))
thumb_w = 260
label_h = 28
thumbs = []
for path in files:
    image = Image.open(path).convert("RGB")
    scale = thumb_w / image.width
    thumb = image.resize((thumb_w, round(image.height * scale)), Image.Resampling.LANCZOS)
    thumbs.append((path.name, thumb))

cell_h = max(im.height for _, im in thumbs) + label_h
rows = (len(thumbs) + columns - 1) // columns
sheet = Image.new("RGB", (columns * thumb_w, rows * cell_h), "white")
draw = ImageDraw.Draw(sheet)
for index, (name, thumb) in enumerate(thumbs):
    x = (index % columns) * thumb_w
    y = (index // columns) * cell_h
    sheet.paste(thumb, (x, y))
    draw.text((x + 8, y + thumb.height + 4), name, fill="black")

sheet.save(output, quality=92)
