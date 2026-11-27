# C82 evidence

## Provenance

`origin/main` at `4aea647`, Node 22.23.4 in the sandbox. `testing/C81` is on main (`kaal-testing run` executes the export `run` form).

## 1. The gap on main

`kaal-testing` has `run` (report) and `observe` (needs a report, the catalog and its revision) but no step that does both and no check of the report against what was asked; release's draft assembler (`release/C135`) does the checks on its side, and `hold Act` reads UNKNOWN "not available" on every ACT pull request.

## 2. RED on this PLAN tree

| Case | Tests | Result |
| --- | --- | --- |
| `testing/T408` | `testing/I50` | RED: `I50.md is absent` |
| `testing/T409` | `testing/F175` | RED: `F175.md is absent` |
| `testing/T410` | `testing/A61` | RED: `A61.md is absent` |
| `testing/T411` | `testing/F175` | RED: `lib/observation.mjs is absent` |
| `testing/T412` | `testing/F175` | RED: `lib/observation.mjs is absent` |
| `testing/T413` | `testing/F175` | RED: `lib/observation.mjs is absent` |

6 RED by assertion, 0 GREEN, 0 import or syntax errors. `collectCases('engineering/testing')` lists them with `parked: false`.

## 3. GREEN is reachable

With the three drafts placed (`KAAL_TESTING_DIR`), `T408` to `T410` are GREEN. A throwaway prototype of `lib/observation.mjs` and the command (about sixty lines over `runCases`, `collectCases` and `observeCases`, not committed) turns `T411` to `T413` GREEN, so the Cases ask for what can be built; the DO builds it properly.
