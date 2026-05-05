#!/bin/sh
set -eu

REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(git rev-parse --show-toplevel)}"
cd "$REPO_ROOT"

if ! command -v npm >/dev/null 2>&1; then
  brew install node
fi

npm ci --include=dev
npm run build
npx cap sync ios
