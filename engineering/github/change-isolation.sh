#!/bin/bash
# KAAL's Change Isolation judgment of one pull request, as a KAAL-owned check that the Change
# Isolation job runs through kaal-guard (.kaal/config/guard/Change-Isolation.md). The job's former body, moved:
# the rule and its verdict live in engineering/change-isolation/check.mjs as the target commit holds it
# (read from Git, so the job may run from any checkout, such as the default branch's), and
# a verified synchronization of a collector is judged by engineering/github/lineage.ts as the default
# branch holds it.
#
# Facts from Guard: GUARD_HEAD, the candidate commit; GUARD_BASE, the target branch's current tip;
# GUARD_BASE_REF, the target branch. From KAAL's job: KAAL_DEFAULT, the default branch.
# Exits 0 when the Change conforms, 1 when it does not, 2 when it cannot be judged, 3 when it does not
# apply (a synchronization already admitted on the default branch).
set -o pipefail
HEAD=$GUARD_HEAD BASE=$GUARD_BASE BASE_REF=$GUARD_BASE_REF DEFAULT=$KAAL_DEFAULT
if [ -z "$HEAD" ] || [ -z "$BASE" ] || [ -z "$BASE_REF" ] || [ -z "$DEFAULT" ]; then
  echo "cannot judge: the job supplied no head, base, target or default branch"; exit 2
fi
T=$(mktemp -d) || exit 2
trap 'rm -rf "$T"' EXIT
git fetch -q --no-tags origin "$HEAD" || { echo "the candidate $HEAD cannot be fetched"; exit 2; }
if git merge-base --is-ancestor "$HEAD" "origin/$DEFAULT"; then
  echo "Synchronization: candidate $HEAD already admitted on $DEFAULT."
  exit 3
fi
CHANGE="$BASE...$HEAD"
if [[ "$BASE_REF" == kaal/* ]]; then
  git show "origin/$DEFAULT:engineering/github/lineage.ts" > "$T/lineage.ts" || {
    echo "$DEFAULT does not hold engineering/github/lineage.ts"; exit 2; }
  RC=0; node "$T/lineage.ts" synchronization "$DEFAULT" "$BASE_REF" "origin/$DEFAULT" "$BASE" "$HEAD" \
    --resolutions "$T/resolved" > "$T/verdict" 2>&1 || RC=$?
  case $RC in
    0) CHANGE=
       [ -s "$T/resolved" ] || { echo "Synchronization: no explicit resolutions; nothing of its own to judge."; exit 0; } ;;
    1|3) echo "Not a verified synchronization; judged as an ordinary Change." ;;
    *) cat "$T/verdict"; exit 2 ;;
  esac
fi
if ! git show "$BASE:engineering/change-isolation/check.mjs" > "$T/check.mjs" 2>/dev/null; then
  echo "not verified: the target does not hold engineering/change-isolation/check.mjs"
  exit 2
fi
if [ -z "$CHANGE" ]; then
  echo "Synchronization: judging its explicit resolutions only."
  node "$T/check.mjs" < "$T/resolved"
else
  git diff --no-ext-diff --no-relative --no-renames --name-only -z --end-of-options "$CHANGE" \
    | node "$T/check.mjs"
fi
