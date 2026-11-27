# C45 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G135 | F102 | five callers reach the controls scripts' own file reading: `codeql.yml` (two steps) and `verify-workflow-names.yml` run `judge-mode.mjs` on a findings file; the Controls Case (T778) runs `check-controls.mjs` over a folder; `evidence.mjs` reads records from a path; `registry.mjs` reads Git | when the Skill stops reading, each of them stops working, and Engineering has no entry point that reads through Hosting |
