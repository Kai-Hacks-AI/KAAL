# Pull Promotion: the delivery candidates are gathered and the existing verdicts consumed (testing)

Runnable Cases `T430` to `T433`, `.red.mjs`. They are RED because `gatherDeliveries` and the reader do not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-gather/T430.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T430 | F50 | Heads `hotfix/x`, `wire/y` and `kaal/a/b` become candidates of HOTFIX, WIRE and KAAL with the prefix removed; `feature/z`, `claude/t` and `hotfix/` are not; no value, size or unit; facts that are not lists give no candidates and a finding; the input is not changed. |
| pull/T431 | F51 | OUT consumes `{verdict, revision, authority}` at the exact head: PASS only for PASS with the head's SHA and the class's registered authority; FAIL at the exact head is FAIL; a missing verdict, another revision, another authority, `held` and an unrecognised value are UNKNOWN; the same verdict with differently shaped evidence for the three classes gives the same result. |
| pull/T432 | F52 | IN follows the destination: no PR at the exact head, or unreadable `required`, is UNKNOWN; every required context successful at that SHA is PASS; one failed is FAIL; pending, missing or other-SHA is UNKNOWN; two different `required` lists give two results with no list stored in the gatherer. |
| pull/T433 | F53 | The reader, run over a recording client, makes only GET requests; a failing or incomplete request leaves UNKNOWN and never PASS. |

They do not show the live host or any workflow.
