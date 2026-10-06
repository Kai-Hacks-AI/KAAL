#!/usr/bin/env bash
# isolate-boundaries <target-ref>
# Change-set policy: a change that touches a protected boundary may change
# nothing outside that boundary. Boundaries are kaal-core (packages and
# engineering) and .github, which holds the machinery that judges everything
# else. A change touching both therefore fails, as does any change touching
# one boundary plus ordinary files. The one thing that may accompany a boundary
# is the record of its own Change: the Change directory and its seals, sealed
# text that no machinery reads. Every admission carries a Change, so a boundary
# would otherwise never be admissible.
set -euo pipefail
target=$1

# A Change record: changes/, and the seals of a Change and of its Work.
record='^\.kaal/(changes|seals/changes|seals/trees)/'

boundaries=(
  '^(packages|engineering)/kaal-core/'
  '^\.github/'
)
changed=$(git diff --no-renames --name-only "$target" HEAD)
status=0
for boundary in "${boundaries[@]}"; do
  grep -Eq "$boundary" <<<"$changed" || continue
  outside=$(grep -Ev "$boundary" <<<"$changed" | grep -Ev "$record" || true)
  if [ -n "$outside" ]; then
    echo "This change touches ${boundary#^}, so it may change nothing outside it. Also changed:" >&2
    echo "$outside" >&2
    status=1
  fi
done
exit $status
