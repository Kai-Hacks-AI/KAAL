# Requirements

## The digest

- **foundation/F1** `sha256(bytes)` returns the SHA-256 of exactly `bytes`, as FIPS 180-4 defines it, written as 64 lowercase hexadecimal digits.
- **foundation/F2** `bytes` is a `Uint8Array`, and a Node.js `Buffer` is one. Only the bytes the array views count, so a view's offset and length are respected. The input is never modified.
- **foundation/F3** Anything else is refused with a `TypeError`: a string, an `ArrayBuffer`, a `DataView`, another typed array, an array of numbers, or `undefined`. There is no text encoding to choose, so no caller gets a different digest for the same text.
- **foundation/N1** The module imports nothing, uses no host global, and keeps no state between calls. The same bytes give the same digest on every host.
- **foundation/N2** The package declares no dependency of any kind.
- **foundation/N4** The README states, for each concern, that Foundation's ownership of it is provisional.

## The command

- **foundation/F14** The package installs one command, `kaal-foundation`:
  - `kaal-foundation sha256 [<file>…]` prints `<digest>  <file>` for each file, as `sha256sum` does. With no file, or with `-`, it hashes standard input.
  - `kaal-foundation verify` runs the verification of foundation/F12 and exits with its status. It loads no library code itself, so a changed or broken library gives `cannot verify`, never a crash.

  An unreadable file, an unknown command or option, or no command at all prints the cause and a usage line on standard error, and exits 2. The command decides nothing the library does not. Its digests are `sha256`'s.
- **foundation/F18** Every documented way to run the command runs the scoped package's own bin by its path: `node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs …`, after `npm install @kaihacksai/kaal-foundation` (amended by foundation/C10). The documents never recommend `npx kaal-foundation` or `npm exec … kaal-foundation`, which run whichever installed package owns `node_modules/.bin/kaal-foundation` and may select an unrelated unscoped package. Where the scoped package is not installed, the documented command fails and never runs another package.

## The skill

- **foundation/F15** The package ships one skill, `skills/kaal-foundation/SKILL.md`. It tells an agent when to use Foundation's SHA-256, how to hash text, how to check a digest and verify an installation with the command, and where a new shared concern belongs.

## The verification

- **foundation/F12** In an installation, `npm test` (or `kaal-foundation verify`) does three things:
  - it compares every file that `test/verify.json` lists with the installed copy, using the host's SHA-256;
  - it runs the delivered cases in `test/embed/`;
  - it matches the cases that ran, by name, against the manifest.

  Its last line is `kaal-foundation-verification {json}`, holding `result`, `exit`, each executed case as `{ name, outcome }`, and `causes`. The result is one of:
  - `verified` (0): the files match and every declared case ran once and passed;
  - `failed` (1): a declared case failed;
  - `cannot verify` (2): the manifest is missing, a listed file is missing or differs, a declared case did not run, an undeclared case ran, or nothing ran.

[Testing](testing.md) says which case checks which Requirement.
