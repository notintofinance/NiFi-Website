#!/bin/bash
# Removes the background jobs installed by install_launchd.sh. Data and logs are kept.
set -euo pipefail
LABEL="${MIE_LAUNCHD_LABEL:-com.notintofinance.mie}"
AGENTS_DIR="$HOME/Library/LaunchAgents"
for job in dashboard pipeline; do
  launchctl bootout "gui/$(id -u)/$LABEL.$job" 2>/dev/null || true
  rm -f "$AGENTS_DIR/$LABEL.$job.plist"
done
echo "Removed the dashboard and pipeline background jobs."
