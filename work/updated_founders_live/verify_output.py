from __future__ import annotations

import re
from pathlib import Path
from zipfile import ZipFile

import pdfplumber


SOURCE_DIR = Path("work/updated_founders_live/source")
DOCX_DIR = Path("work/updated_founders_live/docx")
PDF_DIR = Path("output/pdf/CMC - Surat Undangan Speaker Founders Live - November 2026")

DATES_BY_MODULE = {
    1: ("Selasa, 3 November 2026", "Selasa, 10 November 2026"),
    2: ("Kamis, 5 November 2026", "Kamis, 12 November 2026"),
    3: ("Selasa, 10 November 2026", "Selasa, 17 November 2026"),
    4: ("Kamis, 12 November 2026", "Kamis, 19 November 2026"),
    5: ("Selasa, 17 November 2026", "Selasa, 24 November 2026"),
    6: ("Kamis, 19 November 2026", "Kamis, 26 November 2026"),
    7: ("Selasa, 24 November 2026", "Selasa, 1 Desember 2026"),
    8: ("Kamis, 26 November 2026", "Kamis, 3 Desember 2026"),
}

COMMON_REPLACEMENTS = {
    "[Nama Penanda Tangan]": "Stanley Sebastian",
    "[Jabatan]": "Founder CEO Masterclass",
}


def module_number(name: str) -> int:
    match = re.search(r"Modul (\d+)", name)
    if not match:
        raise ValueError(f"Nomor modul tidak ditemukan: {name}")
    return int(match.group(1))


def verify_docx(source: Path, edited: Path) -> None:
    module = module_number(source.name)
    old_date, new_date = DATES_BY_MODULE[module]
    with ZipFile(source) as src, ZipFile(edited) as out:
        assert src.namelist() == out.namelist(), source.name
        for name in src.namelist():
            src_data = src.read(name)
            out_data = out.read(name)
            if name != "word/document.xml":
                assert src_data == out_data, f"Bagian lain berubah: {source.name} :: {name}"
                continue
            expected = src_data.decode("utf-8").replace(old_date, new_date)
            for old, new in COMMON_REPLACEMENTS.items():
                expected = expected.replace(old, new)
            assert out_data.decode("utf-8") == expected, f"Perubahan tak terduga: {source.name}"


def verify_pdf(pdf: Path) -> None:
    module = module_number(pdf.name)
    expected_date = DATES_BY_MODULE[module][1]
    with pdfplumber.open(pdf) as document:
        assert len(document.pages) == 2, f"Jumlah halaman bukan 2: {pdf.name}"
        text = "\n".join(page.extract_text() or "" for page in document.pages)
    for expected in (expected_date, "Stanley Sebastian", "Founder CEO Masterclass"):
        assert expected in text, f"Teks tidak ditemukan ({expected}): {pdf.name}"
    for placeholder in ("[Nama Penanda Tangan]", "[Jabatan]"):
        assert placeholder not in text, f"Placeholder masih ada ({placeholder}): {pdf.name}"
    print(f"OK | Modul {module} | {expected_date} | 2 halaman | {pdf.name}")


def main() -> None:
    source_files = sorted(SOURCE_DIR.glob("*.docx"))
    docx_files = sorted(DOCX_DIR.glob("*.docx"))
    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    assert len(source_files) == len(docx_files) == len(pdf_files) == 9
    for source in source_files:
        verify_docx(source, DOCX_DIR / source.name)
    for pdf in pdf_files:
        verify_pdf(pdf)


if __name__ == "__main__":
    main()
