"""Market Intelligence & Sentiment Engine."""
import sys

if sys.version_info < (3, 11):  # noqa: UP036 - explicit message beats a cryptic syntax/import error
    raise RuntimeError(
        f"Python 3.11 or newer is required (this is {sys.version.split()[0]}). "
        "On macOS, install Python 3.12 from https://www.python.org/downloads/ and recreate the "
        "virtual environment with: python3.12 -m venv .venv"
    )

__version__ = "0.1.0"
