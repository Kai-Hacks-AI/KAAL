# Foundation 0.0.2 pin transition: admission route PLAN

Date: 2026-11-02. Engineering PLAN for independent Owner review. It is not an
admission rule, a gate change, a synchronization, a promotion or publication
authority. It answers Foundation's request (#848) that Engineering name the route
by which the 0.0.2 version bump, the consumer pins and the root lock reach `main`
together.

Inspected on main `f30221f481c4682e81b092e6a772365f3d7a9f6d`; reacquire before use.

## The problem

Foundation is a workspace at `0.0.1` (C16 plans `0.0.2`). Exact `0.0.1` pins on it
exist in three production manifests:

| Consumer | Field |
| --- | --- |
| `packages/kaal-core/package.json` | dependencies |
| `packages/skills/kaal-change/package.json` | dependencies |
| `packages/skills/kaal-testing/package.json` | devDependencies |

Two assertions pin the same fact: `engineering/acceptance/embed.test.mjs` (Core's
exact dependency set) and `packages/skills/kaal-change/test/publisher/providers.test.mjs`
(the registry map). The root `package-lock.json` records the workspace and each pin.

Bumping Foundation alone leaves an exact `0.0.1` pin the `0.0.2` workspace does not
satisfy. `npm ci` then needs a nested registry copy and fails ("Missing from lock
file"), and the no-nested-copy assertion fails. The bump, the three pins, both
assertions and the lock are one coherent transition.

Current trusted-main Change Isolation (`engineering/change-isolation/check.mjs`)
blocks that delivery as one Change: a change touching Core may carry only Core,
the root `package.json`, the root lock and `embed.test.mjs`. Foundation, Change and
Testing files cannot travel with it. Nothing else prevents the transition, and no
workflow, gate or promotion rule needs to change to deliver it.

## Routes compared

**A. One atomic delivery under a target-owned, single-use transition ledger.**
Foundation `0.0.2`, the three exact pins at `0.0.2`, both assertions updated to the
same exact value and the lock arrive in one Change. The checker admits it only if
an exact ledger already held by `main` names the transition. Preserves exact pins
and the no-nested-copy assertion. Cost: a gate DO, so the checker changes.

**B. Staged compatibility under unchanged isolation.** Each consumer first widens
its exact pin to accept both versions (Core alone, Change, Testing), then Foundation
bumps alone, then pins are tightened again. Needs no gate change. Cost: seven
Changes through collector and main, a temporary weaker exact-pin assertion in Core
and Change, and a window where `0.0.1` and `0.0.2` both resolve. It also changes
assertions twice, which this project treats as weakening unless the Owner accepts it.

**C. Keep consumers on `0.0.1`.** Rejected (#848): forces the nested copy.

### Recommendation

Route A, because it keeps exact pins and the single-candidate guarantee, and each
affected owner still reviews and keeps its own Change record. If the Owner declines a
checker change, route B is the fallback and needs no further Engineering gate work.

## Route A: the admission design

Admission is target-owned: the ledger and the rule exist on the target branch
before the migration Change is opened, so a candidate cannot authorize itself.

1. **Rule DO, inert.** Add to the checker one narrow rule: a Change whose complete
   path set equals a ledger entry that `main` already holds is judged by that entry
   instead of the Core-travels-alone default. No entry exists yet, so behavior is
   unchanged for every Change, and the checker's existing cases stay GREEN.
2. **Ledger entry, separately reviewed.** One entry for this transition lists
   exactly the allowed paths (versions, pins, assertions, lock, Change records) and
   the allowed edit per path. It records the baseline commit. It is reviewed by
   Foundation, Core, Change and Testing as owners of their paths.
3. **Migration Change.** Opened by the owners using the ledger. Checker facts come
   from Git for the trusted target and candidate, never from the candidate's files.
4. **Spent after adoption.** Once `main` holds Foundation `0.0.2`, the entry no longer
   matches, so reuse or replay is refused.

### Obligations on the transition itself

- Foundation's algorithm and tests are unchanged except the C16 declaration work and
  its version. Core, Change and Testing code are byte-equal to the baseline except
  the exact pin edits and the two assertions' expected value.
- The lock is derived twice independently from immutable target bytes and all
  candidate manifests with C16's existing helper, then checked by clean `npm ci`,
  with no copied final lock, alias, invented registry metadata or partial graph.
- Packed Core installs from its tarball with Foundation `0.0.2` and no nested copy.
- Unchanged required full CI, Branching, review, freshness and protection apply.
  No `.github` path is in the ledger. No selective-test gate is involved.

### Negative challenges for the DO

Each must fail closed: a path outside the ledger; a changed pin value other than
the ledger's; a forged or hand-edited lock entry or integrity; a Core algorithm or
test-predicate change; a pin left at `0.0.1` in one consumer; a missing assertion
update; an extra `.github` path; stale or missing Git facts for the target; a
ledger entry added by the candidate in the same Change; and replay after adoption.
The positive case is the real complete transition including the packed consumer,
not a fixture alone. If a safe bounded rule cannot be shown, admission stays blocked.

## Sequence and ownership

| Step | Work | Owner |
| --- | --- | --- |
| 1 | Accept this PLAN and #848 | Owner |
| 2 | Rule DO, inert, with the negative cases above | Engineering |
| 3 | Ledger entry | Engineering with Foundation, Core, Change, Testing |
| 4 | Migration Change, using the ledger | Foundation, Core, Change, Testing each their own paths |
| 5 | SYNC and focused promotion to `main` | Separate Owner authorization |
| 6 | Release Pack, publish, registry acceptance for Foundation `0.0.2` | Existing Release workflow; separate Owner authorization |

Steps 2 and 3 are the missing Engineering work. Foundation's publication does not
wait for Core or Hosting publication. This PLAN is independent of the Hosting/Core
migration admission in `engineering/release/hosting-core-0.0.1/route.md`; that
transition is a different identity change and needs its own ledger entry.

## Open Owner decisions

1. Route A (recommended) or route B.
2. For route A, that the checker may read a target-held ledger at all. If not, B.
3. Whether one ledger entry design should also serve the Hosting identity transition,
   or each transition keeps its own.

No synchronization, promotion or publication is authorized by this PLAN.
