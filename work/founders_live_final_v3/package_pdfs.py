from pathlib import Path
import zipfile

from pypdf import PdfReader, PdfWriter


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
WORK = ROOT / "work/founders_live_final_v3"
RENDERED_LETTERS = WORK / "rendered_letters"
TOR_PDF = WORK / "rendered_tor/CMC - ToR Founders Live 2026 - Umum.pdf"
FINAL_DIR = (
    ROOT
    / "output/pdf/CMC - Surat Undangan dan ToR Founders Live - Final Publikasi"
)
FINAL_ZIP = FINAL_DIR.with_suffix(".zip")


def merge_pdfs(invitation_pdf: Path, tor_pdf: Path, output_pdf: Path) -> None:
    writer = PdfWriter()
    writer.append(str(invitation_pdf))
    writer.append(str(tor_pdf))
    with output_pdf.open("wb") as stream:
        writer.write(stream)


def main() -> None:
    FINAL_DIR.mkdir(parents=True, exist_ok=True)
    invitation_pdfs = sorted(RENDERED_LETTERS.glob("*/*.pdf"))
    if len(invitation_pdfs) != 9:
        raise RuntimeError(f"Expected 9 rendered invitation PDFs, found {len(invitation_pdfs)}")
    if not TOR_PDF.exists():
        raise FileNotFoundError(TOR_PDF)

    outputs = []
    for invitation in invitation_pdfs:
        output = FINAL_DIR / invitation.name
        merge_pdfs(invitation, TOR_PDF, output)
        outputs.append(output)

    standalone_tor = FINAL_DIR / "CMC - ToR Founders Live 2026 - Umum.pdf"
    standalone_tor.write_bytes(TOR_PDF.read_bytes())
    outputs.append(standalone_tor)

    with zipfile.ZipFile(FINAL_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for output in sorted(outputs):
            archive.write(output, arcname=output.name)

    print(f"Created {len(outputs)} PDF files in {FINAL_DIR}")
    print(f"Created ZIP: {FINAL_ZIP}")


if __name__ == "__main__":
    main()
