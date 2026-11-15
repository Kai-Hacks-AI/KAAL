# C28 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `main` holds `.github/workflows/codeql.yml`: one job named `CodeQL (${{ matrix.language }})` over the languages `actions` and `javascript-typescript`, on pull requests and pushes for `main` and `kaal/**`, on `merge_group` (`checks_requested`) and weekly. Its actions are pinned by SHA.
- It reports two contexts: `CodeQL (actions)` and `CodeQL (javascript-typescript)`.
- No Intent, Requirements, Architecture or record of ruleset needs names the control. No Guard declaration names it.
- The default code scanning setup covers `main` only, which is why the advanced workflow exists.
