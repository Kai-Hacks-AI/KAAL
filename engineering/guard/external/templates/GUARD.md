# Guard

Guard connects this repository's own checks to a local `pre-push` hook and to CI, with one meaning per check. It is plain files, owned and maintained here:

| File | What it does |
| --- | --- |
| `.githooks/guard.sh` | lists the checks and runs them; the one place a check's meaning lives |
| `.githooks/pre-push` | early local feedback: runs the `LOCAL` checks before a push |
| `.github/workflows/guard.yml` | one CI job per `CI` check |
| `GUARD.md` | this page |

## The checks

@CHECKS@

A check's exit status is its verdict:

| Status | Verdict | Push | CI job |
| --- | --- | --- | --- |
| 0 | pass | goes through | succeeds |
| 1 | fail | blocked | fails |
| 2 | cannot judge | blocked | fails |
| 3 | not applicable | goes through | succeeds, printed as not applicable |
| any other | cannot judge | blocked | fails |

A check runs from the repository root with no stdin. It may read the facts `GUARD_HEAD` (the candidate commit), `GUARD_BASE` and `GUARD_BASE_REF` (the target commit and its name) and `GUARD_CHANGED` (a file listing the changed paths, NUL-separated). A fact that cannot be determined is left unset, so a check that needs it should exit 2.

## Use

```sh
git config core.hooksPath .githooks       # once per clone, to enable the hook
sh .githooks/guard.sh --local             # what the hook runs
sh .githooks/guard.sh --check <name>      # one check, as its CI job runs it
git push --no-verify                      # skip the hook once; CI still decides
```

The hook is local feedback only. It takes the remote's default branch as the base and prints the commit it used. If the hook passes but CI fails, `git fetch` and compare the bases.

## Change the checks

To add a check, add its name to `LOCAL`, `CI` or both in `.githooks/guard.sh`, and give it one line in `run_check`. For a `CI` check, also add `- { check: <name> }` to the matrix in `.github/workflows/guard.yml`. To remove a check, take it out of all of those places.

## What CI does and does not show

A job in `guard.yml` shows that the check ran and what its verdict was. A merge depends on that job only once branch protection, or a ruleset, names it as a required check. This repository sets that itself; nothing in these files does or proves it.
