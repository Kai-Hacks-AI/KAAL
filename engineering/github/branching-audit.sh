#!/bin/bash
# KAAL's Branching audit, as a KAAL-owned check that the Branching audit job runs through kaal-guard
# (.kaal/config/guard/Branching-audit.md). The job's former two steps, moved: it reads the facts from Git and
# GitHub, then judges them. The rules and verdicts live in engineering/github/lineage.ts and the
# Owner's holds in engineering/github/holds.json. The first argument is lineage.ts, which Guard takes
# from the base revision KAAL's job supplies: the default branch's tip (trusted); holds.json is read
# from the same tip.
#
# From KAAL's job: GH_TOKEN; KAAL_SERVER and KAAL_REPO, this repository; KAAL_DEFAULT, the default
# branch; KAAL_EVENT, the event (push, schedule or workflow_dispatch); and for a push KAAL_REF,
# KAAL_CREATED, KAAL_DELETED, KAAL_BEFORE and KAAL_AFTER.
# Exits 1 when any verdict fails, else 2 when any cannot be judged, else 4 (held) when the Owner holds
# anything, else 0.
LINEAGE=$1
if [ -z "$LINEAGE" ] || [ -z "$KAAL_SERVER" ] || [ -z "$KAAL_REPO" ] || [ -z "$KAAL_DEFAULT" ] || [ -z "$KAAL_EVENT" ]; then
  echo "cannot judge: the job supplied no checker, repository, default branch or event"; exit 2
fi
LINEAGE=$(cd "$(dirname "$LINEAGE")" && pwd)/$(basename "$LINEAGE")
SERVER=$KAAL_SERVER REPO=$KAAL_REPO DEFAULT=$KAAL_DEFAULT EVENT=$KAAL_EVENT REF=$KAAL_REF
CREATED=$KAAL_CREATED DELETED=$KAAL_DELETED BEFORE=$KAAL_BEFORE AFTER=$KAAL_AFTER
W=$(mktemp -d) || exit 2
trap 'rm -rf "$W"' EXIT
F="$W/facts" && mkdir -p "$F"

# Read the facts from Git and GitHub.
git init -q "$W/lineage" && cd "$W/lineage" || exit 2
git fetch -q --no-tags "$SERVER/$REPO" "+refs/heads/*:refs/remotes/origin/*" "+refs/pull/*/head:refs/pull/*/head" || {
  echo "the repository's branches cannot be fetched"; exit 2; }
git show "refs/remotes/origin/$DEFAULT:engineering/github/holds.json" > "$F/holds.json" || {
  echo "$DEFAULT does not hold engineering/github/holds.json"; exit 2; }
set -o pipefail
gh api --paginate "repos/$REPO/activity?per_page=100" \
  --jq '.[] | {ref, before, after, timestamp, activity_type}' | jq -s . > "$F/activity.json" || {
  echo "the repository's activity cannot be read"; exit 2; }
gh api --paginate "repos/$REPO/pulls?state=all&per_page=100" \
  --jq ".[] | {number, state, base: .base.ref, head_ref: .head.ref, own: (.head.repo.full_name == \"$REPO\"), head: .head.sha, merge: (if .merged_at then .merge_commit_sha else null end)}" \
  | jq -s . > "$F/pulls.json" || { echo "the repository's pull requests cannot be read"; exit 2; }
