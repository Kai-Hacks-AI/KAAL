# Agents: Testing

This is the Product Verification Test Plan of `kaal-agents`: the one that ships, and that your installation runs. Each case names, in its title, the identifiers it checks, for example `agents/T1 [agents/F1, agents/F2]`. The identifiers are the trace. The identifiers they cite are defined in [Intent](intent.md), [Requirements](requirements.md) and [Architecture](architecture.md).

## Where they run

- **Delivered cases.** They live in `test/consumer/`, and run in your installation through `node node_modules/kaal-agents/test/verify.mjs` ([Operations](operations.md)). Each case creates what it needs in a scratch directory that the verification gives it and removes afterwards, and needs only Node and Git. The verification runs exactly the cases the manifest declares, against the installed copy, and reads nothing outside your project and that scratch directory.
- **Allocated to the publisher.** These need the KAAL checkout, and run in the publisher's repository, not in your installation.
- **Not Agents' to verify.** What every KAAL package promises alike, such as its identity, its documents, its manifest and its verification entry, is checked by KAAL Packaging's generic conformance (packaging/F7–packaging/F14), which the publisher runs from outside against the same installed artifact. It does not ship, and these cases do not restate it: they verify what is specific to Agents.

## Coverage

The manifest declares, for each identifier the documents define, how it is verified: **covered** by the delivered cases that cite it, **allocated** to the publisher below, or **unverified**, named under "Verified by no Test Case" with the reason. A run reports a covered identifier as covered only when every case covering it passed in that run, and names the identifiers it did not verify. An identifier with none of these makes the run cannot verify.

## Delivered cases

| Case | Checks |
| --- | --- |
| **agents/T1**: in a fresh repository with an `AGENTS.md` and an ownership claim, `orient --json` reports the setting `outside`, HEAD, the branch, the instruction file and the claim, and exits 0. Authority is still unresolved, with both listed as sources. The text output opens with the authority line | agents/F1, agents/F2, agents/F3, agents/I1, agents/I2 |
| **agents/T2**: a changed and an untracked file are in flight, sorted | agents/F1 |
| **agents/T3**: with a `.kaal/` Engine and no Core installed, the setting is `embedded`, the catalog is unresolved naming `kaal-core`, and the exit is 2. With KAAL's own source as well, the setting is `engineered` | agents/F1, agents/N1, agents/N3 |
| **agents/T5**: two runs give byte-identical output, and every file under the directory, `.git/` included, is unchanged | agents/N2, agents/N4 |
| **agents/T6**: with neither an instruction file nor a claim, authority is unresolved with no sources. With both, and with in-flight work, it is still unresolved. No value anywhere in the report reads authorized, verified or granted | agents/F2, agents/N3, agents/I2 |
| **agents/T7**: outside any repository, the repository and what is in flight are unresolved, and the exit is 2. A missing directory exits 1, naming it, with no stack trace | agents/F3, agents/N3 |
| **agents/T8**: a valid unresolved report and a valid claimed resolution each exit 0 with their one line. Each line says "structurally valid", and the claimed one says "(authority not verified)". Two candidates sharing a term in different scopes stay distinct | agents/F4, agents/A4, agents/I3 |
| **agents/T9**: each invalid report exits 1, naming its problem. Non-JSON, and a missing file, exit 2 | agents/F4, agents/N3 |
| **agents/T10**: the package carries the Skill, named `kaal-agents`, and it names `orient` and PREACH | agents/F5 |
| **agents/T11**: the package carries the six documents. Every identifier the delivered cases cite is defined there, and none cites a path of the publisher's repository or a Change | agents/F6 |
| **agents/T12**: `files` ships `bin`, `lib`, `skills`, `docs`, `capability`, `test/consumer`, `test/verify.mjs` and `test/verify.json`, and `bin` names `kaal-agents` | agents/F8, agents/A1 |
| **agents/T14**: `bin/`, `lib/` and the consumer's verification import only `node:` built-ins and relative files, and only `lib/catalog.mjs` names Core's package | agents/N1, agents/N6 |
| **agents/T16**: something installed under Core's name that does not export Core's `catalog` leaves the catalog unresolved, naming `catalog`, and the exit is 2 | agents/F1, agents/A3, agents/N3 |
| **agents/T17**: an `AGENTS.md` that cannot be read as a file, and an ownership claim that is not JSON, are each unresolved, naming their paths. Neither is listed as a source, and the exit is 2 | agents/F1, agents/N3 |
| **agents/T18**: an ambiguous choice (no scope while two candidates share the term) and an empty authority are each invalid (exit 1), naming the problem | agents/F4, agents/I3 |
| **agents/T19**: a status Git cannot read is unresolved, not a clean tree. What is in flight is `null`, HEAD is still reported, the exit is 2, and nothing is written | agents/F1, agents/A2, agents/N3, agents/N4 |
| **agents/T20**: a branch with no commit yet reports HEAD as absent, with nothing unresolved. A HEAD Git cannot read is unresolved | agents/F1, agents/A2, agents/N3 |
| **agents/T21**: no upstream is absent, with nothing unresolved. An upstream whose ahead and behind cannot be counted is unresolved, naming it | agents/F1, agents/A2, agents/N3 |

## Allocated to the publisher

| Case | Checks |
| --- | --- |
| **agents/T4**: with Core installed in the directory and Agents admitted, the catalog lists Agents and the exit is 0. Authority stays unresolved | agents/F1, agents/F2, agents/A3 |
| **agents/T13**: in a copy of the package, `verify` is verified (0). A changed shipped file makes it cannot verify (2), naming the file. An empty case inventory makes it cannot verify (2) | agents/F7, agents/N3 |
| The publisher's Node and admission cases: Core alone admits the Capability Node, with NEW and PREACH alongside, and each Node keeps its type and its id | agents/F9, agents/N7 |
| **agents/T15**: the packed tarball installs in a clean directory with no checkout and no network. There, `orient` runs, and `npm explore kaal-agents -- npm test` is verified. It does not pass in this version, and must pass before 0.0.1 is released ([Limitations](limitations.md)) | agents/I4, agents/F7 |

## Verified by no Test Case

- **agents/N5**, the same behaviour on Linux, macOS and Windows under Node 24 or later, is evidenced by the publisher running the cases on each platform.
- **agents/A5–agents/A7** are placements and decisions, checked by review.
- agents/I5, the boundary, has no case of its own. It is verified through the Requirements that serve it, agents/N1, agents/N6, agents/N7 and agents/F9, each covered or allocated above.
- Whether the Skill and these documents say the right thing is decided by review.
