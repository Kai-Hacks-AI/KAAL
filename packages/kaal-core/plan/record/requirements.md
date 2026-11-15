# Installation Record and Cross-Installer Interoperability: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N10** [core/I3]: The record format, its conformance check and registration are pure and deterministic, like the contract (`core/N4`). They read nothing from the host and write nothing.

## Functional

- **core/F33** [core/I3, core/I5]: Core's `Installation Contract` Definition also defines the shape of the record a contract names (`core/F12`). A record is a JSON object whose `assets` member maps the repository-relative path of every file the Capability owns in this repository to `{ "sha256": <digest>, "version": <the Capability version that wrote or last confirmed it> }`. One map keeps a file's digest and version together, so they cannot diverge. Any other member belongs to the Capability (for Guard, the surfaces a consumer activated, `guard/F30`). An installer that is not the Capability's own lifecycle keeps those members byte for byte and never adds a member of its own.
- **core/F34** [core/I5]: When Core realizes a contract, it registers each asset file it writes in the contract's record, with the SHA-256 it wrote and the contract's `version`. It creates the record when there is none. It never removes or changes another entry or member. This states `core/F19` precisely.
- **core/F35** [core/I5]: Core registers only what it wrote. A file already present at an asset target, whatever its bytes, is kept and reported and is not registered, even when it matches a catalogued content. That matches `guard/F29`: matching published bytes proves neither who installed a file nor who authorized it.
- **core/F36** [core/I3, core/I5]: Every file has one owner and one record. A Skill that a Capability's contract delivers is that Capability's asset at its canonical location, and the Capability's record holds it. Core's own record (`core/F18`) holds only the provider deployments Core generates from it, such as `.claude/skills/<name>/`. Core's own record therefore never holds a file the Capability's standalone `upgrade` or `remove` may change. When the canonical asset is already registered by the Capability's own lifecycle, Core neither rewrites nor re-registers it, and only deploys for providers.
- **core/F37** [core/I3, core/I5]: An asset may be marked `surface`, the name of a surface its Capability installs only when a consumer opts in (for Guard, `hook` or `ci`, `guard/F30`). Core never realizes a surface-gated asset. Activation stays the Capability's own command, so Core's realization never turns on a surface the consumer did not choose.
- **core/F38** [core/I3]: `checkRecord(record)` returns the findings for one record, empty when it conforms. Each finding names its member, like `checkContract` (`core/F15`).
