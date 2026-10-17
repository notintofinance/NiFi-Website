from hashlib import sha256
from pathlib import Path
import zipfile

from pypdf import PdfReader


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
DOCX_DIR = ROOT / "output/docx/Undangan Narasumber CEO Masterclass - Revisi Final"
DOCX_ZIP = ROOT / "output/docx/Undangan Narasumber CEO Masterclass - Revisi Final DOCX.zip"
PDF_DIR = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi TTD Final"
PDF_ZIP = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi TTD Final.zip"
RENDERED = ROOT / "work/founders_live_final_v7/rendered"
SIGNATURE = Path(
    "/var/folders/12/kf33qfk559sgsvh7429ht9bc0000gn/T/"
    "codex-clipboard-62c74574-3a0f-47b3-8786-390f0b93a477.png"
)


def validate_zip(path: Path, suffix: str) -> list[str]:
    with zipfile.ZipFile(path) as archive:
        bad = archive.testzip()
        assert bad is None, f"Corrupt ZIP member: {bad}"
        names = archive.namelist()
    assert len(names) == 10, (path, len(names))
    assert all(name.endswith(suffix) for name in names), names
    return names


def validate_docx() -> None:
    files = sorted(DOCX_DIR.glob("*.docx"))
    invitations = [file for file in files if file.name.startswith("Undangan")]
    assert len(files) == 10 and len(invitations) == 9
    assert (DOCX_DIR / "Undangan Narasumber CEO Masterclass Bapak Otto Toto Sugiri.docx").exists()
    assert not (DOCX_DIR / "Undangan Narasumber CEO Masterclass Pimpinan DCI Indonesia.docx").exists()

    signature_hash = sha256(SIGNATURE.read_bytes()).hexdigest()
    for path in invitations:
        with zipfile.ZipFile(path) as archive:
            xml = archive.read("word/document.xml").decode("utf-8")
            media_hashes = {
                sha256(archive.read(name)).hexdigest()
                for name in archive.namelist()
                if name.startswith("word/media/")
            }
        assert "Stanley Sebastian Tjandra" in xml, path.name
        assert "w:highlight" not in xml, path.name
        assert signature_hash in media_hashes, f"Signature not embedded: {path.name}"

    otto = DOCX_DIR / "Undangan Narasumber CEO Masterclass Bapak Otto Toto Sugiri.docx"
    with zipfile.ZipFile(otto) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")
    assert "Bapak Otto Toto Sugiri" in xml
    assert "Founder dan CEO DCI Indonesia" in xml
    assert "Pimpinan PT DCI Indonesia Tbk" not in xml
    assert "u.p. [nama penerima]" not in xml


def validate_pdf() -> None:
    files = sorted(PDF_DIR.glob("*.pdf"))
    invitations = [file for file in files if file.name.startswith("Undangan")]
    assert len(files) == 10 and len(invitations) == 9
    for path in files:
        reader = PdfReader(path)
        expected_pages = 2 if path.name.startswith("ToR ") else 4
        assert len(reader.pages) == expected_pages, (path.name, len(reader.pages))
        if expected_pages == 4:
            first_page = reader.pages[0].extract_text() or ""
            assert "Stanley Sebastian Tjandra" in first_page, path.name
            second_page = reader.pages[1].extract_text() or ""
            fourth_page = reader.pages[3].extract_text() or ""
            assert "KERANGKA ACUAN KEGIATAN" in second_page, path.name
            assert "LAMPIRAN 1" in fourth_page, path.name

    for folder in RENDERED.iterdir():
        if not folder.is_dir():
            continue
        expected_pages = 2 if folder.name.startswith("ToR ") else 4
        assert len(list(folder.glob("page-*.png"))) == expected_pages, folder.name


def main() -> None:
    docx_names = validate_zip(DOCX_ZIP, ".docx")
    pdf_names = validate_zip(PDF_ZIP, ".pdf")
    assert {Path(name).stem for name in docx_names} == {Path(name).stem for name in pdf_names}
    validate_docx()
    validate_pdf()
    print("PASS: 10 DOCX + 10 PDF validated; ZIPs intact; all invitation PDFs are 4 pages.")


if __name__ == "__main__":
    main()
