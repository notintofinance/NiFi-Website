from __future__ import annotations

from pathlib import Path
import shutil
import zipfile

from pypdf import PdfReader, PdfWriter


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
WORK = ROOT / "work/founders_live_final_v5"
LETTER_PDF_ROOT = WORK / "rendered_letters"
TOR_PDF = WORK / "rendered_tor/ToR Narasumber CEO Masterclass 2026.pdf"

OUTPUT_DIR = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi Final"
OUTPUT_ZIP = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi Final.zip"


def append_pages(writer: PdfWriter, reader: PdfReader, page_numbers: list[int]) -> None:
    for page_number in page_numbers:
        writer.add_page(reader.pages[page_number])


def build_combined_pdf(letter_pdf: Path, output_pdf: Path) -> None:
    letter = PdfReader(letter_pdf)
    tor = PdfReader(TOR_PDF)

    if len(letter.pages) != 2:
        raise RuntimeError(f"Expected 2 pages in {letter_pdf.name}, found {len(letter.pages)}")
    if len(tor.pages) != 2:
        raise RuntimeError(f"Expected 2 pages in {TOR_PDF.name}, found {len(tor.pages)}")

    writer = PdfWriter()
    append_pages(writer, letter, [0])
    append_pages(writer, tor, [0, 1])
    append_pages(writer, letter, [1])

    with output_pdf.open("wb") as stream:
        writer.write(stream)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for old_pdf in OUTPUT_DIR.glob("*.pdf"):
        old_pdf.unlink()
    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()

    letter_pdfs = sorted(LETTER_PDF_ROOT.glob("*/Undangan Narasumber CEO Masterclass *.pdf"))
    if len(letter_pdfs) != 9:
        raise RuntimeError(f"Expected 9 letter PDFs, found {len(letter_pdfs)}")

    output_pdfs: list[Path] = []
    for letter_pdf in letter_pdfs:
        output_pdf = OUTPUT_DIR / letter_pdf.name
        build_combined_pdf(letter_pdf, output_pdf)
        output_pdfs.append(output_pdf)

    standalone_tor = OUTPUT_DIR / TOR_PDF.name
    shutil.copy2(TOR_PDF, standalone_tor)
    output_pdfs.append(standalone_tor)

    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for pdf in sorted(output_pdfs):
            archive.write(pdf, arcname=pdf.name)

    print(f"Created {len(output_pdfs)} PDFs in {OUTPUT_DIR}")
    print(f"Created ZIP: {OUTPUT_ZIP}")


if __name__ == "__main__":
    main()
