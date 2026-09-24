"""Local FinBERT (ProsusAI/finbert) sentence classifier — the challenger/control model.

* Runs locally; no text leaves the machine.
* English only. Other languages are not sent (FinBERT is not validated on them);
  an Indonesian model can be added behind the same `SentenceClassifier` protocol.
* Raw probabilities are stored for diagnostics and never used as weights.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Callable, Protocol, Sequence

from mie.core.enums import FinbertLabel, Sentiment

log = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {"en"}


@dataclass(frozen=True)
class SentencePrediction:
    label: FinbertLabel
    probabilities: dict[str, float]


class SentenceClassifier(Protocol):
    name: str
    version: str
    languages: set[str]

    def predict(self, texts: Sequence[str]) -> list[SentencePrediction]:
        ...


class FinbertUnavailable(RuntimeError):
    pass


class FinbertClassifier:
    languages = SUPPORTED_LANGUAGES

    def __init__(self, model_name: str = "ProsusAI/finbert", revision: str = "main",
                 pipeline_factory: Callable[..., Any] | None = None):
        self.name = model_name
        self.revision = revision
        self._factory = pipeline_factory
        self._pipe: Any = None
        self.version = f"{model_name}@{revision}"

    def load(self) -> None:
        if self._pipe is not None:
            return
        factory = self._factory
        if factory is None:
            try:
                from transformers import pipeline as factory  # optional dependency
            except ImportError as exc:
                raise FinbertUnavailable(
                    "transformers/torch not installed; `pip install -r requirements-ml.txt`") from exc
        try:
            self._pipe = factory("text-classification", model=self.name, revision=self.revision, top_k=None)
        except Exception as exc:  # network / cache failures surface as a clear skip reason
            raise FinbertUnavailable(f"could not load {self.name}: {exc}") from exc
        # Pin the exact weights actually loaded when the hub reports a commit hash.
        commit = getattr(getattr(getattr(self._pipe, "model", None), "config", None), "_commit_hash", None)
        if commit:
            self.version = f"{self.name}@{commit}"

    def predict(self, texts: Sequence[str]) -> list[SentencePrediction]:
        self.load()
        raw = self._pipe(list(texts), truncation=True)
        out = []
        for scores in raw:
            probs = {s["label"].upper(): float(s["score"]) for s in scores}
            label = max(probs, key=probs.get)
            out.append(SentencePrediction(FinbertLabel(label), probs))
        return out


def derive_event_label(labels: Sequence[FinbertLabel | str]) -> Sentiment | None:
    """Parameter-free aggregation of sentence labels within one layer of one event."""
    vals = {FinbertLabel(x) for x in labels}
    if not vals:
        return None
    pos, neg = FinbertLabel.POSITIVE in vals, FinbertLabel.NEGATIVE in vals
    if pos and neg:
        return Sentiment.MIXED
    if pos:
        return Sentiment.POSITIVE
    if neg:
        return Sentiment.NEGATIVE
    return Sentiment.NEUTRAL
