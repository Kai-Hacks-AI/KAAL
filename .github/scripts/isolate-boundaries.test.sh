#!/usr/bin/env bash
# Negative and positive tests for isolate-boundaries.sh, on a throwaway repo.
set -euo pipefail
script=$(cd "$(dirname "$0")" && pwd)/isolate-boundaries.sh
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cd "$tmp"
git init -q -b main
git config user.email t@t; git config user.name t
mkdir -p packages/kaal-core engineering/kaal-core .github/workflows docs .kaal/changes/genesis/26/10/06/01 .kaal/seals/changes .kaal/seals/trees .kaal/seals/node
for f in packages/kaal-core/a engineering/kaal-core/a .github/workflows/w README docs/d; do echo 0 >"$f"; done
git add -A; git commit -qm base

fail=0
# expect <pass|fail> <name> <files...>: change the files on a branch, run the script.
expect() {
  want=$1; name=$2; shift 2
  git checkout -q -B t main
  for f in "$@"; do mkdir -p "$(dirname "$f")"; echo "$RANDOM" >>"$f"; done
  git add -A; git commit -q --allow-empty -m t
  if "$script" main >/dev/null 2>&1; then got=pass; else got=fail; fi
  if [ "$got" = "$want" ]; then echo "ok   $name"; else echo "FAIL $name (wanted $want)"; fail=1; fi
}

expect pass 'no change'
expect pass 'ordinary files only'      README docs/d
expect pass 'core only'                packages/kaal-core/a engineering/kaal-core/a
expect pass '.github only'             .github/workflows/w
expect fail 'core + ordinary'          packages/kaal-core/a README
expect fail '.github + ordinary'       .github/workflows/w README
expect fail 'core + .github'           packages/kaal-core/a .github/workflows/w
expect fail 'new file under .github + ordinary' .github/new.yml docs/d
expect pass 'a Change record only'     .kaal/changes/genesis/26/10/06/01/work/a .kaal/seals/changes/x .kaal/seals/trees/x
expect pass 'core + its Change record' packages/kaal-core/a .kaal/changes/genesis/26/10/06/01/work/a .kaal/seals/changes/x
expect pass '.github + its Change record' .github/workflows/w .kaal/changes/genesis/26/10/06/01/retro-work.md .kaal/seals/trees/x
expect fail 'core + record + ordinary' packages/kaal-core/a .kaal/changes/genesis/26/10/06/01/work/a README
expect fail '.github + a Node seal'    .github/workflows/w .kaal/seals/node/z
expect fail '.github + other .kaal'    .github/workflows/w .kaal/core/x
expect fail 'core + .github + record'  packages/kaal-core/a .github/workflows/w .kaal/changes/genesis/26/10/06/01/work/a
exit $fail
