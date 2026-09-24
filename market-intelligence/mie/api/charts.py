"""Server-rendered SVG charts for the History page (no JavaScript chart library).

Design rules applied:
* one y-axis per chart: breadth (−100…+100) and event counts are separate charts;
* point-in-time is the emphasised series, restated is gray context;
* missing values break the line (no interpolation, no zero-filling);
* colours come from CSS classes, so light/dark themes apply;
* every day has a hover target carrying the exact values (the table below
  the charts remains the accessible view).
"""
from __future__ import annotations

from html import escape

W, PAD_L, PAD_R, PAD_T, PAD_B = 960, 44, 104, 14, 26


def _x(i: int, n: int) -> float:
    inner = W - PAD_L - PAD_R
    return PAD_L + (inner * i / (n - 1) if n > 1 else inner / 2)


def _segments(points: list[tuple[float, float] | None]) -> list[list[tuple[float, float]]]:
    segs, cur = [], []
    for p in points:
        if p is None:
            if cur:
                segs.append(cur)
            cur = []
        else:
            cur.append(p)
    if cur:
        segs.append(cur)
    return segs


def _tip(row: dict) -> str:
    p, r = row["point_in_time"], row["restated"]

    def fmt(b):
        return "n/a" if b["breadth_scaled"] is None else f"{b['breadth_scaled']:+d}".replace("+0", "0")

    return (f"{row['t'][:10]} · Point-in-time {fmt(p)} (n={p['total_classified']}) · "
            f"Restated {fmt(r)} (n={r['total_classified']}) · "
            f"P {p['positive']} · N {p['neutral']} · Mix {p['mixed']} · Neg {p['negative']}")


def _x_labels(rows: list[dict], h: int) -> str:
    n = len(rows)
    idx = sorted({0, n - 1, *range(0, n, max(1, n // 5))})
    return "".join(f'<text class="ax" x="{_x(i, n):.1f}" y="{h - 6}" text-anchor="middle">{escape(rows[i]["t"][5:10])}</text>'
                   for i in idx if i < n)


def _hits(rows: list[dict], h: int) -> str:
    n = len(rows)
    step = (W - PAD_L - PAD_R) / max(n - 1, 1)
    out = []
    for i, row in enumerate(rows):
        x = _x(i, n) - step / 2
        out.append(f'<rect class="hit" x="{x:.1f}" y="{PAD_T}" width="{step:.1f}" height="{h - PAD_T - PAD_B}" '
                   f'data-x="{_x(i, n):.1f}" data-tip="{escape(_tip(row))}"></rect>')
    return "".join(out)


def breadth_line_chart(rows: list[dict], h: int = 240) -> str:
    n = len(rows)
    if n == 0:
        return ""
    inner_h = h - PAD_T - PAD_B

    def y(v: int) -> float:
        return PAD_T + inner_h * (100 - v) / 200

    grid = "".join(
        f'<line class="{"base" if v == 0 else "grid"}" x1="{PAD_L}" x2="{W - PAD_R}" y1="{y(v):.1f}" y2="{y(v):.1f}"/>'
        f'<text class="ax" x="{PAD_L - 6}" y="{y(v) + 4:.1f}" text-anchor="end">{v:+d}</text>'.replace(">+0<", ">0<")
        for v in (100, 50, 0, -50, -100))
    series_svg, labels = [], []
    for key, cls, label in (("restated", "s-restated", "Restated"), ("point_in_time", "s-pit", "Point-in-time")):
        pts = [None if r[key]["breadth_scaled"] is None else (_x(i, n), y(r[key]["breadth_scaled"]))
               for i, r in enumerate(rows)]
        for seg in _segments(pts):
            if len(seg) == 1:
                series_svg.append(f'<circle class="{cls} dot" cx="{seg[0][0]:.1f}" cy="{seg[0][1]:.1f}" r="4"/>')
            else:
                d = "M" + " L".join(f"{px:.1f},{py:.1f}" for px, py in seg)
                series_svg.append(f'<path class="{cls}" d="{d}"/>')
        last = next((p for p in reversed(pts) if p is not None), None)
        if last:
            labels.append((last[1], cls, label))
    # Direct labels at the right edge; nudge apart if they would collide.
    labels.sort()
    placed, prev_y = [], -1e9
    for ly, cls, label in labels:
        ly = max(ly, prev_y + 14)
        placed.append(f'<text class="lbl {cls}-t" x="{W - PAD_R + 8}" y="{ly + 4:.1f}">{label}</text>')
        prev_y = ly
    return (f'<svg class="chart" viewBox="0 0 {W} {h}" role="img" '
            f'aria-label="Daily breadth, point-in-time and restated; exact values in the table below">'
            f'{grid}{"".join(series_svg)}{"".join(placed)}{_x_labels(rows, h)}'
            f'<line class="xhair" x1="0" x2="0" y1="{PAD_T}" y2="{h - PAD_B}"/>{_hits(rows, h)}</svg>')


def composition_chart(rows: list[dict], h: int = 170) -> str:
    """Point-in-time classified events per day, stacked by label."""
    n = len(rows)
    if n == 0:
        return ""
    inner_h = h - PAD_T - PAD_B
    top = max((r["point_in_time"]["total_classified"] for r in rows), default=0)
    top = max(top, 1)
    step = (W - PAD_L - PAD_R) / max(n - 1, 1)
    bw = max(min(step * 0.7, 28), 3)
    ticks = sorted({0, top} | ({(top + 1) // 2} if top >= 2 else set()))
    grid = "".join(
        f'<line class="{"base" if v == 0 else "grid"}" x1="{PAD_L}" x2="{W - PAD_R}" '
        f'y1="{PAD_T + inner_h * (1 - v / top):.1f}" y2="{PAD_T + inner_h * (1 - v / top):.1f}"/>'
        f'<text class="ax" x="{PAD_L - 6}" y="{PAD_T + inner_h * (1 - v / top) + 4:.1f}" text-anchor="end">{v}</text>'
        for v in ticks)
    bars = []
    for i, r in enumerate(rows):
        p = r["point_in_time"]
        y0 = PAD_T + inner_h
        for key, cls in (("positive", "c-pos"), ("neutral", "c-neu"), ("mixed", "c-mix"), ("negative", "c-neg")):
            v = p[key]
            if not v:
                continue
            hh = inner_h * v / top
            y0 -= hh
            bars.append(f'<rect class="{cls} seg" x="{_x(i, n) - bw / 2:.1f}" y="{y0:.1f}" '
                        f'width="{bw:.1f}" height="{hh:.1f}"/>')
    return (f'<svg class="chart" viewBox="0 0 {W} {h}" role="img" '
            f'aria-label="Classified events per day by label; exact counts in the table below">'
            f'{grid}{"".join(bars)}{_x_labels(rows, h)}'
            f'<line class="xhair" x1="0" x2="0" y1="{PAD_T}" y2="{h - PAD_B}"/>{_hits(rows, h)}</svg>')
