#!/usr/bin/env bash
# isolate-boundaries <target-ref>
# Change-set policy: a change that touches a protected boundary may change
# nothing outside that boundary. Boundaries are kaal-core (packages and
# engineering) and .github, which holds the machinery that judges everything
# else. A change touching both therefore fails, as does any change touching
# one boundary plus ordinary files.
set -euo pipefail
target=$1

boundaries=(
  '^(packages|engineering)/kaal-core/'
  '^\.github/'
)
changed=$(git diff --no-renames --name-only "$target" HEAD)
status=0
for boundary in "${boundaries[@]}"; do
  grep -Eq "$boundary" <<<"$changed" || continue
  outside=$(grep -Ev "$boundary" <<<"$changed" || true)
  if [ -n "$outside" ]; then
    echo "This change touches ${boundary#^}, so it may change nothing outside it. Also changed:" >&2
    echo "$outside" >&2
    status=1
  fi
done
exit $status
