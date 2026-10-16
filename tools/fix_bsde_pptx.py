#!/usr/bin/env python3
"""Apply BSDE data to the original HRTA PowerPoint package without rebuilding it.

The script performs surgical edits to slide/table/chart XML so PowerPoint package
relationships, masters, chart styles, and native chart objects remain untouched.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path


ANNUAL_DATES = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
QUARTER_DATES = ["4Q23", "1Q24", "2Q24", "3Q24", "4Q24", "1Q25", "2Q25", "3Q25", "4Q25", "1Q26", "2Q26"]
CHART_DATES = ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "1H26"]

ANNUAL = {
    "Revenue": [6209574.0723, 6602955.2794, 10347343.1922, 6628782.185, 7084864.0386, 6180589.0861, 7654802.251, 10235479.9557, 11539141.2502, 13796572.1488, 12788452.3367],
    "Capital Expenditures": [-143094.7043, -129290.3486, -79649.1091, -42038.6942, -384767.0573, -132542.1418, -23182.5909, -198459.2147, -577124.8988, -822574.9411, -322805.879],
    "Net Income/Net Profit (Losses)": [2139496.5977, 1796156.479, 4920228.0553, 1293850.2226, 2791416.3264, 281700.8887, 1348623.0381, 2433146.9054, 1945467.4413, 4359063.784, 2545380.7191],
    "Total Assets": [36022148.4896, 38536825.1802, 45951188.4752, 52190720.0081, 54540978.398, 60862926.5868, 61469712.1657, 64999403.4808, 66827648.4864, 76023348.8868, 79268402.201],
    "Total Liabilities": [13925458.0063, 14074217.8743, 16754337.3859, 21832718.5041, 20915564.0993, 26391824.1109, 25575995.1518, 26953967.353, 25626062.2827, 28704020.7328, 26599497.5167],
    "Total Equity": [22096690.4833, 24462607.3059, 29196851.0892, 30358001.5039, 33625414.2987, 34471102.4758, 35893717.0138, 38045436.1278, 41201586.2037, 47319328.154, 52668904.6843],
    "Net Debt": [1132372.2885, 3457406.1819, 2520674.0488, 3430445.2051, 3184765.0044, 1918687.6602, 153731.6231, 38630.0655, 1025232.6556, 3454295.1019, 4614035.5486],
    "Cash From Operations": [-366494.0572, -605189.8948, 4606851.2409, 1125468.0912, 2557655.4101, 1103950.6901, 2887014.8893, 2816809.5983, 1207984.6493, 1046659.7066, -1351699.4876],
    "Free Cash Flow": [-509588.7615, -734480.2434, 4527202.1318, 1083429.397, 2172888.3527, 971408.5482, 2863832.2984, 2618350.3837, 630859.7505, 224084.7655, -1674505.3666],
    "Return on Assets": [6.6621, 4.8181, 11.6472, 2.6367, 5.2307, 0.4882, 2.2048, 3.8478, 2.9515, 6.103, 3.2782],
    "Return on Common Equity": [12.5124, 9.0967, 21.4005, 5.0225, 10.0758, 0.9493, 4.3804, 7.4759, 5.5499, 11.2736, 6.0117],
    "Profit Margin": [34.4548, 27.2023, 47.5506, 19.5187, 39.3997, 4.5578, 17.618, 23.7717, 16.8597, 31.5953, 19.9037],
    "Total Debt to Total Equity": [35.8646, 31.304, 31.0926, 45.9566, 39.872, 49.6679, 33.417, 31.4832, 28.7199, 30.5526, 31.1426],
    "Financial Leverage": [1.8781, 1.888, 1.8374, 1.9048, 1.9263, 1.9446, 1.9867, 1.9429, 1.8803, 1.8472, 1.8338],
    "Quick Ratio": [1.1282, 0.809, 0.9311, 1.5144, 1.6126, 1.1338, 1.0919, 1.0695, 0.9304, 0.7754, 1.2315],
}

QUARTER = {
    "Revenue": [4230823.246, 3774499.9302, 3572133.0286, 2720373.5997, 3729565.5903, 2700904.0149, 3689852.4685, 2372024.7321, 4025671.1212, 2368795.9704, 2382857.1253],
    "Capital Expenditures": [-234074.8642, -112485.0727, -107952.646, -304506.7348, -297630.4876, -95354.4687, -87216.8876, -78447.6843, -61865.5295, -40092.1894, -67771.2597],
    "Net Income/Net Profit (Losses)": [176421.4468, 1436953.1803, 896097.2525, 368868.0291, 1657145.3221, 305874.2582, 982173.6425, 75523.3454, 1181809.473, 277628.6476, 326267.3773],
    "Total Assets": [66827648.4864, 67653911.8028, 67862665.4221, 68466170.2821, 76023348.8868, 75916736.8085, 76641008.5958, 77400079.5584, 79268402.201, 80125884.8966, 81942880.5838],
    "Total Liabilities": [25626062.2827, 24935494.6977, 24310502.8588, 24632854.2778, 28704020.7328, 27469342.346, 25905271.5313, 26075586.0912, 26599497.5167, 27257461.8815, 28788877.3358],
    "Total Equity": [41201586.2037, 42718417.105, 43552162.5633, 43833316.0044, 47319328.154, 48447394.4625, 50735737.0644, 51324493.4672, 52668904.6843, 52868423.0151, 53154003.248],
    "Net Debt": [1025232.6556, 1263661.3173, 1329674.014, 2194292.9687, 3454295.1019, 3741557.7763, 1746344.9947, 4162834.4183, 4614035.5486, 6250118.9962, 8761255.2528],
    "Cash From Operations": [410737.0745, -27801.7575, 899529.551, 449588.7399, -274656.8268, -491662.1206, -472830.8513, -362085.7854, -25120.7303, -816556.7214, -554186.5045],
    "Free Cash Flow": [176662.2103, -140286.8302, 791576.905, 145082.0051, -572287.3144, -587016.5893, -560047.7388, -440533.4697, -86986.2599, -856648.9108, -621957.7642],
    "Return on Assets": [2.9515, 3.6833, 4.5429, 4.1243, 6.103, 4.4967, 4.5868, 4.1418, 3.2782, 3.2262, 2.3473],
    "Return on Common Equity": [5.5499, 6.8436, 8.2816, 7.6518, 11.2736, 8.1219, 8.1411, 7.3811, 6.0117, 5.8567, 4.2605],
    "Profit Margin": [4.1699, 38.07, 25.0858, 13.5595, 44.4327, 11.3249, 26.6182, 3.1839, 29.3568, 11.7202, 13.6923],
    "Total Debt to Total Equity": [28.7199, 28.8212, 27.7784, 26.514, 30.5526, 28.3662, 25.2642, 29.1462, 31.1426, 33.0495, 35.1641],
    "Financial Leverage": [1.9023, 1.8085, 1.7656, 1.7466, 1.8049, 1.8426, 1.8129, 1.8078, 1.8117, 1.8077, 1.8174],
    "Quick Ratio": [0.9304, 0.9117, 0.872, 0.7252, 0.7754, 0.7991, 0.9412, 0.985, 1.2315, 1.2829, 1.0829],
}

H1 = {
    "Revenue": 4751653.0957,
    "Capital Expenditures": -107863.4491,
    "Net Income/Net Profit (Losses)": 603896.0249,
    "Total Assets": 81942880.5838,
    "Total Liabilities": 28788877.3358,
    "Total Equity": 53154003.248,
    "Net Debt": 8761255.2528,
    "Cash From Operations": -1370743.2259,
    "Free Cash Flow": -1478606.675,
    "Return on Assets": 2.3473,
    "Return on Common Equity": 4.2605,
    "Profit Margin": 12.70917695,
    "Total Debt to Total Equity": 35.1641,
    "Financial Leverage": 1.8174,
    "Quick Ratio": 1.0829,
}

ROW_NAMES = [
    "Revenue", "Capital Expenditures", "Net Income/Net Profit (Losses)",
    "Total Assets", "Total Liabilities", "Total Equity", "Net Debt",
    "Cash From Operations", "Free Cash Flow", "Return on Assets",
    "Return on Common Equity", "Profit Margin", "Total Debt to Total Equity",
    "Financial Leverage", "Quick Ratio", "Profit Margin",
]


def esc(value: object) -> str:
    return html.escape(str(value), quote=False)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, value: str) -> None:
    path.write_text(value, encoding="utf-8", newline="")


def find_shape(xml: str, shape_name: str) -> tuple[int, int, str]:
    for match in re.finditer(r"<p:sp>(?:(?!<p:sp>).)*?</p:sp>", xml, re.S):
        if f'name="{shape_name}"' in match.group(0):
            return match.start(), match.end(), match.group(0)
    raise ValueError(f"Shape not found: {shape_name}")


def replace_text_nodes(block: str, values: list[str]) -> str:
    index = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal index
        value = values[index] if index < len(values) else ""
        index += 1
        attrs = match.group(1) or ""
        return f"<a:t{attrs}>{esc(value)}</a:t>"

    updated = re.sub(r"<a:t((?: [^>]*)?)>.*?</a:t>", repl, block, flags=re.S)
    if index < len(values):
        raise ValueError(f"Not enough text nodes ({index}) for {len(values)} values")
    return updated


def update_shape_text(xml: str, shape_name: str, values: list[str]) -> str:
    start, end, block = find_shape(xml, shape_name)
    return xml[:start] + replace_text_nodes(block, values) + xml[end:]


def run(text: str, *, bold: bool = False, size: int = 1400) -> str:
    space = ' xml:space="preserve"' if text.startswith(" ") or text.endswith(" ") else ""
    b = ' b="1"' if bold else ""
    return (
        f'<a:r><a:rPr lang="en-ID" sz="{size}"{b} dirty="0">'
        '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
        f'</a:rPr><a:t{space}>{esc(text)}</a:t></a:r>'
    )


def heading(text: str) -> str:
    return (
        '<a:p><a:pPr algn="just"><a:spcBef><a:spcPts val="160"/></a:spcBef></a:pPr>'
        f'{run(text, bold=True, size=1500)}'
        '<a:endParaRPr lang="en-US" sz="1500"/></a:p>'
    )


def bullet(period: str, text: str) -> str:
    return (
        '<a:p><a:pPr marL="285750" indent="-285750" algn="just">'
        '<a:spcBef><a:spcPts val="80"/></a:spcBef>'
        '<a:buFont typeface="Arial"/><a:buChar char="•"/></a:pPr>'
        f'{run(period, bold=True, size=1200)}{run(text, size=1200)}'
        '<a:endParaRPr lang="en-US" sz="1200"/></a:p>'
    )


def narrative_txbody() -> str:
    paragraphs = [
        heading("Profitability:"),
        bullet("2024: ", "Revenue naik 19,6% menjadi Rp13,80 triliun dan laba bersih naik 124,1%. Penjualan residensial/komersial, efisiensi HPP, serta gain akuisisi SMDM Rp1,55 triliun menjadi pendorong utama."),
        bullet("2025: ", "Revenue turun 7,3% menjadi Rp12,79 triliun akibat jasa konstruksi turun Rp615 miliar dan penjualan turun Rp581 miliar. Laba bersih turun 41,6% karena normalisasi gain akuisisi dan beban bunga/keuangan naik menjadi Rp1,53 triliun."),
        bullet("1H26: ", "Revenue turun 25,6% YoY dan laba bersih turun 53,1%, meski gross margin naik menjadi 66,5%. Marketing sales Rp5,12 triliun atau 51% target memberi dukungan untuk pengakuan pendapatan 2H26."),
        heading("Solvency:"),
        bullet("2025: ", "Total aset naik 4,3% menjadi Rp79,27 triliun, terutama dari kas dan persediaan; ekuitas naik 11,3% dan Debt-to-Equity berada di 31,1%."),
        bullet("1H26: ", "Total aset naik 3,4% menjadi Rp81,94 triliun karena persediaan, uang muka, dan investasi. Liabilitas naik 8,2% dan net debt meningkat menjadi Rp8,76 triliun setelah penarikan utang bank baru Rp4,42 triliun."),
        heading("Free Cash Flow:"),
        bullet("2024–2025: ", "FCF berbalik dari positif Rp224 miliar menjadi negatif Rp1,67 triliun seiring operating cash flow menjadi negatif."),
        bullet("1H26: ", "Penerimaan pelanggan naik 15%, tetapi pembelian tanah/bangunan Rp2,51 triliun menekan CFO dan FCF ke sekitar negatif Rp1,4 triliun; ekspansi yang dibiayai utang perlu dimonitor."),
    ]
    return (
        '<p:txBody><a:bodyPr wrap="square" rtlCol="0"><a:spAutoFit/></a:bodyPr>'
        '<a:lstStyle/>' + "".join(paragraphs) + '</p:txBody>'
    )


def update_narrative(xml: str) -> str:
    start, end, block = find_shape(xml, "TextBox 8")
    updated, count = re.subn(r"<p:txBody>[\s\S]*?</p:txBody>", narrative_txbody(), block, count=1)
    if count != 1:
        raise ValueError("Could not replace narrative text body")
    return xml[:start] + updated + xml[end:]


def fmt_table(value: float) -> str:
    formatted = f"{abs(value):,.2f}"
    return f"({formatted})" if value < 0 else formatted


def replace_cell_text(cell: str, value: str) -> str:
    seen = False

    def repl(match: re.Match[str]) -> str:
        nonlocal seen
        attrs = match.group(1) or ""
        text = value if not seen else ""
        seen = True
        return f"<a:t{attrs}>{esc(text)}</a:t>"

    updated = re.sub(r"<a:t((?: [^>]*)?)>.*?</a:t>", repl, cell, flags=re.S)
    if not seen:
        raise ValueError("Table cell has no text node")
    return updated


def update_table(table_xml: str, matrix: list[list[str]]) -> str:
    rows = list(re.finditer(r"<a:tr[\s\S]*?</a:tr>", table_xml))
    if len(rows) != len(matrix):
        raise ValueError(f"Table row mismatch: {len(rows)} vs {len(matrix)}")
    output: list[str] = []
    cursor = 0
    for row_match, row_values in zip(rows, matrix):
        output.append(table_xml[cursor:row_match.start()])
        row = row_match.group(0)
        cells = list(re.finditer(r"<a:tc(?: [^>]*)?>[\s\S]*?</a:tc>", row))
        if len(cells) != len(row_values):
            raise ValueError(f"Table column mismatch: {len(cells)} vs {len(row_values)}")
        row_out: list[str] = []
        row_cursor = 0
        for cell_match, value in zip(cells, row_values):
            row_out.append(row[row_cursor:cell_match.start()])
            row_out.append(replace_cell_text(cell_match.group(0), value))
            row_cursor = cell_match.end()
        row_out.append(row[row_cursor:])
        output.append("".join(row_out))
        cursor = row_match.end()
    output.append(table_xml[cursor:])
    return "".join(output)


def update_tables(xml: str) -> str:
    annual_matrix = [["Dates", *ANNUAL_DATES]]
    quarter_matrix = [["Dates", *QUARTER_DATES, "1H26"]]
    for row_name in ROW_NAMES:
        annual_matrix.append([row_name, *[fmt_table(v) for v in ANNUAL[row_name]]])
        quarter_matrix.append([row_name, *[fmt_table(v) for v in QUARTER[row_name]], fmt_table(H1[row_name])])

    tables = list(re.finditer(r"<a:tbl>[\s\S]*?</a:tbl>", xml))
    if len(tables) != 2:
        raise ValueError(f"Expected two tables, found {len(tables)}")
    replacements = [update_table(tables[0].group(0), annual_matrix), update_table(tables[1].group(0), quarter_matrix)]
    return xml[:tables[0].start()] + replacements[0] + xml[tables[0].end():tables[1].start()] + replacements[1] + xml[tables[1].end():]


def cache_points(values: list[object]) -> str:
    return "".join(f'<c:pt idx="{i}"><c:v>{esc(value)}</c:v></c:pt>' for i, value in enumerate(values))


def replace_str_cache(block: str, values: list[str]) -> str:
    new_cache = f'<c:strCache><c:ptCount val="{len(values)}"/>{cache_points(values)}</c:strCache>'
    updated, count = re.subn(r"<c:strCache>[\s\S]*?</c:strCache>", new_cache, block, count=1)
    if count != 1:
        raise ValueError("String cache not found")
    return updated


def replace_num_cache(block: str, values: list[float], format_code: str) -> str:
    new_cache = (
        f'<c:numCache><c:formatCode>{esc(format_code)}</c:formatCode>'
        f'<c:ptCount val="{len(values)}"/>{cache_points([f"{v:.10g}" for v in values])}</c:numCache>'
    )
    updated, count = re.subn(r"<c:numCache>[\s\S]*?</c:numCache>", new_cache, block, count=1)
    if count != 1:
        raise ValueError("Numeric cache not found")
    return updated


def replace_chart_title(xml: str, title: str) -> str:
    match = re.search(r"<c:title>[\s\S]*?</c:title>", xml)
    if not match:
        raise ValueError("Chart title not found")
    block = replace_text_nodes(match.group(0), [title])
    return xml[:match.start()] + block + xml[match.end():]


def update_series(series_xml: str, name: str, categories: list[str], values: list[float], format_code: str) -> str:
    tx = re.search(r"<c:tx>[\s\S]*?</c:tx>", series_xml)
    cat = re.search(r"<c:cat>[\s\S]*?</c:cat>", series_xml)
    val = re.search(r"<c:val>[\s\S]*?</c:val>", series_xml)
    if not tx or not cat or not val:
        raise ValueError("Incomplete chart series")
    tx_new = replace_str_cache(tx.group(0), [name])
    cat_new = replace_str_cache(cat.group(0), categories)
    val_new = replace_num_cache(val.group(0), values, format_code)
    return (
        series_xml[:tx.start()] + tx_new +
        series_xml[tx.end():cat.start()] + cat_new +
        series_xml[cat.end():val.start()] + val_new +
        series_xml[val.end():]
    )


def update_chart(xml: str, title: str, series_specs: list[tuple[str, list[float]]], format_code: str) -> str:
    xml = replace_chart_title(xml, title)
    series = list(re.finditer(r"<c:ser>[\s\S]*?</c:ser>", xml))
    if len(series) != len(series_specs):
        raise ValueError(f"Series mismatch for {title}: {len(series)} vs {len(series_specs)}")
    out: list[str] = []
    cursor = 0
    for match, (name, values) in zip(series, series_specs):
        out.append(xml[cursor:match.start()])
        out.append(update_series(match.group(0), name, CHART_DATES, values, format_code))
        cursor = match.end()
    out.append(xml[cursor:])
    return "".join(out)


def years(metric: str, divisor: float = 1.0) -> list[float]:
    return [v / divisor for v in ANNUAL[metric][2:]] + [H1[metric] / divisor]


CHART_SPECS = {
    1: ("Free Cash Flow (IDR Bn)", [("Free Cash Flow", years("Free Cash Flow", 1000))], "#,##0"),
    2: ("Net Debt (IDR Bn)", [("Net Debt", years("Net Debt", 1000))], "#,##0"),
    3: ("Net Income (IDR Bn)", [("Net Income", years("Net Income/Net Profit (Losses)", 1000))], "#,##0"),
    4: ("Profit Margin (%)", [("Profit Margin", years("Profit Margin"))], "0.0"),
    5: ("Return on Equity (%)", [("Return on Equity", years("Return on Common Equity"))], "0.0"),
    6: ("Return on Assets (%)", [("Return on Assets", years("Return on Assets"))], "0.0"),
    7: ("Revenue (IDR Tn)", [("Revenue", years("Revenue", 1_000_000))], "0.0"),
    8: ("Total Assets (IDR Tn)", [("Total Assets", years("Total Assets", 1_000_000))], "0.0"),
    9: ("Capital Structure (IDR Tn)", [("Total Equity", years("Total Equity", 1_000_000)), ("Total Liabilities", years("Total Liabilities", 1_000_000))], "0.0"),
    10: ("Quick Ratio (X)", [("Quick Ratio", years("Quick Ratio"))], "0.00"),
    11: ("Debt to Equity (%)", [("Debt to Equity", years("Total Debt to Total Equity"))], "0.0"),
    12: ("Financial Leverage (X)", [("Financial Leverage", years("Financial Leverage"))], "0.00"),
    13: ("Operating Cash Flow (IDR Bn)", [("Operating Cash Flow", years("Cash From Operations", 1000))], "#,##0"),
    14: ("Capital Expenditure (IDR Bn)", [("Capital Expenditure", years("Capital Expenditures", 1000))], "#,##0"),
    15: ("Free Cash Flow (IDR Bn)", [("Free Cash Flow", years("Free Cash Flow", 1000))], "#,##0"),
}


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: fix_bsde_pptx.py <unzipped-pptx-directory>")
    root = Path(sys.argv[1]).resolve()
    if not (root / "[Content_Types].xml").exists():
        raise SystemExit(f"Not an unpacked PPTX: {root}")

    title_runs = ["Bumi Serpong", " Damai ", "(", "Pefindo", ": ", "idAA", ")"]
    for slide_number, shape_name in [(1, "TextBox 4"), (2, "TextBox 6"), (3, "TextBox 4"), (4, "TextBox 1")]:
        path = root / f"ppt/slides/slide{slide_number}.xml"
        xml = update_shape_text(read(path), shape_name, title_runs)
        if slide_number == 1:
            xml = update_narrative(xml)
        if slide_number == 2:
            xml = update_shape_text(xml, "TextBox 9", ["Yearly Performance"])
            xml = update_shape_text(xml, "TextBox 10", ["Quarterly Performance"])
            xml = update_tables(xml)
        if slide_number == 3:
            xml = update_shape_text(xml, "TextBox 6", ["Scale Metrics"])
        write(path, xml)

    for chart_number, (title, series_specs, format_code) in CHART_SPECS.items():
        path = root / f"ppt/charts/chart{chart_number}.xml"
        updated = update_chart(read(path), title, series_specs, format_code)
        if chart_number == 8:
            updated = updated.replace('formatCode="0%"', 'formatCode="0.0"')
        if chart_number == 9:
            updated = re.sub(r"<c:dLbl>[\s\S]*?</c:dLbl>", "", updated)
        write(path, updated)

    print("Updated 4 slides, 2 tables, and 15 native charts.")


if __name__ == "__main__":
    main()
