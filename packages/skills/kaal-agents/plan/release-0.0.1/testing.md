# Agents 0.0.1: Testing

The 18 planned tests live in `packages/skills/kaal-agents/test/plan/release.test.mjs`. Each title names the contracts it checks. DO and CHECK do not change them. Each DO Change in the Change graph turns its tests GREEN and moves them into the package's tests:
- consumer cases go to `test/consumer/`;
- agents/T4 and agents/T15 go to `test/publisher/`, because they need the checkout.

| Test | Checks | Loop |
| --- | --- | --- |
| agents/T1: in a fresh repository with an `AGENTS.md` and an ownership claim, `orient --json` reports the setting `outside`, HEAD, the branch, the instruction file and the claim, and exits 0. Authority is still unresolved, with both listed as sources. The text output opens with the authority line | agents/F1, agents/F2, agents/F3, agents/I1, agents/I2 | Intent |
| agents/T2: a changed and an untracked file are in flight, sorted | agents/F1 | Requirements |
| agents/T3: with a `.kaal/` Engine and no `kaal-core` installed, the setting is `embedded`, the catalog is unresolved naming `kaal-core`, and the exit is 2 | agents/F1, agents/N1, agents/N3 | Requirements |
| agents/T4: with `kaal-core` installed in the directory and Agents admitted, the catalog lists Agents and the exit is 0. Authority stays unresolved (publisher) | agents/F1, agents/F2, agents/A3 | Architecture |
| agents/T5: two runs give byte-identical output, and every file under the directory, `.git/` included, is unchanged | agents/N2, agents/N4 | Architecture |
| agents/T6: with neither an instruction file nor a claim, authority is unresolved with no sources. With both, and with in-flight work, it is still unresolved. No value anywhere in the report reads authorized, verified or granted | agents/F2, agents/N3, agents/I2 | Intent |
| agents/T7: outside any repository, the repository is unresolved and the exit is 2. A missing directory exits 1, naming it, with no stack trace | agents/F3, agents/N3 | Requirements |
| agents/T8: a valid unresolved report and a valid claimed resolution each exit 0 with their one line. Each line says "structurally valid", and the claimed one says "(authority not verified)". Two candidates sharing a term in different scopes stay distinct | agents/F4, agents/A4, agents/I3 | Intent |
| agents/T9: each invalid report exits 1, naming its problem: no candidates; a candidate without a scope; a duplicate; resolved without an authority; a choice outside the candidates; an unknown member. Non-JSON exits 2 | agents/F4, agents/N3 | Requirements |
| agents/T10: the package carries the Skill, named `kaal-agents`, and it names `orient` and PREACH | agents/F5 | Requirements |
| agents/T11: the package carries the six documents. Every identifier the consumer cases cite is defined there, and none cites an Engineering path | agents/F6 | Requirements |
| agents/T12: `files` ships `bin`, `lib`, `skills`, `docs`, `capability`, `test/consumer`, `test/verify.mjs` and `test/verify.json`, and not `test/publisher` or `test/plan` | agents/F8, agents/A1 | Architecture |
| agents/T13: in a copy of the package, `verify` is verified (0). A changed shipped file makes it failed (1), naming the file. An empty case inventory makes it cannot verify (2) | agents/F7, agents/N3 | Requirements |
| agents/T14: `bin/` and `lib/` import only `node:` built-ins and relative files, and only `lib/catalog.mjs` names `kaal-core` | agents/N1, agents/N6 | Architecture |
| agents/T15: the packed tarball installs in a clean directory with no checkout and no network. There, `orient` runs and `npm explore <name> -- npm test` is verified (publisher) | agents/I4, agents/F7 | Intent |
| agents/T16: something installed as `kaal-core` that does not export Core's `catalog` leaves the catalog unresolved, naming `catalog`, and the exit is 2 | agents/F1, agents/A3, agents/N3 | Architecture |
| agents/T17: an `AGENTS.md` that cannot be read as a file, and an ownership claim that is not JSON, are each unresolved, naming their paths. Neither is listed as a source, and the exit is 2 | agents/F1, agents/N3 | Requirements |
| agents/T18: an ambiguous choice (no scope while two candidates share the term) and an empty authority are each invalid (exit 1), naming the problem | agents/F4, agents/I3 | Requirements |

The following are validated by review:
- agents/N5 runs in the repository's Acceptance jobs on Linux, macOS and Windows.
- agents/N7 is covered by `test/agents.test.mjs` staying GREEN.
- agents/A4–agents/A7 are placements and decisions.
- Whether the Skill and the docs say the right thing is decided by Owner review.

## RED evidence

At `agents/C4`, the tests run with `node --test packages/skills/kaal-agents/test/plan/release.test.mjs`, outside the package's `npm test`. Two kinds of RED are kept apart:
- **Blocked before any behavioural assertion:** agents/T1–agents/T10 and agents/T13–agents/T18, because `bin/kaal-agents.mjs`, `lib/`, the Skill or `test/verify.mjs` does not exist. Each fails on its first assertion, which says `blocked:`.
- **Discriminating:** agents/T11 and agents/T12 fail on the behaviour they check. Today's package carries no `docs/`, and its `files` is `["capability"]`.
