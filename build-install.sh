#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# Pull latest if this is an update
if [ -d .git ]; then
    git pull --ff-only 2>/dev/null || true
fi

# Clean stale build artifacts
rm -f bird ~/prj/util/bin/bird
rm -rf node_modules dist

# Build (requires npm and bun)
npm install

# Run build steps directly to avoid pnpm workspace issues
npx tsc
node scripts/copy-dist-assets.js

# Build standalone binary with bun
BIRD_VERSION=$(node -p "require('./package.json').version")
BIRD_GIT_SHA=$(git rev-parse --short=8 HEAD 2>/dev/null || true)
export BIRD_VERSION BIRD_GIT_SHA
bun build --compile --minify --env=BIRD_* src/cli.ts --outfile bird

# Install binary
mkdir -p ~/prj/util/bin
cp bird ~/prj/util/bin/bird
chmod +x ~/prj/util/bin/bird

echo "Installed: $(~/prj/util/bin/bird --version 2>/dev/null || echo 'bird')"
