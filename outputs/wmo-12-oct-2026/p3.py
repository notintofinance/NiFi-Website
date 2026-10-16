"""Rewrite page 3 (Indonesia) text of the user's FiXeD deck; every other part stays as-is.
usage: p3.py OUT.pptx   Markup: *italic*, **bold**, ***bold-italic***."""
import copy, os, re, shutil, sys, zipfile
from lxml import etree

SRC = "/Users/agatbe/BCA Internship/WMO - 12 Oktober FiXeD.pptx"
OUT = sys.argv[1]
W = os.path.join(os.path.dirname(os.path.abspath(__file__)), "work")
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
P = "http://schemas.openxmlformats.org/presentationml/2006/main"
q = lambda ns, t: "{%s}%s" % (ns, t)

BOX = ("Lonjakan biaya energi kini membebani APBN: subsidi dan kompensasi energi per September 2026 sudah melampaui alokasi awalnya, sementara anggaran MBG dipangkas. Di tengah konsumsi yang melemah, IHSG kini turun 31,64% YTD meski valuasinya sudah murah.")

PARAS = [
    "***The State Absorbs the Fuel Bill.*** Lonjakan biaya energi global kini membebani APBN: per September 2026, subsidi dan kompensasi energi mencapai Rp376,8 triliun, naik 54,1% YoY dan sudah melampaui alokasi awal APBN 2026 sebesar Rp338,0 triliun. Pasalnya, rata-rata ICP semester I 2026 mencapai USD 91,87 per barel dan rupiah Rp17.197 per USD, jauh di atas asumsi APBN (USD 70 dan Rp16.500). Pemerintah pun memproyeksikan kebutuhan setahun penuh mencapai Rp525,9 triliun. Namun, defisit APBN masih terjaga di 1,24% PDB per September 2026. Hal ini mengindikasikan beban energi belum terlihat pada defisit, melainkan pada belanja lain yang harus menyesuaikan.",

    "***Less Room on the Plate.*** Salah satu pos yang terkena efisiensi adalah MBG: pagu efektif BGN turun ke Rp229,0 triliun dari Rp268,0 triliun, dan penerima turun dari 63,3 juta pada Juni 2026 ke 57,0 juta setelah 1.276 SPPG ditutup karena belum bersertifikat higiene. Belanja MBG September 2026 memang masih Rp19,0 triliun, namun belum diikuti pemulihan konsumsi: penjualan eceran September 2026 diperkirakan hanya tumbuh 1,4% YoY, di bawah rata-rata 2025 sebesar 3,1% **(Exhibit 5)**, dan Indeks Kondisi Ekonomi Saat Ini turun ke 107,5, terendah sepanjang 2026. Dengan demikian, ruang fiskal untuk menopang konsumsi kian sempit saat daya beli rumah tangga melemah.",

    "***Discount Without a Trigger.*** Per 13 Oktober 2026, IHSG turun 3,00% ke 5.911,17 dari penutupan pekan lalu, atau 31,64% YTD. Pasalnya, MSCI membekukan perubahan indeks Indonesia sejak Januari 2026 dan memperpanjang *review* hingga November 2026 dengan risiko *downgrade* ke *frontier market*, seiring jual bersih asing sekitar Rp85,0 triliun YTD. Valuasi tertekan: *forward* P/E IHSG turun dari 16,4x awal 2026, setara rata-rata 10 tahunnya, ke 10,1x atau −1,79σ **(Exhibit 6)**, sementara MSCI Indonesia 38,89% di bawah MSCI ASEAN. Secara teori, diskon sedalam ini seharusnya menarik pembeli. Namun, dengan status MSCI yang belum pasti, APBN yang tertekan subsidi, dan konsumsi yang belum pulih, murah belum menjadi katalis: arah IHSG lebih ditentukan hasil *review* MSCI daripada valuasi.",
]

TOKEN = re.compile(r"(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*[^*]+?\*)")


def glue(s):
    s = re.sub(r"(\d) (miliar|triliun|juta|bps|bp|poin|tahun|kali|barel)\b", "\\1\u00a0\\2", s)
    s = re.sub(r"\b(USD|Rp) (\d)", "\\1\u00a0\\2", s)
    s = re.sub(r"Exhibit (\d)", "Exhibit\u00a0\\1", s)
    s = re.sub(r"(\d{1,2}) (Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b", "\\1\u00a0\\2", s)
    s = re.sub(r"\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember) (20\d\d)\b", "\\1\u00a0\\2", s)
    s = re.sub(r"\b(rata|berturut|benar)-(rata|turut|benar)\b", "\\1\u2011\\2", s)
    s = re.sub(r"(\d,\d\d?)–(\d,\d\d?)", "\\1\u2011\\2", s)
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


