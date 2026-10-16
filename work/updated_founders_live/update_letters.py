from __future__ import annotations

import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


SOURCE_DIR = Path("work/updated_founders_live/source")
OUTPUT_DIR = Path("work/updated_founders_live/docx")

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


def clone_info(info: ZipInfo) -> ZipInfo:
    cloned = ZipInfo(info.filename, info.date_time)
    cloned.compress_type = info.compress_type
    cloned.comment = info.comment
    cloned.extra = info.extra
    cloned.create_system = info.create_system
    cloned.create_version = info.create_version
    cloned.extract_version = info.extract_version
    cloned.flag_bits = info.flag_bits
    cloned.volume = info.volume
    cloned.internal_attr = info.internal_attr
    cloned.external_attr = info.external_attr
    return cloned


def update_docx(source: Path, destination: Path) -> None:
    match = re.search(r"Modul (\d+)", source.name)
    if not match:
        raise ValueError(f"Nomor modul tidak ditemukan: {source.name}")
    module = int(match.group(1))
    old_date, new_date = DATES_BY_MODULE[module]

    expected = {
        old_date: 1,
        "[Nama Penanda Tangan]": 1,
        "[Jabatan]": 1,
    }
    observed = {key: 0 for key in expected}

    with ZipFile(source, "r") as src, ZipFile(destination, "w", ZIP_DEFLATED) as dst:
        for info in src.infolist():
            data = src.read(info.filename)
            if info.filename == "word/document.xml":
                text = data.decode("utf-8")
                replacements = {old_date: new_date, **COMMON_REPLACEMENTS}
                for old, new in replacements.items():
                    observed[old] = text.count(old)
                    text = text.replace(old, new)
                data = text.encode("utf-8")
            dst.writestr(clone_info(info), data)

    if observed != expected:
        destination.unlink(missing_ok=True)
        raise ValueError(
            f"Jumlah teks sumber tidak sesuai untuk {source.name}: "
            f"ditemukan {observed}, diharapkan {expected}"
        )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = sorted(SOURCE_DIR.glob("*.docx"))
    if len(sources) != 9:
        raise ValueError(f"Diharapkan 9 DOCX, ditemukan {len(sources)}")
    for source in sources:
        destination = OUTPUT_DIR / source.name
        update_docx(source, destination)
        print(destination)


if __name__ == "__main__":
    main()
