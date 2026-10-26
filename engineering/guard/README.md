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

The six concerns, written outside-in:

1. [Intent](intent.md): why, outcomes guard/I1–guard/I7
2. [Requirements](requirements.md): what, obligations guard/F1–guard/F27 and guard/N1–guard/N12, each tracing to Intent
3. [Architecture](architecture.md): where, elements guard/A1–guard/A17, each tracing to Requirements
4. [Testing](testing.md): the four loops, and the planned tests guard/T1–guard/T59, each naming the I, F, N or A contracts it checks
5. [Change](change.md): the bounded Changes `guard/C0a`–`guard/C25`, with their aliases and the Core and Engineering Changes they depend on, each carrying zero or more Intents, with their dependencies, scope, verification and stopping conditions. Code, the how, is written in DO to turn the planned tests from RED to GREEN
6. [Run](run.md)

State: DO (guard/C5). Checkpoint M is reached: the package holds `run`, `verify`, the lifecycle, the adapter templates and its consumer docs, and its outer tests are GREEN on Linux, Windows and macOS. KAAL runs its pre-push hook and CI checks through it. The External tooling, [external/](external/README.md), delivers Guard naked into a target, and guard/T3 is GREEN. The RED evidence of guard/C0a is recorded in [Testing](testing.md#red-evidence). The consumer upgrade is in PLAN (K1): KAAL accepts its published package in a disposable clone, guard/A12, with the planned tests guard/T36–guard/T44 ([Testing](testing.md#consumer-upgrade)).

Guard realizes the Git-hook and CI mechanisms behind two KAAL-wide mnemonics, HITMAN (Hooks Integrating Tests, Making Agents Nervous) and CLAUSE (CI Lets Agents Update Service Errors), and its documents use KAAL's FANATIC identifiers. Guard owns none of the three.
