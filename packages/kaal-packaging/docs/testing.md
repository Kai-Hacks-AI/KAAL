# kaal-packaging: Testing

Assembled from the PLANs under `plan/` by `test/publisher/build.mjs`; edit those, not this file.

## Measurement

The planned cases are written at the start of `packaging/C2`, in `packages/kaal-packaging/test/`, before the code. Each title names what it checks.

Each behavioural case is first observed RED against a deliberately wrong implementation that `packaging/C2` writes for the purpose, such as one that counts the tar headers or drops the last file. Only then does a RED discriminate. A RED that shows only a missing export is recorded as blocked, not as evidence.

| Test | Checks | Loop |
| --- | --- | --- |
| packaging/T1: a fixture tarball built byte by byte in the test gives its known packed size, unpacked size and every path's size | packaging/F1, packaging/N1 | Requirements |
| packaging/T2: every byte of the fixture falls in exactly one group or `unattributed`, and the groups sum to the unpacked size | packaging/F2 | Requirements |
| packaging/T3: two fixtures that differ by one added, one removed and one grown file give exactly those deltas | packaging/F3 | Requirements |
| packaging/T4: a record written and read back is equal, and names the tarball's SHA-256 | packaging/F4 | Requirements |
| packaging/T5: no report, text or JSON, contains a budget, a threshold or the words pass or fail | packaging/F5, packaging/N2 | Requirements |
| packaging/T6: the package imports only `kaal-hosting` and `kaal-foundation`, and no `node:` module | packaging/N3, packaging/A1 | Architecture |
| packaging/T8: the measurement and record forms name no ecosystem; only the npm realization reads `.tgz`, and an artifact of a format no realization reads is refused, naming the format | packaging/F1, packaging/A5 | Architecture |
| packaging/T7: Guard's `0.0.4` tarball, measured by Packaging, gives the packed and unpacked sizes `guard/C117` recorded | packaging/F1, packaging/I1 | Intent |

### Amended in `packaging/C3`

The cases keep their numbers. Where a case's meaning changes, its new title replaces the old one in `packaging/C2`'s rework.

