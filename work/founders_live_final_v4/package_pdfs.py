from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from pypdf import PdfReader, PdfWriter


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
LETTERS_ROOT = ROOT / "work/founders_live_final_v3/rendered_letters"
TOR_PDF = (
    ROOT
    / "work/founders_live_final_v4/rendered_tor"
    / "CMC - ToR Founders Live 2026 - Umum.pdf"
)
OUTPUT_DIR = (
    ROOT
    / "output/pdf"
    / "CMC - Surat Undangan dan ToR Founders Live - Urutan Final"
)
ZIP_PATH = OUTPUT_DIR.with_suffix(".zip")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for old_pdf in OUTPUT_DIR.glob("*.pdf"):
        old_pdf.unlink()

    tor_reader = PdfReader(TOR_PDF)
    letter_paths = sorted(LETTERS_ROOT.glob("*/*.pdf"))
    if len(letter_paths) != 9:
        raise RuntimeError(f"Expected 9 invitation PDFs, found {len(letter_paths)}")

    for letter_path in letter_paths:
        letter_reader = PdfReader(letter_path)
        if len(letter_reader.pages) < 2:
            raise RuntimeError(f"Invitation must contain an attachment: {letter_path}")

        writer = PdfWriter()
        writer.add_page(letter_reader.pages[0])
        # The standalone ToR has its own general appendix on the final page.
        # In invitation packages, use the invitation's personalized appendix
        # instead so the sequence is exactly: invitation, ToR, appendix.
        for page in tor_reader.pages[:-1]:
            writer.add_page(page)
        for page in letter_reader.pages[1:]:
            writer.add_page(page)

        output_path = OUTPUT_DIR / letter_path.name
        with output_path.open("wb") as output_file:
            writer.write(output_file)

    copy2(TOR_PDF, OUTPUT_DIR / TOR_PDF.name)

    with ZipFile(ZIP_PATH, "w", compression=ZIP_DEFLATED) as archive:
        for pdf_path in sorted(OUTPUT_DIR.glob("*.pdf")):
            archive.write(pdf_path, arcname=pdf_path.name)

    print(f"Created {len(list(OUTPUT_DIR.glob('*.pdf')))} PDFs")
    print(ZIP_PATH)


if __name__ == "__main__":
    main()
