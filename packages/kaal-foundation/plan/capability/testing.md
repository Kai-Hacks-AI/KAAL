# Foundation as a capability: Testing

## Publisher's planned cases

`test/plan/capability.test.mjs` holds these planned cases. The DO moves the file unchanged to `test/publisher/` and runs it in `test:publisher`. Each case reads the package as it is packed and installed, or the source workspace where it says so.

| Test | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- |
| foundation/T15 | F11, F13: the installed `test/verify.json` lists every other installed file with its SHA-256. Its `cases` are the leading identifiers of the `test/embed/` titles, and its `model` is exactly those cases with their bracketed targets. Every target is defined in the installed documents. The committed manifest equals the packed one. | Today's package, which ships no manifest |
| foundation/T16 | F12, F17: the installed `npm test` ends on `kaal-foundation-verification` with `verified`, exit 0, every declared case once with outcome `pass`, and no cause | Today's verifier, which prints only a count and a bare result |
| foundation/T17 | F12, N10: on an installed copy, `cannot verify` (2) results from each of these, with its cause: a changed document, a missing manifest, a removed case file, and an extra case that is not declared. A library that answers wrongly, with its manifest digest rewritten to match, gives `failed` (1) and a `fail` outcome. | A verifier that checks presence, or counts cases instead of naming them |
| foundation/T18 | F14, N8: the declared `bin` runs in the consumer through `npm exec`. `sha256 <file>` prints `<digest>  <file>` equal to the host's digest. With no file it hashes standard input. An unreadable file and an unknown command exit 2 with a usage line. `verify` ends on the verification line and exits 0. | Today's package, which declares no `bin` |
| foundation/T19 | F16: the repository's `AGENTS.md` has a Foundation section naming `skills/kaal-foundation/SKILL.md`, `kaal-foundation sha256` and `kaal-foundation verify` | Today's `AGENTS.md`, which names no capability |
| foundation/T20 | F17: `test`, `test:all`, `test:embedded` and `test:publisher` are as declared. Every file `test:publisher` names exists under `test/publisher/`. On fixtures, the runner in source runs `test:embedded` then `test:publisher` and ends on a bare result. Installed, it runs `test:embedded` alone and passes its last line through. | Today's scripts (`test:consumer`, runner as `test`) |
| foundation/T21 | N7: no file under `packages/kaal-foundation/`, tests included, names `process.platform`, `win32`, a `.cmd` launcher or a `shell` option | A test that branches on the platform |
| foundation/T22 | N9: `lib/sha256.mjs` and `lib/sha256.d.ts` have the SHA-256 they have on `main` today, and the package declares no dependency | A changed library |

## Delivered cases

The DO writes these in `test/embed/`. They ship, run in every installation, and are the manifest's `cases` and `model`.

| Test | Targets | Checks |
| --- | --- | --- |
| foundation/T23 | foundation/F1 | the FIPS 180-4 known answers |
| foundation/T24 | foundation/F1 | messages of 55, 56, 63, 64 and 65 bytes, at the padding boundaries |
| foundation/T25 | foundation/F2 | a view counts only its own bytes and stays unmodified, and a `Buffer` agrees with a `Uint8Array` |
| foundation/T26 | foundation/F3 | each refusal is a `TypeError` |
| foundation/T27 | foundation/N1, foundation/N2 | the installed module imports nothing and names no host global, and the package declares no dependency |
| foundation/T28 | foundation/N4 | the README states provisional ownership for each concern it lists |
| foundation/T29 | foundation/F14 | `kaal-foundation sha256` prints the library's digest for a file and for standard input |
| foundation/T30 | foundation/F14 | an unreadable file and an unknown command exit 2 with a usage line |
| foundation/T31 | foundation/F15 | the shipped skill has `name: kaal-foundation` and a description, names both commands, and cites only identifiers the shipped documents define |

## Amendments the DO applies to foundation/T9–T14

What each test asserts is unchanged. Only the names change:
- `test/consumer/` becomes `test/embed/`.
- `test:consumer` becomes `test:embedded`.
- `npm test` becomes `npm run test:all`, with the runner as `test:all`.
- The source marker `test/plan/` becomes `test/publisher/`.
- The source runner's last line becomes a bare result.

Each of T10's mutations rewrites the manifest digest of the file it changes. The verifier then judges behaviour, not tampering. Tampering is T17's. T10's failing delivered test changes one expected digest inside a delivered case, rather than replacing the file with an undeclared test. An undeclared case is `cannot verify` (F12), not `failed`. T14's source fixture runs every declared suite but `test:all`.

The C5 verifier test (`test/publisher/verifier.test.mjs`) changes the same way.

## RED evidence

Run against today's package, through npm (`npm_execpath` set):
- **Behavioural.** T15 fails because no manifest ships. T16 fails because the last line is the bare `verified`. T18 fails because no `bin` is declared. T19 fails because `AGENTS.md` names no Foundation section. T20 fails because `test` is the runner itself.
- **Blocked.** T17 fails before its behavioural assertion, because without a manifest a changed document cannot be told apart.
- **GREEN today, as guards.** T21 and T22 pass, and they must stay GREEN through the DO.

## Amendment by the Owner's review of foundation/C8 (#712)

| Test | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- |
| foundation/T32 | F18: every documented invocation in the installed README, `docs/`, skill and the repository's `AGENTS.md` names `--package=@kaihacksai/kaal-foundation`. Run offline, the documented command prints the scoped bin's digest where the scoped package is installed. Where only an unrelated unscoped `kaal-foundation` is installed, it fails and never runs it, while the bare bin name does run it (the control) | Documentation that recommends `npx kaal-foundation` |

## Amendment foundation/C9

| Test | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- |
| foundation/T33 | F14, N10: installed, `kaal-foundation verify` on a library with a stray line, and on one that throws on import, exits 2 and ends on `kaal-foundation-verification` with `cannot verify` naming `lib/sha256.mjs` | Today's bin, which imports the library at load and crashes with exit 1 |
| foundation/T34 | F19: `publishConfig` is `{ access: "public" }`, and `repository` names the KAAL repository and this package's directory | Today's `package.json`, which has neither |

## Amendment foundation/C10

| Test | Checks | The fixture it must fail, naming the cause |
| --- | --- | --- |
| foundation/T32, revised | F18 as corrected: every documented invocation is `node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs`, the path of `package.json` `bin.kaal-foundation`, and none runs `kaal-foundation` through `npx` or `npm exec`, except prose that warns against it. Run offline, the documented command prints the scoped bin's digest where the scoped package is installed, and also where an unrelated unscoped `kaal-foundation`, installed afterwards, owns `.bin/kaal-foundation`; there, `npm exec --no --package=@kaihacksai/kaal-foundation -- kaal-foundation` runs the impostor (the control). Where only the unscoped package is installed, the documented command fails and never runs it, while the bare bin name does run it (the control) | Documentation that recommends `npm exec --no --package=@kaihacksai/kaal-foundation -- kaal-foundation`, which the side-by-side fixture shows running the impostor |
