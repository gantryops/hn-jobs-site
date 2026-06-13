#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Local development setup for hn-jobs-site
#
# Replaces the git submodule with a symlink to the sibling hn-jobs-data repo
# and creates .env files pointing to a local data server.
#
# Usage: ./scripts/setup-local.sh
# ==============================================================================

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$(cd "$SITE_DIR/.." && pwd)/hn-jobs-data"

# ── Verify sibling data repo exists ──────────────────────────────────────────

if [ ! -d "$DATA_DIR" ]; then
  echo "Error: hn-jobs-data not found at $DATA_DIR"
  echo "Clone it first: git clone https://github.com/gantryops/hn-jobs-data.git $DATA_DIR"
  exit 1
fi

# ── Replace submodule with symlink ───────────────────────────────────────────

LINK_TARGET="$SITE_DIR/hn-jobs-data"

if [ -L "$LINK_TARGET" ]; then
  echo "Symlink already exists: hn-jobs-data -> $(readlink "$LINK_TARGET")"
elif [ -d "$LINK_TARGET" ]; then
  echo "Replacing submodule checkout with symlink..."
  rm -rf "$LINK_TARGET"
  ln -s ../hn-jobs-data "$LINK_TARGET"
  echo "Created symlink: hn-jobs-data -> ../hn-jobs-data"
else
  ln -s ../hn-jobs-data "$LINK_TARGET"
  echo "Created symlink: hn-jobs-data -> ../hn-jobs-data"
fi

# ── Create .env files ────────────────────────────────────────────────────────

if [ ! -f "$SITE_DIR/.env.development" ]; then
  echo "# Dev — reads from hn-jobs-data submodule on disk" > "$SITE_DIR/.env.development"
  echo "Created .env.development"
else
  echo ".env.development already exists, skipping"
fi

if [ ! -f "$SITE_DIR/.env.production" ]; then
  echo "NEXT_PUBLIC_UMAMI_URL=https://cloud.umami.is/script.js" > "$SITE_DIR/.env.production"
  echo "Created .env.production"
else
  echo ".env.production already exists, skipping"
fi

# ── Install dependencies ─────────────────────────────────────────────────────

echo ""
echo "Installing dependencies..."
cd "$SITE_DIR" && pnpm install

echo ""
echo "Done! To start developing:"
echo "  pnpm dev"
