#!/bin/zsh
set -e
set -x

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "Installing Node.js..."
brew install node

echo "Installing npm dependencies..."
cd "$CI_WORKSPACE"
npm ci

echo "Building web app..."
npm run build

echo "Debug: workspace contents"
pwd
ls -la "$CI_WORKSPACE"
ls -la "$CI_WORKSPACE/ios"

echo "Syncing Capacitor iOS project..."
npx cap sync

echo "Installing CocoaPods dependencies..."
cd "$CI_WORKSPACE/ios/App"
pod install

echo "ci_post_clone.sh completed successfully"
