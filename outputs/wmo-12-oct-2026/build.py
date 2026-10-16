"""Build WMO 12 October 2026 from the (AG) 5 Oct deck. usage: build.py OUT.pptx"""
import copy, csv, datetime as dt, os, re, shutil, statistics as st, sys, zipfile
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "tim8"))
import charts as C
from content import PAGES, GLOSSARY, DATE
from load import load
from load9 import load as load9

SRC = "/Users/agatbe/Downloads/(AG) WMO - 5 Oktober 2026.pptx"
OUT = sys.argv[1]
W = os.path.join(HERE, "work")
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
P = "http://schemas.openxmlformats.org/presentationml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PR = "http://schemas.openxmlformats.org/package/2006/relationships"
q = lambda ns, t: "{%s}%s" % (ns, t)
D = dt.date
E = 914400

# ------------------------------------------------------------------ unpack + drop reviewer comments
shutil.rmtree(W, ignore_errors=True)
with zipfile.ZipFile(SRC) as z:
    z.extractall(W)
for i in (1, 2, 3):
    rp = f"{W}/ppt/slides/_rels/slide{i}.xml.rels"
    t = etree.parse(rp)
    for rel in list(t.getroot()):
        if rel.get("Type").endswith("/comments"):
            t.getroot().remove(rel)
    t.write(rp, xml_declaration=True, encoding="UTF-8", standalone=True)
shutil.rmtree(f"{W}/ppt/comments", ignore_errors=True)
ct_path = f"{W}/[Content_Types].xml"
ct = open(ct_path, encoding="utf-8").read()
ct = re.sub(r'<Override PartName="/ppt/comments/comment\d+\.xml"[^>]*/>', "", ct)

# ------------------------------------------------------------------ text helpers
TOKEN = re.compile(r"(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*[^*]+?\*)")


def glue(s):
    s = re.sub(r"(\d) (miliar|triliun|juta|bps|bp|poin|tahun|kali|barel)\b", "\\1\u00a0\\2", s)
    s = re.sub(r"\b(USD|Rp) (\d)", "\\1\u00a0\\2", s)
    s = re.sub(r"Exhibit (\d)", "Exhibit\u00a0\\1", s)
    s = re.sub(r"(\d{1,2}) (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b", "\\1\u00a0\\2", s)
    s = re.sub(r"\b(rata|berturut|benar)-(rata|turut|benar)\b", "\\1\u2011\\2", s)
    s = re.sub(r"(\d,\d\d?)–(\d,\d\d?)", "\\1\u2011\\2", s)
    s = re.sub(r"\bQ(\d)-(\d\d)\b", "Q\\1\u2011\\2", s)
    s = s.replace("BI-Rate", "BI\u2011Rate")
    return s


def clean_rpr(rpr):
    rpr = copy.deepcopy(rpr)
    for att in ("err", "smtClean", "noProof"):
        rpr.attrib.pop(att, None)
    rpr.set("dirty", "0")
    return rpr


def make_runs(markup, base, force_bold=False, strip_fill=False):
    if strip_fill:
        base = copy.deepcopy(base)
        for f in base.findall(q(A, "solidFill")):
            base.remove(f)
    runs = []
    for part in TOKEN.split(glue(markup)):
        if not part:
            continue
        b = i = False
        if part.startswith("***"):
            part, b, i = part[3:-3], True, True
        elif part.startswith("**"):
            part, b = part[2:-2], True
        elif part.startswith("*"):
            part, i = part[1:-1], True
        r = etree.Element(q(A, "r"))
        rp = clean_rpr(base)
        rp.set("b", "1" if (b or force_bold) else "0")
        rp.set("i", "1" if i else "0")
        r.append(rp)
        t = etree.SubElement(r, q(A, "t"))
        t.text = part
        if part != part.strip():
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        runs.append(r)
    return runs


def set_runs(p, runs):
    for ch in list(p):
        if ch.tag in (q(A, "r"), q(A, "br"), q(A, "fld")):
            p.remove(ch)
    end = p.find(q(A, "endParaRPr"))
    for r in runs:
        if end is not None:
            end.addprevious(r)
        else:
            p.append(r)


def regular_rpr(p):
    for r in p.findall(q(A, "r")):
        rp = r.find(q(A, "rPr"))
        if rp is not None and rp.get("b") != "1" and rp.get("i") != "1":
            return rp
    return p.find(q(A, "r")).find(q(A, "rPr"))


def text(sp):
    return "".join(t.text or "" for t in sp.iter(q(A, "t")))


