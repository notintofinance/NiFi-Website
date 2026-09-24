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
    if args.cmd == "serve":
        import uvicorn

        from mie.api.main import create_app
        uvicorn.run(create_app(engine), host=args.host, port=args.port)


if __name__ == "__main__":
    main()