| Test | Checks | Loop |
| --- | --- | --- |
| packaging/T1 (amended): a fixture tarball built byte by byte in the test, described through npm, gives its known packed size, unpacked size and every path's size | packaging/F1, packaging/N1 | Requirements |
| packaging/T4 (amended): a record written and read back is equal, and names the tarball's SHA-256 and the tool and version that described it | packaging/F4 | Requirements |
| packaging/T6 (amended): the package imports only `kaal-hosting` and `kaal-foundation`, no `node:` module, and parses no archive or compression format | packaging/N3, packaging/A1, packaging/A6 | Architecture |
| packaging/T9: with the ecosystem tool missing, failing, or reporting something that is not a description, `measure` refuses and names the tool | packaging/F6 | Requirements |
| packaging/T10 (amended after #616): a report whose sizes do not add up, whose entry count is not its number of files, whose packed size is not the artifact's length, whose path is absolute, has an empty, `.` or `..` segment or a backslash, or appears twice, or that exceeds a limit, is refused, naming the cause. So is an artifact whose SHA-256 changes while the tool runs | packaging/N4 | Requirements |
| packaging/T11: real npm, given fixture tarballs with `package/../evil.txt`, `/etc/evil.txt`, `package/./a.txt`, `package//b.txt`, `package/a\b.txt` and a path listed twice, reports each as `npm.md` records, and `measure` refuses each | packaging/N4, packaging/A6 | Architecture |
| packaging/T12: an artifact location that is relative, has no tarball extension, or begins with `-` is refused before any tool runs. An absolute `.tgz` whose name holds a space, `&`, `;`, `$(x)` and a leading `-` is measured as its contents | packaging/A6 | Architecture |
| packaging/T13: the tool version is recorded exactly as `npm --version` printed it. A version that is not a semantic version, or is below 11.18.0, is refused, naming both versions | packaging/N6, packaging/F4 | Requirements |
| packaging/T14: after `measure`, nothing has been written outside the working directory it was given: no cache, log or update-notifier stamp. A working directory whose `.npmrc` sets `dry-run=false` and `ignore-scripts=false`, and whose `package.json` has a `prepack` script, changes nothing | packaging/A6 | Architecture |

packaging/T9, packaging/T10 and packaging/T13 run against a stand-in tool, a script on a `PATH` the test controls, that writes each wrong report or version. So they do not depend on how npm behaves. packaging/T1, packaging/T7, packaging/T11, packaging/T12 and packaging/T14 run the npm the lane has installed, which must be at least 11.18.0. A lane with an older npm refuses them, naming its version, and that counts as RED, not as a pass. Each case is first RED against a deliberately wrong implementation, as the cases above were.

**The public interface moves with the cases.** `measure(artifact, { work, limits })` is asynchronous, and `LIMITS` becomes `files`, `path`, `unpacked` and `output`. `packaging/C2`'s README, its `.d.ts` and every case use that form. Nothing keeps the old synchronous `measure(bytes)`.

### RED evidence

The cases are in `packages/kaal-packaging/test/plan/measurement.test.mjs` and run with `npm test -w kaal-packaging`.

- **Before any code, all eight original cases were blocked, not RED.** The first assertion failed because `kaal-packaging` did not resolve. That shows only that the package was missing, so it is not counted as evidence.
- **After `packaging/C3`, each of the fourteen cases was run against deliberately wrong implementations, one at a time.** Each was a single edit to the implementation that turns them GREEN, run with npm 11.19.1 on Node 24.22.1. Every case is RED on its behavioural assertion against at least one of them.

| Wrong implementation | RED |
| --- | --- |
| counts a 512-byte header per file into the unpacked size | packaging/T1, packaging/T2, packaging/T6, packaging/T7, packaging/T10 |
| drops the last file | packaging/T1, packaging/T2, packaging/T7, packaging/T14 |
| puts a file in the shortest matching group, not the longest | packaging/T2 |
| leaves removed paths out of the comparison | packaging/T3 |
| writes a record with a SHA-256 that is not the artifact's | packaging/T4 |
| writes a record without the tool | packaging/T4, packaging/T8 |
| ends every text report with "within budget: pass" | packaging/T5 |
| imports `node:zlib` | packaging/T6, packaging/T8 |
| reads every artifact as npm's, so a `zip` is not refused | packaging/T8, packaging/T12 |
| lets npm's start failure escape unnamed | packaging/T9 |
| ignores npm's exit status | packaging/T9 |
| accepts an unsafe path | packaging/T10, packaging/T11 |
| accepts a path listed twice | packaging/T10, packaging/T11 |
| does not check the files' sum, the entry count, the packed size or the output limit (four implementations) | packaging/T10 |
| does not check whether the artifact changed while npm ran | packaging/T10 |
| accepts a relative location | packaging/T12 |
| accepts npm below 11.18.0 | packaging/T13 |
| records the version without its pre-release | packaging/T13 |
| lets npm read the user's configuration and cache | packaging/T14 |

One edit was not RED: dropping the `--` before the artifact. `measure` takes only an absolute location, and no absolute location begins with `-`, so no case through the public interface can tell the two apart. The `--` is kept as defence in depth, as `npm.md` recommends.

While writing `packaging/T11`, npm 11.19.1 reported a directory entry `package/` as an empty path. `npm.md` records it, `packaging/T11` checks it, and `measure` refuses it as an unsafe path. npm packs no directory entries, so a tarball npm packed is not affected.

## Package

The DO writes these cases in `packages/kaal-packaging/test/plan/package.test.mjs`. Each one runs the conformance suite (packaging/A7) against fixture packages that the test packs and installs into a scratch host. Each is first observed RED against a deliberately wrong suite. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Fixture the suite must fail, naming the cause |
| --- | --- | --- |
| packaging/T15 | F7: name, exact version and exact registry dependencies | A `file:` dependency. A range such as `^1.0.0` |
| packaging/T16 | F8: the shipped documents are present and non-empty at their paths, and the README links `docs/operations.md` | A package missing `docs/limitations.md`. One whose `docs/requirements.md` is empty. One that ships Operations only in its README, or whose README does not link `docs/operations.md` |
| packaging/T17 | F9, N9: the installed `npm test` executes the Embedded verification against the installed copy, without the checkout, and runs no Engineering test | A test that imports from this repository by relative path. A `test` script that runs the publisher suite |
| packaging/T18 | F10: the entrypoint's line conforms to Testing's verifier contract | A line that says `verified` with a case failed. A line with no cause |
| packaging/T19 | F11: an installed file that differs from the manifest, and a declared case that is not run, are each reported, never verified | A changed shipped file. A manifest that declares three cases, of which two run |
| packaging/T20 | F12: the runtime is declared, and no `os` or `cpu` restriction appears outside Hosting's OS boundary | A package with no `engines`. A non-Hosting package restricting `os`, `cpu`, or an empty `os`, and one claiming `osBoundary` itself. The same restriction where Hosting declares no boundary is unknown. A portable package without `os` verifies, and Hosting's own package may restrict |
| packaging/T21 | F13: the traces a package ships are Testing's model, Case —tests→ Target, and they resolve | A Case testing an identifier the documents do not define. A model Case that is not delivered, and a delivered case that is not in the model. A model Testing's check rejects. A manifest with no delivered cases. Documents that define identifiers with only a coverage registry and no model, and a model without Testing's model functions, are each unknown. A package that defines no identifier and ships no model (Foundation's form) verifies. So does a sound model in which one identifier has no Case, since no coverage rule is Packaging's |
| packaging/T22 | N7: the consumer's project is byte-identical after verification | A verifier that writes a cache file beside the consumer's `package.json` |
| packaging/T23 | N8: the installed verification runs with only the package's declared runtime dependencies | A verifier that imports `kaal-testing` without declaring it |
| packaging/T24 | N9: a case that passes on presence alone is detected | A suite case that checks only that `docs/requirements.md` exists, run against a fixture whose requirements contradict its behaviour |
| packaging/T25 | N10: every generic Requirement that depends on another owner's meaning cites that owner's ID, and each cited ID exists on its branch | A Requirement that defines `unknown` itself. A citation of `testing/F99` |
| packaging/T26 | F14: the source workspace declares its Test Plan, the Embedded verification is among its suites, and its `npm test` follows the declaration | A workspace whose `npm test` runs no declared suite. A plan that omits the Embedded verification |

