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

1. [Intent](intent.md): why, outcomes I1–I6
2. [Requirements](requirements.md): what, obligations F1–F10 and N1–N7, each tracing to Intent
3. [Architecture](architecture.md): where, elements A1–A11, each tracing to Requirements
4. [Testing](testing.md): the four loops, and the planned tests T1–T35, each naming the I, F, N or A contracts it checks
5. [Change](change.md): the bounded Changes C0a–C5, each carrying zero or more Intents, with their dependencies, scope, verification and stopping conditions. Code, the how, is written in DO to turn the planned tests from RED to GREEN
6. [Run](run.md)

State: DO (C3b). The runner and `kaal-guard run` exist in the package, KAAL installs it as a development dependency, KAAL's pre-push hook runs KAAL's local check through it, and `guard.json` lists KAAL's CI checks. The outer tests that need only `run`, T5 and T33 are GREEN; the rest stay RED until their Changes ([Change](change.md)). The RED evidence of C0a is recorded in [Testing](testing.md#red-evidence).

Guard realizes the Git-hook and CI mechanisms behind two KAAL-wide mnemonics, HITMAN (Hooks Integrating Tests, Making Agents Nervous) and CLAUSE (CI Lets Agents Update Service Errors), and its documents use KAAL's FANATIC identifiers. Guard owns none of the three.
