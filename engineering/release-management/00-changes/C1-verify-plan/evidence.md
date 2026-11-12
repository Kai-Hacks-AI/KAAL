# C1 evidence

The evidence of this Change is observed against `main`, not against the collector `kaal/release/verify-plan` and not against an open pull request.

## Provenance

- Baseline: `main` at `1263be7fdca264722f154be0d6f77af8b5c0fa57`.
- Method: a clean extract of that commit, with only the Case files of this Change (T1 to T42) laid over it at their own paths, executed with the interim runner. Nothing of the collector except those files is present.

```
W=$(mktemp -d)
git archive 1263be7fdca264722f154be0d6f77af8b5c0fa57 . | tar -x -C "$W"
mkdir "$W/runner"
cp "$PLAN/00-changes/C1-verify-plan/run-red.mjs" "$PLAN/00-changes/C1-verify-plan/baseline-judge.mjs" "$W/runner/"
for f in $(git ls-files "$PLAN" | grep -E '/T([1-9]|[1-3][0-9]|4[0-2])\.(red|test)\.mjs$'); do
  mkdir -p "$W/$(dirname "$f")"; cp "$f" "$W/$f"
done
cd "$W"
node runner/run-red.mjs --evidence ev.json $(find engineering/release-management -name 'T*.mjs' | grep -E '/T([1-9]|[1-3][0-9]|4[0-2])\.(red|test)\.mjs$' | sort -V)
```

Environment: Node v22.23.4 on Linux, no dependencies. `$PLAN` is `engineering/release-management` of the branch under review.

## Result

The first run of the Cases as the earlier PLAN wrote them: 42 executed, 0 RED-observed, 15 RED-unconditional, 27 ERROR, 0 GREEN. The unconditional markers failed whatever the tree held, and the Cases of the judgment could not import code that `main` does not hold. That was no meaningful RED against `main`, and the earlier claim of accepted RED rested on the baseline stand-in of the runner, which is not `main`.

After the Cases T19 and T29 to T37 were rebuilt as assertions about what `main` lacks (step 4 of PLAN in change.md): 42 executed, 10 RED-observed, 5 RED-unconditional, 27 ERROR, 0 GREEN.

| Result | Cases | Meaning |
| --- | --- | --- |
| RED-observed | T19 (the workflow is absent), T29 and T34 (README.md is absent), T30 and T36 (I1 is absent), T31 and T35 (F1 is absent), T32 (A1 is absent), T33 (D1 is absent), T37 (the rules of the judgment are absent) | an assertion about intended behaviour fails against `main` |
| RED-unconditional | T16, T17, T18, T26, T27 | markers; T16 is re-expressed in DO step 5, and T17, T18, T26 and T27 leave this Change with their elements |
| ERROR | T1 to T15, T20 to T25, T28, T38 to T42 | the Case imports code of the judgment that `main` does not hold, so it cannot run there |

The Cases that import the judgment prove nothing as RED. They are green where the judgment is, and the ten observed RED Cases above are the evidence of the missing behaviour: the layout, the Intent, the Requirement, the elements, the Defect, the rules of the judgment and the workflow.
