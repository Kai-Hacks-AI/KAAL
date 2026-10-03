#!/usr/bin/env bash
# isolate-kaal-core <target-ref>
# A change that touches protected Core may change nothing outside Core.
set -euo pipefail
target=$1

core='^(packages|engineering)/kaal-core/'
changed=$(git diff --no-renames --name-only "$target" HEAD)
grep -Eq "$core" <<<"$changed" || exit 0
outside=$(grep -Ev "$core" <<<"$changed" || true)
if [ -n "$outside" ]; then
  echo "This change touches kaal-core, so it may change nothing outside it. Also changed:" >&2
  echo "$outside" >&2
  exit 1
fi
