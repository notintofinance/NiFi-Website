from __future__ import annotations

from hashlib import sha256
from pathlib import Path
import zipfile

from docx import Document
from pypdf import PdfReader


ROOT = Path("/Users/agatbe/Claude Project/Claude Vibecode (NiFi)")
WORK = ROOT / "work/founders_live_final_v5"
DOCX_DIR = WORK / "letters_docx"
OUTPUT_DIR = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi Final"
OUTPUT_ZIP = ROOT / "output/pdf/Undangan Narasumber CEO Masterclass - Revisi Final.zip"
TOR_NAME = "ToR Narasumber CEO Masterclass 2026.pdf"


def pdf_text(reader: PdfReader, page_number: int) -> str:
    return reader.pages[page_number].extract_text() or ""


def validate_pdfs() -> None:
    pdfs = sorted(OUTPUT_DIR.glob("*.pdf"))
    assert len(pdfs) == 10, f"Expected 10 PDFs, found {len(pdfs)}"

    tor = PdfReader(OUTPUT_DIR / TOR_NAME)
    assert len(tor.pages) == 2
    tor_text = "\n".join(pdf_text(tor, index) for index in range(2))
    assert "koordinasi dilakukan melalui chat WhatsApp" in tor_text
    assert "Official CEO Masterclass" in tor_text
    assert "Mario" not in tor_text
    assert "gmail" not in tor_text.lower()

    for pdf in pdfs:
        if pdf.name == TOR_NAME:
            continue

        reader = PdfReader(pdf)
        assert len(reader.pages) == 4, f"{pdf.name}: expected 4 pages"
        page_1 = pdf_text(reader, 0)
        page_2 = pdf_text(reader, 1)
        page_3 = pdf_text(reader, 2)
        page_4 = pdf_text(reader, 3)
        all_text = "\n".join((page_1, page_2, page_3, page_4))

        assert "Nomor" in page_1 and "Stanley Sebastian" in page_1
        assert "Official CEO Masterclass" in page_1
        assert "KERANGKA ACUAN KEGIATAN" in page_2
        assert "Jadwal dan poin bahasan" in page_3
        assert "LAMPIRAN 1" in page_4 and "Profil CEO Masterclass" in page_4
        assert "Mario" not in all_text
        assert "Bapak/Ibu" not in all_text
        assert "Konfirmasi kehadiran" not in all_text


def validate_docx_signature_and_highlights() -> None:
    signature_hash = sha256((WORK / "assets/ttd-stanley-sebastian.png").read_bytes()).digest()
    tor_docx = Document(WORK / "tor_docx/ToR Narasumber CEO Masterclass 2026.docx")
    tor_docx_text = "\n".join(paragraph.text for paragraph in tor_docx.paragraphs)
    assert "Briefing dan koordinasi dilakukan melalui chat WhatsApp" in tor_docx_text
    assert "+6285178906100" in tor_docx_text

    docx_files = sorted(DOCX_DIR.glob("*.docx"))
    assert len(docx_files) == 9

    for docx in docx_files:
        with zipfile.ZipFile(docx) as archive:
            names = archive.namelist()
            document_xml = archive.read("word/document.xml")
            assert b"w:highlight" not in document_xml, f"Highlight remains in {docx.name}"
            for name in names:
                if name.startswith("word/media/"):
                    media_hash = sha256(archive.read(name)).digest()
                    assert media_hash != signature_hash, f"Signature image found in {docx.name}"


def validate_zip() -> None:
    with zipfile.ZipFile(OUTPUT_ZIP) as archive:
        names = sorted(archive.namelist())
        assert len(names) == 10
        assert all(name.endswith(".pdf") for name in names)


def main() -> None:
    validate_pdfs()
    validate_docx_signature_and_highlights()
    validate_zip()
    print("QA passed: 9 combined PDFs + 1 standalone ToR; order, text, blank signature, and ZIP verified.")


if __name__ == "__main__":
    main()
