"""Runtime configuration from environment variables. No secrets in code.

Numerical parameters that are not yet empirically calibrated are marked
UNCALIBRATED; see docs/ARCHITECTURE.md §10 for their calibration path.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = PROJECT_ROOT / "config"
FIXTURE_DIR = PROJECT_ROOT / "tests" / "fixtures"


def _bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _csv(name: str, default: str) -> list[str]:
    return [x.strip() for x in os.environ.get(name, default).split(",") if x.strip()]


@dataclass(frozen=True)
class Settings:
    database_url: str = field(
        default_factory=lambda: os.environ.get(
            "DATABASE_URL", f"sqlite:///{PROJECT_ROOT / 'data' / 'mie.db'}"
        )
    )
    # Identifies the prototype to public APIs (SEC requires this pattern).
    http_user_agent: str = field(
        default_factory=lambda: os.environ.get(
            "HTTP_USER_AGENT", "MarketIntelPrototype/0.1 (contact: set HTTP_USER_AGENT)"
        )
    )
    http_timeout_s: float = field(default_factory=lambda: float(os.environ.get("HTTP_TIMEOUT_S", "20")))
    http_max_attempts: int = field(default_factory=lambda: int(os.environ.get("HTTP_MAX_ATTEMPTS", "4")))

    bls_api_key: str | None = field(default_factory=lambda: os.environ.get("BLS_API_KEY") or None)

    # --- Dedup (UNCALIBRATED defaults; calibrate with processing.dedup.calibrate_threshold)
    dedup_similarity_threshold: float = field(
        default_factory=lambda: float(os.environ.get("DEDUP_SIMILARITY_THRESHOLD", "0.35"))
    )
    dedup_window_hours: float = field(
        default_factory=lambda: float(os.environ.get("DEDUP_WINDOW_HOURS", "72"))
    )

    # --- FinBERT
    finbert_enabled: bool = field(default_factory=lambda: _bool("FINBERT_ENABLED", True))
    finbert_model: str = field(default_factory=lambda: os.environ.get("FINBERT_MODEL", "ProsusAI/finbert"))
    finbert_revision: str = field(default_factory=lambda: os.environ.get("FINBERT_REVISION", "main"))

    # --- Claude (off by default; requires credentials and explicit opt-in)
    claude_enabled: bool = field(default_factory=lambda: _bool("CLAUDE_ENABLED", False))
    # "claude_code": local `claude -p` on your Claude subscription (no API key, no per-token bill).
    # "api": Anthropic API with ANTHROPIC_API_KEY (per-token billing; commercial terms).
    claude_backend: str = field(default_factory=lambda: os.environ.get("CLAUDE_BACKEND", "claude_code"))
    claude_code_model: str = field(default_factory=lambda: os.environ.get("CLAUDE_CODE_MODEL", "sonnet"))
    claude_model: str = field(default_factory=lambda: os.environ.get("CLAUDE_MODEL", "claude-opus-5"))
    claude_effort: str | None = field(default_factory=lambda: os.environ.get("CLAUDE_EFFORT") or None)
    claude_event_types: list[str] = field(
        default_factory=lambda: _csv(
            "CLAUDE_EVENT_TYPES",
            "MONETARY_POLICY,INFLATION,GDP,EMPLOYMENT,FISCAL_POLICY,EARNINGS,GUIDANCE,"
            "CREDIT_RATING,M&A,COMMODITY,FX,BOND_AUCTION,SUPPLY_DISRUPTION,GEOPOLITICS",
        )
    )
    # Send events the keyword rules left as OTHER to Claude for a constrained type label.
    claude_type_other_events: bool = field(default_factory=lambda: _bool("CLAUDE_TYPE_OTHER_EVENTS", True))
    # Cost control, not a model parameter.
    brief_max_statements_per_layer: int = field(
        default_factory=lambda: int(os.environ.get("BRIEF_MAX_STATEMENTS_PER_LAYER", "8"))
    )


def load_env_file(path: Path | None = None) -> list[str]:
    """Load KEY=VALUE lines from the project's .env into os.environ.

    Variables already set in the shell win, and empty values are skipped, so
    `ANTHROPIC_API_KEY=` in a copied template never masks a real key. Called only
    by the CLI and scripts: tests never read a developer's .env. Returns the keys
    it set (never the values).
    """
    path = path or PROJECT_ROOT / ".env"
    if not path.is_file():
        return []
    loaded = []
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.removeprefix("export ").split("=", 1)
        key, value = key.strip(), value.strip()
        if value[:1] in ("'", '"') and value[-1:] == value[:1] and len(value) >= 2:
            value = value[1:-1]
        elif " #" in value:
            value = value.split(" #", 1)[0].rstrip()
        if key and value and key not in os.environ:
            os.environ[key] = value
            loaded.append(key)
    return loaded


def get_settings() -> Settings:
    return Settings()


def claude_kwargs(settings: Settings) -> dict:
    """Constructor arguments for the Claude classifiers from settings."""
    if settings.claude_backend == "claude_code":
        return {"model": settings.claude_code_model, "effort": settings.claude_effort, "backend": "claude_code"}
    return {"model": settings.claude_model, "effort": settings.claude_effort, "backend": "api"}
