# C96 baseline

The baseline is `main` (e221e990), which holds release/C95.

- The declaration (`03-architecture/A67-delivery-locations/delivery-locations.json`) lists `.github`, `.githooks` and `.kaal`, each wirable. `.agents` and `.claude` are not in it; the root manifest and lockfile are not either, and the declaration has no `files`.
- Change Isolation (`engineering/change-isolation/check.mjs`) carries two rules of its own: Core travels alone, and `.github` travels alone. It is a live gate on pull requests and the merge group. `.githooks`, `.kaal` and the root files may travel with anything today, apart from what Core's rule says.
- Pull Promotion's `evidence.do` (`05-src/pull-promotion/declaration.json`) spells `packages`, `engineering`, `.github` and `.githooks`. `.kaal`, `.agents`, `.claude` and the root files do not count as DO evidence today. The command `run.mjs` passes the declaration as it is to `walkCollectors` of the package `kaal-release`.
- `node --test engineering/cases/cases.test.mjs`: 284 tests, 272 pass, 12 fail (the C15 collector-capability Cases T268 to T279, also red on `main`). `node --test engineering/change-isolation/*.test.mjs`: 46 tests, 35 pass, 11 fail (all of them need Git facts or approvals that a clone does not give; they fail the same way before and after).
