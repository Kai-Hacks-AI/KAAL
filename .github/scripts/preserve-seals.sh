#!/usr/bin/env bash
# preserve-seals <target-ref>
# Sealed history is append-only: every seal present on the target branch must
# still be present in this checkout; new seals are allowed. This knows paths
# and text, not how a seal is made or what it means.
set -euo pipefail
target=$1

# The files that record seals. A seal is a 64-hex-digit token in one of them.
seal_files=(packages/kaal-core/src/seals.ts engineering/kaal-core/kernel.sha256)

status=0
for file in "${seal_files[@]}"; do
  git cat-file -e "$target:$file" 2>/dev/null || continue # nothing on the target yet
  now=$(git show "HEAD:$file" 2>/dev/null || true)
  for seal in $(git show "$target:$file" | grep -Eo '[0-9a-f]{64}' | sort -u || true); do
    if ! grep -q "$seal" <<<"$now"; then
      echo "seal $seal is recorded in $file on $target but is missing here" >&2
      status=1
    fi
  done
done
exit $status
