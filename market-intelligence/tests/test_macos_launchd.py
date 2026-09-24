"""The launchd installer writes valid plists pointing at the project's venv (tested without launchctl)."""
import os
import plistlib
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.skipif(shutil.which("bash") is None, reason="needs bash")
def test_installer_writes_valid_plists(tmp_path):
    fake_venv = ROOT / ".venv" / "bin"
    created = not (fake_venv / "python").exists()
    if created:
        fake_venv.mkdir(parents=True, exist_ok=True)
        (fake_venv / "python").write_text("#!/bin/sh\n")
        (fake_venv / "python").chmod(0o755)
    try:
        env = {**os.environ, "LAUNCH_AGENTS_DIR": str(tmp_path), "HOME": str(tmp_path)}
        out = subprocess.run(["bash", str(ROOT / "scripts/macos/install_launchd.sh"), "3"], env=env,
                             capture_output=True, text=True, check=True).stdout
        assert "not loaded" in out
        dash = plistlib.loads((tmp_path / "com.notintofinance.mie.dashboard.plist").read_bytes())
        pipe = plistlib.loads((tmp_path / "com.notintofinance.mie.pipeline.plist").read_bytes())
        assert dash["ProgramArguments"][0].endswith(".venv/bin/python")
        assert dash["ProgramArguments"][1:4] == ["-m", "mie.cli", "serve"] and "127.0.0.1" in dash["ProgramArguments"]
        assert dash["KeepAlive"] is True and dash["RunAtLoad"] is True
        assert pipe["ProgramArguments"][1:] == ["-m", "mie.cli", "run"]
        assert pipe["StartInterval"] == 3 * 3600 and pipe["RunAtLoad"] is True
        assert pipe["WorkingDirectory"] == str(ROOT)
        assert "/.local/bin" in pipe["EnvironmentVariables"]["PATH"]  # finds the `claude` CLI
        bad = subprocess.run(["bash", str(ROOT / "scripts/macos/install_launchd.sh"), "0"], env=env,
                             capture_output=True, text=True)
        assert bad.returncode != 0
    finally:
        if created:
            shutil.rmtree(ROOT / ".venv")
