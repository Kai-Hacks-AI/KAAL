# kaal-packaging: Architecture

Assembled from the PLANs under `plan/` by `test/publisher/build.mjs`; edit those, not this file.

## Measurement

Each element names, in brackets, the Requirements it answers.

- **packaging/A1** [packaging/F1–packaging/F5, packaging/N3]: A `Packaging` KAAL Capability Node states the whole concern: how KAAL's deliverables become packages and what those packages are, in any ecosystem. The Node is not npm-specific, and it does not limit Packaging to measurement. This increment delivers one package, `packages/kaal-packaging`, which is private and depends on `kaal-hosting` and `kaal-foundation` only. Its README states its own interface and boundaries: what it measures, which ecosystems it reads, and what it does not do (produce packages, judge sizes).
- **packaging/A2** [packaging/I3]: Engineering invokes it. A driver, `engineering/packaging/measure.mjs` with `npm run size`, measures each tarball that `pack()` already packed once, compares it with the caller's previous record, and writes the report. The driver is Engineering's and lands in an Engineering Change after `packaging/C2`. Whether a result gates anything is Engineering's decision, through its own Control Nodes.
- **packaging/A3** [packaging/I3, packaging/N2]: Products are measured from outside. No product imports Packaging, so Guard keeps no dependencies. A product that wants a size constraint states it in its own documents and checks it against Packaging's report in its own Change.
- **packaging/A5** [packaging/F1] (amended by `packaging/C3`): Ecosystem realizations. The measurement and record forms are ecosystem-neutral. Each ecosystem has its own realization behind `measure`, which asks that ecosystem's tooling (packaging/A6). The first realization is npm's. Whether a later ecosystem ships in this package or as its own independently consumable package is decided when it arrives. No consumer is required to depend on more than one package.
- **packaging/A4**: The boundary with Testing. Testing measures test evidence: coverage, line inventory and attribution of lines to owners. Packaging measures delivered bytes. Neither imports the other. Testing's README line, that what a package delivers is the caller's to decide, stays true: deciding is Engineering's, measuring is Packaging's.

### The Changes

| Change | Owner | Depends on |
| --- | --- | --- |
| `packaging/C1` PLAN, this Change, into `kaal/packaging` | Packaging | |
| `packaging/C2` DO: the package, its Capability Node, GREEN tests | Packaging | `packaging/C1` |
| Engineering's driver and `npm run size` | Engineering | `packaging/C2` |
| promotion `kaal/packaging` → main | Packaging | `packaging/C2`, by the one-pair queue |

### Decided by the Owner (#596)

- **Scope.** Packaging owns the broader packaging concern, and measurement is its first increment. Producing packages moves from Engineering only through later Changes, each authorized on its own. Engineering invokes the current packer meanwhile.
- **Its own Capability.** It is not a module of Testing or of Engineering.
- **Ecosystems.** There is no npm-only conceptual model and no mandatory multi-package dependency. Each delivered package describes its own interface and boundaries.

### Amended in `packaging/C3` (the Owner's review on #614)

`packaging/C2`'s first DO read npm artifacts with its own gzip, DEFLATE and tar parser. From Packaging's seat that was the wrong owner. A KAAL package's delivered contents are what its ecosystem delivers, and the ecosystem's own tooling is the authority on that. A second parser can disagree with it, and its correctness and resource safety then become Packaging's to maintain, for formats Packaging does not own.

