"""Claude tasks: constrained, structured, auditable.

Two tasks share one structured-call helper:
  * EventInterpreter (ClaudeClassifier) – event sentiment, management tone,
    per-asset implications. Input: EventBrief.model_payload() only.
  * EventTyper – proposes an event type for events the deterministic rules left
    as OTHER. Input: the event's statements only.

Both are source-blind and price-blind, and never see FinBERT output. They
return categorical labels only; numeric scores are rejected by the schema.

The static instructions, label definitions and asset universe are all in the
system prompt, so the request prefix is byte-identical across events (cacheable)
and the user turn holds only the event. Caching engages only once the prefix
reaches the model's minimum cacheable length. Below that it is a harmless
no-op, so check usage.cache_read_input_tokens before counting on savings.

Refusal fallbacks to another model are deliberately NOT enabled: every stored
label must be attributable to the pinned model. A refusal is stored as REFUSED.
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
from mie.core.enums import EventType, ImpactHorizon, ManagementTone, Sentiment
from mie.models.briefing import EventBrief

log = logging.getLogger(__name__)

PROMPT_VERSION = "event-interpretation-v2"
TYPING_PROMPT_VERSION = "event-typing-v1"
Status = Literal["OK", "REFUSED", "INVALID"]


def load_asset_universe(path: Path | None = None) -> dict[str, str]:
    return yaml.safe_load((path or CONFIG_DIR / "assets.yaml").read_text())["assets"]


def _enum(values: list[str]) -> dict:
    return {"type": "string", "enum": values}


# ----------------------------------------------------------------------------- shared call
@dataclass
class ClaudeResult:
    status: Status
    output: Any | None          # validated pydantic model when OK
    raw: dict
    served_model: str | None
    input_tokens: int | None
    output_tokens: int | None
    error_message: str | None = None
    cache_read_input_tokens: int | None = None


class ClaudeUnavailable(RuntimeError):
    pass


class StructuredClaudeCall:
    """One request -> schema-constrained JSON -> pydantic validation. Never retries
    on content: a refusal or invalid output is returned as data to be stored."""

    def __init__(self, model: str, effort: str | None = None, client: Any = None, max_tokens: int = 16000):
        self.model = model
        self.effort = effort
        self.max_tokens = max_tokens
        self._client = client

    @property
    def client(self) -> Any:
        if self._client is None:
            try:
                import anthropic
            except ImportError as exc:
                raise ClaudeUnavailable("anthropic SDK not installed") from exc
            self._client = anthropic.Anthropic()  # credentials from environment, never code
        return self._client

    def request_params(self, system: str, user: str, schema: dict) -> dict[str, Any]:
        output_config: dict[str, Any] = {"format": {"type": "json_schema", "schema": schema}}
        if self.effort:
            output_config["effort"] = self.effort
        return dict(
            model=self.model,
            max_tokens=self.max_tokens,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user}],
            output_config=output_config,
        )

    def run(self, system: str, user: str, schema: dict, model_cls: type[BaseModel]) -> ClaudeResult:
        response = self.client.messages.create(**self.request_params(system, user, schema))
        usage = getattr(response, "usage", None)
        common = dict(served_model=getattr(response, "model", None),
                      input_tokens=getattr(usage, "input_tokens", None),
                      output_tokens=getattr(usage, "output_tokens", None),
                      cache_read_input_tokens=getattr(usage, "cache_read_input_tokens", None))
        if response.stop_reason == "refusal":
            details = getattr(response, "stop_details", None)
            return ClaudeResult("REFUSED", None, {"stop_details": str(details)}, **common,
                                error_message="model declined the request")
        if response.stop_reason == "max_tokens":
            return ClaudeResult("INVALID", None, {}, **common, error_message="truncated at max_tokens")
        text = next((b.text for b in response.content if getattr(b, "type", None) == "text"), "")
        try:
            raw = json.loads(text)
            parsed = model_cls.model_validate(raw)
        except (json.JSONDecodeError, ValidationError) as exc:
            return ClaudeResult("INVALID", None, {"text": text[:5000]}, **common, error_message=str(exc)[:2000])
        return ClaudeResult("OK", parsed, raw, **common)


def api_error_policy(exc: Exception) -> tuple[Literal["stop", "continue"], str]:
    """How a stage reacts to an API exception. Stop on problems that will hit every
    following request (auth, permissions, rate limit), continue past per-request ones.
    The SDK has already retried connection errors, 408/409/429 and 5xx twice."""
    if isinstance(exc, (TypeError, ClaudeUnavailable)):
        # e.g. no credentials could be resolved: every following request would fail too.
        return "stop", "client_misconfigured"
    try:
        import anthropic
    except ImportError:
        return "continue", "api_error"
    if isinstance(exc, (anthropic.AuthenticationError, anthropic.PermissionDeniedError)):
        return "stop", "auth_error"
    if isinstance(exc, anthropic.RateLimitError):
        return "stop", "rate_limited"
    if isinstance(exc, anthropic.BadRequestError):
        return "continue", "bad_request"
    if isinstance(exc, anthropic.APIConnectionError):
        return "continue", "connection_error"
    if isinstance(exc, anthropic.APIStatusError):
        return "continue", f"api_status_{exc.status_code}"
    return "continue", "api_error"


# ----------------------------------------------------------------------------- interpretation
INTERPRETATION_INSTRUCTIONS = """You are a financial-markets analyst classifying one market event for an institutional research team.

