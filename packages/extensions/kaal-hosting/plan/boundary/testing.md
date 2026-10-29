# Platform Coupling Conformance: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/boundary.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run build -w kaal-hosting && node --test packages/extensions/kaal-hosting/test/plan/boundary.test.mjs`. `hosting/C14` turns them GREEN and moves them into Hosting's `npm test`, so they run in the Linux, Windows and macOS Hosting lanes. Their fixtures are the suite's positive and negative cases (hosting/N5).

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T32: production code asking which platform it is, through `process`, `node:os`, `os`, `node:path`, a named import, a destructuring or an alias, is a `platform-query` `coupling` at its exact place; `os.tmpdir()`, `process.cwd()`, `join` and `process.env.CI` are not | hosting/F28, hosting/F29 | Requirements |
| hosting/T33: a string literal naming a platform is a `platform-literal`; a mention in a comment, an identifier, a longer word or a phrase is not | hosting/F28 | Requirements |
| hosting/T34: in test code, a platform decision on whether a test is registered or run, by a `skip` option (as guard/T114), `t.skip()` in a branch, a branch around `it`, a ternary between `it.skip` and `it`, or an early `return`, is a `registration`; a skip that does not depend on the platform is no finding | hosting/F29, hosting/N5 | Intent |
| hosting/T35: in test code, a platform decision on what is asserted, by an assertion inside a branch or a platform-dependent expected value, is a `dilution`; the same fixture built per platform with the assertion outside the branch is `setup`, and nothing else | hosting/F29 | Intent |
| hosting/T36: `shell: true`, a `cmd.exe` or `mkfifo` command, `net` listening on a path, a literal mode to `chmodSync`, a `"junction"` link, `process.getuid`, `PATHEXT` and `os.homedir` are `host-api` findings; the portable form of each is not | hosting/F28 | Requirements |
| hosting/T37: an acknowledgement with a reason, at the end of the line or just above it, sets `acknowledged` and keeps the finding; one without a reason, or further away, does not | hosting/F30 | Requirements |
| hosting/T38: TypeScript and CommonJS are read, declarations and non-sources are skipped with a reason, scope follows the path rule or the caller's, the same input gives the same report, and coverage and exclusions are stated | hosting/F27, hosting/F32 | Requirements |
| hosting/T39: `boundarySuite` on a capability with a direct `node:fs/promises` import and a T114-like skip passes, emits the registration finding and the `inspect` violation on one `kaal-hosting-boundary` line named for the capability, and fails on a root that is not a directory | hosting/F31, hosting/F30 | Intent |

hosting/A12 and hosting/A13 are placements, validated by review. The Limits are stated, not tested.

## RED evidence

At `hosting/C13`, hosting/T32–T38 are blocked before behavioural assertion: `kaal-hosting/conformance` exports no `couplings`. hosting/T39 is RED by behavioural assertion: the driver cannot load `conformance/boundary.mjs`, so the run fails where a finding must not fail it. They are not in Hosting's `npm test`, so KAAL's lanes stay green.

## Checked against a throwaway reference

The reference was not committed. It was a `couplings` of about 150 lines that blanks comments, tracks module names, named imports, destructurings and aliases, and classifies by the enclosing `if`, ternary, skip option or assertion call, plus a 20-line `boundarySuite`. With it, all of hosting/T32–T39 are GREEN on Node 24. Each weaker variant was caught:

| Weaker reference | Caught by |
| --- | --- |
| does not follow aliases such as `WINDOWS` | hosting/T32, T34, T35 |
| reads comments as code | hosting/T33 |
| never classifies `registration` | hosting/T34, T37, T39 |
| does not see a `skip` option, as in guard/T114 | hosting/T34, T37, T39 |
| never classifies `dilution` | hosting/T35 |
| classifies every platform branch as `dilution`, so setup is not told apart | hosting/T35 |
| finds no host-specific API | hosting/T36 |
| ignores acknowledgements | hosting/T37 |
| accepts an acknowledgement with no reason | hosting/T37 |
| does not read TypeScript | hosting/T38 |
| fails the suite on a finding | hosting/T39 |
| leaves `inspect` out of the suite | hosting/T39 |
| passes when the root does not exist | hosting/T39 |

It also showed that the suite's line must reach Engineering unescaped. Under `node --test` with the TAP reporter, the line arrives as a comment with its quotes escaped, so hosting/T39 runs the suite's file directly.
