#!/bin/zsh
set -e
set -x

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Don't rely on $CI_WORKSPACE / $CI_PRIMARY_REPOSITORY_PATH being set —
# derive the repo root from this script's own location instead
# (ios/App/ci_scripts/ci_post_clone.sh is 3 levels below the repo root).
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "Repo root resolved to: $REPO_ROOT"
ls -la "$REPO_ROOT"

echo "Installing Node.js..."
brew install node

echo "Installing npm dependencies..."
cd "$REPO_ROOT"
npm ci

echo "Building web app..."
npm run build

echo "Syncing Capacitor iOS project..."
npx cap sync

echo "Installing CocoaPods dependencies..."
cd "$REPO_ROOT/ios/App"
pod install

echo "ci_post_clone.sh completed successfully"
