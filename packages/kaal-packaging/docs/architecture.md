# KAAL Packaging: Architecture

<!-- Shipped with kaal-packaging. The plan/ documents in the source repository record each Change that set these. -->

Each element names, in brackets, the Requirements it answers (`requirements.md`).

- **packaging/A1** [packaging/F1–packaging/F5, packaging/N3]: A `Packaging` KAAL Capability Node states the whole concern: how KAAL's deliverables become packages and what those packages are, in any ecosystem. The Node is not npm-specific, and it does not limit Packaging to measurement. This increment delivers one package, `packages/kaal-packaging`, which is private and depends on `kaal-hosting` and `kaal-foundation` only. Its README states its own interface and boundaries: what it measures, which ecosystems it reads, and what it does not do (produce packages, judge sizes).
- **packaging/A2** [packaging/I3]: Engineering invokes it. A driver, `engineering/packaging/measure.mjs` with `npm run size`, measures each tarball that `pack()` already packed once, compares it with the caller's previous record, and writes the report. The driver is Engineering's and lands in an Engineering Change after `packaging/C2`. Whether a result gates anything is Engineering's decision, through its own Control Nodes.
- **packaging/A3** [packaging/I3, packaging/N2]: Products are measured from outside. No product imports Packaging, so Guard keeps no dependencies. A product that wants a size constraint states it in its own documents and checks it against Packaging's report in its own Change.
- **packaging/A4**: The boundary with Testing. Testing measures test evidence: coverage, line inventory and attribution of lines to owners. Packaging measures delivered bytes. Neither imports the other. Testing's README line, that what a package delivers is the caller's to decide, stays true: deciding is Engineering's, measuring is Packaging's.
- **packaging/A5** [packaging/F1] (amended by `packaging/C3`): Ecosystem realizations. The measurement and record forms are ecosystem-neutral. Each ecosystem has its own realization behind `measure`, which asks that ecosystem's tooling (packaging/A6). The first realization is npm's. Whether a later ecosystem ships in this package or as its own independently consumable package is decided when it arrives. No consumer is required to depend on more than one package.
- **packaging/A6** [packaging/F1, packaging/F6, packaging/N3, packaging/N4, packaging/N6] (amended after the Owner's review on #616): Ecosystem tooling through Hosting. `npm.md` holds the evidence for every choice here.
  - The npm realization runs `npm pack --dry-run --json --ignore-scripts --offline --cache <work>/cache --logs-max=0 --no-update-notifier --userconfig <work>/npmrc -- <artifact>` through `kaal-hosting`'s `execute`, with the arguments as an array and `<work>` as the working directory. No shell reads them. The options come first and `--` ends them, so no artifact name can be read as an option. The cache, logs and user configuration stay inside `<work>`, which the caller gives empty.
  - `<artifact>` must be absolute and end in `.tgz`, `.tar.gz` or `.tar`. npm reads anything else as a registry name or a directory, so the realization refuses it before npm runs.
  - Just before the pack, `npm --version` runs the same way. Its output, trimmed, must be a semantic version, at least 11.18.0 (`packaging/N6`), and it is recorded as it was printed.
  - npm states each file's path and size, the entry count and the unpacked size. The realization maps that into the description and checks it (`packaging/N4`). It ignores `bundled` and `mode`.
  - The packed size and the SHA-256 are taken from the artifact's own bytes, read through `kaal-hosting`'s `readFile` before npm runs and again after, never from the tool.
  - Hosting runs the command and knows nothing of npm. npm's semantics stay in Packaging's npm realization. Packaging parses no archive format.
  - Its dependencies are exactly `packaging/A1`'s: `kaal-hosting` and `kaal-foundation`.
- **packaging/A7** [packaging/F7–F14, packaging/N7–N10]: **A reusable conformance suite, run from outside.** Packaging ships `kaal-packaging/conformance`: parametrized cases that take the location of an installed KAAL package and decide each generic Requirement against it. No KAAL package imports it. Engineering runs it against the packed-and-installed candidate and reports its result next to the package's own, on the same artifact identity (engineering/C5, engineering/F17–F19). This is how Core's conformance cases are reused (engineering/C4, #607).
- **packaging/A8** [packaging/F10, packaging/N10]: **References, not copies.** The suite checks a package's result line against Testing's verifier contract (testing/C29, #639) as Testing publishes it. Until that contract is approved, the suite checks only the three results and exit codes that every product already agrees on (`reconciliation.md`). Packaging defines no result semantics and takes no runtime dependency on Testing (packaging/A1).
- **packaging/A9** [packaging/F11]: **Identity.** The suite reads the installed files and compares them with the manifest. Packaging's `measure` gives the packed artifact's SHA-256 (packaging/F4). That is the identity Engineering records for the candidate.
- **packaging/A10** [packaging/F12]: **Ecosystem-neutral wording, npm first.** The contract is stated for any ecosystem. Its first realization reads npm's `package.json` fields (`name`, `version`, `dependencies`, `engines`, `scripts.test`). Another ecosystem adds a realization and leaves the contract unchanged (packaging/A5).
- **packaging/A11** [packaging/F9, packaging/F14]: **`npm test` depends on its context** (the Owner's D1, #658). Which tests apply follows the realization whose contract is verified, not only where the command runs:
  - **The KAAL repository root.** `npm test` orchestrates every applicable Engineering, Embedded and External Test Suite from the declared Plans. It reports separate results and shows missing or unresolved coverage honestly. This is Engineering's (engineering/C6).
  - **A package's source workspace.** `npm test` follows that workspace's declared Test Plan (packaging/F14).
  - **An installed KAAL package.** `npm test` executes the package's Embedded verification contract against the installed artifact (packaging/F9). This is Packaging's generic Embedding contract.
  - **An external repository.** `npm test` is that repository's own entrypoint and policy. External means a KAAL-loaded agent applying KAAL knowledge to serve another repository, not direct package consumption, and the external repository owns its semantics, adapted or not.
- **packaging/A12** [packaging/F15, packaging/F16, packaging/F17]: **Layout.** The package ships `lib/`, `bin/kaal-packaging.mjs`, `skills/kaal-packaging/SKILL.md`, `docs/`, `capability/`, `test/embed/`, `test/verify.mjs` and `test/verify.json`. `test/publisher/` holds the publisher's suites today in `test/plan/`, and does not ship. `test/verify.json` is build output, written by a script under `test/publisher/` from npm's own pack list, as Core and Guard write theirs.
- **packaging/A13** [packaging/N11]: **npm is given, not found by platform.** `measure` and `conform` take an optional `npm`, the path of a Node script that behaves as npm. When it is given, they run it as `process.execPath <script> …` through Hosting's `execute`. When it is not, they run `npm` through Hosting, as today. The tests give their stand-in this way, and run every real npm through Hosting's `execute`.
- **packaging/A14** [packaging/F19]: **Registry resolution is read, not fetched.** F7 reads the consumer's install record, `node_modules/.package-lock.json` (or the consumer's `package-lock.json`), for each runtime dependency of the package under test. It makes no network request, so its result does not depend on a registry being reachable.

## The Changes that set this package

Each Requirement and element above that names a Change was set or corrected by it. Their PLANs are in the source repository's `plan/`.

| Change | What it set |
| --- | --- |
| packaging/C1 | The PLAN for package size measurement: packaging/I1–I3, F1–F5, N1–N3 |
| packaging/C2 | The DO for package size measurement |
| packaging/C3 | Ecosystem tooling instead of an archive reader: packaging/F6, N4–N6, A5, A6 |
| packaging/C4 | The PLAN for the generic KAAL Package contract: packaging/I4–I6, F7–F14, N7–N10, A7–A11 |
| packaging/C5 | The DO for the KAAL Package conformance suite |
| packaging/C6 | packaging/F12 decided through Hosting's OS boundary |
| packaging/C7 | packaging/F13 read through Testing's model |
| packaging/C8 | The PLAN for Packaging as a capability: packaging/I7, F15–F19, N11, N12, A12–A14 |
| packaging/C9 | The DO for Packaging as a capability |
