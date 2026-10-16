#!/usr/bin/env python3
"""
Publish the engine's full "Market Today" page as one self-contained HTML file
into this website at  public/market-today/index.html .

The website is static, so this takes a point-in-time snapshot of the live
dashboard page: it inlines the CSS and neutralises internal links (which would
otherwise 404 on the public site). Re-run it whenever you want to refresh the
figures, then commit + push.

Prerequisite: the engine dashboard must be running locally:
    cd /Users/agatbe/market-intelligence-engine && source .venv/bin/activate
    python -m mie.cli serve            # http://127.0.0.1:8000

Then, from anywhere:
    python3 "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)/scripts/publish-market-today.py"
"""
import datetime
import pathlib
import re
import sys
import urllib.request

ENGINE = "http://127.0.0.1:8000"
PAGE = "/markets?lang=en"  # the "Market Today" overview, in English
SITE = pathlib.Path(__file__).resolve().parent.parent
OUT = SITE / "public" / "market-today" / "index.html"


def fetch(path: str) -> str:
    req = urllib.request.Request(ENGINE + path, headers={"User-Agent": "nifi-publish"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def main() -> None:
    try:
        html = fetch(PAGE)
    except Exception as e:  # noqa: BLE001
        sys.exit(
            f"Could not reach the engine at {ENGINE}{PAGE} ({e}).\n"
            "Start it first:  python -m mie.cli serve"
        )

    # 1) Inline every stylesheet so the page needs no /static assets.
    for m in re.finditer(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>', html):
        tag, href = m.group(0), m.group(1)
        try:
            css = fetch(href if href.startswith("/") else "/" + href)
        except Exception:  # noqa: BLE001
            continue
        html = html.replace(tag, f"<style>\n{css}\n</style>")

    # 2) Neutralise internal navigation (would 404 on the static site). Keep
    #    external links (http...) and in-page anchors (#...).
    html = re.sub(r'href="/(?!/)[^"]*"', 'href="#"', html)
    html = re.sub(r'action="/[^"]*"', 'action="#"', html)

    # 3) Tiny provenance note so viewers know it is a snapshot.
    stamp = datetime.datetime.now().strftime("%d %b %Y, %H:%M")
    note = (
        f'<div style="position:fixed;bottom:8px;right:10px;z-index:9999;'
        f'font:11px system-ui;opacity:.6;color:#9aa">Snapshot · {stamp}</div>'
    )
    html = html.replace("</body>", note + "</body>")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT}  ({len(html):,} bytes)")


if __name__ == "__main__":
    main()
