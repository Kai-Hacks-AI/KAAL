#!/usr/bin/env bash
# Negative and positive tests for preserve-sealed-changes.sh, on a throwaway
# repo whose .kaal holds a Change sealed on the target branch. The seals are
# made by the repository's own command, never by this test.
set -euo pipefail
script=$(cd "$(dirname "$0")" && pwd)/preserve-sealed-changes.sh
root=$(cd "$(dirname "$0")/../.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cd "$tmp"
git init -q -b main
git config user.email t@t; git config user.name t
one=.kaal/changes/genesis/26/10/04/01
mkdir -p "$one"; printf '# Retro\n' >"$one/retro.md"
node_seal=.kaal/seals/0000000000000000000000000000000000000000000000000000000000000000
mkdir -p .kaal/seals; : >"$node_seal"
(cd "$root" && npm run -s build --prefix engineering/change-seal >/dev/null)
node "$root/engineering/change-seal/dist/helpers/cli.js" seal .kaal changes/genesis/26/10/04/01 >/dev/null
seal=$(ls .kaal/seals/changes)
git add -A; git commit -qm base

fail=0
# expect <pass|fail> <name> <commands>: run the commands on a branch, then the script.
expect() {
  want=$1; name=$2; shift 2
  git checkout -q -B t main
  eval "$*"
  git add -A; git commit -q --allow-empty -m t
  if "$script" main >/dev/null 2>&1; then got=pass; else got=fail; fi
  if [ "$got" = "$want" ]; then echo "ok   $name"; else echo "FAIL $name (wanted $want)"; fail=1; fi
}

expect pass 'no change'
expect pass 'a new open Change'            "mkdir -p .kaal/changes/genesis/26/10/04/02; echo draft >.kaal/changes/genesis/26/10/04/02/work.md"
expect pass 'a new Change, sealed'         "mkdir -p .kaal/changes/genesis/26/10/04/02; echo draft >.kaal/changes/genesis/26/10/04/02/work.md; node '$root/engineering/change-seal/dist/helpers/cli.js' seal .kaal changes/genesis/26/10/04/02 >/dev/null"
expect pass 'unrelated files'              "echo x >README"
expect fail 'edit retro.md'                "echo more >>$one/retro.md"
expect fail 'rename retro.md'              "git mv $one/retro.md $one/foo.md"
expect fail 'add foo.md'                   "echo x >$one/foo.md"
expect fail 'move retro.md into a subdirectory' "mkdir $one/sub; git mv $one/retro.md $one/sub/retro.md"
expect fail 'delete retro.md'              "git rm -q $one/retro.md"
expect fail 'delete the Change directory'  "git rm -rq $one"
expect fail 'delete the Change seal'       "git rm -q .kaal/seals/changes/$seal"
expect fail 'delete directory and seal'    "git rm -rq $one .kaal/seals/changes/$seal"
expect fail 'substitute another seal'      "git rm -q .kaal/seals/changes/$seal; mkdir -p .kaal/seals/changes; : >.kaal/seals/changes/$(printf 'x' | sha256sum | cut -d' ' -f1)"
expect fail 'edit and reseal the Change'   "echo more >>$one/retro.md; node '$root/engineering/change-seal/dist/helpers/cli.js' seal .kaal changes/genesis/26/10/04/01 >/dev/null; git rm -q .kaal/seals/changes/$seal"
expect fail 'edit and reseal, keeping the old seal' "echo more >>$one/retro.md; node '$root/engineering/change-seal/dist/helpers/cli.js' seal .kaal changes/genesis/26/10/04/01 >/dev/null"
expect pass 'move the whole Change to another address' "mkdir -p .kaal/changes/genesis/26/10/05; git mv $one .kaal/changes/genesis/26/10/05/01"
expect pass 'rename the whole Change to another name' "mkdir -p .kaal/changes/other/26/10/04; git mv $one .kaal/changes/other/26/10/04/07"
expect fail 'move the Change, then edit it' "mkdir -p .kaal/changes/genesis/26/10/05; git mv $one .kaal/changes/genesis/26/10/05/01; echo x >.kaal/changes/genesis/26/10/05/01/foo.md"
expect fail 'move the Change but drop its seal' "mkdir -p .kaal/changes/genesis/26/10/05; git mv $one .kaal/changes/genesis/26/10/05/01; git rm -q .kaal/seals/changes/$seal"
expect fail 'move the Change out of any valid address' "git mv $one .kaal/elsewhere"
exit $fail