shutil.rmtree(W, ignore_errors=True)
with zipfile.ZipFile(SRC) as z:
    names = z.namelist()
    z.extractall(W)

path = f"{W}/ppt/slides/slide3.xml"
t = etree.parse(path)
sps = list(t.getroot().iter(q(P, "sp")))
box = [s for s in sps if text(s).startswith("IHSG naik 0,94% WoW seiring")]
assert len(box) == 1
bp = box[0].find(f".//{{{A}}}p")
set_runs(bp, make_runs(BOX, bp.find(q(A, "r")).find(q(A, "rPr")), force_bold=True))
kh = [s for s in sps if text(s).startswith("Key Highlights")]
assert len(kh) == 1
paras = kh[0].findall(f".//{{{A}}}p")
assert len(paras) == 4, len(paras)
for k, mk in enumerate(PARAS, 1):
    set_runs(paras[k], make_runs(mk, regular_rpr(paras[k]), strip_fill=True))
t.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)

# ---- Exhibit 6: JCI (IHSG) 12M forward P/E vs 10Y average, weekly, TIM-10 (Bloomberg), cut at 9 Oct 2026 (WoW basis)
import datetime as dt, statistics as st, openpyxl
sys.path.insert(0, "/private/tmp/claude-501/-Users-agatbe-Claude-Project-Claude-Vibecode--NiFi-/b8153928-d619-410b-b47e-368ae717bd05/scratchpad/deck")
import charts as C
TIM10 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tim10_in", "TIM - 10.xlsx")
ws = openpyxl.load_workbook(TIM10, data_only=True).active
pe = sorted((r[3].date(), float(r[4])) for r in ws.iter_rows(min_row=2, values_only=True)
            if isinstance(r[3], dt.datetime) and r[4] is not None and r[3].date() <= dt.date(2026, 10, 9))
pdts = [d for d, _ in pe]; pv = [v for _, v in pe]
m, sd = st.mean(pv), st.pstdev(pv); nn = len(pv)
ser = [("Fwd P/E", pv, C.BLUE, 19050, "solid", [(nn - 1, -0.08, 0.08)], "0.0"),
       ("10Y average", [round(m, 2)] * nn, C.NAVY, 12700, "dash", [], "0.0"),
       ("±1σ", [round(m + sd, 2)] * nn, C.GREY, 12700, "dash", [], "0.0"),
       ("−1σ", [round(m - sd, 2)] * nn, C.GREY, 12700, "dash", [], "0.0"),
       ("±2σ", [round(m + 2 * sd, 2)] * nn, C.ORANGE, 12700, "sysDot", [], "0.0"),
       ("−2σ", [round(m - 2 * sd, 2)] * nn, C.ORANGE, 12700, "sysDot", [], "0.0")]
xml = C.line_chart(pdts, ser, 5, 35, 5, "0", "yyyy", 2, "years", (0.08, 0.16, 0.88, 0.66))
xml = xml.replace('<c:legendPos val="t"/>', '<c:legendPos val="t"/><c:legendEntry><c:idx val="3"/><c:delete val="1"/></c:legendEntry>'
                  '<c:legendEntry><c:idx val="5"/><c:delete val="1"/></c:legendEntry>')
open(f"{W}/ppt/charts/chart6.xml", "w", encoding="utf-8").write(xml)
C.workbook(f"{W}/ppt/embeddings/Microsoft_Excel_Worksheet5.xlsx", ["Date", "Fwd P/E", "10Y average", "+1σ", "−1σ", "+2σ", "−2σ"],
           [(d, v, round(m, 2), round(m + sd, 2), round(m - sd, 2), round(m + 2 * sd, 2), round(m - 2 * sd, 2)) for d, v in zip(pdts, pv)])
print("Ex6 JCI PE n", nn, "first", pe[0], "last", pe[-1], "mean", round(m, 3), "sd", round(sd, 3), "z", round((pv[-1] - m) / sd, 3),
      "2 Jan 2026", dict(pe).get(dt.date(2026, 1, 2)))
t = etree.parse(path)
ex6 = [s_ for s_ in t.getroot().iter(q(P, "sp")) if text(s_).startswith("Exhibit 6:")]
assert len(ex6) == 1
p0 = ex6[0].find(f".//{{{A}}}p")
r0 = p0.find(q(A, "r"))
for r_ in p0.findall(q(A, "r"))[1:]:
    p0.remove(r_)
r0.find(q(A, "t")).text = "Exhibit 6: JCI 12M Forward P/E vs. 10Y Average (x)"
t.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.write(f"{W}/[Content_Types].xml", "[Content_Types].xml")
    for n in names:
        if n != "[Content_Types].xml" and not n.endswith("/"):
            z.write(f"{W}/{n}", n)
print("built", OUT)
