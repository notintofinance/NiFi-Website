from pathlib import Path
import shutil
import zipfile


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
RENDERED = ROOT / "work/founders_live_final_v7/rendered"
OUTPUT_DIR = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi TTD Final"
OUTPUT_ZIP = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi TTD Final.zip"


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for old_pdf in OUTPUT_DIR.glob("*.pdf"):
        old_pdf.unlink()
    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()

    source_pdfs = sorted(RENDERED.glob("*/*.pdf"))
    if len(source_pdfs) != 10:
        raise RuntimeError(f"Expected 10 rendered PDFs, found {len(source_pdfs)}")

    output_pdfs = []
    for source in source_pdfs:
        target = OUTPUT_DIR / source.name
        shutil.copy2(source, target)
        output_pdfs.append(target)

    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for pdf in sorted(output_pdfs):
            archive.write(pdf, arcname=pdf.name)

    print(f"Created {len(output_pdfs)} PDFs in {OUTPUT_DIR}")
    print(f"Created ZIP: {OUTPUT_ZIP}")


if __name__ == "__main__":
    main()
