# Pull Promotion: ready stock items are listed from verdicts that already exist (testing)

Runnable Cases `T430` to `T433`, `.red.mjs`. They are RED because `scripts/deliveries.mjs` and the adapter do not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-gather/T430.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T430 | F50 | Items of declared classes become deliveries with an opaque `source`; an undeclared class is ignored with a finding; no value, size or unit; facts that are not lists give nothing and a finding; the input is not changed. |
| pull/T431 | F51 | Ready only for a `PASS` from the class's authority at the item's revision; no verdict, another revision, another authority, `FAIL`, `held` and an unrecognised value are not ready; differently shaped evidence for three classes gives the same result; an OUT or IN verdict is neither needed nor read. |
| pull/T432 | F52 | The adapter lists the heads `main` accepts (`kaal/**`, `hotfix/*`, `wire/*`) with their class and nothing else (`main` and other branches are not items), passes the supplied registry through unchanged, builds none and reads no Core; the reader makes only GET requests and a failing read leaves an item not ready. |
| pull/T433 | F53, F54 | The same unmodified package module works for a different host (ticket ids, other class names and revisions) and contains none of this installation's words; an item matching a route of the accepted registry is `auto`; every other item, and every item when the registry is missing, not accepted or malformed, is `judge` and still listed; the registry never makes an item ready. |

They do not show the live host or any workflow.
