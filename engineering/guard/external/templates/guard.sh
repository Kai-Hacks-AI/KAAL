#!/bin/sh
# Guard: runs this repository's own checks with one meaning, for the pre-push hook and for CI.
#   sh .githooks/guard.sh --local            the checks the hook runs
#   sh .githooks/guard.sh --check <name>     one check, as a CI job runs it
#   sh .githooks/guard.sh pre-push <remote>  the pre-push hook (.githooks/pre-push calls this)
# A check's exit status is its verdict: 0 pass, 1 fail, 2 cannot judge, 3 not applicable; any other
# status is cannot judge. Fail and cannot judge block the push and fail the job. See GUARD.md.

# The checks. A name is listed in LOCAL, CI or both, and has one command in run_check.
LOCAL="@LOCAL@"
CI="@CI@"

run_check() {
  case $1 in
@CASES@
    *) return 100 ;;
  esac
}

# Runs one check from the repository root with no stdin, prints its verdict line, and returns 1 for
# fail or cannot judge, else 0. Its own output goes to the terminal or the log unchanged.
judge() {
  name=$1
  case " $LOCAL $CI " in *" $name "*) ;; *)
    echo "cannot judge: $name: not a check in .githooks/guard.sh"
    echo "  do: add $name to LOCAL or CI and to run_check, or name a listed check"
    return 1 ;;
  esac
  ( cd "$root" && run_check "$name" </dev/null >&2 )
  s=$?
  case $s in
    0) echo "pass: $name: exit status 0" ;;
    1) echo "fail: $name: exit status 1"; echo "  do: fix what $name reports, then run sh .githooks/guard.sh --check $name"; return 1 ;;
    3) echo "not applicable: $name: exit status 3" ;;
    2) echo "cannot judge: $name: exit status 2"; echo "  do: fix the cause $name names; it blocks until $name can judge"; return 1 ;;
    *) echo "cannot judge: $name: exit status $s is not a verdict"; echo "  do: make $name exit 0 to 3"; return 1 ;;
  esac
  return 0
}

root=$(git rev-parse --show-toplevel) || exit 2
status=0
case $1 in
  --local)
    for c in $LOCAL; do judge "$c" || status=1; done ;;
  --check)
    [ -n "$2" ] || { echo "cannot judge: guard: --check needs a check name"; exit 2; }
    judge "$2" || status=1 ;;
  pre-push)
    # For each pushed ref: the base is the remote's default branch; the facts go to the checks as
    # GUARD_HEAD, GUARD_BASE, GUARD_BASE_REF and GUARD_CHANGED (a file of changed paths, NUL-separated).
    # A fact Git cannot give is left unset, never filled with a value that looks valid.
    remote=${2:-origin}
    target=$(git symbolic-ref --quiet --short "refs/remotes/$remote/HEAD" 2>/dev/null)
    [ -n "$target" ] || target=$remote/main
    base=$(git rev-parse --quiet --verify "$target^{commit}" 2>/dev/null)
    changed=$(mktemp) || exit 1
    trap 'rm -f "$changed"' EXIT
    while read -r local_ref head remote_ref remote_head; do
      case $head in *[!0]*) ;; *) continue ;; esac # a deleted ref carries no change
      unset GUARD_BASE GUARD_BASE_REF GUARD_CHANGED
      export GUARD_HEAD="$head"
      if [ -n "$base" ]; then
        echo "$local_ref -> $target (base $base):" >&2
        export GUARD_BASE="$base" GUARD_BASE_REF="$target"
        if git diff --name-only -z "$base...$head" >"$changed" 2>/dev/null; then
          export GUARD_CHANGED="$changed"
        else
          echo "the changed paths between $target and $local_ref cannot be computed; GUARD_CHANGED is not set." >&2
        fi
      else
        echo "$local_ref: no base, $target is not known here; GUARD_BASE is not set. Fetch $remote to give it one." >&2
      fi
      for c in $LOCAL; do judge "$c" >&2 || status=1; done
    done
    [ $status = 0 ] || echo "Local feedback only; CI decides. Fix and push again, or skip once with git push --no-verify." >&2 ;;
  *)
    echo "usage: sh .githooks/guard.sh (--local | --check <name> | pre-push <remote>)"; exit 2 ;;
esac
exit $status
