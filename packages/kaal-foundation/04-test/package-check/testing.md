# Testing

## What ships

Each delivered case is titled `foundation/T<n> [<targets>]: <what it checks>`. Its targets are identifiers that these documents define.

| Case | File | Targets | Checks |
| --- | --- | --- | --- |
| foundation/T23 | `02-requirements/functional/requirements.test.mjs` | foundation/F1 | the FIPS 180-4 known answers |
| foundation/T24 | `02-requirements/functional/requirements.test.mjs` | foundation/F1 | messages of 55, 56, 63, 64 and 65 bytes, at the padding boundaries |
| foundation/T25 | `02-requirements/functional/requirements.test.mjs` | foundation/F2 | a view counts only its own bytes and stays unmodified, and a `Buffer` agrees with a `Uint8Array` |
| foundation/T26 | `02-requirements/functional/requirements.test.mjs` | foundation/F3 | each refusal is a `TypeError` |
| foundation/T27 | `03-architecture/architecture.test.mjs` | foundation/N1, foundation/N2 | the installed module imports nothing and names no host global, and the package declares no dependency |
| foundation/T28 | `03-architecture/architecture.test.mjs` | foundation/N4 | the README states provisional ownership for each concern |
| foundation/T31 | `03-architecture/architecture.test.mjs` | foundation/F15 | the skill's frontmatter, its commands, and that it cites only identifiers defined here |
| foundation/T29 | `05-src/skills/kaal-foundation/scripts/kaal-foundation.test.mjs` | foundation/F14 | `kaal-foundation sha256` prints the library's digest for a file and for standard input |
| foundation/T30 | `05-src/skills/kaal-foundation/scripts/kaal-foundation.test.mjs` | foundation/F14 | an unreadable file, an unknown command or option, and no command exit 2 with a usage line |
| foundation/T50 | `02-requirements/functional/declaration.test.mjs` | foundation/F25, foundation/F26 | the public data export holds Foundation's accepted Node identity, name and type |

`04-test/package-check/verify.mjs` (shipped as `dist/test/package-check/verify.mjs`) runs them and decides the result of foundation/F12. The Cases sit beside their Nodes; the temporary collector `04-test/package-check/collect.mjs` finds every `*.test.mjs` under the loop folders, sorted by path, until Testing's mechanism replaces it. `verify.json` lists them as `cases`, and again as `model`, Testing's form `{ cases: [{ id, tests }] }`. Which identifiers are evidenced is derived from that model and a run. Nothing here declares coverage.

## What does not ship

The Cases that are not Solution (the publisher's outer checks and the Delivery Cases) sit beside the Nodes they verify, are listed as not shipping in `04-test/engineering-check/cases.json`, are not delivered, and never run in an installation. The collector runs them from that list before release. They do five things:
- compare every length up to 1024 bytes and seeded inputs up to 1 MiB against the host's SHA-256;
- hash every Node KAAL ships;
- check the packed and installed package;
- challenge the verification with changed, missing and undeclared files and cases;
- check that every documented way to run the command runs the scoped package's own bin by its path, and that another package's `kaal-foundation` can never stand in for it (foundation/F18);
- check that the package publishes publicly, names its repository, and that `verify` never crashes on a changed library;
- check that the owner declaration ships while the ownership claim remains repository-only and claims `packages/kaal-foundation/` alone (foundation/C11, amended by C15);
- check public declaration resolution, normal pack and exact inventory, isolated installed verification, altered/missing bytes and wrong owner/name/type behind refreshed digests, preserved author Engine/configuration and refusal of an unscoped substitute (foundation/T46–T49);
- check that the manifest is current: `04-test/engineering-check/publisher/manifest.mjs --check` is part of `test:publisher` (its Case is foundation/T71).

The repository's separate `test/acceptance/declaration-acceptance.test.mjs`
(foundation/T51) runs through the existing pack-once, ledger-recorded Acceptance
lane on Linux/macOS/Windows. It installs the candidate alone, resolves the public
declaration and executes installed verification with each Case accounted for.
It does not ship or run in a consumer's installation. Native host results are
separate acceptance evidence; a source suite on one host proves no other host.
