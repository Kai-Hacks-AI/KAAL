# Functional requirements

## The digest

- **foundation/F1** `sha256(bytes)` returns the SHA-256 of exactly `bytes`, as FIPS 180-4 defines it, written as 64 lowercase hexadecimal digits.
- **foundation/F2** `bytes` is a `Uint8Array`, and a Node.js `Buffer` is one. Only the bytes the array views count, so a view's offset and length are respected. The input is never modified.
- **foundation/F3** Anything else is refused with a `TypeError`: a string, an `ArrayBuffer`, a `DataView`, another typed array, an array of numbers, or `undefined`. There is no text encoding to choose, so no caller gets a different digest for the same text.

## The command

- **foundation/F14** The package installs one command, `kaal-foundation`:
  - `kaal-foundation sha256 [<file>…]` prints `<digest>  <file>` for each file, as `sha256sum` does. With no file, or with `-`, it hashes standard input.
  - `kaal-foundation verify` runs the verification of foundation/F12 and exits with its status. It loads no library code itself, so a changed or broken library gives `cannot verify`, never a crash.

  An unreadable file, an unknown command or option, or no command at all prints the cause and a usage line on standard error, and exits 2. The command decides nothing the library does not. Its digests are `sha256`'s.
- **foundation/F18** Every documented way to run the command runs the scoped package's own bin by its path: `node node_modules/@kaihacksai/kaal-foundation/dist/skills/kaal-foundation/scripts/kaal-foundation.mjs …`, after `npm install @kaihacksai/kaal-foundation` (amended by foundation/C10). The documents never recommend `npx kaal-foundation` or `npm exec … kaal-foundation`, which run whichever installed package owns `node_modules/.bin/kaal-foundation` and may select an unrelated unscoped package. Where the scoped package is not installed, the documented command fails and never runs another package.

## The skill

- **foundation/F15** The package ships one skill, `dist/skills/kaal-foundation/SKILL.md`. It tells an agent when to use Foundation's SHA-256, how to hash text, how to check a digest and verify an installation with the command, and where a new shared concern belongs.

## The verification

- **foundation/F12** In an installation, `npm test` (or `kaal-foundation verify`) does three things:
  - it compares every file that `dist/test/package-check/verify.json` lists with the installed copy, using the host's SHA-256;
  - it runs the delivered cases that sit beside the Nodes in `dist/` (the temporary collector `collect.mjs` finds them, foundation/C20);
  - it matches the cases that ran, by name, against the manifest.

  Its last line is `kaal-foundation-verification {json}`, holding `result`, `exit`, each executed case as `{ name, outcome }`, and `causes`. The result is one of:
  - `verified` (0): the files match and every declared case ran once and passed;
  - `failed` (1): a declared case failed;
  - `cannot verify` (2): the manifest is missing, a listed file is missing or differs, a declared case did not run, an undeclared case ran, or nothing ran.

[Testing](../../../test/package-check/testing.md) says which case checks which Requirement.

## Foundation's own Capability declaration

- **foundation/F25** The public data export
  `@kaihacksai/kaal-foundation/capability` resolves to the delivered
  `dist/kaal/Foundation.md`. Read its exact UTF-8 Markdown bytes, rather than
  importing it as JavaScript. It is Foundation's authoritative Capability Node,
  named `Foundation`, typed by Core's existing `KAAL Capability` reference
  `56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e`.
  Its content ID is
  `649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5`.
  Core owns explicit binding to CASE kind Capability and admission/registration;
  package metadata is never a substitute for the owner declaration.
- **foundation/F26** The committed manifest lists the declaration. Verification
  first checks its bytes independently against that manifest. A delivered Case
  then checks its accepted identity, name and type. Missing/changed bytes give
  `cannot verify`; a wrong declaration hidden behind a refreshed manifest fails
  the Case. Neither result establishes admission, registration or use.
- **foundation/F27** Declaration delivery performs no Engine lifecycle action.
  Install, resolution, read, upgrade and removal of the npm package neither
  initialize an Engine nor register, replace or remove an Engine contribution.
  Core owns its explicitly requested registration operation and Engine lifecycle;
  Foundation supplies no installation contract or Foundation-owned state record
  for Core to invent or write. npm removal leaves an already registered snapshot
  alone. Changes to such a snapshot require an explicit Core lifecycle operation
  under Core's preservation and refusal guarantees.
