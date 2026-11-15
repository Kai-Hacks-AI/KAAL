# Pull Promotion: the delivery candidates are gathered (testing)

Runnable Cases `T430` to `T433`, `.red.mjs`. They are RED because `gatherDeliveries` and the reader do not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-gather/T430.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T430 | F50 | Heads `hotfix/x`, `wire/y` and `kaal/a/b` become candidates of HOTFIX, WIRE and KAAL with the prefix removed; `feature/z`, `claude/t` and `hotfix/` are not candidates; the shape is what `laneStep` takes. |
| pull/T431 | F51 | PASS only when every declared context has a completed success on the candidate's own SHA; a failing completed run gives FAIL; a missing context, a pending run, a run on another SHA, `held` and an empty declaration give UNKNOWN. |
| pull/T432 | F52 | KAAL `out` follows the report at the same SHA (qualifies PASS, does not qualify FAIL, no report or another SHA UNKNOWN); no value, size or unit appears; facts that are not lists give no candidates and a finding; the input is not changed. |
| pull/T433 | F53 | The reader, run over a recording client, makes only GET requests; a failing or incomplete request leaves UNKNOWN and never PASS. |

They do not show the live host or any workflow.
