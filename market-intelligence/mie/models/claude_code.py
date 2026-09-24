"""Run Claude through the local Claude Code CLI on the user's Claude subscription.

No API key and no per-token bill: `claude -p` (headless mode) authenticates with
the subscription login from `claude` / `claude auth login`, and calls count
towards that plan's usage limits. Documented at
https://code.claude.com/docs/en/headless and /cli-reference.

Guard rails:
* never `--bare`, because bare mode ignores the subscription login and needs an API key;
* ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN are removed from the child's
  environment, so a stray key can never silently switch billing to the API;
* the call runs in an empty temporary directory, so no *project* CLAUDE.md, hooks
  or MCP config are picked up. User-level settings in ~/.claude still load (only
  --bare skips them, and --bare cannot use the subscription), so keep hooks and
  MCP servers out of ~/.claude on the machine that runs the pipeline;
* our --system-prompt replaces Claude Code's default prompt; action tools
  (shell, file edits, web) are denied and anything that would prompt is refused;
* output is `--json-schema` structured output, validated again locally.

Suitable for a personal prototype on public data. Consumer-plan terms and
privacy settings apply. A bank deployment should use a commercial API or
enterprise agreement.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from typing import Any, Callable

STRIP_ENV = ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")
DENIED_TOOLS = ["Bash", "Edit", "Write", "NotebookEdit", "WebFetch", "WebSearch", "mcp__*"]


class ClaudeCodeUnavailable(RuntimeError):
    """The CLI is missing; every following call would fail too."""


class ClaudeCodeRunError(RuntimeError):
    """The CLI ran but reported failure (not logged in, usage limit reached, ...)."""


Runner = Callable[..., subprocess.CompletedProcess]


class ClaudeCodeRunner:
    def __init__(self, model: str = "sonnet", effort: str | None = None, binary: str = "claude",
                 timeout_s: float = 300, runner: Runner = subprocess.run):
        self.model = model
        self.effort = effort
        self.binary = binary
        self.timeout_s = timeout_s
        self._run = runner

    def command(self, system: str, schema: dict) -> list[str]:
        cmd = [self.binary, "-p", "--output-format", "json", "--json-schema", json.dumps(schema),
               "--system-prompt", system, "--model", self.model,
               "--no-session-persistence", "--permission-mode", "dontAsk",
               # one comma-separated value: the option is variadic and must not swallow later flags
               "--disallowedTools", ",".join(DENIED_TOOLS)]
        if self.effort:
            cmd += ["--effort", self.effort]
        return cmd

    @staticmethod
    def child_env() -> dict[str, str]:
        return {k: v for k, v in os.environ.items() if k not in STRIP_ENV}

    def call(self, system: str, user: str, schema: dict) -> dict[str, Any]:
        """Returns {'structured_output', 'served_model', 'input_tokens', 'output_tokens',
        'cache_read_input_tokens'}; raises ClaudeCodeUnavailable / ClaudeCodeRunError."""
        if self._run is subprocess.run and shutil.which(self.binary) is None:
            raise ClaudeCodeUnavailable(
                f"'{self.binary}' not found. Install Claude Code, then run `claude` once to log in with "
                "your Claude subscription.")
        with tempfile.TemporaryDirectory(prefix="mie-claude-") as empty_dir:
            try:
                proc = self._run(self.command(system, schema), input=user, capture_output=True, text=True,
                                 cwd=empty_dir, env=self.child_env(), timeout=self.timeout_s)
            except FileNotFoundError as exc:
                raise ClaudeCodeUnavailable(f"'{self.binary}' not found: {exc}") from exc
            except subprocess.TimeoutExpired as exc:
                raise ClaudeCodeRunError(f"claude -p timed out after {self.timeout_s:.0f}s") from exc
        try:
            out = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:
            raise ClaudeCodeRunError(
                f"claude -p exit {proc.returncode}: {(proc.stderr or proc.stdout)[:500]}") from exc
        if proc.returncode != 0 or out.get("is_error"):
            raise ClaudeCodeRunError(f"claude -p failed: {str(out.get('result') or proc.stderr)[:500]}")
        usage = out.get("usage") or {}
        models = list((out.get("modelUsage") or {}).keys())
        return {
            "structured_output": out.get("structured_output"),
            "served_model": models[0] if len(models) == 1 else (",".join(models) or f"claude-code:{self.model}"),
            "input_tokens": usage.get("input_tokens"),
            "output_tokens": usage.get("output_tokens"),
            "cache_read_input_tokens": usage.get("cache_read_input_tokens"),
        }
