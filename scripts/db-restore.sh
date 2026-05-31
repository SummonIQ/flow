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

BACKUP_FILE="${1:-${BACKUP_FILE:-}}"
if [[ -z "${BACKUP_FILE:-}" ]]; then
  echo "Usage: bash ./scripts/db-restore.sh /path/to/backup.dump" >&2
  echo "Or set BACKUP_FILE=/path/to/backup.dump" >&2
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "YES" ]]; then
  echo "Refusing to restore without confirmation." >&2
  echo "This operation is destructive. Re-run with: CONFIRM_RESTORE=YES bash ./scripts/db-restore.sh $BACKUP_FILE" >&2
  exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "pg_restore not found. Install PostgreSQL client tools (e.g. via Homebrew: brew install libpq)" >&2
  exit 1
fi

pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$DATABASE_URL" "$BACKUP_FILE"

echo "Restore completed from: $BACKUP_FILE"
