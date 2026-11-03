# Core/C52 RED Cases: evidence

Planned tests: `test/plan/registration-delivery.test.mjs`, immutable to DO and CHECK. They add to C50's core/T115 to T117
(`test/plan/composition.test.mjs`) the CPO's settled wording and boundaries from the C52 PLAN approval. Run on `kaal/core`
at 6ba7624 with `node --test test/plan/registration-delivery.test.mjs` through npm (`npm_execpath` set), packing Core,
Foundation and Hosting once and installing them into a fresh consumer per test, Node 24, Linux, offline.

| Case | Checks | Result today |
|---|---|---|
| core/T118 | After `init` alone `verify` prints `Core is installed but not registered in this Engine. Register it with: kaal register capability core <path>`; the specific missing-Type finding stays a separate diagnostic; running the printed command registers Core, the message is gone and the Registration Type is active; registering again is a no-op | **RED** (no message) |
| core/T119 | `init` registers nothing and ships no registration; the package carries `capability/Core.md` and `Registration.md` as content only; Core is not among the listed capabilities until registered | **RED** (package carries no `capability/`) |
| core/T120 | Where Core's installation is not established (never initialized; an Engine elsewhere without Core's record) `verify` does not claim Core is installed | GREEN (guard against a false claim once the message exists) |

T115 to T117 (C50) stay RED until the DO. No existing test is amended here. One existing test, core/T40, asserts that
`capability/` is not delivered; the DO needs a bounded amendment of it, proposed separately in #973.