def xy(sp):
    for x in sp.iter(q(A, "xfrm"), q(P, "xfrm")):
        o = x.find(q(A, "off"))
        if o is not None:
            return int(o.get("x")), int(o.get("y"))
    return 0, 0


def set_plain(sp, s):
    p = sp.find(f".//{{{A}}}p")
    base = p.find(q(A, "r")).find(q(A, "rPr"))
    r = etree.Element(q(A, "r"))
    r.append(clean_rpr(base))
    etree.SubElement(r, q(A, "t")).text = s
    set_runs(p, [r])
    for extra in sp.findall(f".//{{{A}}}p")[1:]:
        extra.getparent().remove(extra)


# ------------------------------------------------------------------ slides 1-3 text
for n, spec in PAGES.items():
    path = f"{W}/ppt/slides/slide{n}.xml"
    t = etree.parse(path)
    tree = t.getroot().find(q(P, "cSld")).find(q(P, "spTree"))
    sps = [s for s in tree.iter(q(P, "sp"))]
    name = lambda s: s.find(f".//{{{P}}}cNvPr").get("name")
    date_tab = [s for s in sps if name(s) == "Date Tab"][0]
    set_plain(date_tab, DATE)
    title = [s for s in sps if xy(s)[1] == 1584960 or (name(s) == "TextBox 18" and abs(xy(s)[1] / E - 1.73) < 0.02)][0]
    set_plain(title, spec["title"])
    box = [s for s in sps if name(s) == "TextBox 14"][0]
    bp = box.find(f".//{{{A}}}p")
    set_runs(bp, make_runs(spec["box"], bp.find(q(A, "r")).find(q(A, "rPr")), force_bold=True))
    kh = [s for s in sps if text(s).startswith("Key Highlights")][0]
    paras = kh.findall(f".//{{{A}}}p")
    for k, mk in enumerate(spec["paras"], 1):
        set_runs(paras[k], make_runs(mk, regular_rpr(paras[k]), strip_fill=True))
    exs = sorted([s for s in sps if text(s).startswith("Exhibit")], key=lambda s: xy(s)[0])
    for s, v in zip(exs, spec["ex"]):
        set_plain(s, v)
    srcs = sorted([s for s in sps if text(s).startswith("Source")], key=lambda s: xy(s)[0])
    for s, v in zip(srcs, spec["src"]):
        set_plain(s, v)
    t.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)

# ------------------------------------------------------------------ slides 4-6 date tab, glossary
for n in (4, 5, 6):
    path = f"{W}/ppt/slides/slide{n}.xml"
    t = etree.parse(path)
    for s in t.iter(q(P, "sp")):
        if s.find(f".//{{{P}}}cNvPr").get("name") == "Date Tab" or text(s).strip() == "5 October 2026":
            set_plain(s, DATE)
    if n == 6:
        g = [s for s in t.iter(q(P, "sp")) if text(s).startswith("Glossary")][0]
        ps = g.findall(f".//{{{A}}}p")
        assert len(ps) - 1 == len(GLOSSARY), (len(ps), len(GLOSSARY))
        for p, mk in zip(ps[1:], GLOSSARY):
            set_runs(p, make_runs(mk, regular_rpr(p)))
        src_sp = [s for s in t.iter(q(P, "sp")) if text(s).startswith("SOURCE")][0]
        sp_p = src_sp.find(f".//{{{A}}}p")
        rr = sp_p.findall(q(A, "r"))
        keep, tail = rr[0], rr[1]
        for r_ in rr[2:]:
            sp_p.remove(r_)
        tail.find(q(A, "t")).text = (" Economic Banking & Industry Research of BCA Group, Bloomberg, Reuters, Bank Indonesia, "
                                     "Kemenkeu, Kontan")
    t.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)

# ------------------------------------------------------------------ data
S = load()
T9 = load9()
A9 = D(2026, 10, 2)
B9 = D(2026, 10, 9)


def at(s, d):
    ks = [x for x in s if x <= d]
    return s[max(ks)]


def write_chart(k, xml, header, rows, date_col=True):
    open(f"{W}/ppt/charts/chart{k}.xml", "w", encoding="utf-8").write(xml)
    C.workbook(f"{W}/ppt/embeddings/Microsoft_Excel_Worksheet{k}.xlsx", header, rows, date_col)


# Ex1 BIDY
bidy = S["BIDY|Last Price|dcol2"]
bd = sorted(d for d in bidy if d <= B9)
bv = [bidy[d] for d in bd]
i_feb = bd.index(D(2026, 2, 27))
xml = C.line_chart(bd, [("BIDY", bv, C.BLUE, 22225, "solid", [(i_feb, -0.02, -0.10), (len(bd) - 1, -0.11, 0.02)], "#,##0")],
                   0, 9000, 2000, "#,##0", "mmm-yy", 2, "months", (0.11, 0.06, 0.86, 0.74), show_legend=False)