**Trace.** Every generic Requirement has a discriminating case:

| Requirement | Case |
| --- | --- |
| packaging/F7 | T15 |
| packaging/F8 | T16 |
| packaging/F9 | T17 |
| packaging/F14 | T26 |
| packaging/F10 | T18 |
| packaging/F11 | T19 |
| packaging/F12 | T20 |
| packaging/F13 | T21 |
| packaging/N7 | T22 |
| packaging/N8 | T23 |
| packaging/N9 | T17, T24 |
| packaging/N10 | T25 |

A tampered installed file in T19 is reported unknown, not failed, per testing/F43. T16 checks `docs/operations.md` and the README's link to it (D2). T17 and T26 follow the context model (D1, packaging/A11): the installed context in T17, the source workspace in T26. Packaging tests neither the root nor an external repository.

Every result is verified, failed or unknown, in Testing's terms. A package that the suite cannot decide is unknown, never verified.

### RED evidence (packaging/C5)

Before `kaal-packaging/conformance` existed, every case failed as blocked (`ERR_PACKAGE_PATH_NOT_EXPORTED`), which is not evidence. The discriminating RED came from deliberately wrong suites, each one change to `lib/conformance.mjs`, run against all thirteen cases on Node 24.22.1 with npm 11.19.1. Every one was caught:

