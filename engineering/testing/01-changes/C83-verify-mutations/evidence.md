# C83 evidence

## Provenance

`origin/main` at `4aea647` and later, Node 22.23.4 in the sandbox. `testing/C81` is on main. `testing/C82` (`observe-at`) is in its collector and not on main; this Change does not depend on it.

## 1. How it is done today

Targeted Mutation Verification is a section of Testing's Skill (killed, survived, invalid, unresolved). A Change keeps patches and a script, for example `packages/kaal-controls/00-changes/C147-ratchet-adoption/mutations/run.sh` and its output `run-at-do-head.txt`, and a reader looks at the output to find a surviving mutant. No tool in the repository runs mutants or records the outcome.

## 2. RED on this PLAN tree

| Case | Tests | Result |
| --- | --- | --- |
| `testing/T414` | `testing/I51` | RED: `I51.md is absent` |
| `testing/T415` | `testing/F176` | RED: `F176.md is absent` |
| `testing/T416` | `testing/A62` | RED: `A62.md is absent` |
| `testing/T417` | `testing/F176` | RED: `lib/mutate.mjs is absent` |
| `testing/T418` | `testing/F176` | RED: `lib/mutate.mjs is absent` |
| `testing/T419` | `testing/F176` | RED: `lib/mutate.mjs is absent` |
| `testing/T426` | `testing/F176` | RED on the collector tree with the DO merged: `a weakening that no Case catches fails under --strict` (`0 !== 1`), because the command has no `--strict` yet |

6 RED by assertion, 0 GREEN, 0 import or syntax errors. `collectCases('engineering/testing')` lists them with `parked: false` and no finding.

## 3. GREEN is reachable

With the three drafts placed (`KAAL_TESTING_DIR`), `T414` to `T416` are GREEN. A throwaway prototype (about eighty lines over Hosting's `list`, `readFile`, `initialize` and `scratch` and `runCases`, plus the command, not committed) turns `T417` to `T419` GREEN, so the Cases ask for what can be built. The prototype copies the tree through Hosting and runs each mutant in its own scratch copy; Cases that import from `node_modules` need it named in `copy`.
