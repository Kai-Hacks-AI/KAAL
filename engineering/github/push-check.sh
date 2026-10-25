#!/bin/sh
# KAAL's branching and Change Isolation judgment of one pushed ref, as a KAAL-owned check that
# KAAL's pre-push hook runs through kaal-guard (guard.json: push). The verdicts are the hook's own,
# unchanged: Branching and Promotion Source from engineering/github/lineage.ts as the default branch
# holds it, Change Isolation from engineering/change-isolation/check.mjs as the target holds it.
# Rules, verdicts and guidance live only there and in engineering/github/branching.md.
#
# Facts from Guard: GUARD_HEAD, the pushed commit; GUARD_BASE, the target commit; GUARD_BASE_REF,
# the target ref the hook resolved (such as origin/kaal/guard). KAAL's hook also sets, for this
# check only: KAAL_PUSH_REMOTE, the remote pushed to; KAAL_PUSH_REF, the pushed local ref; and
# KAAL_PUSH_REMOTE_HEAD, the remote's current commit for it (zeros when it is new).
# Exits 0 when every verdict passes or does not apply, 1 otherwise, as the hook did.
remote=${KAAL_PUSH_REMOTE:-origin}
head=$GUARD_HEAD
target=$GUARD_BASE_REF
base=$GUARD_BASE
local_ref=$KAAL_PUSH_REF
remote_head=$KAAL_PUSH_REMOTE_HEAD
if [ -z "$head" ] || [ -z "$base" ] || [ -z "$target" ] || [ -z "$local_ref" ]; then
  echo "cannot judge: the hook supplied no head, base, target or pushed ref"
  exit 2
fi
branch=${local_ref#refs/heads/}
default_ref=$(git symbolic-ref --quiet --short "refs/remotes/$remote/HEAD" 2>/dev/null || echo "$remote/main")
default=${default_ref#"$remote/"}
repo=$(git remote get-url "$remote" 2>/dev/null | sed -E 's#(\.git)?/*$##; s#^.*[:/]([^/]+/[^/]+)$#\1#')
guide=engineering/github/branching.md
tmp=$(mktemp -d) || exit 2
trap 'rm -rf "$tmp"' EXIT
status=0
say() { echo "$*"; }
fail() { say "$*"; status=1; }
# run <label> <script> <args...>: a checker's verdict; 0 pass, 1 fail, 3 not applicable, else cannot judge.
run() {
  label=$1; shift
  node "$@" >"$tmp/verdict" 2>&1 && rc=0 || rc=$?
  case $rc in
    0) say "$label: $(cat "$tmp/verdict")" ;;
    1) fail "$label: $(cat "$tmp/verdict")" ;;
    3) say "$label: not applicable: $(cat "$tmp/verdict")" ;;
    *) fail "$label: cannot judge: $(cat "$tmp/verdict")" ;;
  esac
  return $rc
}
name=${target#"$remote/"}
case $branch:$remote_head in kaal/*:*[!0]*) ;; kaal/*:*)
  say "Establishing $branch: judged as the promotion it will become. See $guide#establish" ;;
esac
change="$base...$head"
rm -f "$tmp/resolved"
if git show "$default_ref:engineering/github/lineage.ts" >"$tmp/lineage.ts" 2>/dev/null; then
  if [ "$name" = "$default" ]; then
    run "Promotion Source" "$tmp/lineage.ts" source "$repo" "$default" "$name" "$repo" "$branch" </dev/null
    run "Branching" "$tmp/lineage.ts" freshness "$default" "$default_ref" "$branch" "$head" </dev/null
  elif run "Branching" "$tmp/lineage.ts" synchronization "$default" "$name" "$default_ref" "$base" "$head" \
    --resolutions "$tmp/resolved" </dev/null; then
    change= # a verified synchronization: only its explicit resolutions are its own Change
  fi
else
  fail "Branching: cannot judge: $default_ref does not hold engineering/github/lineage.ts"
fi
if ! git show "$base:engineering/change-isolation/check.mjs" >"$tmp/check.mjs" 2>/dev/null; then
  fail "Change Isolation: not verified: $target does not hold engineering/change-isolation/check.mjs"
elif [ -n "$change" ] && git merge-base --is-ancestor "$head" "$default_ref" 2>/dev/null; then
  say "Change Isolation: not applicable: $head is already admitted on $default."
elif [ -n "$change" ]; then
  if git diff --no-ext-diff --no-relative --no-renames --name-only -z --end-of-options "$change" >"$tmp/paths"; then
    run "Change Isolation" "$tmp/check.mjs" <"$tmp/paths"
  else
    fail "Change Isolation: cannot judge: no complete change between $target and $head"
  fi
elif [ -s "$tmp/resolved" ]; then
  run "Change Isolation" "$tmp/check.mjs" <"$tmp/resolved"
else
  say "Change Isolation: a synchronization with no explicit resolutions; nothing of its own to judge."
fi
exit $status
