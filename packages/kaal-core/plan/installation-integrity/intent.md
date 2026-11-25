# Installation Integrity: Intent

This is `core/C53`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN. It is the prerequisite of the `core/C52` DO, by the Owner's decision of 25 Nov 2026.

The Owner's conceptual clarification: version and content alignment is generic installation integrity, not a Skill-specific variant exception. Core owns the common rules and the generic ability to verify, and stays independently installable, knowing no individual Capability, Agent, Skill or Extension inventory or asset details. The detailed contract decisions stay open and are listed in `architecture.md`.

- **core/I32.** Core can verify an installation against what it should be. Given an installed entity and the authoritative expected assets of its selected version and source, it reports the assets that are missing, unexpected and modified. It compares content identity, never filenames alone. The same ability serves a Capability, an Agent, a Skill and an Extension.
- **core/I33.** Core stays independent. It knows no individual entity, no inventory and no asset path. Each owning entity supplies its identity, version and expected assets through the contracts that already exist (the Installation Contract, the installation record, the ownership declaration, registration), and a new manifest, registry or dependency is added only where the assessment shows a gap. Once an entity is registered, it and its installation location can be discovered and verified.
- **core/I34.** The installation being judged is never its own authority, and a label is not an authority either. The expected assets are evidence that a trusted caller, the establisher, has obtained from the selected authoritative source and has vouched for: the published artifact and its Git tag for `.kaal/`, the current owning package at N+1 for Engineering, the selected source for a deployment. Core judges the evidence it is given and never fetches it. When the evidence is unavailable, incomplete, inconsistent or in disagreement, the verdict is unknown, never aligned and never a false difference.
- **core/I35.** Alignment starts as a detective control. A discrepancy is a finding, reported with its source, version and content differences. It is never corrected automatically and never a veto on delivery. Exact identity with the published artifact stays a mandatory product invariant, and a detective control does not make a deviation legitimate. Making it preventive is the Owner's go.
- **core/I36.** A variant is a different authoritative expected asset set, not a blanket exemption. Only the owning capability can supply one, and the owner is authenticated by the ownership declaration, not by what the set says about itself. A location is verified against the one set selected for it, and matching a set that was not selected is a difference.
- **core/I37.** The establisher is a role, and its trust comes from where it runs. It is the control that runs from the protected base or default branch, with direct access to the registry and to Git, and receives the candidate and the installation only as data. It is Release's gate for a published version and its tag, and the gate of the selected source for N+1 and for a deployment. Which control holds the role is the owner's registration, and how it authenticates the registry and Git is the CTO's choice.

## Three comparisons, as agreed

1. `.kaal/` against the exact selected published version: its npmjs artifact and its Git tag.
2. Engineering against the current owning capability package, N+1.
3. `.agents/skills/` and `.claude/skills/` against their selected source, `.kaal/` or Engineering, respecting owner-declared variants.

Every comparison reports source, version and content differences explicitly. A publication is a version bump and an npmjs publication aligned with the Git tag of that version.

## What this changes in Core

Core has the format (the Installation Contract) and the lifecycle (install only where absent, keep a modified file, remove only an unmodified one), but no verdict. `core/C53` adds the verdict and nothing else: a pure comparison over data. It adds no file format, no registry and no dependency unless a decision in `architecture.md` shows one is needed.

## Not in this Change

- The contents of any entity, and whether any Skill meets the Skill standard. That is `core/C52`, which consumes this Change.
- Fetching an npmjs artifact or a Git tag. A control supplies them. Release owns publication and tagging.
- Whether a finding blocks anything. A control decides, detective first.
- The record's and the contract's existing rules, which stand.
