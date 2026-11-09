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

## The Boundary Check

- **foundation/F34** **The scan: `node dist/test/boundary-check/scan.mjs --target <path>… [--base <dir>]`.** Each `--target` is a file or a directory, given by the caller. A directory is walked for JavaScript and TypeScript sources (`.js .mjs .cjs .ts .mts .cts`); the directories `node_modules` and `.git` are not walked and are counted as skipped. The scan reports a place for each of these rules, and only these:
  - `copy`: a file whose bytes equal Foundation's `sha256.mjs` or `sha256.d.ts` as shipped beside the scan. The place is line 1 of the file.
  - `implementation`: a line that holds SHA-256's first two round constants `0x428a2f98` and `0x71374491` together, or the first of them when the second follows within the next three lines. The place is the line of the first.
  - `crypto`: a line that asks the platform for SHA-256: `createHash("sha256")` (any of the three quote forms, any letter case, with or without the hyphen), or `digest("SHA-256"…)`.

  A line is one place, whatever the number of matches on it. The scan decides nothing by operating system (foundation/N7).
- **foundation/F35** **The result.** The last line of standard output is `kaal-foundation-scan {json}`. The JSON holds:
  - `mode`: `"scan"`;
  - `result`: `complete` when every target was read and at least one source file was read, otherwise `unknown`;
  - `coverage`: `read` (source files read), `unreadable` (each target or file that could not be read, by path) and `skipped` (directories not walked, with the reason);
  - `findings`: each with `id` (`kaal-foundation/<file>:<line>`, the file relative to `--base`, default the current directory, with `/` separators), `rule`, `file`, `line`, `digest` (Foundation's SHA-256 of the line's text without its line terminator, so a later record can bind to the line as it was) and `owner` (foundation/F36).

  Exit codes follow Hosting's scan: 0 when `complete`, including with findings; 2 when `unknown`, and for a usage error (no target). It never exits 1. Findings are not failures, because the scan decides nothing. A scan that read nothing is `unknown`, never a clean result. The human summary line states the coverage and says "none found within this coverage" when there are no findings, and never says "compliant" or "verified".
- **foundation/F36** **Where a place is found, and what is not Foundation's to look at.** Each finding carries `owner`: the `owner.name` of the nearest `ownership.kaal.json` above the file within the base, or `null`. A directory whose `ownership.kaal.json` names Foundation as owner is skipped, reported in `coverage.skipped` with the reason `owner`, and yields no finding: the owner holds the thing. No other path is named or skipped by the scan.
- **foundation/F37** **Foundation's own Boundary Check record and its documents.** `04-test/boundary-check/boundary-check.md` and `04-test/boundary-check/scan.mjs` ship (`dist/test/boundary-check/`). The record:
  - declares the Boundary Check **Applicable**, with the command (`scan.mjs --target <path>…`), the three rules and what each looks for;
  - names both axes: Foundation's scan pointed at a package or at the repository, and the peers' scans pointed at Foundation;
  - states what the scan does not establish: it does not find a digest computed some other way (for example `createHash` with the algorithm in a variable), does not say a place is a fault, and an empty list is no compliance;
  - states that findings are audit and decisions about them are held by the repository against the finding `id` and `digest`, never in the package, and that only a consequence of a decision (a Defect, a Requirement, or a change to Intent or Architecture) enters the package, through a Change;
  - names no target path and no role.

  The installed `references/operations.md`, the skill (foundation/F15) and the repository's `AGENTS.md` Foundation section (foundation/F16) name the scan by the scoped package's own path and state the same limits and the same place for decisions.