set +o pipefail
UNACCOUNTED=$(jq -r -n --slurpfile a "$F/activity.json" --slurpfile p "$F/pulls.json" '
  ($p[0] | map(.merge // empty)) as $m
  | [$a[0][] | select(.activity_type == "pr_merge" and (.ref == "refs/heads/main" or (.ref | startswith("refs/heads/kaal/"))))
     | select(.after as $x | $m | index($x) | not) | "\(.ref) \(.after)"]
  | join(", ")') || { echo "the activity and pull requests cannot be compared"; exit 2; }
if [ -n "$UNACCOUNTED" ]; then echo "merges no merged pull request accounts for: $UNACCOUNTED"; exit 1; fi
git for-each-ref --format='%(refname:lstrip=3) %(objectname)' refs/remotes/origin/ > "$F/branches"
echo "$(jq length "$F/activity.json") activity records, $(jq length "$F/pulls.json") pull requests, $(wc -l < "$F/branches") branches"

# Audit with the default branch's checker.
MAIN="refs/remotes/origin/$DEFAULT"
FAILED=0 UNJUDGED=0 HELD=0
judge() {
  local title=$1; shift
  local rc=0; node "$LINEAGE" "$@" > "$F/verdict" 2>&1 || rc=$?
  [ -n "$GITHUB_STEP_SUMMARY" ] && cat "$F/verdict" >> "$GITHUB_STEP_SUMMARY"
  case $rc in
    0|1|4)
      while IFS= read -r line; do
        case $line in
          fail:*) echo "$title: $line"; FAILED=1 ;;
          held:*) echo "$title: $line"; HELD=1 ;;
          pass:*) echo "$title: ${line#pass: }" ;;
          *) if [ "$rc" = 1 ]; then echo "$title: fail: $line"; FAILED=1; else echo "$title: $line"; fi ;;
        esac
      done < "$F/verdict" ;;
    3) echo "$title: not applicable: $(cat "$F/verdict")" ;;
    *) echo "$title: cannot judge: $(cat "$F/verdict")"; UNJUDGED=1 ;;
  esac
}
landing() { # landing <ref> <before> <after>: the pull requests GitHub associates with <after>
  jq --arg after "$3" '[.[] | select(.merge == $after or .head == $after) | {number, base, head, merge}]' "$F/pulls.json" > "$F/landed.json"
  judge Landing landing "$DEFAULT" "$1" "$MAIN" "$2" "$3" "$F/landed.json"
}
establishment() { judge Establishment establishment "$DEFAULT" "$1" "$F/activity.json"; }
collectors=$(awk '$1 ~ /^kaal\// {print $1}' "$F/branches")

if [ "$EVENT" = push ]; then
  if [ "$CREATED" = true ]; then
    case $REF in kaal/*) establishment "$REF" ;; esac
  elif [ "$DELETED" != true ]; then
    landing "$REF" "$BEFORE" "$AFTER"
  fi
else
  for c in $collectors; do establishment "$c"; done
  since=$(date -u -d '2 days ago' +%Y-%m-%dT%H:%M:%SZ)
  while read -r ref before after; do
    git cat-file -e "$after^{commit}" 2>/dev/null || { echo "Landing: $ref at ${after:0:7} is no longer in any branch; not judged"; continue; }
    landing "$ref" "$before" "$after"
  done < <(jq -r --arg since "$since" --arg main "refs/heads/$DEFAULT" '.[]
    | select(.timestamp >= $since and (.activity_type | IN("pr_merge", "push", "force_push"))
             and (.ref == $main or (.ref | startswith("refs/heads/kaal/"))))
    | "\(.ref | ltrimstr("refs/heads/")) \(.before) \(.after)"' "$F/activity.json")
fi

if [ "$EVENT" != push ] || [ "$REF" = "$DEFAULT" ]; then
  DEFAULT=$DEFAULT jq --argjson c "$(printf '%s\n' $collectors | jq -R . | jq -s .)" '. as $p | reduce $c[] as $k ({}; .[$k] = {
      open: [$p[] | select(.state == "open" and .base == $k) | .number],
      promotions: [$p[] | select(.merge != null and .base == env.DEFAULT and .head_ref == $k and .own) | {number, head, merge}]
    })' "$F/pulls.json" > "$F/collectors.json"
  judge Lifecycle collectors "$DEFAULT" "$MAIN" refs/remotes/origin/kaal/ "$F/holds.json" "$F/collectors.json"
  awk -v d="$DEFAULT" '$1 != d && $1 != "HEAD" && $1 !~ /^kaal\// {print}' "$F/branches" \
    | jq -R 'split(" ") | {branch: .[0], tip: .[1]}' | jq -s --slurpfile p "$F/pulls.json" \
      'map(. as $b | . + {merged: [$p[0][] | select(.merge != null and .head_ref == $b.branch and .own) | {number, head}]})' > "$F/working.json"
  judge Lifecycle working-branches "$DEFAULT" "$F/working.json"
fi
[ $FAILED = 1 ] && exit 1
[ $UNJUDGED = 1 ] && exit 2
[ $HELD = 1 ] && exit 4
exit 0
