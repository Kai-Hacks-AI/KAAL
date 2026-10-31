# KAAL Packaging: Testing

<!-- Shipped with kaal-packaging. The plan/ documents in the source repository record each Change that set these. -->

Packaging's Test Plan is declared in its `package.json` as named suites (packaging/F14, packaging/F15):

| Suite | Runs | Ships |
| --- | --- | --- |
| `test:embedded` | `test/verify.mjs`: the Embedded cases in `test/embed/`, against the copy they ship in | yes |
| `test:publisher` | `test/publisher/`: the cases that need the source workspace, such as packing Packaging itself | no |
| `test:all` | `test/run.mjs`: in the source workspace, both suites; installed, `test:embedded` only | yes |

`npm test` runs `test:all`. Installed, it is therefore the Embedded verification alone (packaging/F9, packaging/A11), and its last line is Testing's result in the shared verifier form: `kaal-packaging-verification {"result", "exit", "cases", "causes"}`, with each execution named by its case (packaging/F10, testing/C29). Every process a case starts goes through Hosting's `execute`, and no case decides anything by operating system (packaging/N11).

## Embedded cases

Each case's title begins with its identifier and names, in brackets, the identifiers it tests. `test/verify.json` declares exactly these cases, and its `model` is Testing's model of them, Case —tests→ Target, from those brackets (packaging/F11, packaging/F13, testing/F25).

| Case | Tests | Checks | File |
| --- | --- | --- | --- |
| packaging/T1 | packaging/F1, packaging/N1 | a fixture tarball built byte by byte in the test, described through npm, gives its known packed size, unpacked size and every path's size | `test/embed/measurement.test.mjs` |
| packaging/T2 | packaging/F2 | every byte of the fixture falls in exactly one group or unattributed, and the groups sum to the unpacked size | `test/embed/measurement.test.mjs` |
| packaging/T3 | packaging/F3 | two fixtures that differ by one added, one removed and one grown file give exactly those deltas | `test/embed/measurement.test.mjs` |
| packaging/T4 | packaging/F4 | a record written and read back is equal, and names the tarball's SHA-256 and the tool and version that described it | `test/embed/measurement.test.mjs` |
| packaging/T5 | packaging/F5, packaging/N2 | no report, text or JSON, contains a budget, a threshold or the words pass or fail | `test/embed/measurement.test.mjs` |
| packaging/T6 | packaging/N3, packaging/A1, packaging/A6 | the package imports only kaal-hosting (and its conformance, for hosting/F36's OS boundary) and kaal-foundation, never Testing (packaging/F13 takes Testing's model functions from its caller), no node: module, reads nothing of the process but the running Node's location (packaging/A13), and parses no archive or compression format | `test/embed/measurement.test.mjs` |
| packaging/T7 | packaging/F1, packaging/I1 | Guard's 0.0.4 tarball, measured by Packaging, gives the packed and unpacked sizes guard/C117 recorded | `test/embed/measurement.test.mjs` |
| packaging/T8 | packaging/F1, packaging/A5 | the measurement and record forms name no ecosystem; only the npm realization reads .tgz, and an artifact of a format no realization reads is refused, naming the format | `test/embed/measurement.test.mjs` |
| packaging/T9 | packaging/F6 | with the ecosystem tool missing, failing, or reporting something that is not a description, measure refuses and names the tool | `test/embed/measurement.test.mjs` |
| packaging/T10 | packaging/N4 | a report that does not add up, holds an unsafe or repeated path, or exceeds a limit is refused, naming the cause; so is an artifact whose SHA-256 changes while the tool runs | `test/embed/measurement.test.mjs` |
| packaging/T11 | packaging/N4, packaging/A6 | real npm, given fixture tarballs with unsafe or repeated paths or a directory entry, reports each as npm.md records, and measure refuses each | `test/embed/measurement.test.mjs` |
| packaging/T12 | packaging/A6 | an artifact location that is relative, has no tarball extension, or begins with - is refused before any tool runs; an absolute .tgz whose name holds shell metacharacters and a leading - is measured as its contents | `test/embed/measurement.test.mjs` |
| packaging/T13 | packaging/N6, packaging/F4 | the tool version is recorded exactly as npm --version printed it; one that is not a semantic version, or is below 11.18.0, is refused, naming both versions | `test/embed/measurement.test.mjs` |
| packaging/T14 | packaging/A6 | after measure, nothing has been written outside the working directory, and a working directory whose configuration and scripts invite a real pack changes nothing | `test/embed/measurement.test.mjs` |
| packaging/T15 | packaging/F7 | name, exact version and exact registry dependencies | `test/embed/package.test.mjs` |
| packaging/T16 | packaging/F8 | the shipped documents are present and non-empty, and the README links docs/operations.md | `test/embed/package.test.mjs` |
| packaging/T17 | packaging/F9, packaging/N9 | the installed npm test executes the Embedded verification against the installed copy | `test/embed/package.test.mjs` |
| packaging/T18 | packaging/F10 | the entrypoint's line carries a result consistent with its exit and cases | `test/embed/package.test.mjs` |
| packaging/T19 | packaging/F11 | a changed installed file, and a declared case missing, run twice or replaced, are reported, never verified | `test/embed/package.test.mjs` |
| packaging/T20 | packaging/F12 | the runtime and platforms are declared | `test/embed/package.test.mjs` |
| packaging/T21 | packaging/F13 | the traces a package ships are Testing's model, Case tests Target, and they resolve | `test/embed/package.test.mjs` |
| packaging/T22 | packaging/N7 | the consumer's project is byte-identical after verification | `test/embed/package.test.mjs` |
| packaging/T23 | packaging/N8 | the installed verification needs only its declared runtime dependencies | `test/embed/package.test.mjs` |
| packaging/T24 | packaging/N9 | a verification that passes on presence, whatever the package does, is detected; a count never certifies behaviour | `test/embed/package.test.mjs` |
| packaging/T25 | packaging/N10 | every cited ID exists in its owner's plan, and no Testing term is restated | `test/embed/package.test.mjs` |
| packaging/T26 | packaging/F14 | the source workspace declares its Test Plan, with the Embedded verification, and npm test follows it | `test/embed/package.test.mjs` |
| packaging/T29 | packaging/F16, packaging/N12 | kaal-packaging measure and conform print what the functions return, end on one result line, and exit 0, 1 or 2 by the result | `test/embed/package.test.mjs` |
| packaging/T30 | packaging/F17 | the shipped skill is in the shared skill format, names both commands, and cites only Packaging IDs that exist and other owners' IDs as references, restating no Testing term | `test/embed/package.test.mjs` |
| packaging/T32 | packaging/F19, packaging/F7, packaging/A14 | F7 verifies a dependency the install shows resolved from a registry with integrity, fails a file:, link or other resolution, and is unknown where the install records nothing | `test/embed/package.test.mjs` |
| packaging/T34 | packaging/N11, packaging/A13 | measure and conform run a given npm script through Hosting, and a stand-in reaches them only that way | `test/embed/measurement.test.mjs` |
| packaging/T35 | packaging/A7 | a conforming package is verified as a whole, and the package's own result is reported beside it | `test/embed/package.test.mjs` |

