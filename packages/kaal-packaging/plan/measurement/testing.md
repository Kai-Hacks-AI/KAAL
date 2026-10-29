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
| packaging/T10: a report whose sizes do not add up, whose path is absolute, has a `..` segment or appears twice, or that exceeds a limit, is refused, naming the cause | packaging/N4 | Requirements |

packaging/T9 and packaging/T10 run against a stand-in tool, a script on a `PATH` the test controls, that writes each wrong report. So they do not depend on how npm behaves. Each is first RED against a deliberately wrong implementation, as the cases above were.
