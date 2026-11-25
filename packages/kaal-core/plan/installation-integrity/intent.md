# Installation Integrity: Intent

This is `core/C53`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN. It is the prerequisite of the `core/C52` DO, by the Owner's decision of 25 Nov 2026.

The Owner's conceptual clarification: version and content alignment is generic installation integrity, not a Skill-specific variant exception. Core owns the common rules and the generic ability to verify, and stays independently installable, knowing no individual Capability, Agent, Skill or Extension inventory or asset details. The detailed contract decisions stay open and are listed in `architecture.md`.

- **core/I32.** Core can verify an installation against what it should be. Given an installed entity and the authoritative expected assets of its selected version and source, it reports the assets that are missing, unexpected and modified. It compares content identity, never filenames alone. The same ability serves a Capability, an Agent, a Skill and an Extension.
- **core/I33.** Core stays independent. It knows no individual entity, no inventory and no asset path. Each owning entity supplies its identity, version and expected assets through the contracts that already exist (the Installation Contract, the installation record, the ownership declaration, registration), and a new manifest, registry or dependency is added only where the assessment shows a gap. Once an entity is registered, it and its installation location can be discovered and verified.
- **core/I34.** The installation being judged is never its own authority. The expected assets come from the selected authoritative source, never from the installed files or their own record: the published artifact and its Git tag for `.kaal/`, the current owning package at N+1 for Engineering, the selected source for a deployment.
- **core/I35.** Alignment starts as a detective control. A discrepancy is a finding, reported with its source, version and content differences. It is never corrected automatically and never a veto on delivery. Exact identity with the published artifact stays a mandatory product invariant, and a detective control does not make a deviation legitimate. Making it preventive is the Owner's go.
- **core/I36.** A variant is a different authoritative expected asset set, supplied by the owning capability, not a blanket exemption. Only the owner supplies one. A location is verified against the set it was selected for, and nothing is exempt from being verified.

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
