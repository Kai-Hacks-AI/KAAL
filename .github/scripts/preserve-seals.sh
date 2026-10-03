#!/usr/bin/env bash
# preserve-seals <target-ref>
# Sealed history is append-only: every seal present on the target branch must
# still be present in this checkout; new seals are allowed. This knows paths
# and text, not how a seal is made or what it means.
set -euo pipefail
target=$1

# Where seals are recorded. A seal is a 64-hex-digit token in a record file, or
# the name of a seal artifact kept in a seals directory.
seal_files=(engineering/kaal-core/kernel.sha256)
seal_dirs=(packages/kaal-core/artifacts/seals/)

# The seals recorded at a ref, one per line.
seals_at() {
  for file in "${seal_files[@]}"; do
    git show "$1:$file" 2>/dev/null | grep -Eo '[0-9a-f]{64}' || true
  done
  for dir in "${seal_dirs[@]}"; do
    git ls-tree --name-only "$1" "$dir" 2>/dev/null | sed 's|.*/||' | grep -E '^[0-9a-f]{64}$' || true
  done
}

status=0
now=$(seals_at HEAD)
for seal in $(seals_at "$target" | sort -u); do
  if ! grep -Fxq "$seal" <<<"$now"; then
    echo "seal $seal is recorded on $target but is missing here" >&2
    status=1
  fi
done
exit $status
