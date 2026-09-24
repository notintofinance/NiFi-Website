"""Claude via the local Claude Code CLI on a subscription (no API key, no per-token bill)."""
import json
import os
import subprocess
from dataclasses import replace
from pathlib import Path

import pytest
from sqlalchemy import select

from mie.core.config import claude_kwargs
from mie.db.models import ClaudePrediction, EventImpact
from mie.intelligence.service import run_claude, run_claude_typing
from mie.models.claude import ClaudeClassifier, EventTyper, api_error_policy
from mie.models.claude_code import ClaudeCodeRunError, ClaudeCodeRunner, ClaudeCodeUnavailable
from mie.preview import claude_preview
from tests.conftest import claude_json


class FakeCli:
    """Stands in for subprocess.run; records each call."""

    def __init__(self, structured=None, is_error=False, returncode=0, stdout=None):
        self.calls = []
        self.structured = claude_json() if structured is None else structured
        self.is_error, self.returncode, self.stdout = is_error, returncode, stdout

    def __call__(self, cmd, **kw):
        self.calls.append({"cmd": cmd, **kw, "cwd_listing": os.listdir(kw["cwd"])})
        out = self.stdout if self.stdout is not None else json.dumps({
            "type": "result", "is_error": self.is_error, "result": "Not logged in" if self.is_error else "",
            "structured_output": self.structured,
            "usage": {"input_tokens": 900, "output_tokens": 210, "cache_read_input_tokens": 0},
            "modelUsage": {"claude-sonnet-5": {}}})
        return subprocess.CompletedProcess(cmd, self.returncode, out, "")


def _clf(cli, **kw):
    return ClaudeClassifier("sonnet", backend="claude_code", claude_code=ClaudeCodeRunner(runner=cli), **kw)


def _on(settings):
    return replace(settings, claude_enabled=True)


def test_command_uses_subscription_mode_and_schema(loaded, settings, monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-should-not-leak")
    cli = FakeCli()
    run_claude(loaded, _on(settings), _clf(cli))
    call = cli.calls[0]
    cmd = call["cmd"]
    assert cmd[:2] == ["claude", "-p"] and "--bare" not in cmd          # bare mode can't use the subscription
    assert cmd[cmd.index("--output-format") + 1] == "json"
    assert json.loads(cmd[cmd.index("--json-schema") + 1])["required"][0] == "factual_sentiment"
    assert "--system-prompt" in cmd and "--no-session-persistence" in cmd
    assert cmd[cmd.index("--permission-mode") + 1] == "dontAsk"
    assert "Bash" in cmd[cmd.index("--disallowedTools") + 1]
    assert "ANTHROPIC_API_KEY" not in call["env"]                       # never silently bill the API
    assert call["cwd_listing"] == []                                     # empty dir: no project config
    assert '"event_type"' in call["input"] and "example.invalid" not in call["input"]  # brief on stdin, source-blind


def test_ok_result_is_stored_with_served_model_and_tokens(loaded, settings):
    r = run_claude(loaded, _on(settings), _clf(FakeCli()))
    assert r.counts["ok"] == 3
    p = loaded.scalars(select(ClaudePrediction)).first()
    assert p.served_model == "claude-sonnet-5" and p.input_tokens == 900 and p.status == "OK"
    assert loaded.query(EventImpact).count() == 3
    from mie.db.models import ModelVersion
    assert loaded.scalars(select(ModelVersion.name)).all() == ["claude-code:sonnet"]


def test_invalid_structured_output_is_recorded_not_trusted(loaded, settings):
    run_claude(loaded, _on(settings), _clf(FakeCli(structured={"factual_sentiment": "0.74"})))
    assert {p.status for p in loaded.scalars(select(ClaudePrediction))} == {"INVALID"}


def test_cli_failure_stops_the_stage_and_stores_nothing(loaded, settings):
    cli = FakeCli(is_error=True)
    r = run_claude(loaded, _on(settings), _clf(cli))
    assert r.counts["claude_code_failed"] == 1 and "ok" not in r.counts
    assert len(cli.calls) == 1 and loaded.query(ClaudePrediction).count() == 0


def test_errors_map_to_stop():
    assert api_error_policy(ClaudeCodeUnavailable("x")) == ("stop", "claude_code_unavailable")
    assert api_error_policy(ClaudeCodeRunError("x")) == ("stop", "claude_code_failed")


def test_missing_binary_is_clear():
    runner = ClaudeCodeRunner(binary="definitely-not-installed-claude")
    with pytest.raises(ClaudeCodeUnavailable, match="log in"):
        runner.call("s", "u", {"type": "object"})


def test_garbage_stdout_raises():
    runner = ClaudeCodeRunner(runner=FakeCli(stdout="not json", returncode=1))
    with pytest.raises(ClaudeCodeRunError):
        runner.call("s", "u", {"type": "object"})


def test_typing_works_on_claude_code(loaded, settings):
    cli = FakeCli(structured={"event_type": "REGULATION", "rationale": "supervisory statement"})
    typer = EventTyper("sonnet", backend="claude_code", claude_code=ClaudeCodeRunner(runner=cli))
    assert run_claude_typing(loaded, _on(settings), typer).counts == {"retyped": 1}


def test_default_backend_is_subscription_and_preview_never_runs_cli(loaded, settings, monkeypatch):
    assert claude_kwargs(settings)["backend"] == "claude_code" and claude_kwargs(settings)["model"] == "sonnet"
    monkeypatch.setattr(subprocess, "run", lambda *a, **k: (_ for _ in ()).throw(AssertionError("ran CLI")))
    p = claude_preview(loaded, settings)
    assert p["backend"] == "claude_code" and p["model"] == "claude-code:sonnet" and p["would_send"] == 3


def test_unknown_backend_rejected():
    with pytest.raises(ValueError):
        ClaudeClassifier("m", backend="bogus")
