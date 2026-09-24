"""Blind model comparison. Runs only after both predictions are stored.
Models are never averaged; disagreement is kept as information."""
from __future__ import annotations

from dataclasses import dataclass

from mie.core.enums import AgreementStatus, ManagementTone, Sentiment

NON_DIRECTIONAL = {Sentiment.UNCERTAIN, Sentiment.INSUFFICIENT_CONTEXT}
OPPOSITE = {frozenset({Sentiment.POSITIVE, Sentiment.NEGATIVE})}


@dataclass(frozen=True)
class Comparison:
    status: AgreementStatus
    review_required: bool


def compare(claude: Sentiment | None, finbert: Sentiment | None) -> Comparison:
    if claude is None and finbert is None:
        return Comparison(AgreementStatus.NOT_CLASSIFIED, False)
    if claude is None:
        return Comparison(AgreementStatus.FINBERT_ONLY, False)
    if finbert is None:
        return Comparison(AgreementStatus.CLAUDE_ONLY, False)
    if claude in NON_DIRECTIONAL:
        return Comparison(AgreementStatus.UNCERTAIN, False)
    if claude == finbert:
        return Comparison(AgreementStatus.AGREE, False)
    # Opposite polarity is a strong conflict and goes to an analyst.
    return Comparison(AgreementStatus.DISAGREE, frozenset({claude, finbert}) in OPPOSITE)


def tone_to_sentiment(tone: ManagementTone | str | None) -> Sentiment | None:
    """Maps Claude's finer management tone onto the space FinBERT can express."""
    if tone is None:
        return None
    tone = ManagementTone(tone)
    return {
        ManagementTone.POSITIVE: Sentiment.POSITIVE,
        ManagementTone.NEGATIVE: Sentiment.NEGATIVE,
        ManagementTone.NEUTRAL: Sentiment.NEUTRAL,
        ManagementTone.MIXED_POSITIVE: Sentiment.MIXED,
        ManagementTone.MIXED_NEGATIVE: Sentiment.MIXED,
        ManagementTone.NOT_APPLICABLE: None,
    }[tone]
