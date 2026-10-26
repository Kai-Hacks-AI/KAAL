# Core's Lifecycle: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A20** [core/F42]: Core's contract is package data, delivered beside `payload/`, listed in `files`, and read through Hosting like the payload. The catalogue accumulates release by release. kaal-core 0.0.1 is unreleased, so at `core/C19` each target catalogues only its current bytes. An Engine bootstrapped before `core/C19` from other bytes is not adopted. It is kept and reported, and a fresh bootstrap still applies, as the README says today.
- **core/A21** [core/F43, core/F44, core/F45, core/N12]: one Core record holds Core's whole installation: the Engine files `init` and `upgrade` write, and the provider deployments Agent Realization makes. Its `assets` entries are `{ sha256, version }`, as `core/F33` defines them. Upgrade and remove are planned by a pure function from:
  - the contract;
  - the record;
  - what is present at the recorded paths and the targets.

  `realization.ts` applies the plan through Hosting's `reconcile`, guarded by what was read. Verification of the upgraded Engine runs on the planned files before anything is applied.
- **core/A23** [core/N12]: `upgrade` has two internal phases (`core/C21`). `planUpgrade(root)` reads, plans and verifies, and returns the planned reconciliation. Every Engine file it read is a read-only precondition there, as `hosting/C8` defines one. `applyUpgrade(root, planned)` hands that reconciliation to Hosting and reports what was applied. `kaal upgrade` runs both at once. Neither phase is exported from an entry point. The split exists so that `core/T48` can change a file between them. Core supplies the expected state and Hosting checks it atomically with the writes and removes. Hosting keeps the filesystem mechanics, and Core keeps planning and verification.
- **core/A22** [core/F46]: The lifecycle is repository-rooted, as `realizeIn(root)` already is. An Engine elsewhere keeps its content-based freedoms: it may be moved, renamed and verified. It has no record. Rebasing contract targets onto an arbitrary Engine directory would bend the format's repository-relative paths for Core alone. That breaks `core/I13`.

## Options considered

| Question | Recommended | Alternative | Why not |
| --- | --- | --- | --- |
| Where is Core's version kept? | **A.** In Core's record, per file (`core/F43`). | B. A version Node or field in the Engine. | A Node's bytes would change at every release, and with them its id. The record already carries versions for every Capability. |
| Engine without a record | **A.** Adopt what the catalogue lists (`core/F44`). | B. Refuse until a fresh bootstrap. | Core is its own lifecycle, and the catalogue exists to recognize published bytes. B strands every Engine bootstrapped before `core/C19`'s record. |
| Engine outside `./.kaal` | **A.** Bootstrap and verify only, with no record (`core/F46`). | B. Rebase targets onto `--engine`. | See `core/A22`. |
| Remove with contributions registered | **A.** Remove Core's files and keep and report the contributions (`core/F45`). | B. Refuse while any contribution is registered. | The format removes only what its installer wrote, and keeps the rest. B makes Core the guardian of other owners' files. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C18` PLAN, this Change | Core | `core/C16` |
| `core/C20` PLAN amendment: T44 and T46 assert the one shared Core record and that a kept modified file leaves a verifying Engine (Owner review of #466) | Core | `core/C18` |
| `core/C21` PLAN amendment: every Engine file `upgrade` relies upon is a read-only precondition (`core/N12`, `core/A23`, `core/T48`), per the Owner review of #472 | Core | `core/C20` |
| `hosting/C8`: read-only preconditions in guarded `reconcile`, checked atomically with the writes and removes, never rewriting a guarded file or changing its executable mark | Hosting | `hosting/C7` |
| `core/C19` DO: the contract, the record at `init`, and `version`, `upgrade` and `remove` | Core | `core/C21`, and `hosting/C8` reaching `kaal/core` |
| Core contract evidence mapping | Core | `testing/C8` (#465) |
| Packaging decision for kaal-core | Owner | all four LOVE criteria met |
| Release authorization | Owner | the packaging decision, and nothing implied by it |
