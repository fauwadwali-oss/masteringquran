#!/bin/sh
set -eu

REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO_ROOT"

if ! command -v npm >/dev/null 2>&1; then
  brew install node
fi

npm ci --include=dev
# The apps do not need the 8,000 crawler pages.
SKIP_PRERENDER=1 npm run build
npx cap sync ios
