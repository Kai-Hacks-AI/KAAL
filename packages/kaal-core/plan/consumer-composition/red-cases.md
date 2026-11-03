# Core/C50 RED Cases: evidence

Planned tests: `test/plan/composition.test.mjs`, immutable to DO and CHECK. Run on `kaal/core` at the C50 PLAN
(ed84763) with `node --test test/plan/composition.test.mjs` through npm (`npm_execpath` set), packing Core, Foundation
and Hosting once and installing them into a clean consumer per test, Node 24, Linux, offline.

| Case | Checks | Result today |
|---|---|---|
| core/T112 | A alone discovered and verifying; B added afterwards discovered beside it; B's files removed; A's result identical to before B; Core's installed bytes identical throughout | GREEN |
| core/T113 | B alone in a clean consumer is discovered, verifies, and needs nothing from A | GREEN |
| core/T114 | A consumer-owned scope tracing to A's and B's instances resolves with both present (3 kinds, 3 instances, 0 findings); with B absent verify fails with a finding that names B's instance and the scope with no holder, never a crash or a silent pass; A's standalone result is unaffected | GREEN |
| core/T115 | The packed Core carries its own contribution; registering it into `.kaal/` like any package makes the Registration Type active, so a consumer's Registration Node is admitted | **RED** |
| core/T116 | An installed but unregistered Core says so plainly | **RED** |

## What this shows

- The scenario the PLAN asked for already holds on today's Core. The DO for T112 to T114 is enrollment: running them in a
  required lane and in the unfiltered release suite on all three hosts. No Core behavior changes for them.
- There is no command that unregisters a contribution (`kaal remove` removes Core's own installation). "Removing" a
  capability is the consumer deleting the files it registered, and the tests do exactly that and assert what Core reports.
- The unresolved-trace finding is worded `unclaimed scope: the target's scope has no holder` when B's whole scope is gone;
  the PLAN's "unresolved target" holds in meaning, and T114 accepts either rule text.

## Findings: T115 and T116, Defects planned separately (core/C52)

By the Owner's rulings the package contains no registrations, and **package installed is not package registered**: Core is
registered into the instance's `.kaal/` like any other package, and its registration-dependent features, such as the
Registration Type Definition, are active only once it is registered. A consumer's own registrations stay its own.
Installed Core can register what a consumer brings: T112 to T114 show assembly, discovery and findings working.

How Core resolves `.kaal/` today: the Engine is `./.kaal` by default (`--engine <dir>` elsewhere). `kaal init` copies
Core's payload into it. `kaal register capability <name> <dir>` registers a package's contribution under
`.kaal/capabilities/<name>`. Core reads the Engine, never the package, for definitions.

- **T115 (RED):** Core's own contribution (`capability/Core.md`, `capability/Registration.md`) is not in the package
  `files`, so the installed Core has nothing to register itself with. Core's own tests pass only because they use the
  source tree's copy. Checked: with the source `capability/` registered in the same clean consumer, the rest of T115
  passes, so the only missing piece is that the package does not carry its contribution.
- **T116 (RED):** an installed but unregistered Core reports each Registration Node as
  `unregistered: no Type Definition named Core/Registration; register one with the Core Capability` (exit 0). It does not
  say that Core itself is not registered in this Engine. The wording asserted is the PLAN's proposal for the CPO to settle.

Scope for 0.0.1 is core/C52's, not fixed here. No existing test is amended. No promotion, SYNC or publication is part of
this.
