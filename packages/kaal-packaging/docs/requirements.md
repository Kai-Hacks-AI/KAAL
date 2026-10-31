# kaal-packaging: Requirements

Assembled from the PLANs under `plan/` by `test/publisher/build.mjs`; edit those, not this file.

## Measurement

Each Requirement names, in brackets, the Intents it serves.

### Functional

- **packaging/F1** [packaging/I1] (amended by `packaging/C3`): `measure(artifact, { work })` takes the location of a package artifact and an empty working directory for its tool, and resolves to its description: its identity, the tool and version that described it, its packed size and SHA-256 from the artifact's own bytes, and every delivered file's path and size as the ecosystem's own tooling reports them. The description is the same for every ecosystem. Obtaining it is an ecosystem realization's work, and the first realization asks npm. A second ecosystem, such as NuGet, adds a realization and changes no description.
- **packaging/F2** [packaging/I1]: `attribute(measurement, groups)` sums the files into groups the caller names by path prefix, such as `docs/` or `test/`. Every byte falls in exactly one group, or in `unattributed`, and the groups add up to the unpacked size.
- **packaging/F3** [packaging/I2]: `compare(before, after)` gives the change in packed and unpacked size, the change for each group and each path, and the paths added and removed.
- **packaging/F4** [packaging/I2] (amended by `packaging/C3`): A measurement can be written as a record and read back unchanged. The record holds the package's ecosystem, name, version and artifact SHA-256, the tool and version that described it, and the measurement. Where records are kept is the caller's choice.
- **packaging/F5** [packaging/I3]: `report` renders a measurement or a comparison as text and as JSON. It states sizes and deltas only.

### Nonfunctional

- **packaging/N1** [packaging/I1] (amended by `packaging/C3`): The same artifact, described by the same ecosystem tool version, always gives the same measurement, on every host. The record names that tool version, so a difference between two records can be traced to it.
- **packaging/N2** [packaging/I3]: Nothing in Packaging holds a budget, a threshold or a verdict. No output reads as pass or fail.
- **packaging/N3** [packaging/I1] (amended by `packaging/C3`): Packaging imports no host module and parses no archive or compression format. Anything it needs from the host, including running an ecosystem's tool, comes through `kaal-hosting`, and SHA-256 comes from `kaal-foundation`.

### Not in this Change

- Producing packages. `engineering/delivery/pack.mjs` stays Engineering's, and Engineering keeps invoking it, until a later Change authorized on its own moves it.
- Any product's size constraint, including Guard's. `guard/C117`'s decision, None, stands.
- Publication. The package is `private`.

### Added in `packaging/C3`

