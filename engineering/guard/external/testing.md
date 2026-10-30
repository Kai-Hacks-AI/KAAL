# Guard: Testing, External's part

External is a KAAL-loaded agent that uses KAAL's knowledge to serve another repository. It delivers Guard naked: the target gets hooks, CI and local docs, and installs no `@kaihacksai/kaal-guard`. So External is not a consumer of the Guard package, and its tests are neither the package's Embedded Tests nor Engineering's own. This is External's Test Plan (`guard/C129`, the Owner on #631). Guard is accountable for it. Its tooling is in [`deliver.mjs`](deliver.mjs), and the identifiers it tests are defined in Guard's [Requirements](../requirements.md) and [Architecture](../architecture.md) and the package's `docs/`.

## Test Cases

| Test | Checks | Loop | Where |
| --- | --- | --- | --- |
| guard/T3: an External delivery works in a fresh repository and leaves nothing from KAAL in it | guard/I6, guard/N5, guard/F8, guard/A10 | Intent | Engineering |
| guard/T56: an External delivery writes the Skill variant at the canonical location; it names neither KAAL nor npm; its hook's reminder names the canonical path; a target's existing Skill and instruction files are untouched. Core at delivery moved to guard/T83 in `guard/C46` | guard/I6, guard/F25, guard/F26, guard/A16 | Requirements | Engineering |
| guard/T83: where Core's realization is available at delivery, an External delivery also writes the further deployments Core computes for the passed declaration, lists Core's pointers in `GUARD.md`, and leaves no Core or Hosting element in the target. Added in `guard/C46` | guard/I6, guard/F25, guard/A16 | Requirements | Engineering |
| guard/T93: the workflow an External delivery writes pins `actions/checkout`, and `actions/setup-node` where it sets up Node, by commit SHA, and has no `${{` expression in any `run:` line. Added in `guard/C71` | guard/F5, guard/N5 | Requirements | Engineering |

| Test | Checks | Written in | Intended evidence on the `guard/C98` candidate |
| --- | --- | --- | --- |
| guard/T112: External's hook, workflow and Skill templates equal the package's under their declared transformation | guard/N14, guard/A16 | `guard/C105` | RED: no transformation is declared, and the templates differ |

## Suites

<!-- suites -->
| Suite | Owner | Files | Hosts | Why a host is left out |
| --- | --- | --- | --- | --- |
| External acceptance | External | `engineering/guard/acceptance/external.test.mjs` | linux, darwin, win32 | |
| External with Core | External | `engineering/guard/acceptance/external-workspace.test.mjs` | linux | it needs Core's realization built in KAAL's workspace (`npm ci`, `npm run build`), which only the Linux lane does (guard/C47) |
| External delivery tooling | External | `engineering/guard/external/deliver.test.mjs` | linux, darwin, win32 | |
<!-- end of suites -->

`external.test.mjs` and `external-workspace.test.mjs` move here, beside their tooling, once every lane runs the suites through `engineering/guard/suites.mjs`, so the move cannot leave it unrun.