| Wrong suite | Caught by |
| --- | --- |
| F7 accepts any version or range | T15 |
| F8 accepts an empty document | T16 |
| F8 ignores the README link | T16 |
| F9 ignores a verifier that reaches into the checkout | T17 |
| F9 verifies a run that reported no result | T17 |
| F10 ignores a result that contradicts the exit | T18 |
| F10 ignores failed cases under `verified` | T18 |
| F10 accepts a result without a cause | T18 |
| F11 ignores a changed file | T19 |
| F11 ignores a declared case that did not run | T19 |
| F11 ignores a case run twice | T19 |
| F11 ignores an undeclared stand-in | T19 |
| F11 accepts counts in place of identities | T18, T19, T24 |
| F11 counts a case reported `not run` as run | T19 |
| F11 reports a changed file as failed, not unknown | T19 |
| F12 accepts undeclared platforms (the original rule, withdrawn by packaging/C6) | T20 |
| F12 requires `os`, penalizing a portable package | T20 |
| F12 verifies an `os` restriction outside Hosting's boundary | T20 |
| F12 verifies a `cpu` restriction outside Hosting's boundary | T20 |
| F12 verifies a restriction when Hosting declares no boundary | T20 |
| F12 trusts a package's own `osBoundary` field | T20 |
| F12 ignores an empty `os` or `cpu` declaration | T20 |
| F13 reads the coverage registry (the original rule, withdrawn by packaging/C7) | T21 |
| F13 reports a package with no identifier and no model unknown | T21 |
| F13 verifies defined identifiers with no model | T21 |
| F13 ignores a target its documents do not define | T21 |
| F13 ignores a model Case that is not delivered | T21 |
| F13 ignores a delivered case missing from the model | T21 |
| F13 ignores Testing's check | T21 |
| F13 verifies a model without Testing's model functions | T21 |
| F13 applies a coverage rule, holding an untested identifier unknown | T21 |
| F13 verifies a manifest with no delivered cases | T21 |
| F13 loads Testing itself by default, a dependency Packaging does not take | T6 |
| N7 ignores a changed consumer | T22 |
| N8 trusts any import | T23 |
| N9 accepts `verified` with no case run | T24 |
| N9 certifies a positive count without the probe | T17, T24 |
| N9's probe leaves the manifest's digests as shipped | T24 |
| N9's probe breaks no module | T17, T24, A7 |
| N9's probe counts a `verified` probe as behaviour | T24 |
| N9 verifies without a working directory | T24 |
| N10 accepts a citation its owner does not define | T25 |
| N10 accepts a restated Testing term | T25 |
| N10 verifies an unresolved citation | T25 |
| F14 accepts a plan without the Embedded verification | T26 |
| F14 accepts an `npm test` that states no suite | T26 |
| F14 accepts an undeclared suite | T26 |

The first run left two survivors in F9: T17's checkout fixture failed at run time, so the static check was never the deciding one. T17 now installs that fixture inside a checkout, where the import resolves and the run succeeds, and only the suite's own check fails it.

**Revised to the Owner's review on #660 (5718600645).**
- **F11 by identity.** Counts, even equal ones, do not show which declared cases ran. The suite reads testing/C29's per-case list (`cases`, one `{ name, outcome }` per reported execution, #639) and reconciles it with the manifest by name. A declared case missing, reported twice, or reported `skipped`, `todo` or `not run`, and a reported case the manifest does not declare, are each unknown. A run that reports counts only is unknown, never verified. T19's fixtures run three cases, as many as are declared, with one twice or a stand-in in place of one.
- **N9 by behaviour.** A count never certifies behaviour. In a scratch working directory, never in the consumer, the suite installs a copy of the package with every shipped module outside `test/` broken, and the manifest's digests rewritten to match. Then it runs the copy's `npm test`. A verification that still reports `verified` decides from presence and is failed. One that no longer does depends on the modules' behaviour, and the finding says that this is all it shows. Whether its assertions are adequate stays with its owner. T24's fixture ships every document, while its module contradicts `docs/requirements.md`, and its verifier checks only that the document exists. A second fixture checks only the manifest's digests. Both are failed.

