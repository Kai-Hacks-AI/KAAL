#!/usr/bin/env bash
# contain-change <target-ref>
# The candidate contains exactly one new closed Change, and previously admitted
# closed history remains intact. This checkout's .kaal is the candidate, the
# target branch's .kaal is the baseline, and the repository's own command,
# `npm run check-kaal-admission`, decides; it knows which Change counts as new,
# closed or intact, and this script only supplies the two directories and passes
# on the verdict. It does not judge whether the Change is good or faithful to
# its intent: review owns that.
set -euo pipefail
target=$1
root=$(cd "$(dirname "$0")/../.." && pwd)

base=$(mktemp -d)
trap 'rm -rf "$base"' EXIT
mkdir -p "$base/.kaal"
if git cat-file -e "$target:.kaal" 2>/dev/null; then
  git archive "$target" .kaal | tar -x -C "$base"
fi
candidate=$(pwd)/.kaal
cd "$root"
npm run -s check-kaal-admission -- "$base/.kaal" "$candidate"
