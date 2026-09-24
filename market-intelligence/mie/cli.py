"""Command line entry point:  python -m mie.cli <command>"""
from __future__ import annotations

import argparse
import json
import logging
from dataclasses import asdict

from mie.core.config import get_settings
from mie.db.session import init_db, make_engine, make_session_factory
from mie.pipeline import run_pipeline


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="mie", description="Market Intelligence & Sentiment Engine")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init-db", help="create tables")
    run = sub.add_parser("run", help="one pipeline pass against live sources")
    run.add_argument("--fixtures", action="store_true", help="use SYNTHETIC fixtures instead of the network")
    sub.add_parser("demo", help="init-db + pipeline on synthetic fixtures")
    prev = sub.add_parser("claude-preview", help="show exactly what Claude would receive (no API call)")
    prev.add_argument("--event-id", type=int, action="append", help="limit to these events (repeatable)")
    prev.add_argument("--show-system", action="store_true", help="also print the system prompt and schema")
    serve = sub.add_parser("serve", help="start the dashboard/API")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8000)
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    settings = get_settings()
    engine = make_engine(settings.database_url)

    if args.cmd in {"init-db", "demo", "run"}:
        init_db(engine)
    if args.cmd in {"run", "demo"}:
        fixtures = args.cmd == "demo" or args.fixtures
        reports = run_pipeline(make_session_factory(engine), settings, fixtures=fixtures)
        print(json.dumps([asdict(r) for r in reports], indent=2))
    if args.cmd == "claude-preview":
        _print_preview(engine, settings, args.event_id, args.show_system)
    if args.cmd == "serve":
        import uvicorn

        from mie.api.main import create_app
        uvicorn.run(create_app(engine), host=args.host, port=args.port)


def _print_preview(engine, settings, event_ids, show_system: bool) -> None:
    from mie.preview import claude_preview

    with make_session_factory(engine)() as session:
        p = claude_preview(session, settings, event_ids)
    print(f"Model {p['model']} · prompt {p['prompt_version']} · as of {p['as_of']} · "
          f"CLAUDE_ENABLED={p['claude_enabled']}")
    print(f"System prompt: {p['system_prompt_chars']} characters (identical for every event)")
    if show_system:
        print("-" * 80 + "\n" + p["system_prompt"] + "\n" + json.dumps(p["output_schema"], indent=1))
    for e in p["events"]:
        print("-" * 80)
        print(f"event {e['event_id']} [{e['event_type']}] {e['title']}\n  -> {e['status']}"
              f"  (excluded: after as-of {e['excluded_after_as_of']}, "
              f"not permitted {e['excluded_not_permitted']}, over cap {sum(e['omitted_over_cap'].values())})")
        if e["status"] == "SEND":
            print(f"  user message ({e['user_message_chars']} characters):")
            print("  " + e["user_message"].replace("\n", "\n  "))
    print("-" * 80 + f"\n{p['would_send']} event(s) would be sent. Nothing was sent.")


if __name__ == "__main__":
    main()
