"""Deterministic text normalisation and sentence splitting."""
from __future__ import annotations

import hashlib
import html
import re
import unicodedata

_TAG = re.compile(r"<[^>]+>")
_WS = re.compile(r"\s+")
# Split on sentence punctuation followed by whitespace and an uppercase letter/digit/quote.
# Avoids splitting on common abbreviations and decimals ("U.S.", "2.4%").
_ABBREV = r"(?<!\bU\.S)(?<!\bMr)(?<!\bMs)(?<!\bDr)(?<!\bInc)(?<!\bCo)(?<!\bNo)(?<!\bvs)"
_SENT = re.compile(_ABBREV + r"(?<=[.!?])\s+(?=[\"'“A-Z0-9])")


def clean_text(text: str | None) -> str:
    if not text:
        return ""
    text = html.unescape(_TAG.sub(" ", text))
    text = unicodedata.normalize("NFKC", text)
    return _WS.sub(" ", text).strip()


def split_sentences(text: str) -> list[str]:
    text = clean_text(text)
    if not text:
        return []
    return [s.strip() for s in _SENT.split(text) if s.strip()]


def content_hash(*parts: str) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8"))
        h.update(b"\x1f")
    return h.hexdigest()
