# C4 evidence

The PLAN of C4 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C4 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`. It holds the machinery of `inventory.md` and no file of `engineering/release-management/` for this control.
- Method: the seventeen Cases of this PLAN (T55 to T71) are copied over a full checkout of `main`, so that the judge, the declarations, the hook and the workflows are `main`'s own, and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- The behavioral Cases (T56, T57, T58, T60, T65, T67, T68, T69) were also run once against a throwaway reference outside the repository: a copy of the judge with `judge()` and `--json --place`, and the two declarations changed as F5 says. All eight were green with it, so each can pass. The reference is not part of this PLAN and implies no design of the DO beyond what F4 to F6 state.
- No job executes these Cases. Engineering CI runs the explicit list of `test:engineering`, and no script, lane or workflow names a file of `engineering/release-management/` or a `.red.mjs` file. The result below is by hand.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T55 | I3 | I3 is absent | green |
| release/T56 | F4 | the judge is not exported | the judge is not exported |
| release/T57 | F5 | Change Isolation declares no hook placement of its own | the same |
| release/T58 | F6 | the judge prints no machine-readable record | the same |
| release/T59 | A17 | A17 is absent | green |
| release/T60 | A18 | A18 is absent | the judge is not exported |
| release/T61 | A19 | A19 is absent | green |
| release/T62 | A20 | A20 is absent | green |
| release/T63 | A21 | A21 is absent | green |
| release/T64 | A22 | A22 is absent | green |
| release/T65 | A23 | A23 is absent | the hook does not run Change Isolation by its own declaration |
| release/T66 | G15 | I3 is absent | green |
| release/T67 | G16 | the judge is not exported | the same |
| release/T68 | G17 | Change Isolation declares no hook placement of its own | the same |
| release/T69 | G18 | the judge prints no machine-readable record | the same |
| release/T70 | G19 | A17 is absent | green |
| release/T71 | G20 | the replay is absent | the same |

On `main`: 17 RED-observed, 0 unconditional, 0 error, 0 green. In the tree of this PLAN: 9 RED-observed, 8 green. The eight green Cases are about documents this PLAN adds. The nine red Cases wait for the judge's verdict function and record, the declaration of the hook placement and the replay, which the DO delivers.

## What the RED asks the Change to add relative to `main`

I3, F4 to F6 and A17 to A23 (this PLAN), an exported `judge()` and a `--json --place` record (S1), the replay (S2), the hook placement declared and run through the same adapter with the same ledger (S3), and `push` without Change Isolation (S6).

## Reproduce

Environment: Node 24 on Linux. Run from a checkout of this branch. `red.mjs` calls `run()` of each Case and prints RED-observed for an assertion failure and ERROR for anything else.

```
cat > red.mjs <<'JS'
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
for (const f of process.argv.slice(2)) {
  const m = await import(pathToFileURL(resolve(f)).href);
  try { await m.run(); console.log('GREEN       ', m.id); }
  catch (x) { console.log(x?.code === 'ERR_ASSERTION' ? 'RED-observed' : 'ERROR       ', m.id, String(x.message).split('\n')[0]); }
}
JS
# in the tree of this PLAN
node red.mjs $(find engineering/release-management -name 'T*.red.mjs' | sort -V)
# on main: a checkout of main with only the Case files added
W=$(mktemp -d); git worktree add --detach "$W" origin/main
for f in $(find engineering/release-management -name 'T*.red.mjs'); do mkdir -p "$W/$(dirname "$f")"; cp "$f" "$W/$f"; done
(cd "$W" && node "$OLDPWD/red.mjs" $(find engineering/release-management -name 'T*.red.mjs' | sort -V))
```

## Reproduce the observations of `inventory.md`

```
R=repos/Kai-Hacks-AI/KAAL
gh api $R/rules/branches/main                                    # O1: promotion ruleset, required contexts, queue
gh api $R/rulesets/24952357                                      # O1: integration ruleset
gh api $R/pulls/1319 --jq .mergeable_state                       # O2
gh api $R/actions/workflows/change-isolation.yml/runs?status=failure   # O2: failing runs, with head_sha
# O3: the judge over first-parent history, path rules only
git show origin/main:engineering/change-isolation/check.mjs > /tmp/check.mjs
for c in $(git rev-list --first-parent origin/main); do p=$(git rev-parse -q --verify $c^) || continue
  git diff --no-renames --name-only -z $p $c | node /tmp/check.mjs >/dev/null 2>&1 || echo "$c"; done
# O4: the hook, called directly on a scratch branch that holds a Core path and README.md
git config core.hooksPath                                        # empty: Git calls no hook
printf 'refs/heads/b %s refs/heads/b %s\n' "$(git rev-parse HEAD)" 0000000000000000000000000000000000000000 | sh .githooks/pre-push origin
# H4: the red files are green by hand and run by nothing
node --test engineering/change-isolation/*.red.mjs
grep -rn "red.mjs" package.json engineering/lanes .github/workflows
```

Observed on 11 Nov 2026 against `main` 8720c40:

```
O3: 139 first-parent landings, 135 conform, 3 do not: cec37d9, 9a89e80, 52b4e20 (one root commit has no parent)
H4: attest-target 3/3, ledger-in-promotion 20/20, merge-group 10/10, review-unreadable 4/4 passing; no reference in package.json, lanes or workflows
```
