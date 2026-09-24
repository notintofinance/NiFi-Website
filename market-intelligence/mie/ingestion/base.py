"""Connector interface and HTTP retry helper.

A connector knows one source format:
    fetch()  – network I/O only; retried by the runner.
    parse()  – pure function from a RawPayload to NormalizedDocuments; unit-tested
               against fixtures.
Retries, timeouts, User-Agent and run logging live in the runner, not here.
"""
from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import httpx

from mie.core.schemas import NormalizedDocument, RawPayload, SourceSpec

log = logging.getLogger(__name__)

RETRYABLE_STATUS = {408, 425, 429, 500, 502, 503, 504}


class ParseError(Exception):
    """Payload was fetched but does not match the documented format."""


class FetchError(Exception):
    """All retry attempts failed."""

    def __init__(self, message: str, attempts: int, cause: Exception | None = None):
        super().__init__(message)
        self.attempts = attempts
        self.cause = cause


class HttpFetcher:
    """httpx wrapper with exponential backoff on transport errors and retryable statuses."""

    def __init__(
        self,
        client: httpx.Client,
        max_attempts: int = 4,
        base_delay_s: float = 2.0,
        sleep: Callable[[float], None] = time.sleep,
    ):
        self.client = client
        self.max_attempts = max_attempts
        self.base_delay_s = base_delay_s
        self.sleep = sleep
        self.last_attempts = 0

    def request(self, method: str, url: str, **kwargs: Any) -> httpx.Response:
        last_exc: Exception | None = None
        for attempt in range(1, self.max_attempts + 1):
            self.last_attempts = attempt
            try:
                resp = self.client.request(method, url, **kwargs)
                if resp.status_code in RETRYABLE_STATUS:
                    last_exc = httpx.HTTPStatusError(
                        f"retryable status {resp.status_code}", request=resp.request, response=resp
                    )
                else:
                    resp.raise_for_status()
                    return resp
            except httpx.HTTPStatusError as exc:
                if exc.response.status_code not in RETRYABLE_STATUS:
                    raise FetchError(f"HTTP {exc.response.status_code} for {url}", attempt, exc) from exc
                last_exc = exc
            except httpx.TransportError as exc:
                last_exc = exc
            if attempt < self.max_attempts:
                delay = self.base_delay_s * 2 ** (attempt - 1)
                log.warning("fetch %s failed (attempt %d/%d): %s; retrying in %.0fs",
                            url, attempt, self.max_attempts, last_exc, delay)
                self.sleep(delay)
        raise FetchError(f"giving up on {url} after {self.max_attempts} attempts: {last_exc}",
                         self.max_attempts, last_exc)


class SourceConnector(ABC):
    #: Fixture file names (in tests/fixtures) that stand in for fetch() offline.
    fixture_files: tuple[str, ...] = ()

    def __init__(self, spec: SourceSpec, options: dict[str, Any] | None = None):
        self.spec = spec
        self.options = options or {}

    @abstractmethod
    def fetch(self, http: HttpFetcher) -> list[RawPayload]:
        ...

    @abstractmethod
    def parse(self, payload: RawPayload) -> list[NormalizedDocument]:
        ...

    def load_fixtures(self, fixture_dir: Path) -> list[RawPayload]:
        now = datetime.now(timezone.utc)
        return [
            RawPayload(
                source_key=self.spec.key,
                content=(fixture_dir / name).read_bytes(),
                fetched_at=now,
                request_meta={"fixture": name},
            )
            for name in self.fixture_files
        ]
