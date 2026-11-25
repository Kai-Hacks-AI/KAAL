# C81 evidence

## Provenance

`origin/main` at `765ceb3`, Node 22.23.4 in the sandbox (Case files that assert Node 24 behaviour can differ in CI).

## 1. The gap on main

`kaal-testing run --root . engineering/release-management/00-changes/C132-judge-from-default-branch/T1430.test.mjs` gives counts 0/0/0, `execution.complete: false` and the problem `{ kind: 'empty-inventory', detail: 'the file has no test' }`. The file exports `id`, `tests`, `title` and `run()` and no node:test.

## 2. RED on this PLAN tree

| Case | Tests | Result |
| --- | --- | --- |
| `testing/T402` | `testing/I49` | RED: `I49.md is absent` |
| `testing/T403` | `testing/F174` | RED: `F174.md is absent` |
| `testing/T404` | `testing/A60` | RED: `A60.md is absent` |
| `testing/T405` | `testing/F174` | RED: `a returning run() is one test under its own file` |
| `testing/T406` | `testing/F174` | RED: `a file with node:test tests and a callable run reports both` |

5 RED by assertion, 0 GREEN, 0 import or syntax errors.

## 3. Throwaway DO

With the three drafts placed in `10-intent`, `11-requirements` and `12-architecture` (`KAAL_TESTING_DIR`), `T402` to `T404` are GREEN. `T405` is GREEN with a prototype of the runner change; `T406` and the existing `testing/C63` Cases are the DO's obligation (see the risk in `change.md`).
