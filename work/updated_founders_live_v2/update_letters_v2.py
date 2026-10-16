from __future__ import annotations

import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from lxml import etree


SOURCE_DIR = Path("work/updated_founders_live/source")
OUTPUT_DIR = Path("work/updated_founders_live_v2/docx")

WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": WORD_NS}

DATES_BY_MODULE = {
    1: ("Selasa, 3 November 2026", "Selasa, 17 November 2026"),
    2: ("Kamis, 5 November 2026", "Kamis, 19 November 2026"),
    3: ("Selasa, 10 November 2026", "Selasa, 24 November 2026"),
    4: ("Kamis, 12 November 2026", "Kamis, 26 November 2026"),
    5: ("Selasa, 17 November 2026", "Selasa, 1 Desember 2026"),
    6: ("Kamis, 19 November 2026", "Kamis, 3 Desember 2026"),
    7: ("Selasa, 24 November 2026", "Selasa, 8 Desember 2026"),
    8: ("Kamis, 26 November 2026", "Kamis, 10 Desember 2026"),
}

ORDERED_FILENAMES = [
    "CMC - Undangan Narasumber Founders Live - Modul 1 - Richard Theodore (Sambal Bakar).docx",
    "CMC - Undangan Narasumber Founders Live - Modul 2 - Yukka Harlanda (Brodo).docx",
    "CMC - Undangan Narasumber Founders Live - Modul 3 - Merry Riana (opsi 1).docx",
    "CMC - Undangan Narasumber Founders Live - Modul 3 - dr. Richard Lee (opsi 2).docx",
    "CMC - Undangan Narasumber Founders Live - Modul 4 - Ryan Maurice Tallulah (Bardi).docx",
    "CMC - Undangan Narasumber Founders Live - Modul 5 - CEO Office Sinar Mas.docx",
    "CMC - Undangan Narasumber Founders Live - Modul 6 - CEO Office DCI Indonesia.docx",
    "CMC - Undangan Narasumber Founders Live - Modul 7 - CEO Office Saratoga.docx",
    "CMC - Undangan Narasumber Founders Live - Modul 8 - CEO Office Pandu Sjahrir.docx",
]


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


def paragraph_text(paragraph: etree._Element) -> str:
    return "".join(paragraph.xpath(".//w:t/text()", namespaces=NS))


def remove_before_marker(paragraph: etree._Element, marker: str) -> None:
    nodes = paragraph.xpath(".//w:t", namespaces=NS)
    full_text = "".join(node.text or "" for node in nodes)
    cut = full_text.find(marker)
    if cut < 0:
        raise ValueError(f"Penanda koordinasi tidak ditemukan: {full_text}")

    offset = 0
    for node in nodes:
        text = node.text or ""
        end = offset + len(text)
        if end <= cut:
            node.text = ""
        elif offset < cut:
            node.text = text[cut - offset :]
        offset = end


def align_paragraph_left(paragraph: etree._Element) -> None:
    p_pr = paragraph.find(f"{{{WORD_NS}}}pPr")
    if p_pr is None:
        p_pr = etree.Element(f"{{{WORD_NS}}}pPr")
        paragraph.insert(0, p_pr)
    justification = p_pr.find(f"{{{WORD_NS}}}jc")
    if justification is None:
        justification = etree.SubElement(p_pr, f"{{{WORD_NS}}}jc")
    justification.set(f"{{{WORD_NS}}}val", "left")


def update_document_xml(data: bytes, module: int, letter_number: str) -> bytes:
    parser = etree.XMLParser(remove_blank_text=False)
    root = etree.fromstring(data, parser)
    initial_text = "".join(root.xpath("//w:t/text()", namespaces=NS))
    old_date, new_date = DATES_BY_MODULE[module]

    required_once = [
        old_date,
        "[tanggal]",
        "[Nomor surat]",
        "[tanggal konfirmasi]",
        "[Nama PIC]",
        "[nomor WhatsApp]",
        "[email]",
        "[Nama Penanda Tangan]",
        "[Jabatan]",
    ]
    for value in required_once:
        count = initial_text.count(value)
        if count != 1:
            raise ValueError(f"Teks {value!r} ditemukan {count} kali, diharapkan 1")

    confirmation_paragraphs = [
        paragraph
        for paragraph in root.xpath("//w:p", namespaces=NS)
        if paragraph_text(paragraph).startswith("Kami mengharapkan")
        and "Untuk koordinasi lebih lanjut" in paragraph_text(paragraph)
    ]
    if len(confirmation_paragraphs) != 1:
        raise ValueError(
            f"Paragraf konfirmasi ditemukan {len(confirmation_paragraphs)} kali, diharapkan 1"
        )
    remove_before_marker(confirmation_paragraphs[0], "Untuk koordinasi lebih lanjut")
    align_paragraph_left(confirmation_paragraphs[0])

    replacements = {
        old_date: new_date,
        "[tanggal]": "16",
        "[Nomor surat]": letter_number,
        "[Nama PIC]": "Mario",
        "[nomor WhatsApp]": "+6285178906100",
        "[email]": "ceomasterclassoffical@gmail.com",
        "[Nama Penanda Tangan]": "Stanley Sebastian",
        "[Jabatan]": "Founder CEO Masterclass",
    }
    observed = {key: 0 for key in replacements}
    for node in root.xpath("//w:t", namespaces=NS):
        text = node.text or ""
        for old, new in replacements.items():
            count = text.count(old)
            if count:
                observed[old] += count
                text = text.replace(old, new)
        node.text = text

    expected_observed = {key: 1 for key in replacements}
    if observed != expected_observed:
        raise ValueError(
            f"Jumlah penggantian tidak sesuai: ditemukan {observed}, "
            f"diharapkan {expected_observed}"
        )

    final_text = "".join(root.xpath("//w:t/text()", namespaces=NS))
    forbidden = [
        "[tanggal konfirmasi]",
        "Kami mengharapkan konfirmasi kesediaan",
        "Kami mengharapkan nama dan kontak perwakilan",
        "[Nama PIC]",
        "[nomor WhatsApp]",
        "[email]",
        "[Nama Penanda Tangan]",
        "[Jabatan]",
    ]
    for value in forbidden:
        if value in final_text:
            raise ValueError(f"Teks yang seharusnya hilang masih ada: {value}")

    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def update_docx(source: Path, destination: Path, letter_number: str) -> None:
    match = re.search(r"Modul (\d+)", source.name)
    if not match:
        raise ValueError(f"Nomor modul tidak ditemukan: {source.name}")
    module = int(match.group(1))

    with ZipFile(source, "r") as src, ZipFile(destination, "w", ZIP_DEFLATED) as dst:
        for info in src.infolist():
            data = src.read(info.filename)
            if info.filename == "word/document.xml":
                data = update_document_xml(data, module, letter_number)
            dst.writestr(clone_info(info), data)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, filename in enumerate(ORDERED_FILENAMES, start=35):
        source = SOURCE_DIR / filename
        if not source.exists():
            raise FileNotFoundError(source)
        letter_number = f"CMC/{index:03d}/UND/X/2026"
        destination = OUTPUT_DIR / filename
        update_docx(source, destination, letter_number)
        print(f"{letter_number} | {destination}")


if __name__ == "__main__":
    main()
