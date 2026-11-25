# Installation Integrity: Testing

The planned outer tests live in `packages/kaal-core/test/plan/installation-integrity.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK, and the DO turns them GREEN. They are written against the provisional entry point of `core/A53` (decision D6), so a decision that changes the surface changes the tests in a PLAN amendment, never in the DO.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T110: the verdict lists missing, unexpected and modified assets by content identity, in path order, and is aligned only when none exist; the same bytes at another path are one missing and one unexpected; the same name with other bytes is modified | core/F100, core/N29, core/A53 | Requirements |
| core/T111: evidence that is absent, names no establisher, is unavailable, or whose source is the installation or its own record gives unknown with a reason code, never aligned | core/F101, core/F110, core/A53 | Requirements |
| core/T112: the result names the entity, the version, the comparison, the establisher and each source; a source naming another entity or version is unknown (identity); another version's evidence gives that version's differences | core/F102, core/F110, core/A53 | Requirements |
| core/T113: the same call judges a Capability, an Agent, a Skill, an Extension and an entity nobody has heard of, and the module holds no name of another package and imports only what Core already depends on | core/F103, core/N28, core/A55 | Architecture |
| core/T114: a discrepancy exits 0, exits 1 only when enforcement is requested, and unknown exits 2 whatever is requested | core/F104, core/A56 | Requirements |
| core/T115: a source whose tree digest does not match, or that lacks an asset its manifest lists, is unknown (digest, incomplete), whatever the installation holds | core/F108, core/F110, core/A53 | Requirements |
| core/T116: the three comparisons require their sources (`installed` the artifact and its tag, `engineering` the package, `deployed` the selected source), a missing one is unknown (unavailable), and an artifact and a tag that disagree are unknown (disagree) with the differing paths, never aligned and never a difference | core/F106, core/F109, core/F110 | Requirements |
| core/T117: a variant is accepted only when its owner and path match the ownership declaration, `not-owner` and `no-ownership` are unknown, a location is verified against the one set selected for it, and matching another set is a difference that names it | core/F105, core/F110 | Requirements |
| core/T118: a contract registered with Core gives its expected set and its observation scope by the existing contract alone: the targets of its assets, a directory asset's files all under it, and never a surface-gated asset; verifying with them is aligned, with no list of any entity in Core | core/F107, core/F111, core/A53 | Requirements |
| core/T119: an observed inventory is judged only when it states its scope, is complete and matches its tree digest; a file outside the scope or an expected asset outside it is unknown (inventory), and unexpected is claimed only inside the scope | core/F111, core/F110 | Requirements |

## What the CTO still decides

core/T118 uses only what the contracts already say. D1 (which published package supplies the source files), D3 (whether a location's reach is wider than the contract's scope, the scope being what the observer states) and D4 (which entities get a contract) change what a caller supplies, never what the contracts require. A decision that changes the entry points amends these Cases in a PLAN, never in the DO.

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/installation-integrity.test.mjs`, outside Core's `npm test` until the DO. At `core/C53` all ten are RED, blocked before behavioural assertion: Core has no `kaal-core/integrity` entry point.
