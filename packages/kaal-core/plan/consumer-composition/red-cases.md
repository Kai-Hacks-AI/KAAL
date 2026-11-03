# Core/C50 RED Cases: evidence

Planned tests: `test/plan/composition.test.mjs`, immutable to DO and CHECK. Run on `kaal/core` at the C50 PLAN
(ed84763) with `node --test test/plan/composition.test.mjs` through npm (`npm_execpath` set), packing Core, Foundation
and Hosting once and installing them into a clean consumer per test, Node 24, Linux, offline.

| Case | Checks | Result today |
|---|---|---|
| core/T112 | A alone discovered and verifying; B added afterwards discovered beside it; B's files removed; A's result identical to before B; Core's installed bytes identical throughout | GREEN |
| core/T113 | B alone in a clean consumer is discovered, verifies, and needs nothing from A | GREEN |
| core/T114 | A consumer-owned scope tracing to A's and B's instances resolves with both present (3 kinds, 3 instances, 0 findings); with B absent verify fails with a finding that names B's instance and the scope with no holder, never a crash or a silent pass; A's standalone result is unaffected | GREEN |
| core/T115 | In a clean consumer from the packed Core, a Registration Node is admitted as its Type | **RED** |

## What this shows

- The scenario the PLAN asked for already holds on today's Core. The DO for T112 to T114 is enrollment: running them in a
  required lane and in the unfiltered release suite on all three hosts. No Core behavior changes for them.
- There is no command that unregisters a contribution (`kaal remove` removes Core's own installation). "Removing" a
  capability is the consumer deleting the files it registered, and the tests do exactly that and assert what Core reports.
- The unresolved-trace finding is worded `unclaimed scope: the target's scope has no holder` when B's whole scope is gone;
  the PLAN's "unresolved target" holds in meaning, and T114 accepts either rule text.

## Finding: T115, a Defect to be planned separately

The RED output:

```
✖ core/T115 [core/C50 finding]: in a clean consumer from the packed Core, a Registration Node is admitted as its Type, not reported unregistered
  AssertionError: the packed Core must carry the Registration Type Definition
```

In the installed consumer, `kaal verify` assembles Registration Nodes (code carries the schema) but reports each as
`unregistered: no Type Definition named Core/Registration; register one with the Core Capability`. Core's own tests pass
only because they copy `capability/Core.md` and `capability/Registration.md` from the source tree; those two files are not
in the package's `files` list and not in the `init` payload. So in a consumer the Registration Type's schema does not judge
its Nodes. Whether the packed Core must carry that Definition for 0.0.1 is a scope question for a separate Core PLAN
(numbered when it is opened), not decided or fixed here, as the C50 PLAN requires.

No existing test is amended. No promotion, SYNC or publication is part of this.
