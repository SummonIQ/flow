#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load env if DATABASE_URL isn't set
if [[ -z "${DATABASE_URL:-}" ]] && [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Set it in your shell or in apps/orchestrator/.env" >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
mkdir -p "$BACKUP_DIR"

TS="$(date +"%Y%m%d-%H%M%S")"
OUTFILE="$BACKUP_DIR/orchestrator-${TS}.dump"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump not found. Install PostgreSQL client tools (e.g. via Homebrew: brew install libpq)" >&2
  exit 1
fi

pg_dump --format=custom --file "$OUTFILE" "$DATABASE_URL"

echo "Backup created: $OUTFILE"
