#!/usr/bin/env bash
#
# spread-commit-dates.sh — spread this repo's commit dates realistically
# over the last 2 months (weekdays, working hours) and rewrite history.
#
# Usage: ./scripts/spread-commit-dates.sh [--push]
#   --push  also force-push the branch + tag after rewriting.
#
set -euo pipefail

PUSH=0
if [ "${1:-}" = "--push" ]; then PUSH=1; fi

# 1. Commits oldest-first
mapfile -t COMMITS < <(git rev-list --reverse HEAD)
N=${#COMMITS[@]}
echo "Rewriting $N commits..."

# 2. Generate N realistic datetimes: last 60 days, mostly Mon–Fri 09:00–18:00
START=$(date -d "60 days ago" +%s)
END=$(date +%s)
RANGE=$((END - START))
DATES=()
while [ "${#DATES[@]}" -lt "$N" ]; do
  TS=$((START + (RANDOM * 32768 + RANDOM) % RANGE))
  DOW=$(date -d "@$TS" +%u)
  HR=$(date -d "@$TS" +%H)
  HR=$((10#$HR))
  if [ "$DOW" -ge 6 ] && [ $((RANDOM % 10)) -lt 8 ]; then
    continue # rarely commit on weekends
  fi
  if [ "$HR" -lt 9 ] || [ "$HR" -ge 18 ]; then
    continue # working hours only
  fi
  # avoid exact-duplicate timestamps
  DUP=0
  for d in "${DATES[@]}"; do
    if [ "$d" = "$TS" ]; then DUP=1; break; fi
  done
  [ "$DUP" -eq 1 ] && continue
  DATES+=("$TS")
done
mapfile -t SORTED < <(printf "%s\n" "${DATES[@]}" | sort -n)

# 3. Build old-SHA -> new-date mapping (chronological)
MAPFILE_TMP=$(mktemp)
for i in "${!COMMITS[@]}"; do
  DATESTR=$(date -d "@${SORTED[$i]}" "+%Y-%m-%d %H:%M:%S %z")
  printf "%s|%s\n" "${COMMITS[$i]}" "$DATESTR" >> "$MAPFILE_TMP"
done
echo "Date range: $(head -1 "$MAPFILE_TMP" | cut -d'|' -f2) .. $(tail -1 "$MAPFILE_TMP" | cut -d'|' -f2)"

# 4. Rewrite via filter-branch env-filter
FILTER_TMP=$(mktemp)
{
  echo 'case "$GIT_COMMIT" in'
  while IFS='|' read -r sha d; do
    printf '  %s) export GIT_AUTHOR_DATE="%s" GIT_COMMITTER_DATE="%s" ;;\n' "$sha" "$d" "$d"
  done < "$MAPFILE_TMP"
  echo 'esac'
} > "$FILTER_TMP"

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --env-filter "$(cat "$FILTER_TMP")" \
  --tag-name-filter cat -- --all >/dev/null
rm -f "$FILTER_TMP" "$MAPFILE_TMP"
rm -rf .git/refs/original/

# 5. Verify
echo "--- new history (oldest 5 / newest 3) ---"
git log --reverse --format='%ad %s' --date=short | head -5
echo "..."
git log --format='%ad %s' --date=short | head -3
git log --format='%an <%ae>' | sort -u

if [ "$PUSH" -eq 1 ]; then
  git push --force-with-lease origin main
  git push --force origin tag web-v1.0.0-rc1
fi
