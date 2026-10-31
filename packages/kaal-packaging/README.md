# kaal-packaging

KAAL Packaging: how KAAL's deliverables become packages and what those packages are. It measures a package artifact's delivered size, and decides the generic KAAL Package contract against an installed package. It is private and not published.

```
capability/Packaging.md      the Capability Node, typed by Core's KAAL Capability
lib/packaging.mjs            measure, attribute, compare, write, read and report: ecosystem-neutral
lib/conformance.mjs          the KAAL Package contract's conformance suite (kaal-packaging/conformance)
lib/npm/                     the npm realization: asks npm to describe an npm package artifact
ownership.kaal.json          Packaging's ownership claim (repository data, not delivered)
plan/                        the PLANs (not delivered)
```

## Interface

```js
import { attribute, compare, measure, read, report, write } from "kaal-packaging";
```

- `await measure(artifact, { work, limits })` takes the absolute location of a package artifact and a working directory for the ecosystem's tool, and returns its `package` (`ecosystem`, `name`, `version` and the artifact's `sha256`), the `tool` and version that described it, its `packed` size, its `unpacked` size and every file's `path` and `size`. They come from the artifact itself, never from a source directory. Paths are relative to the package root.
- `attribute(measurement, groups)` sums the files into the groups the caller names by path prefix. Each file falls in the longest prefix that matches its path, or in `unattributed`, so the groups and `unattributed` add up to the unpacked size.
- `compare(before, after, groups)` gives the change in packed and unpacked size, for each group, and for each path that changed, was added or was removed.
- `write(measurement)` gives a record, and `read(record)` reads it back unchanged or refuses what is not one. A record is machine-owned state. Where it is kept is the caller's choice.
- `report(subject, { format })` renders a measurement or a comparison as `text` or `json`.

## How an artifact is described

Packaging parses no archive (`packaging/A6`). Describing an artifact is its ecosystem's own tool's, and Packaging asks that tool through Hosting's `execute`. For npm that is `npm pack --dry-run --json --ignore-scripts --offline --cache <work>/cache --logs-max=0 --no-update-notifier --userconfig <work>/npmrc -- <artifact>`, which reports what an existing tarball delivers without repacking it. `plan/measurement/npm.md` holds the evidence for what npm reports and where it cannot be trusted.

The packed size and the SHA-256 come from the artifact's own bytes, read through Hosting before and after the tool runs. Everything else is what the tool reported, checked (`packaging/N4`) and refused with an `Error` naming the cause when:
- the tool is missing, exits non-zero, or writes something that is not one package's description;
- npm is below 11.18.0, the first 11.x that refuses a decompression bomb (`packaging/N6`), or prints a version that is not a semantic version;
- the files do not add up to the unpacked size, their number is not the entry count, or the packed size is not the artifact's length;
- a path is empty or absolute, has an empty, `.` or `..` segment or a backslash, or is listed twice;
- the output, the number of files, a path or the unpacked size exceeds `LIMITS` (`output`, `files`, `path`, `unpacked`), which `limits` narrows or widens;
- the artifact's SHA-256 changed while the tool ran.

A recorded path is always the path the tool reported: nothing is normalized. Nothing is written outside the working directory, and the user's own npm configuration is not read.

**Known provenance.** npm's time and memory grow with the artifact, and neither npm nor Hosting bounds them. So `measure` is for artifacts of known provenance, such as one a lane just packed (`packaging/N5`).

**Its dependencies.** `kaal-hosting` runs the tool and reads the artifact. `@kaihacksai/kaal-foundation` supplies SHA-256. `packaging/A1`'s "Hosting and Foundation only" is the most it may depend on.

## The KAAL Package contract's conformance suite

```js
import { conform, conformSource, references } from "kaal-packaging/conformance";
```

Every KAAL package keeps one generic contract, Packaging's (`plan/package/`, packaging/F7–F14 and N7–N10), next to the specific contract its delivering capability owns. This suite decides the generic one. It is run from outside: no KAAL package imports it, and Engineering runs it beside each package's own suite on the same packed-and-installed candidate (packaging/A7, engineering/C5).

