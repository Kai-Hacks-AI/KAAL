# Platform Coupling Conformance: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/boundary.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run build -w kaal-hosting && node --test packages/extensions/kaal-hosting/test/plan/boundary.test.mjs`. `hosting/C14` turns them GREEN and moves them into Hosting's `npm test`, so they run in the Linux, Windows and macOS Hosting lanes. Their fixtures are the suite's positive and negative cases (hosting/N5).

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T32: production code asking which platform it is, through `process`, `node:os`, `os`, `node:path`, a named import, a destructuring or an alias, is a `platform-query` `coupling` at its exact place; `os.tmpdir()`, `process.cwd()`, `join` and `process.env.CI` are not | hosting/F28, hosting/F29 | Requirements |
| hosting/T33: a string literal naming a platform is a `platform-literal`; a mention in a comment, an identifier, a longer word or a phrase is not | hosting/F28 | Requirements |
| hosting/T34: in test code, a platform decision on whether a test is registered or run, by a `skip` option (as guard/T114), `t.skip()` in a branch, a branch around `it`, a ternary between `it.skip` and `it`, or an early `return`, is a `registration`; a skip that does not depend on the platform is no finding | hosting/F29, hosting/N5 | Intent |
| hosting/T35: in test code, a platform decision on what is asserted, by an assertion inside a branch or a platform-dependent expected value, is a `dilution`; the same fixture built per platform with the assertion outside the branch is `setup`, and nothing else | hosting/F29 | Intent |
| hosting/T36: `shell: true`, a `cmd.exe` or `mkfifo` command, `net` listening on a path, a literal mode to `chmodSync`, a `"junction"` link, `process.getuid`, `PATHEXT` and `os.homedir` are `host-api` findings; the portable form of each is not | hosting/F28 | Requirements |
| hosting/T37: an acknowledgement with a reason, at the end of the line or just above it, sets `acknowledged` and keeps the finding with its `kind`; one without a reason, or further away, does not | hosting/F30 | Requirements |
| hosting/T38: TypeScript and CommonJS are read, declarations and non-sources are skipped with a reason, the sources read are listed, scope follows the path rule or the caller's, the same input gives the same report, and coverage and exclusions are stated | hosting/F27, hosting/F32 | Requirements |
| hosting/T39: the shipped suite on a negative capability fixture (an undeclared `node:fs/promises` import; an acknowledged `process.platform` in production; T114-style tests skipped on Windows, one of them acknowledged; an assertion skipped on Windows; a fixture and a script) is `failed`, with each deterministic case's outcome, every finding at its exact file, line and column, a review request with a question for every test-code finding, acknowledged ones included, the `summary`, and the `sources` read in production and test scope. A fixture needing only judgment is `verified` with a review requested, reported as `todo`, never a pass. A clean fixture is `verified` with no review. A root that is not a directory is `unknown`, with the failure stated. The command gives the same findings and exits 1, 3, 0 and 2 for these | hosting/F31, hosting/F33, hosting/F30, hosting/F32, hosting/N5 | Intent |
| hosting/T40: the package exports `./boundary`, declares the `kaal-hosting-boundary` command and ships `bin` and `skills`; neither the production entry nor `kaal-hosting/conformance` loads `node:test`; the Skill names itself, starts Bare, and covers the line, each kind, acknowledgement and PREACH escalation | hosting/F34, hosting/F31 | Requirements |

hosting/A12–hosting/A14 are placements, validated by review. Whether the Skill's guidance is right is a Review judgment; hosting/T40 checks only that it ships and covers its subjects. The Limits are stated, not tested.

## RED evidence

At `hosting/C13`, hosting/T32–T38 are blocked before behavioural assertion: `kaal-hosting/conformance` exports no `couplings`. hosting/T39 is RED by behavioural assertion: the driver cannot load `kaal-hosting/boundary`, so no `kaal-hosting-boundary` line is written. hosting/T40 is RED by assertion: the manifest exports no `./boundary`. They are not in Hosting's `npm test`, so KAAL's lanes stay green.

## Checked against a throwaway reference

The reference was not committed. It was a `couplings` of about 150 lines that blanks comments, tracks module names, named imports, destructurings and aliases, and classifies by the enclosing `if`, ternary, skip option or assertion call, plus a 60-line `boundary` and `boundarySuite`, a 10-line command and a placeholder Skill. With it, all of hosting/T32–T39 are GREEN on Node 24. Each weaker variant was caught:

| Weaker reference | Caught by |
| --- | --- |
| does not follow aliases such as `WINDOWS` | hosting/T32, T34, T35 |
| reads comments as code | hosting/T33 |
| never classifies `registration` | hosting/T34, T37, T39 |
| never classifies `dilution` | hosting/T35, T39 |
| finds no host-specific API | hosting/T36 |
| accepts an acknowledgement with no reason | hosting/T37 |
| changes an acknowledged finding's `kind` to `setup` | hosting/T37, T39 |
| reports 0-based columns | hosting/T32, T39 |
| lists only production sources | hosting/T38, T39 |
| does not read TypeScript | hosting/T38 |
| excuses an acknowledged production coupling | hosting/T39 |
| approves an acknowledged test finding by dropping its review request | hosting/T39 |
| treats test-code findings as deterministic failures | hosting/T39 |
| does not test production coupling | hosting/T39 |
| reports a pending review as a passed case | hosting/T39 |
| asks the reviewer nothing | hosting/T39 |
| gives a review request an outcome | hosting/T39 |
| gives a review request an id that changes between runs | hosting/T39 |
| names a rule without Hosting as its owner | hosting/T39 |
| leaves acknowledged findings out of the `summary` | hosting/T39 |
| leaves `inspect` out of the suite | hosting/T39 |
| reports an incomplete inspection as `failed` | hosting/T39 |
| writes no line when the inspection cannot complete | hosting/T39 |
| as a command, exits 0 with a review requested | hosting/T39 |
| as a command, exits 1 on `unknown` | hosting/T39 |
| as a command, ignores the declared builtins | hosting/T39 |
| does not ship `skills` | hosting/T40 |
| gives instructions without PREACH escalation | hosting/T40 |
| loads `node:test` from the production entry | hosting/T40 |

It also showed that the suite's line must reach Engineering unescaped. Under `node --test` with the TAP reporter, the line arrives as a comment with its quotes escaped, so hosting/T39 runs the suite's file directly.
