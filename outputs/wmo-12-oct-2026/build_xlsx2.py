"""Processed exhibit data for WMO 5-12 Oct 2026 (from TIM-8 + official public sources).

Blue = hardcoded inputs (Bloomberg TIM-8 or official source), black = formulas,
green = links to other sheets. No forward-fill: missing dates stay blank.
"""
import csv, datetime as dt, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter as L

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from load import load

S = load()
D = dt.date
OUT = sys.argv[1]

FONT = "Arial"
BLUE = Font(name=FONT, color="0000FF", size=10)
BLACK = Font(name=FONT, color="000000", size=10)
GREEN = Font(name=FONT, color="008000", size=10)
BOLD = Font(name=FONT, bold=True, size=10)
HEAD = Font(name=FONT, bold=True, size=10, color="FFFFFF")
TITLE = Font(name=FONT, bold=True, size=12, color="002060")
NOTE = Font(name=FONT, italic=True, size=9, color="595959")
HFILL = PatternFill("solid", fgColor="002060")
KEY = PatternFill("solid", fgColor="FFFF00")

wb = Workbook()


def sheet(name, title, notes):
    ws = wb.create_sheet(name)
    ws["A1"] = title
    ws["A1"].font = TITLE
    for i, n in enumerate(notes):
        ws.cell(2 + i, 1, n).font = NOTE
    return ws, 3 + len(notes)


def header(ws, r, cols, c0=1):
    for j, h in enumerate(cols):
        c = ws.cell(r, c0 + j, h)
        c.font = HEAD
        c.fill = HFILL
        c.alignment = Alignment(horizontal="center", wrap_text=True, vertical="center")


def put(ws, r, c, v, font=BLUE, fmt=None):
    cell = ws.cell(r, c, v)
    cell.font = font
    if fmt:
        cell.number_format = fmt
    return cell


def widths(ws, w):
    for i, x in enumerate(w, 1):
        ws.column_dimensions[L(i)].width = x


def treasury(col, files):
    out = {}
    for f in files:
        for row in csv.DictReader(open(f)):
            out[dt.datetime.strptime(row["Date"], "%m/%d/%Y").date()] = float(row[col])
    return out


AG = __file__.rsplit("/", 2)[0] + "/ag/"
NOM = treasury("10 Yr", [AG + "ny2025.csv", AG + "daily_treasury_yield_curve.csv"])
REAL = treasury("10 YR", [AG + "ry2025.csv", AG + "daily_treasury_real_yield_curve.csv"])
DATEF = "dd-mmm-yy"

# ---------------------------------------------------------------- README
ws = wb.active
ws.title = "README"
rows = [
    ("WMO 5–12 Oktober 2026 — Processed Exhibit Data", TITLE),
    ("Disusun 12 Oktober 2026. Cutoff riset 12 Okt 2026 (WIB). Endpoint return: penutupan 5 Okt → 9 Okt 2026 (semua aset).", BLACK),
    ("", BLACK),
    ("Sumber", BOLD),
    ("Bloomberg — file TIM-8.xlsx (ditarik 12 Okt 2026 ±11:37 WIB): MXID/peer BEst P/E (mingguan, 10 thn), SOX harga & BEst P/E (harian, 1 thn), SPX/SPW/CCMP/RTY, XAU, 26 saham AI, CO1/CL1, GIDN10YR, USDIDR REGN, BIDY.", BLACK),
    ("US Treasury — Daily Par Yield Curve & Daily Real Yield Curve (10Y), 2025–2026.", BLACK),
    ("Baltic Exchange — Gas report & Tanker report Week 41 (9 Okt 2026).", BLACK),
    ("TSMC Investor Relations — Monthly Revenue 2025 & 2026 (unaudited).", BLACK),
    ("Bank Indonesia — Survei Konsumen Sep 2026 (Tabel 1, rilis 8 Okt 2026); Survei Penjualan Eceran Juli 2026 (Tabel 2) + siaran pers 9 Okt 2026.", BLACK),
    ("", BLACK),
    ("Konvensi warna", BOLD),
    ("Biru = input (Bloomberg/sumber resmi). Hitam = rumus. Hijau = tautan antar-sheet. Kuning = angka kunci untuk teks deck.", BLACK),
    ("", BLACK),
    ("Catatan kualitas data", BOLD),
    ("1. Nilai 12 Okt 2026 untuk XAU, CO1, CL1, USDIDR, MXID adalah intraday saat penarikan — TIDAK dipakai untuk return.", BLACK),
    ("2. BEst P/E 12 Okt (MXID 9,2078; SOX 28,776) sama dengan 9 Okt → estimasi belum diperbarui; dipakai 9 Okt.", BLACK),
    ("3. MXID harga & P/E berfrekuensi mingguan (Jumat) → valuasi dibaca per 9 Okt, bukan return 5→9 Okt.", BLACK),
    ("4. SOX BEst P/E hanya 1 tahun (13 Okt 2025 – 9 Okt 2026), jadi benchmark valuasi SOX = rentang 1 tahun, bukan 10 tahun.", BLACK),
    ("5. GIDN10YR berhenti 8 Okt 2026 (9 Okt kosong). Perubahan SBN dihitung 5→8 Okt.", BLACK),
    ("6. ASML memakai ASML NA Equity (EUR, Amsterdam), bukan ADR AS.", BLACK),
    ("7. Z-score MXID versi Bloomberg = −2,36σ (10 thn). Chart Refinitiv referensi menunjukkan ±−3 → beda sumber konsensus/metode; deck memakai angka Bloomberg.", BLACK),
    ("8. Saham Korea/Taiwan, JCI/LQ45, arus asing, dan CME FedWatch tidak ada di TIM-8.", BLACK),
]
for i, (t, f) in enumerate(rows, 1):
    ws.cell(i, 1, t).font = f
ws.column_dimensions["A"].width = 150

# ---------------------------------------------------------------- Ex1 Freight
ws, r0 = sheet("Ex1_Freight", "Exhibit 1 — Biaya angkut energi: tanker minyak vs LPG vs LNG", [
    "Panel A: Baltic Dirty Tanker Index (BIDY), harian. Sumber: Bloomberg (TIM-8). Panel B: asesmen rute Baltic Exchange, 9 Okt 2026.",
    "Perubahan mingguan versi Baltic = Jumat 2 Okt → Jumat 9 Okt (metodologi laporan mingguan), BUKAN return 5–12 Okt.",
])
header(ws, r0, ["Date", "BIDY", "x pra-perang (27 Feb)"])
bidy = S["BIDY|Last Price|dcol2"]
first = r0 + 1
for i, d in enumerate(sorted(bidy)):
    put(ws, first + i, 1, d, BLUE, DATEF)
    put(ws, first + i, 2, bidy[d], BLUE, "#,##0")
