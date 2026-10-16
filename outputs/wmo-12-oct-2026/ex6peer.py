"""Exhibit 6 = MSCI Indonesia vs MSCI ASEAN & MSCI EM 12M forward P/E; 10Y mean / ±1σ / ±2σ bands for Indonesia only.
Base: FiXeD (Indonesia v2), whose page 3 text matches the user's current paragraph. usage: ex6peer.py OUT.pptx"""
import datetime as dt, os, shutil, statistics as st, sys, zipfile
from lxml import etree
sys.path.insert(0, "/private/tmp/claude-501/-Users-agatbe-Claude-Project-Claude-Vibecode--NiFi-/b8153928-d619-410b-b47e-368ae717bd05/scratchpad/deck")
import charts as C
import openpyxl

SRC = "/Users/agatbe/BCA Internship/WMO - 12 Oktober FiXeD (Indonesia v2).pptx"
DATA = "/Users/agatbe/BCA Internship/WMO 12 Oktober 2026 - Data Olahan (lengkap).xlsx"
OUT = sys.argv[1]
W = os.path.join(os.path.dirname(os.path.abspath(__file__)), "work6")
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
P = "http://schemas.openxmlformats.org/presentationml/2006/main"
q = lambda ns, t: "{%s}%s" % (ns, t)
END = dt.date(2026, 10, 9)

# weekly BEst P/E (Bloomberg TIM-8 / TIM-9-2), sheet Ex6c_Peer_PE: Date | Indonesia | ... | ASEAN (AC) | ... | EM | ...
ws = openpyxl.load_workbook(DATA, data_only=True, read_only=True)["Ex6c_Peer_PE"]
rows = list(ws.iter_rows(values_only=True))
hdr = list(rows[4])
ci, ca, ce = hdr.index("Indonesia"), hdr.index("ASEAN (AC)"), hdr.index("EM")
data = sorted((r[0].date(), float(r[ci]), float(r[ca]), float(r[ce])) for r in rows[5:]
              if isinstance(r[0], dt.datetime) and r[0].date() <= END)
dts = [d[0] for d in data]
idn, asean, em = [d[1] for d in data], [d[2] for d in data], [d[3] for d in data]
m, sd = st.mean(idn), st.pstdev(idn)
n = len(dts)
band = lambda v: [round(v, 2)] * n
ser = [("Indonesia", idn, C.BLUE, 28575, "solid", [(n - 1, 0.0, 0.045)], "0.0"),
       ("ASEAN", asean, C.ORANGE, 15875, "solid", [(n - 1, 0.0, -0.012)], "0.0"),
       ("EM", em, "7F7F7F", 15875, "solid", [(n - 1, 0.0, 0.0)], "0.0"),
       ("10Y avg (ID)", band(m), C.NAVY, 12700, "dash", [], "0.0"),
       ("±1σ (ID)", band(m + sd), C.NAVY, 9525, "sysDash", [], "0.0"),
       ("−1σ (ID)", band(m - sd), C.NAVY, 9525, "sysDash", [], "0.0"),
       ("±2σ (ID)", band(m + 2 * sd), C.NAVY, 9525, "sysDot", [], "0.0"),
       ("−2σ (ID)", band(m - 2 * sd), C.NAVY, 9525, "sysDot", [], "0.0")]
xml = C.line_chart(dts, ser, 6, 26, 4, "0", "yyyy", 2, "years", (0.08, 0.25, 0.79, 0.57), leg_h=0.22)
xml = xml.replace('<c:dLblPos val="t"/>', '<c:dLblPos val="r"/>')
xml = xml.replace('<c:legendPos val="t"/>', '<c:legendPos val="t"/><c:legendEntry><c:idx val="5"/><c:delete val="1"/></c:legendEntry>'
                  '<c:legendEntry><c:idx val="7"/><c:delete val="1"/></c:legendEntry>')

shutil.rmtree(W, ignore_errors=True)
with zipfile.ZipFile(SRC) as z:
    names = z.namelist()
    z.extractall(W)
open(f"{W}/ppt/charts/chart6.xml", "w", encoding="utf-8").write(xml)
C.workbook(f"{W}/ppt/embeddings/Microsoft_Excel_Worksheet5.xlsx",
           ["Date", "MSCI Indonesia", "MSCI ASEAN", "MSCI EM", "Indonesia 10Y avg", "+1σ", "−1σ", "+2σ", "−2σ"],
           [(d, a, b, c, round(m, 2), round(m + sd, 2), round(m - sd, 2), round(m + 2 * sd, 2), round(m - 2 * sd, 2))
            for d, a, b, c in data])


def text(sp):
    return "".join(t.text or "" for t in sp.iter(q(A, "t")))


def set_first_run(sp, s):
    p0 = sp.find(f".//{{{A}}}p")
    r0 = p0.find(q(A, "r"))
    for r_ in p0.findall(q(A, "r"))[1:]:
        p0.remove(r_)
    r0.find(q(A, "t")).text = s


path = f"{W}/ppt/slides/slide3.xml"
t = etree.parse(path)
sps = list(t.getroot().iter(q(P, "sp")))
title = [s for s in sps if text(s).startswith("Exhibit 6:")]
src = [s for s in sps if text(s).startswith("Source: Bloomberg (9 October 2026); bands")]
assert len(title) == 1 and len(src) == 1, (len(title), len(src))
set_first_run(title[0], "Exhibit 6: MSCI Indonesia vs. Peers 12M Forward P/E (x)")
set_first_run(src[0], "Source: Bloomberg (9 October 2026); σ bands = Indonesia only")
t.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.write(f"{W}/[Content_Types].xml", "[Content_Types].xml")
    for nm in names:
        if nm != "[Content_Types].xml" and not nm.endswith("/"):
            z.write(f"{W}/{nm}", nm)

s26 = [d for d in data if d[0] == dt.date(2026, 1, 2)][0]
print("built", OUT, "| n", n, dts[0], dts[-1])
print(f"ID mean {m:.2f} sd {sd:.2f} z {(idn[-1]-m)/sd:.2f} | last ID {idn[-1]:.2f} ASEAN {asean[-1]:.2f} EM {em[-1]:.2f}")
print("2 Jan 2026 ID/ASEAN/EM", s26[1:], "| 10Y avg ASEAN", round(st.mean(asean), 2), "EM", round(st.mean(em), 2))
print(f"ID vs ASEAN now {idn[-1]/asean[-1]-1:.4f} avg {st.mean([a/b-1 for a,b in zip(idn,asean)]):.4f} | "
      f"ID vs EM now {idn[-1]/em[-1]-1:.4f} avg {st.mean([a/b-1 for a,b in zip(idn,em)]):.4f}")
