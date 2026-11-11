# C3 evidence

The PLAN of C3 observes its RED against `main`, not against the collector of C1 or against any open pull request. Work that is not on `main` is not delivered functionality.

## Provenance

- Baseline: `main` at `9033099e9234d4059c841c155abc9c309a7aa6fb`. `main` holds no `engineering/release-management/` and no `.github/PULL_REQUEST_TEMPLATE/`.
- Method: a clean extract of `.github` from that commit, with only the eleven Cases of this PLAN (T43 to T53) laid over it at their own paths, executed with the interim runner of C1:

  ```
  node run-red.mjs --evidence ev-main.json <the eleven Case files>
  ```

  The Cases read only repository files and assert the target state after the DO. Nothing of the collector of C1 is present in that tree. The runner passes no judge to a Case.
- A second execution of the same Cases in the tree of this PLAN shows which of them stay red even with the documents of this PLAN present.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T43 | I2 | the PLAN template is absent | the PLAN template is absent |
| release/T44 | F2 | F2 is absent | F1 still states the structure of a PLAN |
| release/T45 | F3 | the PLAN template is absent | the PLAN template is absent |
| release/T46 | A14 | A14 is absent | A3 does not sit under A15 |
| release/T47 | A15 | A4 does not sit under A15 | A4 does not sit under A15 |
| release/T48 | G10 | I2 is absent | the PLAN template is absent |
| release/T49 | G11 | F2 is absent | F1 still states the structure of a PLAN |
| release/T50 | G12 | F3 is absent | the PLAN template is absent |
| release/T51 | G13 | A14 is absent | A3 does not sit under A15 |
| release/T52 | G14 | A4 does not sit under A15 | A4 does not sit under A15 |
| release/T53 | G15 | F1 is absent | F1 does not cite F2 |

All eleven fail on an assertion about intended behaviour: 11 RED-observed, 0 unconditional, 0 error, 0 green, on `main` and in the tree of this PLAN. None is an unconditional failure or a missing import.

## What the RED asks the Change to add relative to `main`

I2, F2, F3, A14 and A15 with their interface, the PLAN template, A3 and A4 under A15, and a narrowed F1 that cites F2.

## Reproduce

Environment: Node v22.23.4 on Linux, no dependencies. Run from a checkout of this branch (head after this commit) with `main` fetched; `$PLAN` is the directory `engineering/release-management`.

```
W=$(mktemp -d)
git archive 9033099e9234d4059c841c155abc9c309a7aa6fb .github | tar -x -C "$W"
mkdir "$W/runner"
cp "$PLAN/00-changes/C1-verify-plan/run-red.mjs" "$PLAN/00-changes/C1-verify-plan/baseline-judge.mjs" "$W/runner/"
for f in $(git ls-files "$PLAN" | grep -E 'T(4[3-9]|5[0-3])\.red\.mjs'); do
  mkdir -p "$W/$(dirname "$f")"; cp "$f" "$W/$f"
done
cd "$W"
node runner/run-red.mjs --evidence ev.json $(find engineering -name 'T4[3-9].red.mjs' -o -name 'T5[0-3].red.mjs' | sort -V)
```

The runner of C1 reads only the Case files it is given. The tree it runs in is `main`'s `.github` plus the eleven Case files and nothing else, so no document of the collector or of an open pull request is visible to the Cases. Observed transcript on 11 Nov 2026 (the order of the lines follows the order the shell lists the files):

```
RED-observed       release/T48  stopped at line 9: I2 is absent
RED-observed       release/T49  stopped at line 9: F2 is absent
RED-observed       release/T50  stopped at line 9: F3 is absent
RED-observed       release/T51  stopped at line 9: A14 is absent
RED-observed       release/T52  stopped at line 16: A4 does not sit under A15
RED-observed       release/T53  stopped at line 9: F1 is absent
RED-observed       release/T43  stopped at line 16: the PLAN template is absent
RED-observed       release/T44  stopped at line 9: F2 is absent
RED-observed       release/T45  stopped at line 9: the PLAN template is absent
RED-observed       release/T47  stopped at line 16: A4 does not sit under A15
RED-observed       release/T46  stopped at line 9: A14 is absent

11 executed: 11 RED-observed, 0 RED-unconditional, 0 ERROR, 0 GREEN.
Each Case stops at its first failing assertion; later assertions and scenarios in a Case are not executed.
Accepted RED: at least one meaningful observed RED.
All executed Cases produced observed RED. This does not mean every assertion or scenario inside them was executed.
```
