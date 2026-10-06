#!/usr/bin/env bash
# Negative and positive tests for contain-change.sh, on a throwaway repo whose
# .kaal on the target branch holds one closed Change. Changes are made and
# closed by the repository's own commands, never by this test.
set -euo pipefail
script=$(cd "$(dirname "$0")" && pwd)/contain-change.sh
root=$(cd "$(dirname "$0")/../.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
(cd "$root" && npm run -s build --prefix engineering/change-seal >/dev/null)
cli="node $root/engineering/change-seal/dist/helpers/cli.js"
cd "$tmp"
git init -q -b main
git config user.email t@t; git config user.name t
a=changes/genesis/26/10/06/01 b=changes/genesis/26/10/06/02 c=changes/genesis/26/10/06/03

# change <path> <stage>: take a Change in .kaal as far as the stage says.
change() {
  mkdir -p ".kaal/$1/work"; echo "evidence $1" >".kaal/$1/work/e.md"
  [ "$2" != work ] || return 0
  # Where the evaluator prints the identity of work/ (work: <id>), review is a step and a converged round must name it;
  # an evaluator that does not print it has no review. Either way the Change below is taken through the process it has.
  id=$($cli state .kaal "$1" | sed -n 's/^work: //p' || true)
  if [ -n "$id" ]; then
    mkdir -p ".kaal/$1/review"
    printf '# Review\n\nWork: %s\nResult: converged\n\n## Findings\n\nNone.\n' "$id" >".kaal/$1/review/01.md"
  fi
  $cli seal-work .kaal "$1" >/dev/null
  [ "$2" != sealed-work ] || return 0
  echo '# Retro' >".kaal/$1/retro-work.md"
  [ "$2" != retro-work ] || return 0
  # The three perspectives: the Worker's, the Reviewer's and the Owner's. An evaluator with two takes the surplus file as nothing.
  echo '# Retro' >".kaal/$1/retro-review.md"
  echo '# Retro' >".kaal/$1/retro-observe.md"
  [ "$2" != retro-observe ] || return 0
  $cli close .kaal "$1" >/dev/null
}
change "$a" closed
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

expect pass 'one new closed Change'           'change "$b" closed'
expect fail 'no Change'                       ':'
expect fail 'two new closed Changes'          'change "$b" closed; change "$c" closed'
expect fail 'a new Change with open Work'     'change "$b" work'
expect fail 'a new Change with sealed Work'   'change "$b" sealed-work'
expect fail 'a new Change with both retros but not sealed' 'change "$b" retro-observe'
expect fail 'closed history altered'          'change "$b" closed; echo x >>".kaal/$a/work/e.md"'
expect fail 'closed history removed'          'change "$b" closed; rm -r ".kaal/$a"'
# A target branch with no .kaal at all: the baseline is empty, so one closed Change is admitted.
git checkout -q -B bare main
git rm -rq .kaal; git commit -qm bare
git checkout -q -B t main
git add -A; git commit -q --allow-empty -m t
if "$script" bare >/dev/null 2>&1; then got=pass; else got=fail; fi
if [ "$got" = pass ]; then echo "ok   an empty baseline admits one closed Change"; else echo "FAIL an empty baseline admits one closed Change"; fail=1; fi
exit $fail