last = first + len(bidy) - 1
feb_row = first + sorted(bidy).index(D(2026, 2, 27))
for rr in range(first, last + 1):
    put(ws, rr, 3, f"=B{rr}/$B${feb_row}", BLACK, "0.00\"x\"")
# panel B
c0 = 6
header(ws, r0, ["Segmen", "Rute (kode)", "Satuan rate", "Level 9 Okt", "Δ w/w (Baltic)", "Level 2 Okt (implied)", "Δ w/w %", "TCE USD/hari 9 Okt"], c0)
routes = [
    ("LNG", "BLNG1 Australia–Japan", "USD/hari", 34600, -2300, 34600),
    ("LNG", "BLNG2 US Gulf–Continent", "USD/hari", 21200, -4900, 21200),
    ("LNG", "BLNG3 US Gulf–Japan", "USD/hari", 52100, -4200, 52100),
    ("LPG", "BLPG1 Ras Tanura–Chiba", "USD/ton", 265.00, None, 258182),
    ("LPG", "BLPG2 Houston–Flushing", "USD/ton", 190.83, 18.00, 227905),
    ("LPG", "BLPG3 Houston–Chiba", "USD/ton", 344.71, 22.00, 214030),
    ("Minyak mentah", "TD3C MEG–China (VLCC)", "Worldscale", 1318.75, 115, 1412594),
    ("Minyak mentah", "TD22 US Gulf–China (VLCC)", "USD lumpsum", 79611111, 24800000, 637675),
    ("Minyak mentah", "TD15 West Africa–China (VLCC)", "Worldscale", 750.63, 111, 763031),
]
for i, (seg, rt, unit, lvl, chg, tce) in enumerate(routes):
    rr = r0 + 1 + i
    put(ws, rr, c0, seg, BLACK)
    put(ws, rr, c0 + 1, rt, BLACK)
    put(ws, rr, c0 + 2, unit, BLACK)
    put(ws, rr, c0 + 3, lvl, BLUE, "#,##0.00")
    if chg is None:
        put(ws, rr, c0 + 4, "n.a.", BLACK)
        put(ws, rr, c0 + 5, "", BLACK)
        put(ws, rr, c0 + 6, "", BLACK)
    else:
        put(ws, rr, c0 + 4, chg, BLUE, "#,##0.00")
        put(ws, rr, c0 + 5, f"={L(c0+3)}{rr}-{L(c0+4)}{rr}", BLACK, "#,##0.00")
        put(ws, rr, c0 + 6, f"={L(c0+3)}{rr}/{L(c0+5)}{rr}-1", BLACK, "0.0%")
    put(ws, rr, c0 + 7, tce, BLUE, "#,##0")
