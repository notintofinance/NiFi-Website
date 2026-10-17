from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
RENDERED = ROOT / "work/founders_live_final_v7/rendered"
OUTPUT = ROOT / "work/founders_live_final_v7/contact_sheets"


def label_for(folder: Path) -> str:
    return folder.name.replace("Undangan Narasumber CEO Masterclass ", "")


def make_sheet(items: list[tuple[str, Path]], output_name: str, columns: int = 3) -> None:
    thumb_w, thumb_h = 424, 600
    label_h = 34
    gutter = 14
    rows = (len(items) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        (
            columns * thumb_w + (columns + 1) * gutter,
            rows * (thumb_h + label_h) + (rows + 1) * gutter,
        ),
        "#d8dde2",
    )
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=18)

    for index, (label, image_path) in enumerate(items):
        row, column = divmod(index, columns)
        x = gutter + column * (thumb_w + gutter)
        y = gutter + row * (thumb_h + label_h + gutter)
        image = Image.open(image_path).convert("RGB")
        image.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        paste_x = x + (thumb_w - image.width) // 2
        paste_y = y + label_h + (thumb_h - image.height) // 2
        draw.rectangle((x, y + label_h, x + thumb_w, y + label_h + thumb_h), fill="white")
        sheet.paste(image, (paste_x, paste_y))
        draw.text((x + 4, y + 5), label, fill="#111111", font=font)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    sheet.save(OUTPUT / output_name, quality=94)


def main() -> None:
    invitation_folders = sorted(
        folder for folder in RENDERED.iterdir() if folder.is_dir() and folder.name.startswith("Undangan")
    )
    for page in range(1, 5):
        make_sheet(
            [(label_for(folder), folder / f"page-{page}.png") for folder in invitation_folders],
            f"all-invitations-page-{page}.jpg",
        )

    tor_folder = RENDERED / "ToR Narasumber CEO Masterclass 2026"
    make_sheet(
        [(f"ToR page {page}", tor_folder / f"page-{page}.png") for page in range(1, 3)],
        "standalone-tor.jpg",
        columns=2,
    )


if __name__ == "__main__":
    main()
