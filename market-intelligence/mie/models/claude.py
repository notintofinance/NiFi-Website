"""Claude event interpretation — constrained, structured, auditable.

Claude receives only EventBrief.model_payload(): source-blind, price-blind,
and without FinBERT's output. It returns categorical labels (no numeric scores)
and per-asset implications restricted to config/assets.yaml.

Refusal fallbacks to another model are deliberately NOT enabled: every stored
label must be attributable to the pinned model. A refusal is stored as status
REFUSED instead.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, ValidationError, field_validator

from mie.core.config import CONFIG_DIR
from mie.core.enums import ImpactHorizon, ManagementTone, Sentiment
from mie.models.briefing import EventBrief

log = logging.getLogger(__name__)

PROMPT_VERSION = "event-interpretation-v1"

SYSTEM_PROMPT = """You are a financial-markets analyst classifying one market event for an institutional research team.

You receive a JSON brief with: event_type, event_date, country, entities, computed_facts (numbers already calculated in code; do not recompute them), and statements grouped by information layer:
- factual_statements: what objectively happened, from official or primary releases.
- management_statements: commentary or forward-looking views from the issuer (company management, or central-bank/official communication).
- media_statements: how media describe the event.

Rules:
- Use only information in the brief. You do not know market prices or how markets reacted after the event, and you must not guess them.
- factual_sentiment: are the FACTUAL statements and computed facts favourable or unfavourable for the fundamentals of the event's primary subject (the company, or the economy the data describes)? This is not a price forecast. Use MIXED when material favourable and unfavourable facts coexist, UNCERTAIN when the direction genuinely cannot be judged, and INSUFFICIENT_CONTEXT when the brief is too thin.
- management_tone: the tone of management_statements only, or NOT_APPLICABLE if there are none.
- asset_implications: the plausible first-order direction for each materially affected asset, using only the allowed asset keys. Leave out assets with no material link. Direction describes likely pressure on the asset's price or value, based on the brief alone.
- Keep factors and rationales short, factual and specific to the brief. Do not give numeric scores or probabilities.
"""


def load_asset_universe(path: Path | None = None) -> dict[str, str]:
    return yaml.safe_load((path or CONFIG_DIR / "assets.yaml").read_text())["assets"]


Direction = Literal["POSITIVE", "NEGATIVE", "MIXED", "NEUTRAL", "UNCERTAIN"]


class AssetImplication(BaseModel):
    asset: str
    direction: Direction
    horizon: ImpactHorizon
    rationale: str


class ClaudeEventOutput(BaseModel):
    factual_sentiment: Sentiment
    management_tone: ManagementTone
    impact_horizon: ImpactHorizon
    key_positive_factors: list[str]
    key_negative_factors: list[str]
    asset_implications: list[AssetImplication]
    reasoning_summary: str

    @field_validator("asset_implications")
    @classmethod
    def _unique_assets(cls, v: list[AssetImplication]) -> list[AssetImplication]:
        assets = [a.asset for a in v]
        if len(assets) != len(set(assets)):
            raise ValueError("duplicate asset in implications")
        return v


def output_schema(asset_keys: list[str]) -> dict[str, Any]:
    def enum(values: list[str]) -> dict:
        return {"type": "string", "enum": values}

    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["factual_sentiment", "management_tone", "impact_horizon", "key_positive_factors",
                     "key_negative_factors", "asset_implications", "reasoning_summary"],
        "properties": {
            "factual_sentiment": enum([s.value for s in Sentiment]),
            "management_tone": enum([t.value for t in ManagementTone]),
            "impact_horizon": enum([h.value for h in ImpactHorizon]),
            "key_positive_factors": {"type": "array", "items": {"type": "string"}},
            "key_negative_factors": {"type": "array", "items": {"type": "string"}},
            "asset_implications": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["asset", "direction", "horizon", "rationale"],
                    "properties": {
                        "asset": enum(asset_keys),
                        "direction": enum(["POSITIVE", "NEGATIVE", "MIXED", "NEUTRAL", "UNCERTAIN"]),
                        "horizon": enum([h.value for h in ImpactHorizon]),
                        "rationale": {"type": "string"},
                    },
                },
            },
            "reasoning_summary": {"type": "string"},
        },
    }


@dataclass
class ClaudeResult:
    status: Literal["OK", "REFUSED", "INVALID"]
    output: ClaudeEventOutput | None
    raw: dict
    served_model: str | None
    input_tokens: int | None
    output_tokens: int | None
    error_message: str | None = None


class ClaudeUnavailable(RuntimeError):
    pass


class ClaudeClassifier:
    def __init__(self, model: str, effort: str | None = None, client: Any = None,
                 assets: dict[str, str] | None = None):
        self.model = model
        self.effort = effort
        self.assets = assets or load_asset_universe()
        self._client = client
        self.schema = output_schema(sorted(self.assets))

    @property
    def client(self) -> Any:
        if self._client is None:
            try:
                import anthropic
            except ImportError as exc:
                raise ClaudeUnavailable("anthropic SDK not installed") from exc
            self._client = anthropic.Anthropic()  # credentials from environment, never code
        return self._client

    def build_user_message(self, brief: EventBrief) -> str:
        return (
            "Allowed asset keys:\n" + json.dumps(self.assets, sort_keys=True) +
            "\n\nEvent brief:\n" + json.dumps(brief.model_payload(), sort_keys=True, ensure_ascii=False, indent=1)
        )

    def classify(self, brief: EventBrief) -> ClaudeResult:
        output_config: dict[str, Any] = {"format": {"type": "json_schema", "schema": self.schema}}
        if self.effort:
            output_config["effort"] = self.effort
        response = self.client.messages.create(
            model=self.model,
            max_tokens=16000,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": self.build_user_message(brief)}],
            output_config=output_config,
        )
        usage = getattr(response, "usage", None)
        common = dict(served_model=getattr(response, "model", None),
                      input_tokens=getattr(usage, "input_tokens", None),
                      output_tokens=getattr(usage, "output_tokens", None))
        if response.stop_reason == "refusal":
            details = getattr(response, "stop_details", None)
            return ClaudeResult("REFUSED", None, {"stop_details": str(details)}, **common,
                                error_message="model declined the request")
        if response.stop_reason == "max_tokens":
            return ClaudeResult("INVALID", None, {}, **common, error_message="truncated at max_tokens")
        text = next((b.text for b in response.content if getattr(b, "type", None) == "text"), "")
        try:
            raw = json.loads(text)
            parsed = ClaudeEventOutput.model_validate(raw)
        except (json.JSONDecodeError, ValidationError) as exc:
            return ClaudeResult("INVALID", None, {"text": text[:5000]}, **common, error_message=str(exc)[:2000])
        unknown = [a.asset for a in parsed.asset_implications if a.asset not in self.assets]
        if unknown:
            return ClaudeResult("INVALID", None, raw, **common, error_message=f"unknown assets {unknown}")
        return ClaudeResult("OK", parsed, raw, **common)
