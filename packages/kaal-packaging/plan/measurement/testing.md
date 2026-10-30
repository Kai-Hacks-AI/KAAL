# Package size measurement: Testing

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

## Amended in `packaging/C3`

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

## RED evidence

The cases are in `packages/kaal-packaging/test/plan/measurement.test.mjs` and run with `npm test -w kaal-packaging`.

- **Before any code, all eight are blocked, not RED.** The first assertion fails because `kaal-packaging` does not resolve. That shows only that the package is missing, so it is not counted as evidence.
- **Each case was then run against deliberately wrong implementations, one at a time.** Each ran on top of the implementation that `packaging/C2` turns GREEN. Every case is RED on its behavioural assertion against at least one of them.

| Wrong implementation | RED |
| --- | --- |
| counts each tar header's 512 bytes into the unpacked size | packaging/T1, packaging/T2, packaging/T7 |
| drops the last file | packaging/T1, packaging/T2, packaging/T3, packaging/T7 |
| puts a file in the shortest matching group, not the longest | packaging/T2 |
| leaves removed paths out of the comparison | packaging/T3 |
| writes a record with a SHA-256 that is not the artifact's | packaging/T4 |
| ends every text report with "within budget: pass" | packaging/T5 |
| decompresses with `node:zlib` | packaging/T6 |
| reads every artifact as npm's, so a `zip` is not refused | packaging/T8 |

The first commit of `packaging/C2` holds these implementations together, and all eight cases are RED there. The next commit turns all eight GREEN.