**Lesson, packaging/C6 (testing/F74).**
- **The case:** packaging/T20.
- **Its kind:** a false RED.
- **The target:** packaging/F12, read against Hosting's portability contract (hosting/F36, hosting/F39).
- **What it froze:** a manifest `os` list as the evidence of declared platforms. That penalized a portable package for correctly omitting `os`, and rewarded a restriction that only Hosting's OS boundary may make.
- **The correction:** F12 now requires the runtime alone, and decides any `os` or `cpu` restriction through Hosting's `osBoundary`. T20 is a new version that pairs a portable positive with a negative for each unauthorized restriction (the Owner's review on #686).

**Lesson, packaging/C7 (testing/F74).**
- **The case:** packaging/T21.
- **Its kind:** a false RED (an unknown), and a route to a false GREEN.
- **The target:** packaging/F13, read against Testing's model (testing/F25, testing/F40, testing/F66) and the Owner's coverage ruling on Testing #667.
- **What it froze:** a second coverage registry, `identifiers`, `coverage`, `allocated` and `unverified` in `test/verify.json`, as the evidence of traceability. That held a valid package such as Foundation unknown for correctly omitting the registry, and let a declaration stand in for traces that might not exist.
- **The correction:** F13 now reads the shipped `model` through Testing's own `check` and `tested`, and holds it against the delivered cases and the shipped documents. Evidence stays Testing's derivation. T21 is a new version that pairs Foundation's form and a sound model as positives with a negative for each absent or inconsistent trace (the Owner's review on #686). Packaging takes no dependency on Testing (the Owner's review on #703): the caller hands in Testing's model functions, and without them a shipped model is unknown, never verified. T21 shows the suite loading and deciding with every `kaal-testing` resolution refused. Until `kaal-testing/model` reaches main, T21's own cases use a stand-in that holds to its interface.

## Capability

The DO writes these cases first and observes each one RED by a behavioural assertion. A RED that shows only a missing module or file is blocked, not evidence.

| Test | Checks | Fixture the case must fail, naming the cause |
| --- | --- | --- |
| packaging/T27 | F15: `kaal-packaging`, packed and installed into a fresh consumer with Hosting and Foundation, passes its own `conform`. Every finding is `verified`, apart from F13 when no Testing model functions are given, which is `unknown` | Today's package, which reports `failed` for F8, F9 and F10 |
| packaging/T28 | F15: the source `npm test` follows the declared plan, and the installed one runs `test:embedded` only | A `test` script that runs `test/publisher/` once installed |
| packaging/T29 | F16, N12: `kaal-packaging measure` and `conform` print what the functions return, end on one result line, and exit 0, 1 or 2 by the result | A command that reports `verified` on a failed finding. A command that exits 0 on `unknown` |
| packaging/T30 | F17: the shipped skill is in the shared skill format, names both commands, and cites only Packaging IDs that exist and other owners' IDs as references | A skill that restates Testing's result terms |
| packaging/T31 | F18: the agent instructions name Packaging, the skill and the commands | Instructions that do not mention Packaging |
| packaging/T32 | F19: F7 verifies a dependency that resolved from a registry with integrity. It fails a `file:` or `link:` resolution, and is `unknown` for a dependency the install records nothing for | A fixture that pins `kaal-dep@1.2.3`, placed by path, which F7 verifies today |
| packaging/T33 | N11: no file under `packages/kaal-packaging/` names `process.platform`, `win32`, a `.cmd` launcher or a platform-dependent `shell` | Today's `test/plan/measurement.test.mjs` and `package.test.mjs` |
| packaging/T34 | A13: `measure` and `conform` run a given npm script through Hosting, and the stand-in reaches them only that way | A stand-in found on `PATH` |

**Trace.**

| Requirement | Case |
| --- | --- |
| packaging/F15 | T27, T28 |
| packaging/F16 | T29 |
| packaging/F17 | T30 |
| packaging/F18 | T31 |
| packaging/F19 | T32 |
| packaging/N11 | T33, T34 |
| packaging/N12 | T29 |

T15's existing F7 cases move to the registry form, with no false RED: a dependency installed from a registry tarball with integrity still verifies.