Each user message is a JSON brief with: event_type, event_date, country, entities, computed_facts (numbers already calculated in code; do not recompute them), and statements grouped by information layer:
- factual_statements: what objectively happened, from official or primary releases.
- management_statements: commentary or forward-looking views from the issuer (company management, or central-bank/official communication).
- media_statements: how media describe the event.

Rules:
- Use only information in the brief. You do not know market prices or how markets reacted after the event, and you must not guess them.
- factual_sentiment: are the FACTUAL statements and computed facts favourable or unfavourable for the fundamentals of the event's primary subject (the company, or the economy the data describes)? This is not a price forecast. Use MIXED when material favourable and unfavourable facts coexist, UNCERTAIN when the direction genuinely cannot be judged, and INSUFFICIENT_CONTEXT when the brief is too thin.
- management_tone: the tone of management_statements only, or NOT_APPLICABLE if there are none.
- asset_implications: the plausible first-order direction for each materially affected asset, using only the asset keys listed below. Leave out assets with no material link; leaving an asset out is not a NEUTRAL call. Direction describes likely pressure on the asset's price or value, based on the brief alone.
- Keep factors and rationales short, factual and specific to the brief. Do not give numeric scores or probabilities.
"""


def interpretation_system_prompt(assets: dict[str, str]) -> str:
    lines = "\n".join(f"- {k}: {v}" for k, v in sorted(assets.items()))
    return f"{INTERPRETATION_INSTRUCTIONS}\nAllowed asset keys:\n{lines}\n"


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
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["factual_sentiment", "management_tone", "impact_horizon", "key_positive_factors",
                     "key_negative_factors", "asset_implications", "reasoning_summary"],
        "properties": {
            "factual_sentiment": _enum([s.value for s in Sentiment]),
            "management_tone": _enum([t.value for t in ManagementTone]),
            "impact_horizon": _enum([h.value for h in ImpactHorizon]),
            "key_positive_factors": {"type": "array", "items": {"type": "string"}},
            "key_negative_factors": {"type": "array", "items": {"type": "string"}},
            "asset_implications": {
                "type": "array",
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["asset", "direction", "horizon", "rationale"],
                    "properties": {
                        "asset": _enum(asset_keys),
                        "direction": _enum(["POSITIVE", "NEGATIVE", "MIXED", "NEUTRAL", "UNCERTAIN"]),
                        "horizon": _enum([h.value for h in ImpactHorizon]),
                        "rationale": {"type": "string"},
                    },
                },
            },
            "reasoning_summary": {"type": "string"},
        },
    }


class ClaudeClassifier:
    """Event interpretation."""

    prompt_version = PROMPT_VERSION

    def __init__(self, model: str, effort: str | None = None, client: Any = None,
                 assets: dict[str, str] | None = None):
        self.call = StructuredClaudeCall(model, effort, client)
        self.assets = assets or load_asset_universe()
        self.schema = output_schema(sorted(self.assets))
        self.system_prompt = interpretation_system_prompt(self.assets)

    @property
    def model(self) -> str:
        return self.call.model

    @property
    def effort(self) -> str | None:
        return self.call.effort

    def build_user_message(self, brief: EventBrief) -> str:
        return json.dumps(brief.model_payload(), sort_keys=True, ensure_ascii=False, indent=1)

    def request_params(self, brief: EventBrief) -> dict[str, Any]:
        """Exactly what classify() would send. Used by the pre-flight preview."""
        return self.call.request_params(self.system_prompt, self.build_user_message(brief), self.schema)

    def classify(self, brief: EventBrief) -> ClaudeResult:
        result = self.call.run(self.system_prompt, self.build_user_message(brief), self.schema, ClaudeEventOutput)
        if result.status == "OK":
            unknown = [a.asset for a in result.output.asset_implications if a.asset not in self.assets]
            if unknown:
                return ClaudeResult("INVALID", None, result.raw, result.served_model, result.input_tokens,
                                    result.output_tokens, f"unknown assets {unknown}")
        return result


# ----------------------------------------------------------------------------- event typing
TYPING_INSTRUCTIONS = """You assign an event type to one financial-market event that keyword rules could not classify.

Each user message is a JSON object with the event's country, entities and statements. Choose the single best event_type from the allowed list below. Choose OTHER if none fits well; a wrong specific type is worse than OTHER. Give a one-sentence rationale that quotes the deciding words. Use only the text provided.

Allowed event types:
"""

TYPEABLE = [t.value for t in EventType]


def typing_system_prompt() -> str:
    return TYPING_INSTRUCTIONS + "\n".join(f"- {t}" for t in TYPEABLE) + "\n"


class EventTypeOutput(BaseModel):
    event_type: EventType
    rationale: str


TYPING_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["event_type", "rationale"],
    "properties": {"event_type": _enum(TYPEABLE), "rationale": {"type": "string"}},
}


class EventTyper:
    prompt_version = TYPING_PROMPT_VERSION

    def __init__(self, model: str, effort: str | None = None, client: Any = None):
        self.call = StructuredClaudeCall(model, effort, client, max_tokens=4000)
        self.system_prompt = typing_system_prompt()

    @property
    def model(self) -> str:
        return self.call.model

    @staticmethod
    def payload(brief: EventBrief) -> dict:
        p = brief.model_payload()
        p.pop("event_type")  # don't anchor on the rules' OTHER
        p.pop("computed_facts")
        return p

    def build_user_message(self, brief: EventBrief) -> str:
        return json.dumps(self.payload(brief), sort_keys=True, ensure_ascii=False, indent=1)

    def classify(self, brief: EventBrief) -> ClaudeResult:
        return self.call.run(self.system_prompt, self.build_user_message(brief), TYPING_SCHEMA, EventTypeOutput)
