#!/usr/bin/env bash
# Judges a proposed synchronization of a kaal/* lineage with the default branch, in Git terms.
#
#   synchronization.sh <default tip> <lineage tip> <candidate head>    (run inside a repository holding all three)
#
# A synchronization is one commit on the lineage's tip whose message carries the line
# `Synchronized-with: <sha>`, the default-branch commit it synchronizes with. Its tree is what
# rebasing the lineage's outstanding Changes onto that commit produced, conflicts resolved explicitly.
# It is verified against the three-way merge of that commit and the lineage's tip over the last
# default-branch state the lineage incorporated (its newest Synchronized-with line on first-parent
# history, else its fork point): every path must equal that merge, except where the merge conflicts.
# Those paths are the synchronization's explicit resolutions, and they alone are its Change.
#
# Exit 0: verified; stdout lists the explicit resolutions, one path per line, stderr says why.
# Exit 1: a synchronization that is wrong or stale; stderr says what to rebuild.
# Exit 2: cannot judge.
# Exit 3: not a synchronization (no Synchronized-with line on the candidate head).
# Used by Lineage Synchronization (the verdict) and Change Isolation (the Change to judge), as
# both stand on the default branch.
set -uo pipefail
TIP=$1 BASE=$2 HEAD=$3
synced() { git log "$@" --format=%B | grep -m1 -oxE 'Synchronized-with: [0-9a-f]{40}' | cut -d' ' -f2 || true; }
S=$(synced -1 "$HEAD")
[ -n "$S" ] || { echo "not a synchronization: $HEAD carries no Synchronized-with line" >&2; exit 3; }
REBUILD="Rebuild it: in a working branch from the default branch's tip $TIP, rebase the lineage's outstanding Changes onto it and resolve conflicts explicitly; commit that tree as one commit on the lineage's tip $BASE with the line 'Synchronized-with: $TIP' (git commit-tree <tree> -p $BASE) and push it to this pull request."
fail() { echo "$1 $REBUILD" >&2; exit 1; }
[ "$(git rev-parse -q --verify "$HEAD^1")" = "$BASE" ] && [ "$(git rev-list --count "$BASE..$HEAD")" = 1 ] \
  || fail "This synchronization is not one commit on the lineage's tip $BASE."
git merge-base --is-ancestor "$S" "$TIP" 2>/dev/null || fail "Synchronized-with $S is not a default-branch commit."
[ "$S" = "$TIP" ] || fail "Stale: the default branch has advanced from $S to $TIP."
LB=$(synced --first-parent "$BASE")
{ [ -n "$LB" ] && git merge-base --is-ancestor "$LB" "$TIP" 2>/dev/null; } || LB=$(git merge-base "$BASE" "$TIP")
OUT=$(git merge-tree --write-tree --name-only --no-messages --merge-base="$LB" "$S" "$BASE"); [ $? -le 1 ] || { echo "cannot merge $S and $BASE over $LB" >&2; exit 2; }
RESOLVED=$(tail -n +2 <<< "$OUT" | sed '/^$/d' | sort -u)
DIFFERS=$(git diff --no-renames --name-only "${OUT%%$'\n'*}" "$HEAD" | grep -vxF -f <(printf '%s\n' "$RESOLVED") || true)
[ -z "$DIFFERS" ] || fail "It differs from the default branch $S with the lineage's outstanding Changes since $LB on: $(paste -sd' ' <<< "$DIFFERS")."
echo "verified: the default branch $S with the lineage's outstanding Changes since $LB; explicit resolutions: $([ -n "$RESOLVED" ] && paste -sd' ' <<< "$RESOLVED" || echo none)" >&2
[ -z "$RESOLVED" ] || printf '%s\n' "$RESOLVED"
