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

The six concerns:

1. [Intent](intent.md): why, outcomes O1–O6
2. [Requirements](requirements.md): what, obligations G1–G10 and N1–N7, each tracing to Intent
3. [Architecture](architecture.md): where, elements A1–A11, each tracing to Requirements
4. [Testing](testing.md): the four loops, and the planned tests tracing to all three
5. [Code](code.md): how, within the Architecture
6. [Run](run.md)

State: PLAN (C0a). The outer tests are planned and RED, most of them blocked before behavioural assertion ([Testing](testing.md#red-evidence)). No Guard code exists yet.
