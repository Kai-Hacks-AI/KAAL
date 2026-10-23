#!/bin/bash
# KAAL's Branching judgment of one pull request, as a KAAL-owned check that the Branching job runs
# through kaal-guard (guard.json: Branching). The job's former body, moved: the rules and verdicts live
# in engineering/github/lineage.ts. Its first argument is that checker, which Guard takes from the base
# revision KAAL's job supplies: the default branch's tip (trusted).
#
# Facts from Guard: GUARD_HEAD, the candidate commit; GUARD_BASE_REF, the target branch. From KAAL's
# job: KAAL_DEFAULT, the default branch; KAAL_HEAD_REF, the source branch; KAAL_AUTO_MERGE, the
# auto-merge method, if any. The job's checkout holds the remote branches.
# Judges the proposed result (freshness into the default branch, synchronization into a collector),
# then the merge method. Exits 1 on a fail, 2 when either cannot be judged, 3 when neither applies,
# else 0.
LINEAGE=$1 HEAD=$GUARD_HEAD BASE_REF=$GUARD_BASE_REF DEFAULT=$KAAL_DEFAULT
if [ -z "$LINEAGE" ] || [ -z "$HEAD" ] || [ -z "$BASE_REF" ] || [ -z "$DEFAULT" ]; then
  echo "cannot judge: the job supplied no checker, head, target or default branch"; exit 2
fi
T=$(mktemp -d) || exit 2
trap 'rm -rf "$T"' EXIT
git fetch -q --no-tags origin "+refs/heads/$DEFAULT:refs/remotes/origin/$DEFAULT" \
  "+refs/heads/$BASE_REF:refs/remotes/origin/$BASE_REF" "$HEAD" || { echo "the branches and candidate cannot be fetched"; exit 2; }
if [ "$BASE_REF" = "$DEFAULT" ]; then
  set -- freshness "$DEFAULT" "refs/remotes/origin/$DEFAULT" "$KAAL_HEAD_REF" "$HEAD"
else
  set -- synchronization "$DEFAULT" "$BASE_REF" "refs/remotes/origin/$DEFAULT" "refs/remotes/origin/$BASE_REF" "$HEAD"
fi
RC=0; node "$LINEAGE" "$@" > "$T/verdict" 2>&1 || RC=$?
[ -n "$GITHUB_STEP_SUMMARY" ] && cat "$T/verdict" >> "$GITHUB_STEP_SUMMARY"
case $RC in
  0) cat "$T/verdict" ;;
  3) echo "Not applicable: $(cat "$T/verdict")" ;;
  1) cat "$T/verdict"; exit 1 ;;
  *) cat "$T/verdict"; exit 2 ;;
esac
FIRST=$RC
RC=0; node "$LINEAGE" auto-merge "$DEFAULT" "$BASE_REF" "refs/remotes/origin/$DEFAULT" \
  "refs/remotes/origin/$BASE_REF" "$HEAD" "${KAAL_AUTO_MERGE:-none}" > "$T/method" 2>&1 || RC=$?
[ -n "$GITHUB_STEP_SUMMARY" ] && cat "$T/method" >> "$GITHUB_STEP_SUMMARY"
case $RC in
  0) cat "$T/method" ;;
  3) echo "Not applicable: $(cat "$T/method")" ;;
  1) echo "Merge method: $(cat "$T/method")"; exit 1 ;;
  *) echo "Merge method: $(cat "$T/method")"; exit 2 ;;
esac
[ "$FIRST" = 3 ] && [ "$RC" = 3 ] && exit 3
exit 0
