"""Maps config/sources.yaml entries to connector classes."""
from __future__ import annotations

from pathlib import Path

import yaml

from mie.core.config import CONFIG_DIR, Settings
from mie.core.schemas import SourceSpec
from mie.ingestion.base import SourceConnector
from mie.ingestion.bls import BlsCpiConnector
from mie.ingestion.fed_rss import FedPressReleaseConnector
from mie.ingestion.rss import RssConnector
from mie.ingestion.sec_edgar import SecEdgarConnector
from mie.ingestion.youtube import YouTubeChannelConnector

CONNECTORS: dict[str, type[SourceConnector]] = {
    "fed_rss": FedPressReleaseConnector,
    "rss": RssConnector,
    "bls_cpi": BlsCpiConnector,
    "sec_edgar": SecEdgarConnector,
    "youtube_channels": YouTubeChannelConnector,
}


def load_connectors(settings: Settings, fixtures: bool = False, path: Path | None = None,
                    include_disabled: bool = False, only: set[str] | None = None) -> list[SourceConnector]:
    """Build enabled connectors. In fixture mode each source gets a separate
    `<key>__fixture` identity flagged is_fixture, so synthetic data can never be
    confused with live data downstream."""
    raw = yaml.safe_load((path or CONFIG_DIR / "sources.yaml").read_text())
    connectors: list[SourceConnector] = []
    for entry in raw["sources"]:
        if only is not None and entry["key"] not in only:
            continue
        if not entry.get("enabled", True) and not include_disabled:
            continue
        if fixtures and not CONNECTORS[entry["connector"]].fixture_files:
            continue  # no synthetic payload for this connector
        cls = CONNECTORS[entry["connector"]]
        spec_fields = {k: entry[k] for k in SourceSpec.model_fields if k in entry}
        if fixtures:
            spec_fields["key"] = entry["key"] + "__fixture"
            spec_fields["name"] = entry["name"] + " [SYNTHETIC FIXTURE]"
            spec_fields["is_fixture"] = True
        spec = SourceSpec(**spec_fields)
        options = entry.get("options", {})
        if cls is BlsCpiConnector:
            connectors.append(cls(spec, options, api_key=settings.bls_api_key))
        else:
            connectors.append(cls(spec, options))
    return connectors
