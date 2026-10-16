"""Apply why_text.NEW to the user's latest deck; write a NEW pptx (never touches the source).

usage: why_edit.py <src.pptx> <out.pptx>
"""
import copy, os, re, shutil, sys, zipfile
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B
from tomarkup import kh_paras, markup
from why_text import NEW, HOOK

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"


def glue(s):
    s = re.sub(r"(\d) (miliar|triliun|ribu|bps|bulan|tahun)", "\\1\u00a0\\2", s)
    s = re.sub(r"\b(rata|satu|buru|benar)-(rata|satunya|buru|benar)\b", "\\1\u2011\\2", s)
    s = s.replace("BI-Rate", "BI\u2011Rate")
    return re.sub(r"\b(USD|Rp) (\d)", "\\1\u00a0\\2", s)


def base_rpr(p):
    for r in p.findall(A + "r"):
        rpr = r.find(A + "rPr")
        if rpr is not None and rpr.get("b") != "1" and rpr.get("i") != "1":
            return rpr
    return p.find(A + "r").find(A + "rPr")


def main(src, out):
    work = os.path.join(HERE, "why_build")
    shutil.rmtree(work, ignore_errors=True)
    with zipfile.ZipFile(src) as z:
        z.extractall(work)
    for sl in sorted({k[0] for k in NEW}):
        path = os.path.join(work, "ppt", "slides", f"slide{sl}.xml")
        tree = etree.parse(path)
        _, paras = kh_paras(tree)
        for (s, k), new in NEW.items():
            if s != sl:
                continue
            p = paras[k]
            old, _ = markup(p)
            assert old.startswith("***" + HOOK[(s, k)]), (s, k, old[:60])
            runs = B.make_runs(glue(new), base_rpr(p))
            B.replace_para_runs(p, runs)
            print(f"slide {s} para {k}: {len(old)} -> {len(new)} chars")
        tree.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)
    B.zip_dir(work, out)
    print("wrote", out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
