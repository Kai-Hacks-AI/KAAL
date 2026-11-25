# Installation Integrity: Testing

The planned outer tests live in `packages/kaal-core/test/plan/installation-integrity.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK, and the DO turns them GREEN. They are written against the provisional entry point of `core/A53` (decision D6), so a decision that changes the surface changes the tests in a PLAN amendment, never in the DO.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T110: the verdict lists missing, unexpected and modified assets by content identity, in path order, and is aligned only when none exist; the same bytes at another path are one missing and one unexpected; the same name with other bytes is modified | core/F100, core/N29, core/A53 | Requirements |
| core/T111: a verdict with no stated origin, or whose origin is the installation or its own record, is unknown with a reason, never aligned | core/F101, core/A53 | Requirements |
| core/T112: the result names the entity, the selected version, the kind of source and the origin; the same installation compared with another version's expected set gives that version's differences | core/F102, core/A53 | Requirements |
| core/T113: the same call judges a Capability, an Agent, a Skill, an Extension and an entity nobody has heard of, and the module holds no name of another package and imports only what Core already depends on | core/F103, core/N28, core/A55 | Architecture |
| core/T114: a discrepancy exits 0, exits 1 only when enforcement is requested, and unknown exits 2 whatever is requested | core/F104, core/A56 | Requirements |

## Planned, written after their decisions close

These Cases are fixed in criterion and not yet in code, because the decision that shapes them is open. Each is added to the executable file by a PLAN amendment, still before the DO.

- **core/T115 (D2).** A variant: an expected set supplied by the owner is authoritative for the location it is selected for, a set supplied by anyone else is refused, and the installation matches the set it was selected against.
- **core/T116 (D1, D5).** The three comparisons, with the expected set taken from the artifact and tag of the selected published version, from the N+1 package, and from the selected source: each reports source, version and content differences, and a different version is never used silently.
- **core/T117 (D1, D3, D4).** An entity registered with its contract has its installation location found and verified by the existing contracts alone.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/installation-integrity.test.mjs`, outside Core's `npm test` until the DO. At `core/C53` all five are RED, blocked before behavioural assertion: Core has no `kaal-core/integrity` entry point.
