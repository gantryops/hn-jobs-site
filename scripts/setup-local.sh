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
  cat > "$SITE_DIR/.env.development" <<'EOF'
DATA_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DATA_BASE_URL=http://localhost:3001
EOF
  echo "Created .env.development (localhost:3001)"
else
  echo ".env.development already exists, skipping"
fi

if [ ! -f "$SITE_DIR/.env.production" ]; then
  cat > "$SITE_DIR/.env.production" <<'EOF'
DATA_BASE_URL=https://gantryops.github.io/hn-jobs-data
NEXT_PUBLIC_DATA_BASE_URL=https://gantryops.github.io/hn-jobs-data
EOF
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
echo "  Terminal 1: pnpm dev:data   (serves data repo on :3001)"
echo "  Terminal 2: pnpm dev        (Next.js on :3000)"
