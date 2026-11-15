#!/bin/bash
# KAAL's Promotion Source judgment of one pull request, as a KAAL-owned check that the Promotion
# Source job runs through kaal-guard (.kaal/config/guard/Promotion-Source.md). The job's former body, moved: the
# rule and its verdict live in engineering/github/lineage.ts. Its first argument is that checker, which
# Guard takes from the base revision KAAL's job supplies: the default branch's tip (trusted).
#
# Facts from Guard: GUARD_BASE_REF, the target branch. From KAAL's job: KAAL_REPO, this repository;
# KAAL_DEFAULT, the default branch; KAAL_HEAD_REPO and KAAL_HEAD_REF, the source repository and branch.
# Exits as lineage.ts does: 0 pass, 1 fail, 3 not applicable; anything else is 2, cannot judge.
LINEAGE=$1
if [ -z "$LINEAGE" ] || [ -z "$GUARD_BASE_REF" ] || [ -z "$KAAL_REPO" ] || [ -z "$KAAL_DEFAULT" ] || [ -z "$KAAL_HEAD_REPO" ] || [ -z "$KAAL_HEAD_REF" ]; then
  echo "cannot judge: the job supplied no checker, target, repository, default branch or source"; exit 2
fi
RC=0; node "$LINEAGE" source "$KAAL_REPO" "$KAAL_DEFAULT" "$GUARD_BASE_REF" "$KAAL_HEAD_REPO" "$KAAL_HEAD_REF" 2>&1 || RC=$?
case $RC in 0|1|3) exit $RC ;; *) exit 2 ;; esac