- **packaging/F6** [packaging/I1]: When the ecosystem's tool is missing, cannot read the artifact, or reports something that is not a description, `measure` refuses with the tool and the reason named. It never guesses a size.
- **packaging/N4** [packaging/I1] (amended after the Owner's review on #616): What Packaging accepts from a tool is bounded and checked, because the tool does not check it (`npm.md`).
  - The number of files, each path's length, the unpacked size and the length of the tool's output have limits the caller can set.
  - The files' sizes must add up to the unpacked size the tool reports, and their number must equal its entry count.
  - The tool's packed size must equal the artifact's length, and the artifact's SHA-256 must be the same before and after the tool runs.
  - A path must be relative, with no empty, `.` or `..` segment and no backslash, and must appear once. It is refused, not normalized.
  - Anything else is refused, naming the cause.
- **packaging/N5** [packaging/I1] (added after the Owner's review on #616): `measure` is for artifacts whose producer the caller trusts. An ecosystem tool's time and memory grow with the artifact, and Hosting bounds neither (`npm.md`). Measuring an untrusted artifact waits on a bounded execution, which is the Owner's decision in `architecture.md`.
- **packaging/N6** [packaging/I1] (added after the Owner's review on #616): Each realization names the lowest tool version it accepts, and refuses an older one, naming both versions. npm's is 11.18.0, the first 11.x that refuses a decompression bomb instead of expanding it (`npm.md`).

## Package

Each Requirement names, in brackets, the Intents it serves. Where another capability owns the meaning, the Requirement references it and does not restate it. "A KAAL package" is any workspace package this repository delivers.

### Functional

- **packaging/F7** [packaging/I4]: **Identity.** A KAAL package states one name, one exact version, and every runtime dependency at an exact version that installs from its registry. It names no workspace, file or Git dependency. Which namespace a package takes is the Owner's per-package decision (#622). Whether a dependency installs from its registry is decided as packaging/F19 states (packaging/C8).
- **packaging/F8** [packaging/I4]: **Shipped documentation.** A KAAL package ships `docs/intent.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/testing.md`, `docs/limitations.md` and `docs/operations.md`. Their content is the package's own. `docs/operations.md` is the authoritative Operations document. The README is the discoverable entry: it gives the overview and links each delivered document, Operations included (the Owner's D2, #658).
- **packaging/F9** [packaging/I4, packaging/I5]: **The Embedding contract: installed verification.** Once installed, a KAAL package's `npm test` executes its Embedded verification contract against that installed copy. It needs no checkout of this repository and runs no Engineering test. The installed run and its meaning are testing/F11–F12's. This is the only `npm test` context Packaging owns (`architecture.md`, packaging/A11).
- **packaging/F14** [packaging/I4, packaging/I5]: **A declared source Test Plan.** In its source workspace, a KAAL package declares its Test Plan as named scripts, and its `npm test` there follows that declaration. The Embedded verification is one of the declared suites, so the contract that is checked once installed can also be run before packing. Which other suites the plan holds is the package's own decision.
- **packaging/F10** [packaging/I4, packaging/I6]: **Result.** That entrypoint reports Testing's result for the run, with cause and evidence (testing/F13–F14), on a single line that a caller can read. Its form is the shared verifier contract's, which hosting/F26 assigns to Testing (testing/C29, #639). Packaging requires conformance to it and defines no result of its own.
- **packaging/F11** [packaging/I4, packaging/I5]: **Shipped manifest.** A KAAL package ships a manifest of every delivered file with its SHA-256 and every Embedded Test Case it declares. Its verification compares the installed files with the manifest and runs exactly the declared cases. Under testing/F14, consistency with a shipped manifest is not provenance.
- **packaging/F12** [packaging/I4, packaging/I6]: **Declared runtime; platforms are Hosting's.** A KAAL package declares its runtime (in npm, `engines.node`). It does not restrict the hosts it runs on: Hosting is the sole operating-system boundary (hosting/F36), and outside it a manifest `os` or `cpu` restriction is an architectural violation (hosting/F39). A portable package that declares no platforms conforms. Packaging consumes Hosting's boundary declaration and holds no OS policy of its own. Where the installed Hosting declares no boundary, a restriction is unknown, never verified. Host facts, fixtures and justified applicability exceptions are Hosting's, and not-applicable cases are governed by testing/F47. (Corrected by packaging/C6, the Owner's review on #686.)
- **packaging/F13** [packaging/I4, packaging/I5]: **Traceability, Testing's.** The traces a KAAL package ships are Testing's model: Case —tests→ Target (testing/F25, testing/F66). Packaging reads them only through Testing's model functions, which its caller hands in, and they must resolve. Packaging takes no dependency on Testing. Testing's check finds nothing in the shipped model. Its Cases are exactly the delivered cases. Every target it tests is an identifier the shipped documents define. Which targets are evidenced is derived by Testing, from these traces and the latest applicable Run (testing/F40). Coverage, allocation and a verifier's own result are not interchangeable with that evidence. Packaging reads no coverage, allocation or unverified declaration, and applies no rule that every identifier be tested, because that rule waits on the Owner's decision on Testing #667. A package that defines no identifier and ships no model has no trace to resolve, and conforms. Identifiers defined with no shipped model, and a shipped model without Testing's model functions, are unknown, never verified. (Corrected by packaging/C7, the Owner's review on #686.)

### Nonfunctional

- **packaging/N7** [packaging/I4]: **Intact consumer.** Verification writes only in a scratch space it removes. It leaves the consumer's project, dependencies and configuration as they were, as testing/F15 states.
- **packaging/N8** [packaging/I4]: **Self-contained verifier.** The installed verification needs only the runtime and the package's own declared runtime dependencies. It depends on neither Testing nor Guard at runtime.
- **packaging/N9** [packaging/I5]: **Behaviour, not presence.** Every case decides its Requirement from the installed package's behaviour or bytes. A case that passes merely because a file exists, or that reads this repository's checkout, is itself a defect.
- **packaging/N10** [packaging/I6]: **No restatement.** No Packaging Requirement restates a meaning another capability owns. Each one references it by ID, and if that meaning changes, the reference follows.

### Not in this Change

- Any package's specific contract, and any product's acceptance.
- Producing, packing and publishing packages, which stay Engineering's and the Owner's. Repeatable publication and binding the exact artifact (candidate F10) are returned to Engineering and the Owner.
- Determinism of outcomes (candidate N5). testing/F15 promises none, and Packaging does not contradict it.
- Gating anything. Engineering decides how conformance is used (engineering/C5, engineering/F17–F19).

## Capability

Each Requirement names, in brackets, the Intents it serves.

### Functional

- **packaging/F15** [packaging/I7, packaging/I4]: **Dogfood.** `kaal-packaging` is a KAAL package under packaging/F7–F14 and N7–N10. It ships the six documents of packaging/F8, linked from its README. It ships its own Embedded Test Cases in `test/embed/` (testing/F76), its verifier, and `test/verify.json` with digests, delivered cases and its Testing `model` (packaging/F11, packaging/F13). Its source `npm test` follows a declared Test Plan with `test:embedded` and `test:publisher` (packaging/F14). Installed, its `npm test` runs `test:embedded` only. Being private is no exemption. The publisher's planned tests leave `test/plan/` for `test/publisher/`. `test/plan/` is legacy (#702).
- **packaging/F16** [packaging/I7]: **Commands.** The package declares a `bin`, `kaal-packaging`, with two commands:
  - `measure <artifact> [--work <dir>]` prints the measurement record of packaging/F1–F6;
  - `conform <installed-dir> [--consumer <dir>] [--work <dir>]` prints the conformance report of packaging/F7–F13 and N7–N9, and ends on one result line in Testing's form (packaging/F10).

  The exit statuses are 0 for verified, 1 for failed and 2 for unknown or cannot run. Both commands are thin: they parse arguments and call the exported functions, and they decide nothing the functions do not.
- **packaging/F17** [packaging/I7]: **Skill.** The package ships one skill, `skills/kaal-packaging/SKILL.md`, in the shared skill format. It tells an agent when to measure an artifact, when to run the generic contract against a packed-and-installed candidate, how to read each finding and the three results, and which questions belong to another owner rather than to Packaging. Graph's and Testing's skills are the shape to follow.
- **packaging/F18** [packaging/I7]: **Agent instructions.** The repository's agent instructions name Packaging. They say when to use it, through the skill and the commands, and that Packaging decides the generic contract and nothing else. The skill ships, so an agent in a consumer can read it.
- **packaging/F19** [packaging/I4]: **F7 decides the registry, not the syntax.** packaging/F7 verifies a runtime dependency only when the consumer's install shows that it resolved from a registry: the installed lockfile's `resolved` for that dependency is a registry tarball URL with an `integrity`. A `file:`, `link:`, Git or path resolution fails F7. A dependency the install records no resolution for is `unknown`, never `verified`, because a version pinned in syntax alone may name a package nobody published, which is open to dependency confusion.

### Nonfunctional

- **packaging/N11** [packaging/I7, packaging/I6]: **No OS knowledge, in tests either.** No file in Packaging, tests included, branches on `process.platform`, writes an OS-specific launcher, or passes `shell` by platform. Every process Packaging or its tests start goes through Hosting's `execute`. A stand-in npm is a Node script that a caller gives to `measure` and `conform` (packaging/A13), never a launcher put on `PATH`. A platform-scoped not-applicable outside Hosting is a violation (testing/F67).
- **packaging/N12** [packaging/I7, packaging/I3]: **The commands decide nothing new.** What `measure` and `conform` decide stays in the library and its Requirements. A command adds argument parsing, printing and exit statuses only.

### Not in this Change

- Foundation's `test/verify.json`. packaging/F11 is not relaxed for it.
- Publishing Packaging. It stays private, and so does its version.
- Any gate. When conformance gates a release stays Engineering's and the Owner's (engineering/C5).
