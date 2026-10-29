# Agents: Testing

This is the Product Verification Test Plan of `kaal-agents`: the one that ships, and that your installation runs. Each case names, in its title, the identifiers it checks, for example `agents/T1 [agents/F1, agents/F2]`. The identifiers are the trace. The identifiers they cite are defined in [Intent](intent.md), [Requirements](requirements.md) and [Architecture](architecture.md).

## Where they run

- **Delivered cases.** They live in `test/consumer/`, and run in your installation through `npm explore kaal-agents -- npm test` ([Operations](operations.md)). Each case creates what it needs in the operating system's temporary directory, and needs only Node and Git.
- **Allocated to the publisher.** These need the KAAL checkout, and run in the publisher's repository, not in your installation.

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
| **agents/T19**: a status Git cannot read is unresolved, not a clean tree. What is in flight is `null`, HEAD is still reported, the exit is 2, and nothing is written | agents/F1, agents/N3, agents/N4 |
| **agents/T20**: a branch with no commit yet reports HEAD as absent, with nothing unresolved. A HEAD Git cannot read is unresolved | agents/F1, agents/N3 |
| **agents/T21**: no upstream is absent, with nothing unresolved. An upstream whose ahead and behind cannot be counted is unresolved, naming it | agents/F1, agents/N3 |

## Allocated to the publisher

| Case | Checks |
| --- | --- |
| **agents/T4**: with Core installed in the directory and Agents admitted, the catalog lists Agents and the exit is 0. Authority stays unresolved | agents/F1, agents/F2, agents/A3 |
| **agents/T13**: in a copy of the package, `verify` is verified (0). A changed shipped file makes it failed (1), naming the file. An empty case inventory makes it cannot verify (2) | agents/F7, agents/N3 |
| **agents/T15**: the packed tarball installs in a clean directory with no checkout and no network. There, `orient` runs, and `npm explore kaal-agents -- npm test` is verified | agents/I4, agents/F7 |

## Verified by no Test Case

- **agents/N5**, the same behaviour on Linux, macOS and Windows under Node 24 or later, is evidenced by the publisher running the cases on each platform.
- **agents/A5–agents/A7** are placements and decisions, checked by review.
- Whether the Skill and these documents say the right thing is decided by review.
