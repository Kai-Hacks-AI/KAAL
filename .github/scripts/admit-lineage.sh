#!/usr/bin/env bash
# admit-lineage <target-ref>
# Admission into the lineage: this checkout's .kaal is the candidate, the
# target branch's .kaal is the baseline, and the repository's own command,
# `npm run check-kaal-admission`, decides whether the candidate may be
# admitted. It knows which Change counts as new, closed, or intact; this
# script only supplies the two directories and passes on the verdict.
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
