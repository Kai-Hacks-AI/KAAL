# Impact-CI contract (C759 / C762)

These modules are unwired. They do not discover repository impact, establish
authority, fetch GitHub results, or certify a release. No workflow or protection
uses them. Issue #762 remains open for the governed adapter and check/OS policy.

## Call boundary

`judgeAggregate(expected, manifest, observations, context)` applies target policy,
then selection completeness, then the imported execution checker. Callers cannot
replace the execution checker with a function that returns success.

`context` is the runner's independently obtained `{ event, baseRef }`, not data
copied from the candidate manifest. PRs targeting `kaal/*` are eligible for
selection. PRs targeting `main` and pushes to `main` return `unresolved`: full
assurance needs independent complete-matrix validation that is not implemented
here. Other events/targets and absent context also return `unresolved`.

The expected evidence and manifest must match the runner event/target and each
other's `headSha`, `baseSha`, `policyDigest`, and `impactDigest`. Both must be
resolved. Empty/non-string provenance is unresolved. Fixture provenance strings
in tests are labels, not actual SHA/digest validation.

## Selection input

The independently supplied `expected` object contains:

| Field | Obligation |
| --- | --- |
| `authoritative`, `resolved` | Both true; prerequisites asserted by the trusted adapter, never proof of authority |
| `event`, `baseRef` | Match the independently obtained runner context |
| `headSha`, `baseSha`, `policyDigest`, `impactDigest` | Nonempty strings identifying immutable inputs, independently verified by the adapter |
| `inventory` | Complete target-owned policy check/OS inventory |
| `required` | Nonempty impacted subset derived from governed closure and Case/contract policy |
| `nonImpact` | Every remaining inventory entry with a nonempty evidence reference in `reason` |

Entries use `{ check, os }`; non-impact entries also have `reason`. Check and OS
names must be nonempty, trimmed strings without `@`, matching the execution
checker's identity convention. All sets must be unique, and required/non-impact
must partition the inventory. Sparse or malformed entries fail closed.

The manifest's `selected` must equal `required`. Its `excluded` must equal
`nonImpact`, including the target evidence reference in `reason`. Unknown jobs,
missing exclusions, invented reasons and contradictory assignments fail. An
excluded job is explicitly not selected; it never becomes a passed observation.
The existing execution checker additionally requires `mode: 'capability-pr'` and
successful exact-head observations for every selected check/OS.

## Remaining authority boundary

Matching strings, a supplied inventory and `authoritative: true` do not establish
provenance. A caller can still invent all inputs. Production wiring is blocked
until a target-owned adapter independently verifies:

- C11 P1 Change, P2 trace ownership and P3 ownership claims, plus Graph wiring;
- complete changed-element attribution and transitive impact, including newly
  added dependents, with unresolved ownership/traces refusing selective green;
- a complete capability/Case-to-check/OS policy, including shared suites;
- policy/impact digests and immutable base/head identity using Foundation;
- non-impact evidence references against that target-owned closure;
- shared CI/security/release changes requiring full assurance or unresolved;
- actual workflow-run/job/platform/head identity before creating observations.

C11 #739 is still a draft using fixture targets. This PR does not invent its
production input format or accept candidate scope as authoritative. Full-matrix
validation, shadow comparison, workflow integration and protection migration
remain separate work. Existing promotion and npm packed-consumer checks remain
in force.

## Verification

`node --test engineering/impact-ci/*.test.mjs` exercises the pure contracts;
the same three test files are registered in `npm run test:engineering`.
The omitted impacted Guard Windows negative fails at selection, while #760's
execution-only boundary demonstration is preserved unchanged. New regressions
cover inventory/exclusion completeness, forged reasons, a newly impacted
dependent, malformed inputs, target-policy enforcement and execution injection.