packaging/T9, T10, T13 and T34 run against a stand-in npm, a Node script given to `measure` and `conform` as their `npm` (packaging/A13). The others run the npm the host has installed, which must be at least 11.18.0 (packaging/N6). The cases of the KAAL Package contract pack fixture packages and install them offline into fresh consumers in a scratch directory, and run the conformance suite against them. They use a stand-in for Testing's model functions, since Packaging takes no dependency on Testing (packaging/N8).

## Publisher cases

These run in the source workspace only, in `test/publisher/capability.test.mjs`, and do not ship.

| Case | Tests | Checks |
| --- | --- | --- |
| packaging/T27 | packaging/F15, packaging/I7 | `kaal-packaging`, packed and installed into a fresh consumer with Hosting and Foundation, is decided by its own `conform`. Every finding is `verified`, except packaging/F7 while Hosting and Foundation are installed from local tarballs rather than a registry (packaging/F19). `test/verify.json` is the one `test/publisher/manifest.mjs` writes |
| packaging/T28 | packaging/F15, packaging/F14 | the source `npm test` follows the declared plan, verified by `conformSource`, and the installed `npm test` runs `test:embedded` only |
| packaging/T31 | packaging/F18 | the repository's agent instructions name Packaging, its skill and both commands |
| packaging/T33 | packaging/N11 | no file of the package names the running platform, a launcher for one, or a shell chosen by platform |

## Running

- Installed: `npm test` in the package's directory, such as `npm explore kaal-packaging -- npm test`.
- In the source workspace: `npm test -w kaal-packaging`, or one suite with `npm run test:embedded -w kaal-packaging`.
- After a change to any shipped file, regenerate the manifest with `node test/publisher/manifest.mjs`. packaging/T27 fails while it is stale.
