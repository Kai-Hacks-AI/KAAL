#!/usr/bin/env bash
# preserve-sealed-changes <target-ref>
# A Change that is validly sealed on the target branch must be the same validly
# sealed Change here: same path, same identity, its seal still in place. Open
# Changes and new Changes are free. This asks the repository's own command,
# `npm run list-sealed-changes`, which Changes are closed in a KAAL directory,
# once for the target's .kaal and once for this checkout's; it knows paths and
# lines, never how a Change is identified.
set -euo pipefail
target=$1
root=$(cd "$(dirname "$0")/../.." && pwd)
kaal=.kaal

# The closed Changes of a KAAL directory, one "<path> <id>" per line.
closed() { (cd "$root" && npm run -s list-sealed-changes -- "$1"); }

base=$(mktemp -d)
trap 'rm -rf "$base"' EXIT
if git cat-file -e "$target:$kaal" 2>/dev/null; then
  git archive "$target" "$kaal" | tar -x -C "$base"
fi
before=$(closed "$base/$kaal")
now=$(closed "$(pwd)/$kaal")

status=0
while IFS= read -r line; do
  [ -n "$line" ] || continue
  if ! grep -Fxq -- "$line" <<<"$now"; then
    echo "the Change ${line% *} is sealed on $target (${line##* }) but is not the same sealed Change here" >&2
    status=1
  fi
done <<<"$before"
exit $status