write_chart(1, xml, ["Date", "BIDY"], zip(bd, bv))

# Ex2 gold (top) + real yield (bottom)
real = {}
for f in (os.path.join(HERE, "..", "ag", "ry2025.csv"), os.path.join(HERE, "..", "ag", "daily_treasury_real_yield_curve.csv")):
    for row in csv.DictReader(open(f)):
        real[dt.datetime.strptime(row["Date"], "%m/%d/%Y").date()] = float(row["10 YR"])
xau = S["XAU|Last Price|dcol2"]
gd = sorted(d for d in xau if D(2025, 12, 31) <= d <= B9 and d in real)
gv = [xau[d] for d in gd]
rv = [real[d] for d in gd]
last2 = len(gd) - 1
xml = C.dual_line_chart(gd, ("Gold (USD/oz, L)", gv, C.ORANGE, [(last2, -0.07, 0.09)], "#,##0"),
                        ("UST 10YR real yield (%, R)", rv, C.BLUE, [(last2, -0.1, 0.07)], "0.00"),
                        (3600, 5600, 400, "#,##0"), (1.0, 3.5, 0.5, "0.0"), "mmm-yy", 2, "months",
                        (0.12, 0.15, 0.76, 0.67), leg_h=0.12)
write_chart(2, xml, ["Date", "Gold (USD/oz, L)", "UST 10YR real yield (%, R)"], zip(gd, gv, rv))

# Ex3 AI value chain WoW
groups = [("Power", ["CEG", "VST"]), ("Software", ["IGV", "PLTR"]), ("Hyperscalers", ["MSFT", "AMZN", "GOOGL", "META", "ORCL"]),
          ("Networking/servers", ["ANET", "DELL", "MRVL"]), ("GPU/logic", ["NVDA", "AMD", "AVGO", "ARM", "INTC"]),
          ("Foundry/equipment", ["TSM", "ASML", "AMAT", "LRCX", "KLAC"]), ("Memory/storage", ["MU", "SNDK", "STX", "WDC"])]


def wow(s):
    return (at(s, B9) / at(s, A9) - 1) * 100


rows = []
for g, tks in groups:
    vals = [wow(S[[k for k in S if k.startswith(f"US STOCKS|{t} ") and "Volume" not in k][0]]) for t in tks]
    rows.append((g, round(st.mean(vals), 2), "grp"))
rows.append(("S&P 500", round(wow(S["SPX, SPW, CCMP, RTY|SPX Index|dcol2"]), 2), "ref"))
rows.append(("SOX", round(wow(S["SOX|Last Price|dcol2"]), 2), "ref"))
rows.sort(key=lambda r: -r[1])
cols = [C.GREY if k == "ref" else (C.BLUE if v >= 0 else C.ORANGE) for _, v, k in rows]
xml = C.hbar_chart([r[0] for r in rows], [r[1] for r in rows], cols, -10, 20, 5, "0.00", (0.27, 0.02, 0.6, 0.86))
write_chart(3, xml, ["Group", "WoW return (%)"], [(r[0], r[1]) for r in rows], date_col=False)
EX3 = rows

# Ex4 SOX forward P/E, weekly 10Y with bands (TIM-9)
spw = {d: v for d, v in T9["BEST PE SOX|BEst P/E Ratio|dcol1"].items() if d <= B9}
sdts = sorted(spw)
sv = [spw[d] for d in sdts]
m4, s4 = st.mean(sv), st.pstdev(sv)
n4 = len(sdts)
ser4 = [("Fwd P/E", sv, C.BLUE, 19050, "solid", [(n4 - 1, -0.08, -0.12)], "0.0"),
        ("10Y average", [round(m4, 2)] * n4, C.NAVY, 12700, "dash", [], "0.0"),
        ("±1σ", [round(m4 + s4, 2)] * n4, C.GREY, 12700, "dash", [], "0.0"),
        ("−1σ", [round(m4 - s4, 2)] * n4, C.GREY, 12700, "dash", [], "0.0"),
        ("±2σ", [round(m4 + 2 * s4, 2)] * n4, C.ORANGE, 12700, "sysDot", [], "0.0"),
        ("−2σ", [round(m4 - 2 * s4, 2)] * n4, C.ORANGE, 12700, "sysDot", [], "0.0")]
