#!/bin/bash
# KAAL's Promotion Source judgment of one pull request, as a KAAL-owned check that the Promotion
# Source job runs through kaal-guard (.kaal/config/guard/Promotion-Source.md). The rule and its verdict live
# in engineering/github/lineage.ts. Its first argument is that checker, which Guard takes from the base
# revision KAAL's job supplies: the default branch's tip (trusted).
#
# Facts from Guard: GUARD_BASE_REF, the target branch. From KAAL's job: KAAL_REPO, this repository;
# KAAL_DEFAULT, the default branch; KAAL_HEAD_REPO and KAAL_HEAD_REF, the source repository and branch.
# A kaal/<capability>/*, hotfix/* or wire/* head of this repository into the default branch is admitted only
# when every check its rulesets require is green on its exact head, so for those the job also supplies
# KAAL_HEAD_SHA (the head commit) and GH_TOKEN, and this script reads GitHub's effective rules of the head
# branch and the check runs on that commit (nothing of the head is fetched or run). A required check still
# running is waited for (KAAL_ATTEMPTS times, KAAL_INTERVAL seconds apart); anything unreadable is exit 2.
# KAAL_GH names the GitHub CLI (default gh).
# Exits as lineage.ts does: 0 pass, 1 fail, 3 not applicable; anything else is 2, cannot judge.
LINEAGE=$1
if [ -z "$LINEAGE" ] || [ -z "$GUARD_BASE_REF" ] || [ -z "$KAAL_REPO" ] || [ -z "$KAAL_DEFAULT" ] || [ -z "$KAAL_HEAD_REPO" ] || [ -z "$KAAL_HEAD_REF" ]; then
  echo "cannot judge: the job supplied no checker, target, repository, default branch or source"; exit 2
fi
ARGS=("$KAAL_REPO" "$KAAL_DEFAULT" "$GUARD_BASE_REF" "$KAAL_HEAD_REPO" "$KAAL_HEAD_REF")
GH=${KAAL_GH:-gh}
case $KAAL_HEAD_REF in kaal/*/?*|hotfix/?*|wire/?*) STOCK=1 ;; *) STOCK= ;; esac
if [ -z "$STOCK" ] || [ "$GUARD_BASE_REF" != "$KAAL_DEFAULT" ] || [ "$KAAL_HEAD_REPO" != "$KAAL_REPO" ]; then
  RC=0; node "$LINEAGE" source "${ARGS[@]}" 2>&1 || RC=$?
  case $RC in 0|1|3) exit $RC ;; *) exit 2 ;; esac
fi
if [ -z "$KAAL_HEAD_SHA" ]; then
  echo "cannot judge: the job supplied no head commit to read the checks at"; exit 2
fi
W=$(mktemp -d) || exit 2
trap 'rm -rf "$W"' EXIT
N=${KAAL_ATTEMPTS:-30}; WAIT=${KAAL_INTERVAL:-20}
while :; do
  "$GH" api --paginate "repos/$KAAL_REPO/rules/branches/$KAAL_HEAD_REF" --jq '.[]' > "$W/rules.ndjson" || {
    echo "cannot judge: the rules of $KAAL_HEAD_REF cannot be read"; exit 2; }
  "$GH" api --paginate "repos/$KAAL_REPO/commits/$KAAL_HEAD_SHA/check-runs" \
    --jq '.check_runs[] | {id, name, status, conclusion, appId: .app.id, headSha: .head_sha}' > "$W/runs.ndjson" || {
    echo "cannot judge: the check runs on $KAAL_HEAD_SHA cannot be read"; exit 2; }
  RC=0; OUT=$(node "$LINEAGE" source "${ARGS[@]}" "$KAAL_HEAD_SHA" "$W/rules.ndjson" "$W/runs.ndjson" 2>&1) || RC=$?
  N=$((N - 1))
  if [ "$RC" = 1 ] && [ "$N" -gt 0 ] && echo "$OUT" | grep -q '(pending)'; then sleep "$WAIT"; continue; fi
  echo "$OUT"
  case $RC in 0|1|3) exit $RC ;; *) exit 2 ;; esac
done