rr = r0 + len(routes) + 2
ws.cell(rr, c0, "Ringkasan BIDY").font = BOLD
summ = [
    ("BIDY 9 Okt 2026", f"=INDEX(B:B,MATCH(DATE(2026,10,9),A:A,0))", "#,##0"),
    ("BIDY 5 Okt 2026", f"=INDEX(B:B,MATCH(DATE(2026,10,5),A:A,0))", "#,##0"),
    ("Return 5→9 Okt", f"={L(c0+1)}{rr+1}/{L(c0+1)}{rr+2}-1", "0.00%"),
    ("BIDY 27 Feb 2026 (pra-perang)", f"=B{feb_row}", "#,##0"),
    ("Kelipatan vs 27 Feb", f"={L(c0+1)}{rr+1}/{L(c0+1)}{rr+4}", "0.0\"x\""),
    ("BIDY 14 Agu 2026", f"=INDEX(B:B,MATCH(DATE(2026,8,14),A:A,0))", "#,##0"),
    ("Kenaikan sejak 14 Agu", f"={L(c0+1)}{rr+1}/{L(c0+1)}{rr+6}-1", "0.0%"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, rr + 1 + i, c0, lab, BLACK)
    c = put(ws, rr + 1 + i, c0 + 1, f, BLACK, fmt)
    c.fill = KEY
widths(ws, [12, 10, 12, 3, 3, 14, 30, 14, 14, 14, 16, 10, 16])

# ---------------------------------------------------------------- Ex2 Gold vs real yield
ws, r0 = sheet("Ex2_Gold_RealYield", "Exhibit 2 — Emas vs real yield UST 10Y (dua panel, tanpa dual-axis)", [
    "XAU = Bloomberg XAU Curncy (TIM-8). Real & nominal 10Y = US Treasury par yield curve. Breakeven = nominal − real (perhitungan).",
    "Periode chart: 1 Jul – 9 Okt 2026. 12 Okt (XAU intraday) tidak dipakai.",
])
header(ws, r0, ["Date", "XAU (USD/oz)", "Real 10Y (%)", "Nominal 10Y (%)", "Breakeven 10Y (%)"])
xau = S["XAU|Last Price|dcol2"]
dates = sorted(d for d in set(xau) | set(REAL) if D(2025, 12, 31) <= d <= D(2026, 10, 9))
first = r0 + 1
idx = {}
for i, d in enumerate(dates):
    rr = first + i
    idx[d] = rr
    put(ws, rr, 1, d, BLUE, DATEF)
    if d in xau:
        put(ws, rr, 2, xau[d], BLUE, "#,##0.00")
    if d in REAL:
        put(ws, rr, 3, REAL[d], BLUE, "0.00")
    if d in NOM:
        put(ws, rr, 4, NOM[d], BLUE, "0.00")
    put(ws, rr, 5, f'=IF(AND(ISNUMBER(C{rr}),ISNUMBER(D{rr})),D{rr}-C{rr},"")', BLACK, "0.00")
last = first + len(dates) - 1
c0 = 7
ws.cell(r0, c0, "Ringkasan").font = BOLD
g = lambda d, col: f"{col}{idx[d]}"
summ = [
    ("XAU 5 Okt", "=" + g(D(2026, 10, 5), "B"), "#,##0.00"),
    ("XAU 9 Okt", "=" + g(D(2026, 10, 9), "B"), "#,##0.00"),
    ("Return 5→9 Okt", f"={L(c0+1)}{r0+2}/{L(c0+1)}{r0+1}-1", "0.00%"),
    ("Puncak sejak Jul (25 Agu)", "=" + g(D(2026, 8, 25), "B"), "#,##0.00"),
    ("Titik terendah 7 Okt", "=" + g(D(2026, 10, 7), "B"), "#,##0.00"),
    ("Puncak → 7 Okt", f"={L(c0+1)}{r0+5}/{L(c0+1)}{r0+4}-1", "0.00%"),
    ("Puncak 2026 (28 Jan)", "=" + g(D(2026, 1, 28), "B"), "#,##0.00"),
    ("28 Jan → 9 Okt", f"={L(c0+1)}{r0+2}/{L(c0+1)}{r0+7}-1", "0.00%"),
    ("Real 10Y 28 Jan", "=" + g(D(2026, 1, 28), "C"), "0.00"),
    ("Real 10Y 9 Okt", "=" + g(D(2026, 10, 9), "C"), "0.00"),
    ("Δ real 10Y 28 Jan→9 Okt (bps)", f"=({L(c0+1)}{r0+10}-{L(c0+1)}{r0+9})*100", "0"),
    ("Real 10Y 31 Agu", "=" + g(D(2026, 8, 31), "C"), "0.00"),
    ("Real 10Y 30 Sep", "=" + g(D(2026, 9, 30), "C"), "0.00"),
    ("Δ real 10Y September (bps)", f"=({L(c0+1)}{r0+13}-{L(c0+1)}{r0+12})*100", "0"),
    ("Breakeven 9 Okt", "=" + g(D(2026, 10, 9), "E"), "0.00"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 13, 11, 13, 14, 3, 30, 12])

# ---------------------------------------------------------------- Ex3 AI chain
ws, r0 = sheet("Ex3_AI_Chain", "Exhibit 3 — Rantai nilai AI: return 5→9 Okt 2026", [
    "Harga penutupan Bloomberg (TIM-8). YTD dari penutupan terakhir ≤ 31 Des 2025. Rata-rata kelompok = rata-rata sederhana (bukan indeks).",
])
header(ws, r0, ["Kelompok", "Ticker", "31 Des 2025", "5 Okt 2026", "9 Okt 2026", "Return 5→9 Okt", "YTD"])
groups = [
    ("Listrik", ["CEG", "VST"]), ("Software", ["IGV", "PLTR"]),
    ("Hyperscaler", ["MSFT", "AMZN", "GOOGL", "META", "ORCL"]),
    ("Jaringan/server", ["ANET", "DELL", "MRVL"]),
    ("GPU/logic", ["NVDA", "AMD", "AVGO", "ARM", "INTC"]),
    ("Foundry/peralatan", ["TSM", "ASML", "AMAT", "LRCX", "KLAC"]),
    ("Memori/storage", ["MU", "SNDK", "STX", "WDC"]),
]
ref = [("Acuan", "SOX", "SOX|Last Price|dcol2"), ("Acuan", "SPX", "SPX, SPW, CCMP, RTY|SPX Index|dcol2"),
       ("Acuan", "SPW (equal-weight)", "SPX, SPW, CCMP, RTY|SPW Index|dcol2"),
       ("Acuan", "CCMP (Nasdaq)", "SPX, SPW, CCMP, RTY|CCMP Index|dcol2"),
       ("Acuan", "RTY (Russell 2000)", "SPX, SPW, CCMP, RTY|RTY Index|dcol2")]


def ye(ser):
    k = max(d for d in ser if d <= D(2025, 12, 31))
    return ser[k]


rr = r0 + 1
first = rr
for grp, tks in groups:
    for t in tks:
        key = [k for k in S if k.startswith(f"US STOCKS|{t} ") and "Volume" not in k][0]
        ser = S[key]
        put(ws, rr, 1, grp, BLACK)
        put(ws, rr, 2, key.split("|")[1], BLACK)
        put(ws, rr, 3, ye(ser), BLUE, "#,##0.00")
        put(ws, rr, 4, ser[D(2026, 10, 5)], BLUE, "#,##0.00")
        put(ws, rr, 5, ser[D(2026, 10, 9)], BLUE, "#,##0.00")
        put(ws, rr, 6, f"=E{rr}/D{rr}-1", BLACK, "0.00%")
        put(ws, rr, 7, f"=E{rr}/C{rr}-1", BLACK, "0.0%")
        rr += 1
lastst = rr - 1
for grp, name, key in ref:
    ser = S[key]
    put(ws, rr, 1, grp, BLACK)
    put(ws, rr, 2, name, BLACK)
    put(ws, rr, 3, ye(ser), BLUE, "#,##0.00")
    put(ws, rr, 4, ser[D(2026, 10, 5)], BLUE, "#,##0.00")
    put(ws, rr, 5, ser[D(2026, 10, 9)], BLUE, "#,##0.00")
    put(ws, rr, 6, f"=E{rr}/D{rr}-1", BLACK, "0.00%")
    put(ws, rr, 7, f"=E{rr}/C{rr}-1", BLACK, "0.0%")
    rr += 1
c0 = 9
header(ws, r0, ["Kelompok (data chart)", "Rata-rata 5→9 Okt", "Rata-rata YTD"], c0)
for i, (grp, _) in enumerate(groups):
    r = r0 + 1 + i
    put(ws, r, c0, grp, BLACK)
    put(ws, r, c0 + 1, f'=AVERAGEIF($A${first}:$A${lastst},{L(c0)}{r},$F${first}:$F${lastst})', BLACK, "0.00%").fill = KEY
    put(ws, r, c0 + 2, f'=AVERAGEIF($A${first}:$A${lastst},{L(c0)}{r},$G${first}:$G${lastst})', BLACK, "0.0%")
widths(ws, [18, 20, 12, 12, 12, 14, 10, 3, 22, 16, 14])

# ---------------------------------------------------------------- Ex4 TSMC vs SOX
ws, r0 = sheet("Ex4_TSMC_SOX", "Exhibit 4 — Fundamental pemasok vs harga: penjualan TSMC dan SOX", [
    "Panel kiri: penjualan bulanan TSMC (NT$ juta, unaudited) — TSMC IR. YoY 2025 sesuai laporan TSMC; YoY 2026 dihitung vs 2025.",
    "Panel kanan: SOX harga & BEst P/E (blended forward) — Bloomberg (TIM-8), 1 tahun. Implied forward EPS = harga ÷ P/E (perhitungan).",
])
header(ws, r0, ["Bulan", "Penjualan (NT$ juta)", "YoY (%)"])
tsmc25 = [293288, 260009, 285957, 349567, 320516, 263709, 323166, 335772, 330980, 367473, 343614, 335003]
yoy25 = [35.9, 43.1, 46.5, 48.1, 39.6, 26.9, 25.8, 33.8, 31.4, 16.9, 24.5, 20.4]
tsmc26 = [401255, 317657, 415191, 410726, 416975, 442680, 467580, 514806, 511857]
rr = r0 + 1
r25 = {}
for m, (v, y) in enumerate(zip(tsmc25, yoy25), 1):
    put(ws, rr, 1, D(2025, m, 1), BLUE, "mmm-yy")
    put(ws, rr, 2, v, BLUE, "#,##0")
    put(ws, rr, 3, y / 100, BLUE, "0.0%")
    r25[m] = rr
    rr += 1
for m, v in enumerate(tsmc26, 1):
    put(ws, rr, 1, D(2026, m, 1), BLUE, "mmm-yy")
    put(ws, rr, 2, v, BLUE, "#,##0")
    put(ws, rr, 3, f"=B{rr}/B{r25[m]}-1", BLACK, "0.0%")
    rr += 1
sep26 = rr - 1
put(ws, rr + 1, 1, "Sep-26 YoY", BLACK)
put(ws, rr + 1, 2, f"=C{sep26}", BLACK, "0.0%").fill = KEY
put(ws, rr + 2, 1, "Jan–Sep 26 YoY", BLACK)
put(ws, rr + 2, 2, f"=SUM(B{r25[12]+1}:B{sep26})/SUM(B{r25[1]}:B{r25[9]})-1", BLACK, "0.0%").fill = KEY
c0 = 5
header(ws, r0, ["Date", "SOX", "BEst P/E", "Implied fwd EPS"], c0)
sox = S["SOX|Last Price|dcol2"]
spe = S["SOX|BEst P/E Ratio|dcol5"]
sd = sorted(d for d in sox if d <= D(2026, 10, 9))
sidx = {}
for i, d in enumerate(sd):
    r = r0 + 1 + i
    sidx[d] = r
    put(ws, r, c0, d, BLUE, DATEF)
    put(ws, r, c0 + 1, sox[d], BLUE, "#,##0.00")
    if d in spe:
        put(ws, r, c0 + 2, spe[d], BLUE, "0.00")
        put(ws, r, c0 + 3, f"={L(c0+1)}{r}/{L(c0+2)}{r}", BLACK, "#,##0.0")
slast = r0 + len(sd)
c1 = 10
ws.cell(r0, c1, "Ringkasan SOX").font = BOLD
ye_d = max(d for d in sd if d <= D(2025, 12, 31))
summ = [
    ("SOX 5 Okt", f"={L(c0+1)}{sidx[D(2026,10,5)]}", "#,##0.00"),
    ("SOX 9 Okt", f"={L(c0+1)}{sidx[D(2026,10,9)]}", "#,##0.00"),
    ("Return 5→9 Okt", f"={L(c1+1)}{r0+2}/{L(c1+1)}{r0+1}-1", "0.00%"),
    ("SOX 31 Des 2025", f"={L(c0+1)}{sidx[ye_d]}", "#,##0.00"),
    ("YTD s.d. 9 Okt", f"={L(c1+1)}{r0+2}/{L(c1+1)}{r0+4}-1", "0.00%"),
    ("Return 7→8 Okt", f"={L(c0+1)}{sidx[D(2026,10,8)]}/{L(c0+1)}{sidx[D(2026,10,7)]}-1", "0.00%"),
    ("P/E 5 Okt", f"={L(c0+2)}{sidx[D(2026,10,5)]}", "0.00"),
    ("P/E 9 Okt", f"={L(c0+2)}{sidx[D(2026,10,9)]}", "0.00"),
    ("P/E 31 Des 2025", f"={L(c0+2)}{sidx[ye_d]}", "0.00"),
    ("P/E rata-rata 1 thn", f"=AVERAGE({L(c0+2)}{r0+1}:{L(c0+2)}{slast})", "0.00"),
    ("P/E min 1 thn", f"=MIN({L(c0+2)}{r0+1}:{L(c0+2)}{slast})", "0.00"),
    ("P/E maks 1 thn", f"=MAX({L(c0+2)}{r0+1}:{L(c0+2)}{slast})", "0.00"),
    ("Fwd EPS 5 Okt", f"={L(c0+3)}{sidx[D(2026,10,5)]}", "#,##0.0"),
    ("Fwd EPS 9 Okt", f"={L(c0+3)}{sidx[D(2026,10,9)]}", "#,##0.0"),
    ("Fwd EPS 31 Des 2025", f"={L(c0+3)}{sidx[ye_d]}", "#,##0.0"),
    ("Δ fwd EPS YTD", f"={L(c1+1)}{r0+14}/{L(c1+1)}{r0+15}-1", "0.0%"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c1, lab, BLACK)
    put(ws, r0 + 1 + i, c1 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [10, 16, 9, 3, 11, 11, 9, 13, 3, 20, 12])

# ---------------------------------------------------------------- Ex5 consumer
ws, r0 = sheet("Ex5_Consumer", "Exhibit 5 — Konsumen Indonesia: kondisi saat ini vs ekspektasi, dan penjualan eceran", [
    "Survei Konsumen BI, Tabel 1 (laporan Sep 2026, rilis 8 Okt 2026). Penjualan eceran: SPE Juli 2026 Tabel 2 (Jan 24–Jul 26) + siaran pers BI 9 Okt 2026 (Agu realisasi, Sep prakiraan).",
])
header(ws, r0, ["Bulan", "IKK", "IKE (kondisi saat ini)", "IEK (ekspektasi)", "Gap IEK−IKE", "Penghasilan saat ini", "Ketersediaan kerja", "Barang tahan lama", "Ekspektasi penghasilan", "Ekspektasi kerja", "Ekspektasi usaha"])
ikk = [127.2, 126.4, 121.1, 121.7, 117.5, 117.8, 118.1, 117.2, 115.0, 121.2, 124.0, 123.5, 127.0, 125.2, 122.9, 123.0, 120.9, 117.8, 116.8, 118.5, 118.1]
ike = [113.5, 114.2, 110.6, 113.7, 106.0, 106.7, 106.6, 105.1, 102.7, 109.1, 111.5, 111.4, 115.1, 115.9, 115.4, 116.5, 112.2, 109.2, 107.9, 109.4, 107.5]
iek = [140.8, 138.7, 131.7, 129.8, 129.0, 128.9, 129.6, 129.2, 127.2, 133.4, 136.6, 135.6, 138.8, 134.4, 130.4, 129.6, 129.7, 126.4, 125.7, 127.6, 128.7]
ipsi = [122.6, 122.7, 121.3, 125.4, 118.1, 120.2, 117.8, 116.9, 112.9, 117.1, 121.5, 120.2, 123.7, 125.0, 129.2, 128.1, 123.2, 119.8, 118.5, 118.0, 114.6]
iklk = [107.7, 106.2, 100.3, 101.6, 95.7, 94.1, 95.3, 93.2, 92.0, 102.6, 103.7, 106.5, 109.9, 110.7, 107.8, 108.8, 105.0, 101.8, 101.1, 104.1, 101.1]
ipdg = [110.3, 113.7, 110.2, 113.9, 104.1, 105.9, 106.6, 105.1, 103.2, 107.5, 109.4, 107.6, 111.8, 112.0, 109.2, 112.6, 108.3, 105.9, 104.1, 106.1, 106.7]
iep = [144.8, 143.3, 137.0, 137.5, 135.4, 133.2, 136.4, 136.7, 134.3, 138.4, 140.6, 140.8, 146.0, 140.7, 137.7, 136.9, 136.5, 133.6, 133.6, 134.9, 136.9]
ieklk = [137.0, 134.2, 125.9, 123.5, 123.8, 124.1, 125.0, 122.8, 123.1, 132.0, 135.3, 135.1, 135.1, 131.7, 128.0, 127.7, 128.1, 124.4, 123.1, 125.7, 127.7]
ieku = [140.7, 138.6, 132.2, 128.5, 127.8, 129.3, 127.5, 128.2, 124.2, 129.6, 133.8, 130.8, 135.3, 130.9, 125.5, 124.1, 124.5, 121.2, 120.4, 122.1, 121.5]
months = [D(2025, m, 1) for m in range(1, 13)] + [D(2026, m, 1) for m in range(1, 10)]
for i, m in enumerate(months):
    r = r0 + 1 + i
    put(ws, r, 1, m, BLUE, "mmm-yy")
    for j, arr in enumerate([ikk, ike, iek], 2):
        put(ws, r, j, arr[i], BLUE, "0.0")
    put(ws, r, 5, f"=D{r}-C{r}", BLACK, "0.0")
    for j, arr in enumerate([ipsi, iklk, ipdg, iep, ieklk, ieku], 6):
        put(ws, r, j, arr[i], BLUE, "0.0")
cl = r0 + len(months)
r25a, r25b = r0 + 1, r0 + 12
c0 = 13
ws.cell(r0, c0, "Ringkasan").font = BOLD
summ = [
    ("IKE Sep 2026", f"=C{cl}", "0.0"),
    ("IKE terendah 2026", f"=MIN(C{r25b+1}:C{cl})", "0.0"),
    ("IEK Sep 2026", f"=D{cl}", "0.0"),
    ("Gap IEK−IKE Sep 2026", f"=E{cl}", "0.0"),
    ("Gap rata-rata 2025", f"=AVERAGE(E{r25a}:E{r25b})", "0.0"),
    ("Penghasilan saat ini Sep 26", f"=F{cl}", "0.0"),
    ("Ketersediaan kerja Sep 26", f"=G{cl}", "0.0"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
# retail sales
rr = cl + 3
ws.cell(rr, 1, "Penjualan eceran — Indeks Penjualan Riil, pertumbuhan YoY (%)").font = BOLD
header(ws, rr + 1, ["Bulan", "IPR YoY (%)", "Status"])
ipr = [1.1, 6.4, 9.3, -2.7, 2.1, 2.7, 4.5, 5.8, 4.8, 1.5, 0.9, 1.8,
       0.5, 2.0, 5.5, -0.3, 1.9, 1.3, 4.7, 3.5, 3.7, 4.3, 6.3, 3.5,
       5.7, 6.5, 3.4, -3.7, -3.9, -3.0, 1.1, 1.3, 1.4]
rm = [D(2024, m, 1) for m in range(1, 13)] + [D(2025, m, 1) for m in range(1, 13)] + [D(2026, m, 1) for m in range(1, 10)]
for i, (m, v) in enumerate(zip(rm, ipr)):
    r = rr + 2 + i
    put(ws, r, 1, m, BLUE, "mmm-yy")
    put(ws, r, 2, v / 100, BLUE, "0.0%")
    status = "Prakiraan (rilis 9 Okt 2026)" if m == D(2026, 9, 1) else ("Realisasi (rilis 9 Okt 2026)" if m == D(2026, 8, 1) else "Realisasi")
    put(ws, r, 3, status, BLACK)
r25s, r25e = rr + 2 + 12, rr + 2 + 23
put(ws, rr + 1, c0, "Rata-rata YoY 2025", BLACK)
put(ws, rr + 1, c0 + 1, f"=AVERAGE(B{r25s}:B{r25e})", BLACK, "0.0%").fill = KEY
widths(ws, [10, 8, 12, 12, 11, 12, 12, 12, 12, 12, 12, 3, 26, 10])

# ---------------------------------------------------------------- Ex6 MXID valuation
ws, r0 = sheet("Ex6_MXID_Valuation", "Exhibit 6 — MSCI Indonesia 12m forward P/E vs rata-rata 10 tahun", [
    "Bloomberg BEst P/E (blended forward), mingguan 14 Okt 2016 – 9 Okt 2026 (TIM-8). Rata-rata & σ = populasi seluruh jendela 10 tahun.",
    "12 Okt 2026 tidak dipakai (estimasi sama dengan 9 Okt).",
])
names = ["MXID Index", "MXEF Index", "MXASJ Index", "MXIN Index", "MXCN Index"]
header(ws, r0, ["Date"] + [n.replace(" Index", "") for n in names] + ["Rata-rata MXID", "+1σ", "−1σ", "+2σ", "−2σ", "Z MXID", "MXID vs MXEF"])
pdates = sorted(d for d in S["MXID|MXID Index|dcol8"] if d <= D(2026, 10, 9))
first = r0 + 1
last = first + len(pdates) - 1
statc = 17
for i, d in enumerate(pdates):
    r = first + i
    put(ws, r, 1, d, BLUE, DATEF)
    for j, n in enumerate(names, 2):
        v = S[f"MXID|{n}|dcol8"].get(d)
        if v is not None:
            put(ws, r, j, v, BLUE, "0.00")
    put(ws, r, 7, f"=${L(statc+1)}${r0+1}", GREEN, "0.00")
    put(ws, r, 8, f"=${L(statc+1)}${r0+1}+${L(statc+1)}${r0+2}", BLACK, "0.00")
    put(ws, r, 9, f"=${L(statc+1)}${r0+1}-${L(statc+1)}${r0+2}", BLACK, "0.00")
    put(ws, r, 10, f"=${L(statc+1)}${r0+1}+2*${L(statc+1)}${r0+2}", BLACK, "0.00")
    put(ws, r, 11, f"=${L(statc+1)}${r0+1}-2*${L(statc+1)}${r0+2}", BLACK, "0.00")
    put(ws, r, 12, f"=(B{r}-${L(statc+1)}${r0+1})/${L(statc+1)}${r0+2}", BLACK, "0.00")
    put(ws, r, 13, f'=IF(AND(ISNUMBER(B{r}),ISNUMBER(C{r})),B{r}/C{r}-1,"")', BLACK, "0.0%")
summ = [
    ("Rata-rata 10 thn MXID", f"=AVERAGE(B{first}:B{last})", "0.00"),
    ("σ 10 thn MXID", f"=STDEVP(B{first}:B{last})", "0.00"),
    ("MXID P/E 9 Okt 2026", f"=B{last}", "0.00"),
    ("Z-score 9 Okt 2026", f"=L{last}", "0.00"),
    ("P/E terendah 10 thn", f"=MIN(B{first}:B{last})", "0.00"),
    ("Persentil 9 Okt", f"=PERCENTRANK(B{first}:B{last},B{last})", "0.0%"),
    ("Diskon vs MXEF 9 Okt", f"=M{last}", "0.0%"),
    ("Rata-rata 10 thn vs MXEF", f"=AVERAGE(M{first}:M{last})", "0.0%"),
]
for k, (lab, n) in enumerate([("Z MXEF", "C"), ("Z MXASJ", "D"), ("Z MXIN", "E"), ("Z MXCN", "F")]):
    summ.append((lab, f"=({n}{last}-AVERAGE({n}{first}:{n}{last}))/STDEVP({n}{first}:{n}{last})", "0.00"))
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, statc, lab, BLACK)
    put(ws, r0 + 1 + i, statc + 1, f, BLACK, fmt).fill = KEY
# price & implied EPS
pc = 21
header(ws, r0, ["Date (harga)", "MXID harga", "Implied fwd EPS"], pc)
px = S["MXID|Last Price|dcol2"]
pe = S["MXID|MXID Index|dcol8"]
pxd = [d for d in sorted(px) if d <= D(2026, 10, 9) and d >= D(2025, 6, 27)]
for i, d in enumerate(pxd):
    r = r0 + 1 + i
    put(ws, r, pc, d, BLUE, DATEF)
    put(ws, r, pc + 1, px[d], BLUE, "#,##0.00")
    if d in pe:
        put(ws, r, pc + 2, px[d] / pe[d], BLACK, "#,##0.0")  # value; P/E sits in col B by date
        ws.cell(r, pc + 2).value = f"={L(pc+1)}{r}/INDEX($B${first}:$B${last},MATCH({L(pc)}{r},$A${first}:$A${last},0))"
r_ye = r0 + 1 + pxd.index(D(2025, 12, 26))
r_last = r0 + len(pxd)
put(ws, r_last + 2, pc, "Harga MXID 26 Des 25 → 9 Okt 26", BLACK)
put(ws, r_last + 2, pc + 2, f"={L(pc+1)}{r_last}/{L(pc+1)}{r_ye}-1", BLACK, "0.0%").fill = KEY
put(ws, r_last + 3, pc, "Implied fwd EPS 26 Des 25 → 9 Okt 26", BLACK)
put(ws, r_last + 3, pc + 2, f"={L(pc+2)}{r_last}/{L(pc+2)}{r_ye}-1", BLACK, "0.0%").fill = KEY
widths(ws, [11, 8, 8, 8, 8, 8, 10, 7, 7, 7, 7, 8, 10, 3, 3, 3, 24, 9, 3, 3, 12, 11, 13])

# ---------------------------------------------------------------- SBN vs UST
ws, r0 = sheet("Data_SBN_UST_IDR", "Pendukung teks Indonesia — SBN 10Y vs UST 10Y, dan USD/IDR", [
    "SBN = Bloomberg GIDN10YR Index (berhenti 8 Okt). UST = US Treasury par yield 10Y. USD/IDR = Bloomberg USDIDR REGN Curncy.",
])
header(ws, r0, ["Date", "SBN 10Y (%)", "UST 10Y (%)", "Spread (bps)", "USD/IDR"])
sbn = S["SBN &IDR|GIDN10YR Index|dcol2"]
fx = S["SBN &IDR|USDIDR REGN Curncy|dcol2"]
dd = sorted(d for d in set(sbn) | set(fx) if D(2025, 12, 30) <= d <= D(2026, 10, 9))
ix = {}
for i, d in enumerate(dd):
    r = r0 + 1 + i
    ix[d] = r
    put(ws, r, 1, d, BLUE, DATEF)
    if d in sbn:
        put(ws, r, 2, sbn[d], BLUE, "0.000")
    if d in NOM:
        put(ws, r, 3, NOM[d], BLUE, "0.00")
    put(ws, r, 4, f'=IF(AND(ISNUMBER(B{r}),ISNUMBER(C{r})),(B{r}-C{r})*100,"")', BLACK, "0")
    if d in fx:
        put(ws, r, 5, fx[d], BLUE, "#,##0")
c0 = 7
summ = [
    ("Δ SBN 30 Jun→8 Okt (bps)", f"=(B{ix[D(2026,10,8)]}-B{ix[D(2026,6,30)]})*100", "0.0"),
    ("Δ UST 30 Jun→8 Okt (bps)", f"=(C{ix[D(2026,10,8)]}-C{ix[D(2026,6,30)]})*100", "0.0"),
    ("Δ SBN 5→8 Okt (bps)", f"=(B{ix[D(2026,10,8)]}-B{ix[D(2026,10,5)]})*100", "0.0"),
    ("Δ UST 5→8 Okt (bps)", f"=(C{ix[D(2026,10,8)]}-C{ix[D(2026,10,5)]})*100", "0.0"),
    ("Spread 30 Jun (bps)", f"=D{ix[D(2026,6,30)]}", "0"),
    ("Spread 8 Okt (bps)", f"=D{ix[D(2026,10,8)]}", "0"),
    ("USD/IDR 5 Okt", f"=E{ix[D(2026,10,5)]}", "#,##0"),
    ("USD/IDR 9 Okt", f"=E{ix[D(2026,10,9)]}", "#,##0"),
    ("Rupiah 5→9 Okt (+ = menguat)", f"=E{ix[D(2026,10,5)]}/E{ix[D(2026,10,9)]}-1", "0.00%"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 11, 11, 11, 10, 3, 30, 10])

# ---------------------------------------------------------------- Brent
ws, r0 = sheet("Data_Brent_WTI", "Pendukung teks Global — Brent & WTI (front month)", [
    "Bloomberg CO1 Comdty & CL1 COMB Comdty (TIM-8). 12 Okt = intraday, tidak dipakai.",
])
header(ws, r0, ["Date", "Brent (CO1)", "WTI (CL1)"])
b = S["Brent & WTI|CO1 Comdty|dcol2"]
w = S["Brent & WTI|CL1 COMB Comdty|dcol2"]
bd = sorted(d for d in set(b) | set(w) if D(2025, 12, 31) <= d <= D(2026, 10, 9))
bx = {}
for i, d in enumerate(bd):
    r = r0 + 1 + i
    bx[d] = r
    put(ws, r, 1, d, BLUE, DATEF)
    if d in b:
        put(ws, r, 2, b[d], BLUE, "0.00")
    if d in w:
        put(ws, r, 3, w[d], BLUE, "0.00")
c0 = 5
summ = [
    ("Brent 5→9 Okt", f"=B{bx[D(2026,10,9)]}/B{bx[D(2026,10,5)]}-1", "0.00%"),
    ("WTI 5→9 Okt", f"=C{bx[D(2026,10,9)]}/C{bx[D(2026,10,5)]}-1", "0.00%"),
    ("Brent 26 Feb 2026 (pra-perang)", f"=B{bx[D(2026,2,26)]}", "0.00"),
    ("Brent 9 Okt vs 26 Feb", f"=B{bx[D(2026,10,9)]}/B{bx[D(2026,2,26)]}-1", "0.0%"),
    ("Brent puncak 2026", f"=MAX(B{r0+1}:B{r0+len(bd)})", "0.00"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 11, 10, 3, 30, 10])


# ================================================================ TIM-9 additions
from load9 import load as load9
T9 = load9()

# ---------------------------------------------------------------- SOX P/E 10y
ws, r0 = sheet("Ex4b_SOX_PE_10y", "Pendukung Exhibit 4 — SOX BEst P/E (blended forward), mingguan 10 tahun", [
    "Bloomberg (TIM-9). Benchmark valuasi SOX 10 tahun dan 5 tahun. 12 Okt tidak dipakai (sama dengan 9 Okt).",
])
header(ws, r0, ["Date", "SOX BEst P/E"])
sp = {d: v for d, v in T9["BEST PE SOX|BEst P/E Ratio|dcol1"].items() if d <= D(2026, 10, 9)}
sd_ = sorted(sp)
for i, d in enumerate(sd_):
    put(ws, r0 + 1 + i, 1, d, BLUE, DATEF)
    put(ws, r0 + 1 + i, 2, sp[d], BLUE, "0.00")
f1, l1 = r0 + 1, r0 + len(sd_)
f5 = r0 + 1 + next(i for i, d in enumerate(sd_) if d > D(2021, 10, 9))
c0 = 4
summ = [
    ("P/E 9 Okt 2026", f"=B{l1}", "0.00"),
    ("Rata-rata 10 thn", f"=AVERAGE(B{f1}:B{l1})", "0.00"),
    ("σ 10 thn", f"=STDEVP(B{f1}:B{l1})", "0.00"),
    ("Z 10 thn", f"=(E{r0+1}-E{r0+2})/E{r0+3}", "0.00"),
    ("Persentil 10 thn", f"=PERCENTRANK(B{f1}:B{l1},B{l1})", "0%"),
    ("Rata-rata 5 thn", f"=AVERAGE(B{f5}:B{l1})", "0.00"),
    ("Z 5 thn", f"=(E{r0+1}-E{r0+6})/STDEVP(B{f5}:B{l1})", "0.00"),
    ("P/E maks 10 thn", f"=MAX(B{f1}:B{l1})", "0.00"),
    ("P/E min 10 thn", f"=MIN(B{f1}:B{l1})", "0.00"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 12, 3, 22, 10])

# ---------------------------------------------------------------- Asia chip stocks
ws, r0 = sheet("Data_Asia_Chips", "Pendukung US P1 — Samsung, SK hynix, TSMC (bursa lokal)", [
    "Bloomberg (TIM-9). Korea libur 5 & 9 Okt; Taiwan libur 9 Okt → dibiarkan kosong. 12 Okt = intraday, tidak dipakai.",
])
names9 = [("005930 KS Equity", "Samsung"), ("000660 KS Equity", "SK hynix"), ("2330 TT Equity", "TSMC (TW)")]
header(ws, r0, ["Date"] + [n for _, n in names9])
dset = sorted({d for t, _ in names9 for d in T9[f"KOR STOCKS|{t}|dcol1"] if D(2025, 12, 30) <= d <= D(2026, 10, 9)})
ax = {}
for i, d in enumerate(dset):
    r = r0 + 1 + i
    ax[d] = r
    put(ws, r, 1, d, BLUE, DATEF)
    for j, (t, _) in enumerate(names9, 2):
        v = T9[f"KOR STOCKS|{t}|dcol1"].get(d)
        if v is not None:
            put(ws, r, j, v, BLUE, "#,##0")
c0 = 6
summ = [
    ("Samsung 7→8 Okt (hari rilis)", f"=B{ax[D(2026,10,8)]}/B{ax[D(2026,10,7)]}-1", "0.00%"),
    ("Samsung 6→8 Okt", f"=B{ax[D(2026,10,8)]}/B{ax[D(2026,10,6)]}-1", "0.00%"),
    ("SK hynix 6→8 Okt", f"=C{ax[D(2026,10,8)]}/C{ax[D(2026,10,6)]}-1", "0.00%"),
    ("TSMC (TW) 5→8 Okt", f"=D{ax[D(2026,10,8)]}/D{ax[D(2026,10,5)]}-1", "0.00%"),
    ("Samsung YTD s.d. 8 Okt", f"=B{ax[D(2026,10,8)]}/B{r0+1}-1", "0.0%"),
    ("SK hynix YTD s.d. 8 Okt", f"=C{ax[D(2026,10,8)]}/C{r0+1}-1", "0.0%"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 11, 11, 11, 3, 28, 10])

# ---------------------------------------------------------------- JCI / LQ45
ws, r0 = sheet("Data_JCI_LQ45", "Pendukung Indonesia P3 — JCI & LQ45 harian", [
    "Bloomberg (TIM-9). Basis YTD = penutupan terakhir 2025 (30 Des 2025). 12 Okt (±13:30 WIB) = intraday, tidak dipakai.",
])
header(ws, r0, ["Date", "JCI", "LQ45"])
jc = T9["JCI & LQ45|JCI Index|dcol1"]; lq = T9["JCI & LQ45|LQ45 Index|dcol1"]
jd = sorted(d for d in jc if D(2025, 12, 30) <= d <= D(2026, 10, 9))
jx = {}
for i, d in enumerate(jd):
    r = r0 + 1 + i
    jx[d] = r
    put(ws, r, 1, d, BLUE, DATEF)
    put(ws, r, 2, jc[d], BLUE, "#,##0.00")
    if d in lq:
        put(ws, r, 3, lq[d], BLUE, "#,##0.00")
c0 = 5
summ = [
    ("JCI 5 Okt", f"=B{jx[D(2026,10,5)]}", "#,##0.00"),
    ("JCI 9 Okt", f"=B{jx[D(2026,10,9)]}", "#,##0.00"),
    ("JCI 5→9 Okt", f"=F{r0+2}/F{r0+1}-1", "0.00%"),
    ("JCI YTD (30 Des 25→9 Okt)", f"=F{r0+2}/B{jx[D(2025,12,30)]}-1", "0.00%"),
    ("LQ45 5→9 Okt", f"=C{jx[D(2026,10,9)]}/C{jx[D(2026,10,5)]}-1", "0.00%"),
    ("LQ45 YTD", f"=C{jx[D(2026,10,9)]}/C{jx[D(2025,12,30)]}-1", "0.00%"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, c0, lab, BLACK)
    put(ws, r0 + 1 + i, c0 + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 11, 10, 3, 28, 11])

# ---------------------------------------------------------------- Risk premia (reference chart)
ws, r0 = sheet("Ex6b_Risk_Premia", "Opsi Exhibit 6 — Premi risiko Indonesia: saham vs FX vs kredit (meniru chart Refinitiv)", [
    "Mingguan. Z-score P/E MXID & RR USD/IDR 1M 25D = jendela 10 thn (Okt 2016–Okt 2026). CDS 5Y hanya tersedia 5 thn (Okt 2021–) → z-score CDS jendela 5 thn.",
    "RR & CDS dikali −1 (seperti chart referensi): nilai positif = premi risiko lebih rendah dari rata-rata. Sumber: Bloomberg TIM-8 & TIM-9.",
])
header(ws, r0, ["Date", "MXID BEst P/E", "USD/IDR RR 1M 25D", "CDS Indo 5Y (bps)", "Z P/E (10y)", "Z RR ×−1 (10y)", "Z CDS ×−1 (5y)"])
mx = {d: v for d, v in S["MXID|MXID Index|dcol8"].items() if d <= D(2026, 10, 9)}
rr9 = {d: v for d, v in T9["USD IDR Risk Reversal|Last Price|dcol1"].items() if d <= D(2026, 10, 9)}
cd9 = {d: v for d, v in T9["CDS INDO 5Y|Last Price|dcol1"].items() if d <= D(2026, 10, 9)}
dd = sorted(set(mx) | set(rr9))
first = r0 + 1; last = r0 + len(dd)
sc = 9
for i, d in enumerate(dd):
    r = first + i
    put(ws, r, 1, d, BLUE, DATEF)
    if d in mx: put(ws, r, 2, mx[d], BLUE, "0.00")
    if d in rr9: put(ws, r, 3, rr9[d], BLUE, "0.000")
    if d in cd9: put(ws, r, 4, cd9[d], BLUE, "0.0")
    put(ws, r, 5, f'=IF(ISNUMBER(B{r}),(B{r}-$J${r0+1})/$J${r0+2},"")', BLACK, "0.00")
    put(ws, r, 6, f'=IF(ISNUMBER(C{r}),-(C{r}-$J${r0+3})/$J${r0+4},"")', BLACK, "0.00")
    put(ws, r, 7, f'=IF(ISNUMBER(D{r}),-(D{r}-$J${r0+5})/$J${r0+6},"")', BLACK, "0.00")
summ = [
    ("Rata-rata P/E 10y", f"=AVERAGE(B{first}:B{last})", "0.00"),
    ("σ P/E 10y", f"=STDEVP(B{first}:B{last})", "0.00"),
    ("Rata-rata RR 10y", f"=AVERAGE(C{first}:C{last})", "0.000"),
    ("σ RR 10y", f"=STDEVP(C{first}:C{last})", "0.000"),
    ("Rata-rata CDS 5y", f"=AVERAGE(D{first}:D{last})", "0.0"),
    ("σ CDS 5y", f"=STDEVP(D{first}:D{last})", "0.0"),
    ("Z P/E 9 Okt", f"=E{last}", "0.00"),
    ("Z RR ×−1 9 Okt", f"=F{last}", "0.00"),
    ("Z CDS ×−1 9 Okt", f"=G{last}", "0.00"),
    ("CDS 26 Des 2025", f"=INDEX(D{first}:D{last},MATCH(DATE(2025,12,26),A{first}:A{last},0))", "0.0"),
    ("CDS 9 Okt 2026", f"=D{last}", "0.0"),
]
for i, (lab, f, fmt) in enumerate(summ):
    put(ws, r0 + 1 + i, sc, lab, BLACK)
    put(ws, r0 + 1 + i, sc + 1, f, BLACK, fmt).fill = KEY
widths(ws, [11, 12, 14, 14, 11, 13, 13, 3, 20, 10])

# ---------------------------------------------------------------- ASEAN peers (price)
ws, r0 = sheet("Data_ASEAN_Peers", "Pendukung Indonesia P3 — kinerja harga MSCI ASEAN & negara (USD), mingguan", [
    "Bloomberg (TIM-9) — PX_LAST, BUKAN P/E. Valuasi peer ASEAN belum tersedia (perlu BEST_PE_RATIO). MXID harga dari TIM-8.",
])
pn = ["MXSO", "MXMY", "MXTH", "MXPH", "MXSG"]
header(ws, r0, ["Date", "MXID"] + pn)
pd = sorted(d for d in T9["PEER ASEAN|MXSO Index|dcol4"] if D(2025, 12, 26) <= d <= D(2026, 10, 9))
mxp = S["MXID|Last Price|dcol2"]
for i, d in enumerate(pd):
    r = r0 + 1 + i
    put(ws, r, 1, d, BLUE, DATEF)
    if d in mxp: put(ws, r, 2, mxp[d], BLUE, "#,##0.00")
    for j, n in enumerate(pn, 3):
        v = T9[f"PEER ASEAN|{n} Index|dcol4"].get(d)
        if v is not None: put(ws, r, j, v, BLUE, "#,##0.00")
lr = r0 + len(pd)
put(ws, lr + 2, 1, "YTD (26 Des 25 → 9 Okt 26)", BOLD)
for j in range(2, 3 + len(pn)):
    put(ws, lr + 2, j, f"={L(j)}{lr}/{L(j)}{r0+1}-1", BLACK, "0.0%").fill = KEY
widths(ws, [24, 10, 10, 10, 10, 10, 10])

wb.save(OUT)
print("saved", OUT)
