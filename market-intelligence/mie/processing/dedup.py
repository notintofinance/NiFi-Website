"""Event deduplication for text documents.

Two stages keep this cheap and explainable, and neither uses an LLM:
  1. Hard constraints (no parameters to tune): same event type, entity overlap
     when both sides have entities, and not a structured (natural-key) event.
  2. Within the time window, lexical cosine similarity against every supporting
     document of each candidate event; attach to the best match >= threshold.

The window and threshold are UNCALIBRATED config values. `calibrate_threshold`
derives the threshold from labelled document pairs; see ARCHITECTURE.md §10.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Protocol, Sequence

import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer


class SimilarityBackend(Protocol):
    name: str

    def similarities(self, query: str, candidates: Sequence[str]) -> list[float]:
        ...


class LexicalCosine:
    """Stateless hashed word 1–2-gram TF vectors, L2-normalised. Identical inputs give
    identical scores on every run and machine (no fitted vocabulary)."""

    name = "LEXICAL_COSINE_V1"

    def __init__(self) -> None:
        self._vec = HashingVectorizer(
            ngram_range=(1, 2), stop_words="english", alternate_sign=False, norm="l2", n_features=2**18
        )

    def similarities(self, query: str, candidates: Sequence[str]) -> list[float]:
        if not candidates:
            return []
        m = self._vec.transform([query, *candidates])
        return [float(x) for x in (m[1:] @ m[0].T).toarray().ravel()]


@dataclass(frozen=True)
class CandidateEvent:
    event_id: int
    event_type: str
    event_time: datetime
    entity_keys: frozenset[str]
    document_texts: tuple[str, ...]


@dataclass(frozen=True)
class DedupDecision:
    event_id: int | None      # None -> open a new event
    similarity: float | None  # best observed score among eligible candidates
    method: str


def passes_hard_constraints(event_type: str, entity_keys: frozenset[str], when: datetime,
                            cand: CandidateEvent, window: timedelta) -> bool:
    if cand.event_type != event_type:
        return False
    if abs(cand.event_time - when) > window:
        return False
    if entity_keys and cand.entity_keys and not (entity_keys & cand.entity_keys):
        return False
    return True


def decide(text: str, event_type: str, entity_keys: frozenset[str], when: datetime,
           candidates: Sequence[CandidateEvent], backend: SimilarityBackend,
           threshold: float, window: timedelta) -> DedupDecision:
    best_id, best_score = None, None
    for cand in candidates:
        if not passes_hard_constraints(event_type, entity_keys, when, cand, window):
            continue
        score = max(backend.similarities(text, cand.document_texts), default=0.0)
        # Deterministic tie-break: earlier event id wins.
        if best_score is None or score > best_score or (score == best_score and cand.event_id < best_id):
            best_id, best_score = cand.event_id, score
    if best_score is not None and best_score >= threshold:
        return DedupDecision(best_id, best_score, backend.name)
    return DedupDecision(None, best_score, "NEW_EVENT")


def calibrate_threshold(scores: Sequence[float], same_event: Sequence[bool]) -> dict:
    """Pick the threshold that maximises F1 on labelled pairs (use the dev split only;
    report the result on validation). Ties go to the higher threshold, which is the
    conservative side (fewer false merges)."""
    s = np.asarray(scores, dtype=float)
    y = np.asarray(same_event, dtype=bool)
    if len(s) == 0 or y.sum() == 0:
        raise ValueError("need at least one positive labelled pair")
    best: dict | None = None
    for t in np.unique(s):
        pred = s >= t
        tp = int((pred & y).sum())
        fp = int((pred & ~y).sum())
        fn = int((~pred & y).sum())
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        if best is None or f1 > best["f1"] or (f1 == best["f1"] and t > best["threshold"]):
            best = {"threshold": float(t), "precision": precision, "recall": recall, "f1": f1}
    assert best is not None
    best["n_pairs"] = int(len(s))
    best["n_positive"] = int(y.sum())
    return best
