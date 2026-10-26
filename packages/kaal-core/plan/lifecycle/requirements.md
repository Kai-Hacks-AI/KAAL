# Core's Lifecycle: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N12** [core/I12, core/I13]: Every lifecycle step follows the same pattern:
  - **Planning:** Core decides the step purely, from what it reads.
  - **Applying:** Hosting applies the step in one guarded reconciliation, the way `realizeIn` already does. If anything changed after it was read, nothing changes.
  - **Refusing:** a refused step leaves every file byte-for-byte as it was.
  - **Boundaries:** Core gains no host knowledge. Hosting's contract changes only through `hosting/C8`, which Hosting owns (`core/C21`).
  - **Relied upon:** a step guards every file it relied upon, not only the files it writes or removes. Each Engine file read to plan or verify the step is a read-only precondition of the same reconciliation. A file that changes after Core read it refuses the step. A file guarded this way is never rewritten, and its executable mark never changes (`core/C21`).
  - **Scope:** a step touches only the files Core's own record holds and that record itself. It never touches another Capability's record or assets, or a registered contribution.

## Functional

- **core/F42** [core/I13]: kaal-core delivers its own Installation Contract, `installation.kaal.json`, at the package root. The contract:
  - conforms to Core's format (`checkContract` returns no finding);
  - names the Capability `core`, and the version in kaal-core's `package.json`;
  - has one file asset for each payload file, with source `payload/<path>` and target `.kaal/<path>`, and no `surface`;
  - catalogues each target with the SHA-256 of every content it has had in a published version, the current bytes included. Once published, a digest is never dropped;
  - names the record `.kaal/state/core/installation.json`, which is the record Core's Agent Realization already keeps;
  - states the runtime `{ node: 24 }`, and provides no Skill.
- **core/F43** [core/I12]: **Version.**
  - `kaal init` registers each file it writes in Core's record, with the contract's version, through `register`.
  - `kaal version` prints:
    - the kaal-core version that runs;
    - the version the Engine's record holds for Core's files. When the record holds no Core file, it says the Engine is unrecorded. When the files carry different versions, it says it is mixed and names each version.
- **core/F44** [core/I12, core/I5]: **Upgrade.** `kaal upgrade` brings an Engine to the contract of the kaal-core that runs.
  - **Install where absent:** a target that is absent is written.
  - **Replace where unmodified:** a file Core's record holds, with its recorded bytes, is replaced with the contract's bytes.
  - **Adopt:** a file at a target that the record does not hold, but whose bytes the catalogue lists, is adopted, because Core is its own lifecycle. That is how an Engine without a record gets one.
  - **Keep and report:** every other file at a target, such as one somebody changed, is kept and reported.
  - **Remove:** a recorded file the contract no longer delivers is removed if unmodified, and kept and reported otherwise.
  - **Record:** every file written or confirmed is recorded with the contract's version.
  - **Refuse:** the upgraded Engine must verify. If it would not, for example because a kept file is a foundational Node or the Kernel, or because a registered contribution no longer resolves, the upgrade is refused with the reasons and nothing changes.
  - **Idempotent:** upgrading an Engine already at the contract writes nothing.
- **core/F45** [core/I12, core/I5]: **Remove.** `kaal remove` removes Core's installation:
  - every file Core's record holds that is unmodified, the provider deployments of Agent Realization included, then the record itself;
  - the directories that removal empties, which are pruned.

  It keeps and reports everything else: a modified file, a registered contribution, a typed artifact, and another Capability's record or assets. When nothing is kept, the Engine directory is gone.
- **core/F46** [core/I12]: **Where.** The lifecycle commands act on the Engine at `./.kaal`, because Core's contract and record are written relative to the repository root. With `--engine`, `upgrade` and `remove` are refused and nothing is written. `version` reports such an Engine as unrecorded. `init --engine <dir>` still bootstraps, with no record.
