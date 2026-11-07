#!/usr/bin/env bash
# Binds a merge group to the pull request queued in it. One implementation for both merge group jobs that need the
# queued pull request (the Branching job and the Change Isolation (review) job), so they cannot disagree.
#
#   bind-group.sh branching | review
#
# It runs from the checkout of the default branch (trusted code); the candidate is only fetched and compared, never run.
# Input (environment): GH_TOKEN, GITHUB_REPOSITORY, GITHUB_ENV, GROUP_REF (the group's head_ref), GROUP_HEAD,
# GROUP_BASE_SHA (the base commit the queue built the group on), GROUP_BASE_REF (refs/heads/<base>).
#
# The group must be exactly the queued pull request at its current head on that base, in one of the two shapes GitHub's
# queue produces. Anything this script cannot establish ends in exit 2 (cannot judge); nothing is passed on its behalf.
#
#   one parent (squash method): the parent is GROUP_BASE_SHA and the group's tree is the tree of merging the pull
#     request head into that base (git merge-tree). A conflict, or a merge that cannot be computed, is cannot judge,
#     which is told apart from a tree that differs (also exit 2, with its own message).
#   two parents (merge method): the first parent is GROUP_BASE_SHA and the pull request head is an ancestor of the group.
#   any other shape, or a missing or malformed base: cannot judge.
set -euo pipefail

job="${1:-}"
case "$job" in
  branching) label="Branching" ;;
  review) label="Change Isolation (review)" ;;
  *) echo "::error title=bind-group: usage::unknown job '$job'"; exit 2 ;;
esac
fail() { echo "::error title=$label: cannot judge::$1"; exit 2; }

N=$(printf '%s' "$GROUP_REF" | sed -n 's#^.*/pr-\([0-9][0-9]*\)-[0-9a-f]\{7,\}$#\1#p')
[ -n "$N" ] || fail "the queued pull request cannot be read from the group's ref $GROUP_REF"
printf '%s' "${GROUP_BASE_SHA:-}" | grep -Eq '^[0-9a-f]{40}$' || fail "the group's base commit is missing or malformed"
printf '%s' "${GROUP_HEAD:-}" | grep -Eq '^[0-9a-f]{40}$' || fail "the group's head commit is missing or malformed"

gh api "repos/$GITHUB_REPOSITORY/pulls/$N" > pull.json || fail "pull request $N cannot be read"
BASE_REF=$(jq -r .base.ref pull.json)
[ "refs/heads/$BASE_REF" = "$GROUP_BASE_REF" ] || fail "pull request $N does not target the group's base"
PRHEAD=$(jq -r .head.sha pull.json)
printf '%s' "$PRHEAD" | grep -Eq '^[0-9a-f]{40}$' || fail "the head of pull request $N cannot be read"

if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
  git fetch -q --no-tags --unshallow origin || fail "the history needed to compare the group cannot be fetched"
fi
git fetch -q --no-tags origin "$PRHEAD" "$GROUP_HEAD" "$GROUP_BASE_SHA" "+refs/heads/$BASE_REF:refs/remotes/origin/$BASE_REF" \
  || fail "the pull request's head, the group or its base cannot be fetched"

read -r -a commit <<< "$(git rev-list --parents -n 1 "$GROUP_HEAD")" || fail "the group's commit cannot be read"
[ "${commit[0]}" = "$GROUP_HEAD" ] || fail "the group's commit cannot be read"
case "$((${#commit[@]} - 1))" in
  1)
    [ "${commit[1]}" = "$GROUP_BASE_SHA" ] || fail "the group's parent is not the group's base"
    expected=$(git merge-tree --write-tree "$GROUP_BASE_SHA" "$PRHEAD") \
      || fail "applying pull request $N to the group's base does not merge cleanly or cannot be computed"
    printf '%s' "$expected" | grep -Eq '^[0-9a-f]{40,64}$' || fail "the result of applying pull request $N cannot be computed"
    [ "$(git rev-parse "$GROUP_HEAD^{tree}")" = "$expected" ] \
      || fail "the group's content is not pull request $N at its head $PRHEAD on the group's base"
    ;;
  2)
    [ "${commit[1]}" = "$GROUP_BASE_SHA" ] || fail "the group's first parent is not the group's base"
    git merge-base --is-ancestor "$PRHEAD" "$GROUP_HEAD" \
      || fail "the group does not contain pull request $N at its head $PRHEAD"
    ;;
  *) fail "the group has an unexpected shape ($((${#commit[@]} - 1)) parents)" ;;
esac

case "$job" in
  branching)
    {
      echo "PR_HEAD=$PRHEAD"
      echo "KAAL_HEAD_REF=$(jq -r .head.ref pull.json)"
      # GitHub clears a pull request's auto-merge field once it is in the queue, and under a queue the label it reports says nothing
      # (the queue's configured method decides, see effectiveMethod). Being in the group is itself the intent to merge, so an empty
      # field is not "auto-merge disabled": it is reported as "merge", the label GitHub gives a queued pull request. This only normalizes
      # the input inside a merge group; it grants no method, and effectiveMethod still takes the queue's own method and fails closed.
      echo "KAAL_AUTO_MERGE=$(jq -r '.auto_merge.merge_method // "merge"' pull.json)"
    } >> "$GITHUB_ENV"
    ;;
  review)
    { echo "PR_NUMBER=$N"; echo "PR_HEAD=$PRHEAD"; echo "BASE_REF=$BASE_REF"; } >> "$GITHUB_ENV"
    ;;
esac