- `await conform(dir, { consumer, env })` takes the location of an installed package and of the consumer project it is installed in. It runs the installed `npm test` there once, and returns one finding per Requirement, packaging/F7–F13 and N7–N9, each `verified`, `failed` or `unknown` with its cause, the overall `result`, and what the package's own verification `reported`. That report is the package's specific contract and is not Packaging's to judge.
- `await conformSource(dir, { env })` decides packaging/F14 against a package's source workspace.
- `references(requirements, plans)` decides packaging/N10 for a Requirements text, given each cited owner's plan documents as they stand on that owner's branch.

Every result is Testing's (testing/F13). A package the suite cannot decide is `unknown`, never `verified`, and so is an installed file that differs from the shipped manifest (testing/F43). The overall result is `failed` when any finding failed, else `unknown` when any is unknown, else `verified`.

**What the npm realization reads** (packaging/A10):
- identity, runtime and platforms from `package.json`: `name`, `version`, `dependencies`, `optionalDependencies`, `peerDependencies`, `engines.node`, and any `os` or `cpu`. Packaging F12 requires the runtime and refuses an `os` or `cpu` restriction outside Hosting's OS boundary (`osBoundary` from `kaal-hosting/conformance`, hosting/F36). A portable package declares neither;
- the shipped manifest from `test/verify.json`: `files` (path to SHA-256), `cases`, and `model`, the delivered cases as Testing's model (testing/F64, testing/F66). A package that ships its file list only in `docs/operations.md`, without digests, is reported unknown for packaging/F11;
- packaging/F13 from that `model`, read through Testing's `check` and `tested` (testing/F25), which the caller hands in as `conform`'s `testing` option, against the delivered cases and the identifiers the shipped `docs/` define. A coverage declaration (`identifiers`, `coverage`, `allocated`, `unverified`) is not read. A package that defines no identifier and ships no model has nothing to trace, and needs no Testing. Packaging does not depend on Testing: without `testing`, a shipped model is unknown, never verified;
- the result from the last line `npm test` prints: either `<name>-verification {json}` with `result`, `exit`, `cases` and `causes`, or a bare `verified`, `failed`, `cannot verify` or `unknown`. Until Testing's verifier contract (testing/C29) is approved, only the three results and their exit codes 0, 1 and 2 are checked (packaging/A8). Which declared cases ran is read only from testing/C29's per-case `cases` list, by name (#639). Counts leave packaging/F11 unknown;
- packaging/N9 from a behaviour probe: in `work`, a copy of the package with its shipped modules outside `test/` broken, and its manifest's digests rewritten to match, must no longer verify. `conform` needs `work`, a missing or empty directory the caller owns and removes, for this. Without it, N9 is unknown;
- a source Test Plan as `test:<suite>` scripts. The Embedded verification is declared as `test:embedded` or `test:consumer`. A source `npm test` follows the plan when it runs declared suites with `npm run test:<suite>`, or is itself a declared suite's command. Otherwise which suites it runs cannot be told from outside, and packaging/F14 is unknown.

Imports are read from the shipped modules' text, so a dynamic import built at run time is not seen.

## Ecosystems

The measurement and the record name no ecosystem. Describing an artifact is an ecosystem realization's, and npm (`.tgz`, `.tar.gz` or `.tar`) is the first. An artifact no realization reads is refused, naming its format, such as `zip`. A later ecosystem adds a realization. Whether it ships in this package or as its own is decided when it arrives, and no consumer has to depend on more than one package.

## Boundaries

- **It decides nothing.** No budget, threshold or verdict is held or reported. Each product owns its size constraints, and Engineering owns when measurement runs and whether a result gates anything.
- **It produces no package.** Packing stays Engineering's (`engineering/delivery/pack.mjs`) until a later Change moves it.
- **It imports no host module.** Every host operation goes through `kaal-hosting`, and SHA-256 comes from `@kaihacksai/kaal-foundation`. It depends on nothing else.
- **No product imports it.** Products are measured and checked from outside, so Guard keeps no dependencies.
- **It edits no product.** Where a product does not yet conform, its owner aligns it (`plan/package/architecture.md`, step 5).