- **packaging/A6** [packaging/F1, packaging/F6, packaging/N3, packaging/N4, packaging/N6] (amended after the Owner's review on #616): Ecosystem tooling through Hosting. `npm.md` holds the evidence for every choice here.
  - The npm realization runs `npm pack --dry-run --json --ignore-scripts --offline --cache <work>/cache --logs-max=0 --no-update-notifier --userconfig <work>/npmrc -- <artifact>` through `kaal-hosting`'s `execute`, with the arguments as an array and `<work>` as the working directory. No shell reads them. The options come first and `--` ends them, so no artifact name can be read as an option. The cache, logs and user configuration stay inside `<work>`, which the caller gives empty.
  - `<artifact>` must be absolute and end in `.tgz`, `.tar.gz` or `.tar`. npm reads anything else as a registry name or a directory, so the realization refuses it before npm runs.
  - Just before the pack, `npm --version` runs the same way. Its output, trimmed, must be a semantic version, at least 11.18.0 (`packaging/N6`), and it is recorded as it was printed.
  - npm states each file's path and size, the entry count and the unpacked size. The realization maps that into the description and checks it (`packaging/N4`). It ignores `bundled` and `mode`.
  - The packed size and the SHA-256 are taken from the artifact's own bytes, read through `kaal-hosting`'s `readFile` before npm runs and again after, never from the tool.
  - Hosting runs the command and knows nothing of npm. npm's semantics stay in Packaging's npm realization. Packaging parses no archive format.
  - Its dependencies are exactly `packaging/A1`'s: `kaal-hosting` and `kaal-foundation`.
- **What Packaging claims, and what it does not.** It claims the description it accepted, checked by `packaging/N4`. It does not claim the ecosystem tool's robustness against a hostile artifact. npm's time and memory grow with the artifact (`npm.md`), so `measure` is for artifacts of known provenance (`packaging/N5`).
- **The interface, kept.** `attribute`, `compare`, `write`/`read` and `report` work on the description only, so they are unchanged. `measure(artifact, { work, limits })` becomes asynchronous and takes the artifact's location and a working directory, because its realization runs a tool. Its limits become `files`, `path`, `unpacked` and `output`. The old `archive` limit goes, because Packaging decompresses nothing. Groups stay prefixes the caller names. Grouping by a package's own declared parts, such as an Installation Contract's assets, is a later increment.
- **Where measurement runs.** It runs where the ecosystem's tool is installed, as it is in KAAL Engineering's lanes. Where the tool is missing, `measure` refuses and names it (`packaging/F6`).
- **Boundaries.** No other Capability changes. Hosting's `execute` and `readFile` are used as they are, and Engineering's driver is still planned after `packaging/C2`. A change to any of these returns to the Owner for alignment.

| Change | Owner | Depends on |
| --- | --- | --- |
| `packaging/C3` PLAN amendment, this Change | Packaging | `packaging/C1`; the Owner's review on #614 |
| `packaging/C2` DO, reworked to `packaging/A6`: the own reader removed, the amended tests GREEN | Packaging | `packaging/C3` |

### For the Owner (#616)

**Untrusted artifacts.** **A (recommended):** `packaging/C2` measures artifacts of known provenance only, as `packaging/N5` states, and Engineering's driver measures the tarballs its own job has just packed. **B:** first, a Hosting Change gives `execute` a time limit and an output limit, so a hostile artifact is stopped rather than measured. B still leaves memory unbounded, since no host-neutral mechanism caps it. B would be Hosting's Change, for the Owner to align, and `packaging/C3` does not propose it.

## Package

- **packaging/A7** [packaging/F7–F14, packaging/N7–N10]: **A reusable conformance suite, run from outside.** Packaging ships `kaal-packaging/conformance`: parametrized cases that take the location of an installed KAAL package and decide each generic Requirement against it. No KAAL package imports it. Engineering runs it against the packed-and-installed candidate and reports its result next to the package's own, on the same artifact identity (engineering/C5, engineering/F17–F19). This is how Core's conformance cases are reused (engineering/C4, #607).
- **packaging/A8** [packaging/F10, packaging/N10]: **References, not copies.** The suite checks a package's result line against Testing's verifier contract (testing/C29, #639) as Testing publishes it. Until that contract is approved, the suite checks only the three results and exit codes that every product already agrees on (`reconciliation.md`). Packaging defines no result semantics and takes no runtime dependency on Testing (packaging/A1).
- **packaging/A9** [packaging/F11]: **Identity.** The suite reads the installed files and compares them with the manifest. Packaging's `measure` gives the packed artifact's SHA-256 (packaging/F4). That is the identity Engineering records for the candidate.
- **packaging/A10** [packaging/F12]: **Ecosystem-neutral wording, npm first.** The contract is stated for any ecosystem. Its first realization reads npm's `package.json` fields (`name`, `version`, `dependencies`, `engines`, `scripts.test`). Another ecosystem adds a realization and leaves the contract unchanged (packaging/A5).

- **packaging/A11** [packaging/F9, packaging/F14]: **`npm test` depends on its context** (the Owner's D1, #658). Which tests apply follows the realization whose contract is verified, not only where the command runs:
  - **The KAAL repository root.** `npm test` orchestrates every applicable Engineering, Embedded and External Test Suite from the declared Plans. It reports separate results and shows missing or unresolved coverage honestly. This is Engineering's (engineering/C6).
  - **A package's source workspace.** `npm test` follows that workspace's declared Test Plan (packaging/F14).
  - **An installed KAAL package.** `npm test` executes the package's Embedded verification contract against the installed artifact (packaging/F9). This is Packaging's generic Embedding contract.
  - **An external repository.** `npm test` is that repository's own entrypoint and policy. External means a KAAL-loaded agent applying KAAL knowledge to serve another repository, not direct package consumption, and the external repository owns its semantics, adapted or not.

  Engineering builds KAAL, Embedding delivers it, and External applies its knowledge through an agent. Packaging owns only the Embedding contract. It states nothing about Engineering's or External tests.

### Owner alignment, decided on #658

The Owner decided both on #658 (comment 6530188315). The text below records what each replaced.

- **D1, decided: no universal rule, `npm test` depends on its context** (packaging/A11). The binary choice it replaced:
  - **A: comprehensive.** Source `npm test` runs every `test:<name>` suite the package declares, the publisher's included. This is foundation/F9 and core/F75, both citing the convention the Owner set on #625.
  - **B: consumer-only everywhere.** Source `npm test` also runs only the consumer entry, and the publisher's suites run under `test:publisher`. This is hosting/F20 and graph/F6. engineering/C6 cites a later #625 comment (6510333640) as superseding the comprehensive reading.
  - Under A11, both readings remain legitimate source-workspace plans (packaging/F14). The root stays comprehensive, and an installed package stays independently verifiable.
- **D2, decided: A.** `docs/operations.md` is the authoritative shipped Operations document, and the README links to it (packaging/F8). The options it chose between:
  - **A (recommended): `docs/operations.md`,** beside the other shipped documents, as Foundation, Core and Graph plan it (foundation/F7, core/F69, graph/F5). It also already carries their shipped-files list (packaging/F11). The README keeps the overview and points to it.
  - **B: the README,** as Guard, Hosting and Change do (guard/F37, hosting/F18, change/F21).

Two more conflicts are not Packaging's. Packaging follows whatever their owners decide:

- whether a tampered installed file is failed or unknown. That is Testing's: graph/F6 says failed, testing/F43 says unknown, and Testing proposes unknown on #610;
- which evidence counts toward a release, registry or packed candidate. That is the Owner's: guard/N9 against core/F72 and hosting/A9.

### The DO, and what follows it

The Owner chose **baseline first** (#658): the generic contract, Testing's semantics and Engineering's dual conformance come before the first 0.0.1 publication. The sequence, each step its own reviewed Change:

1. **packaging/C4 PLAN** (this Change). D1 and D2 are decided.
2. **packaging/C5 DO, the conformance suite.** It covers `kaal-packaging/conformance` with packaging/T15–T26 and their fixtures, RED first. It touches only `packages/kaal-packaging/`, depends on nothing beyond Hosting and Foundation, and changes no product. It is bounded to the Requirements above.
   - **packaging/C6, a bounded correction of step 2** (the Owner's review on #686). packaging/F12 decides platforms through Hosting's OS boundary (hosting/F36, hosting/F39), not through a manifest `os`. It covers T20's new version, and touches only `packages/kaal-packaging/`.
   - **packaging/C7, a bounded correction of step 2** (the Owner's review on #686). packaging/F13 reads the traces a package ships through Testing's model (testing/F25, testing/F66), not through a coverage registry. It covers T21's new version. Testing's model functions are handed in by the caller, so Packaging takes no dependency on Testing (the Owner's review on #703). It touches only `packages/kaal-packaging/`.
   - **packaging/C8, Packaging as a capability** (the peer review on #686, against the Owner's capability bar). Packaging meets the contract it enforces, and gains a skill, commands and agent instructions. F7 decides the registry, and no test holds OS knowledge. See `plan/capability/`.
3. **Testing**, in parallel with step 2: testing/C29 (#639) for the verifier contract, and the coverage PLAN Testing proposed on #610, on the Owner's go. Until they land, the suite reports what depends on them as unknown, never GREEN.
4. **Engineering's dual conformance**, engineering/C5's release-readiness DO (#610, engineering/F17–F19). It runs step 2's suite and each product's own suite on one packed-and-installed candidate. It waits for step 2 and for the C5 PLAN's approval.
5. **Each product's alignment**, by its owner, in the runtime-dependency order the Owner set: Foundation, Hosting, Graph, Core. Each closes the gaps `reconciliation.md` lists for it. Hosting and Change also move Operations into `docs/operations.md`, and Guard does the same in a later release of its own. Packaging edits no product.
6. **Each release candidate.** Engineering reports both results on the exact candidate. The Owner's recorded authorization accepts it, and publication stays the Owner's.

Approving this PLAN authorizes step 2 only.

## Capability

- **packaging/A12** [packaging/F15, packaging/F16, packaging/F17]: **Layout.** The package ships `lib/`, `bin/kaal-packaging.mjs`, `skills/kaal-packaging/SKILL.md`, `docs/`, `capability/`, `test/embed/`, `test/verify.mjs` and `test/verify.json`. `test/publisher/` holds the publisher's suites today in `test/plan/`, and does not ship. `test/verify.json` is build output, written by a script under `test/publisher/` from npm's own pack list, as Core and Guard write theirs.
- **packaging/A13** [packaging/N11]: **npm is given, not found by platform.** `measure` and `conform` take an optional `npm`, the path of a Node script that behaves as npm. When it is given, they run it as `process.execPath <script> …` through Hosting's `execute`. When it is not, they run `npm` through Hosting, as today. The tests give their stand-in this way, and run every real npm through Hosting's `execute`.
- **packaging/A14** [packaging/F19]: **Registry resolution is read, not fetched.** F7 reads the consumer's install record, `node_modules/.package-lock.json` (or the consumer's `package-lock.json`), for each runtime dependency of the package under test. It makes no network request, so its result does not depend on a registry being reachable.

### Sequence

1. **packaging/C8 PLAN** (this Change). It also aligns `plan/package/reconciliation.md`'s F11 row with the code: the manifest is `test/verify.json`, and a list in `docs/operations.md` without digests leaves F11 `unknown`.
2. **packaging/C9 DO.** packaging/T27–T34, RED first, then the layout, commands, skill, F7 resolution and the OS-free tests. It touches `packages/kaal-packaging/`, the repository's agent instructions for F18, and the root lockfile only if `bin` requires it.
3. **#686**, the promotion, re-reviewed on C9's head, as the Owner decides on #686.
