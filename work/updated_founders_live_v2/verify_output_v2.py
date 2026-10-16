from __future__ import annotations

from pathlib import Path

import pdfplumber


PDF_DIR = Path(
    "output/pdf/CMC - Surat Undangan Speaker Founders Live - Final 17 November 2026"
)

EXPECTED = [
    (
        "CMC - Undangan Narasumber Founders Live - Modul 1 - Richard Theodore (Sambal Bakar).pdf",
        "CMC/035/UND/X/2026",
        "Selasa, 17 November 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 2 - Yukka Harlanda (Brodo).pdf",
        "CMC/036/UND/X/2026",
        "Kamis, 19 November 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 3 - Merry Riana (opsi 1).pdf",
        "CMC/037/UND/X/2026",
        "Selasa, 24 November 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 3 - dr. Richard Lee (opsi 2).pdf",
        "CMC/038/UND/X/2026",
        "Selasa, 24 November 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 4 - Ryan Maurice Tallulah (Bardi).pdf",
        "CMC/039/UND/X/2026",
        "Kamis, 26 November 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 5 - CEO Office Sinar Mas.pdf",
        "CMC/040/UND/X/2026",
        "Selasa, 1 Desember 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 6 - CEO Office DCI Indonesia.pdf",
        "CMC/041/UND/X/2026",
        "Kamis, 3 Desember 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 7 - CEO Office Saratoga.pdf",
        "CMC/042/UND/X/2026",
        "Selasa, 8 Desember 2026",
    ),
    (
        "CMC - Undangan Narasumber Founders Live - Modul 8 - CEO Office Pandu Sjahrir.pdf",
        "CMC/043/UND/X/2026",
        "Kamis, 10 Desember 2026",
    ),
]

REQUIRED_COMMON = [
    "Jakarta, 16 Oktober 2026",
    "Mario",
    "+6285178906100",
    "ceomasterclassoffical@gmail.com",
    "Stanley Sebastian",
    "Founder CEO Masterclass",
]

FORBIDDEN = [
    "[tanggal]",
    "[Nomor surat]",
    "[tanggal konfirmasi]",
    "[Nama PIC]",
    "[nomor WhatsApp]",
    "[email]",
    "[Nama Penanda Tangan]",
    "[Jabatan]",
    "Kami mengharapkan konfirmasi kesediaan",
    "Kami mengharapkan nama dan kontak perwakilan",
]


def main() -> None:
    actual_files = sorted(PDF_DIR.glob("*.pdf"))
    assert len(actual_files) == 9, f"Diharapkan 9 PDF, ditemukan {len(actual_files)}"

    for filename, number, event_date in EXPECTED:
        path = PDF_DIR / filename
        assert path.exists(), f"PDF tidak ditemukan: {filename}"
        with pdfplumber.open(path) as document:
            assert len(document.pages) == 2, f"Jumlah halaman bukan 2: {filename}"
            text = "\n".join(page.extract_text() or "" for page in document.pages)

        for expected in [number, event_date, *REQUIRED_COMMON]:
            assert expected in text, f"Teks tidak ditemukan ({expected}): {filename}"
        for forbidden in FORBIDDEN:
            assert forbidden not in text, f"Teks seharusnya tidak ada ({forbidden}): {filename}"

        print(f"OK | {number} | {event_date} | 2 halaman | {filename}")


if __name__ == "__main__":
    main()