xml = C.line_chart(sdts, ser4, 0, 50, 10, "0", "yyyy", 2, "years", (0.08, 0.16, 0.88, 0.66))
xml = xml.replace('<c:legendPos val="t"/>', '<c:legendPos val="t"/><c:legendEntry><c:idx val="3"/><c:delete val="1"/></c:legendEntry>'
                  '<c:legendEntry><c:idx val="5"/><c:delete val="1"/></c:legendEntry>')
write_chart(4, xml, ["Date", "Fwd P/E", "10Y average", "+1σ", "−1σ", "+2σ", "−2σ"],
            [(d, v, round(m4, 2), round(m4 + s4, 2), round(m4 - s4, 2), round(m4 + 2 * s4, 2), round(m4 - 2 * s4, 2)) for d, v in zip(sdts, sv)])
print("Ex4 SOX PE mean/sd", round(m4, 2), round(s4, 2), "last", sv[-1])

# Ex5 MBG monthly spending (bars) vs retail sales growth (line)
# cumulative realisation, Rp tn: Jan-Aug = government data via Republika (18 Sep 2026); Sep = APBN KiTa (9 Oct 2026)
mbg_cum = [19.55, 38.97, 55.34, 75.0, 88.15, 101.0, 117.33, 134.19, 153.2]
mbg_m = [round(b_ - a_, 2) for a_, b_ in zip([0] + mbg_cum[:-1], mbg_cum)]
# retail sales (IPR) % YoY: Jan-Jul = BI SPE Jul 2026 Tabel 2; Aug realisasi & Sep prakiraan = BI 9 Oct 2026
ipr = [5.7, 6.5, 3.4, -3.7, -3.9, -3.0, 1.1, 1.3, 1.4]
cats5 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep*"]
xml = C.bar_line_combo(cats5, "MBG spending (IDR tn, L)", mbg_m, "Retail sales (% YoY, R)", ipr,
                       (0, 25, 5, "0"), (-6, 9, 3, "0"), (0.08, 0.17, 0.82, 0.66), line_labels=[(8, 0.0, 0.12)])
write_chart(5, xml, ["Month 2026", "MBG spending (IDR tn)", "Retail sales (% YoY)"], zip(cats5, mbg_m, ipr), date_col=False)
print("Ex5 MBG monthly", mbg_m)

# Ex6 MXID forward P/E with 10Y bands
pe = S["MXID|MXID Index|dcol8"]
pdts = sorted(d for d in pe if d <= B9)
pv6 = [pe[d] for d in pdts]
m, s = st.mean(pv6), st.pstdev(pv6)
nn = len(pdts)
ser6 = [("Fwd P/E", pv6, C.BLUE, 19050, "solid", [(nn - 1, -0.08, 0.08)], "0.0"),
        ("10Y average", [round(m, 2)] * nn, C.NAVY, 12700, "dash", [], "0.0"),
        ("±1σ", [round(m + s, 2)] * nn, C.GREY, 12700, "dash", [], "0.0"),
        ("−1σ", [round(m - s, 2)] * nn, C.GREY, 12700, "dash", [], "0.0"),
        ("±2σ", [round(m + 2 * s, 2)] * nn, C.ORANGE, 12700, "sysDot", [], "0.0"),
        ("−2σ", [round(m - 2 * s, 2)] * nn, C.ORANGE, 12700, "sysDot", [], "0.0")]
xml = C.line_chart(pdts, ser6, 6, 26, 4, "0", "yyyy", 2, "years", (0.08, 0.16, 0.88, 0.66))
xml = xml.replace('<c:legendPos val="t"/>', '<c:legendPos val="t"/><c:legendEntry><c:idx val="3"/><c:delete val="1"/></c:legendEntry>'
                  '<c:legendEntry><c:idx val="5"/><c:delete val="1"/></c:legendEntry>')
write_chart(6, xml, ["Date", "Fwd P/E", "10Y average", "+1σ", "−1σ", "+2σ", "−2σ"],
            [(d, v, round(m, 2), round(m + s, 2), round(m - s, 2), round(m + 2 * s, 2), round(m - 2 * s, 2)) for d, v in zip(pdts, pv6)])

open(ct_path, "w", encoding="utf-8").write(ct)

# ------------------------------------------------------------------ zip ([Content_Types] first)
if os.path.exists(OUT):
    os.remove(OUT)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.write(ct_path, "[Content_Types].xml")
    for base, _, files in os.walk(W):
        for f in sorted(files):
            full = os.path.join(base, f)
            arc = os.path.relpath(full, W)
            if arc != "[Content_Types].xml":
                z.write(full, arc)
print("built", OUT)
print("EX3", EX3)
print("Ex6 mean/sd", round(m, 2), round(s, 2), "last", pv6[-1])
