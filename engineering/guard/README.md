# Guard

Engineering home of the Guard Capability ([Guard.md](Guard.md)). Guard connects a repository's own checks to local Git hooks and to GitHub CI enforcement.

The Capability and its three realizations are kept apart:

| Element | What it is | May depend on |
| --- | --- | --- |
| Capability, [Guard.md](Guard.md) | the responsibility | — |
| Engineer, `engineering/guard/` | where Guard is engineered: these documents, the Engineering-only outer tests and, later, the External tooling | any useful KAAL element |
| Embed, the `kaal-guard` package in `packages/kaal-guard/` | the distributable form, with its consumer docs and its own multi-loop TDD tests | no KAAL element |
| External, a target repository | Guard delivered naked by KAAL Engineering as an actual Change | nothing from KAAL |

Engineering-time dependencies never become package dependencies. Multi-loop TDD is a concept: the package practises it with its own tests and needs no KAAL package to do so.

Guard's product contract, its Intent, Requirements, Architecture, Testing and Limitations, is authoritative in the package, in [`packages/kaal-guard/docs/`](../../packages/kaal-guard/docs/intent.md), with its Operations in the package's README and Skill. Engineering cites it and never restates it (guard/N14). This directory holds only Engineering's part, outside-in:

1. [Intent](intent.md): KAAL's own use of Guard (guard/I4) and External delivery (guard/I6)
2. [Requirements](requirements.md): guard/F25, guard/N5, guard/N7–guard/N9 and guard/N14
3. [Architecture](architecture.md): guard/A9–guard/A12, guard/A16 and guard/A20
4. [Testing](testing.md): the plan and evidence of Engineering's Test Cases, the RED and GREEN record of every Test Case, and the Defect register
5. [Change](change.md): the bounded Changes, with their aliases, dependencies, scope, verification and stopping conditions
6. [Run](run.md)

State: DO (guard/C5). Checkpoint M is reached: the package holds `run`, `verify`, the lifecycle, the adapter templates and its consumer docs, and its outer tests are GREEN on Linux, Windows and macOS. KAAL runs its pre-push hook and CI checks through it. The External tooling, [external/](external/README.md), delivers Guard naked into a target, and guard/T3 is GREEN. The RED evidence of guard/C0a is recorded in [Testing](testing.md#red-evidence). The consumer upgrade is in PLAN (K1): KAAL accepts its published package in a disposable clone, guard/A12, with the planned tests guard/T36–guard/T44 ([Testing](testing.md#consumer-upgrade)).

Guard realizes the Git-hook and CI mechanisms behind two KAAL-wide mnemonics, HITMAN (Hooks Integrating Tests, Making Agents Nervous) and CLAUSE (CI Lets Agents Update Service Errors), and its documents use KAAL's FANATIC identifiers. Guard owns none of the three.
