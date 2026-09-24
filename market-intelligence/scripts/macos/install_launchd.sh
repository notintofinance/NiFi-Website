#!/bin/bash
# Installs two macOS background jobs (launchd user agents) for this project:
#   <label>.dashboard  - the dashboard on http://127.0.0.1:8000, started at login, restarted if it stops
#   <label>.pipeline   - `mie run` every N hours (default 2) and once at login; missed runs catch up on wake
# Usage:   ./scripts/macos/install_launchd.sh [hours]
# Remove:  ./scripts/macos/uninstall_launchd.sh
# Logs:    data/logs/
set -euo pipefail

PROJECT="$(cd "$(dirname "$0")/../.." && pwd)"
PY="$PROJECT/.venv/bin/python"
HOURS="${1:-2}"
LABEL="${MIE_LAUNCHD_LABEL:-com.notintofinance.mie}"
AGENTS_DIR="${LAUNCH_AGENTS_DIR:-$HOME/Library/LaunchAgents}"   # overridable for testing
LOG_DIR="$PROJECT/data/logs"
PORT="${MIE_PORT:-8000}"

case "$HOURS" in (''|*[!0-9]*) echo "hours must be a whole number" >&2; exit 1;; esac
[ "$HOURS" -ge 1 ] || { echo "hours must be >= 1" >&2; exit 1; }
if [ ! -x "$PY" ]; then
  echo "No virtual environment at $PROJECT/.venv. Create it first:" >&2
  echo "  cd \"$PROJECT\" && python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt -r requirements-ml.txt" >&2
  exit 1
fi
mkdir -p "$AGENTS_DIR" "$LOG_DIR"

# launchd starts jobs with a minimal PATH; include the usual Claude Code / Homebrew locations
# so the `claude` CLI (Claude subscription backend) is found.
JOB_PATH="$HOME/.local/bin:$HOME/.claude/local:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

xml() { sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' <<<"$1"; }

write_plist() {  # $1 name, $2 program args (xml <string> lines), $3 extra keys
  cat > "$AGENTS_DIR/$LABEL.$1.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL.$1</string>
  <key>ProgramArguments</key>
  <array>
$2
  </array>
  <key>WorkingDirectory</key><string>$(xml "$PROJECT")</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$(xml "$JOB_PATH")</string>
    <key>PYTHONUNBUFFERED</key><string>1</string>
  </dict>
  <key>StandardOutPath</key><string>$(xml "$LOG_DIR/$1.log")</string>
  <key>StandardErrorPath</key><string>$(xml "$LOG_DIR/$1.log")</string>
  <key>RunAtLoad</key><true/>
$3
</dict>
</plist>
PLIST
}

args() { for a in "$@"; do printf '    <string>%s</string>\n' "$(xml "$a")"; done; }

write_plist dashboard "$(args "$PY" -m mie.cli serve --host 127.0.0.1 --port "$PORT")" \
  "  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>30</integer>"
write_plist pipeline "$(args "$PY" -m mie.cli run)" \
  "  <key>StartInterval</key><integer>$((HOURS * 3600))</integer>
  <key>ProcessType</key><string>Background</string>"

if [ -n "${LAUNCH_AGENTS_DIR:-}" ] || ! command -v launchctl >/dev/null; then
  echo "Wrote plists to $AGENTS_DIR (not loaded: test mode or no launchctl)."
  exit 0
fi
for job in dashboard pipeline; do
  launchctl bootout "gui/$(id -u)/$LABEL.$job" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$AGENTS_DIR/$LABEL.$job.plist"
done
echo "Installed. Dashboard: http://127.0.0.1:$PORT  (starts at login, restarts if it stops)"
echo "Pipeline: every $HOURS hour(s) and at login. Logs: $LOG_DIR"
echo "Run the pipeline now:  launchctl kickstart gui/$(id -u)/$LABEL.pipeline"
