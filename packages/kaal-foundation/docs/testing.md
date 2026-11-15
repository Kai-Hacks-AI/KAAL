# Testing

## What ships

Each delivered case is titled `foundation/T<n> [<targets>]: <what it checks>`. Its targets are identifiers that these documents define.

| Case | File | Targets | Checks |
| --- | --- | --- | --- |
| foundation/T23 | `test/embed/requirements.test.mjs` | foundation/F1 | the FIPS 180-4 known answers |
| foundation/T24 | `test/embed/requirements.test.mjs` | foundation/F1 | messages of 55, 56, 63, 64 and 65 bytes, at the padding boundaries |
| foundation/T25 | `test/embed/requirements.test.mjs` | foundation/F2 | a view counts only its own bytes and stays unmodified, and a `Buffer` agrees with a `Uint8Array` |
| foundation/T26 | `test/embed/requirements.test.mjs` | foundation/F3 | each refusal is a `TypeError` |
| foundation/T27 | `test/embed/architecture.test.mjs` | foundation/N1, foundation/N2 | the installed module imports nothing and names no host global, and the package declares no dependency |
| foundation/T28 | `test/embed/architecture.test.mjs` | foundation/N4 | the README states provisional ownership for each concern |
| foundation/T31 | `test/embed/architecture.test.mjs` | foundation/F15 | the skill's frontmatter, its commands, and that it cites only identifiers defined here |
| foundation/T29 | `test/embed/commands.test.mjs` | foundation/F14 | `kaal-foundation sha256` prints the library's digest for a file and for standard input |
| foundation/T30 | `test/embed/commands.test.mjs` | foundation/F14 | an unreadable file, an unknown command or option, and no command exit 2 with a usage line |

`test/verify.mjs` runs them and decides the result of foundation/F12. `test/verify.json` lists them as `cases`, and again as `model`, Testing's form `{ cases: [{ id, tests }] }`. Which identifiers are evidenced is derived from that model and a run. Nothing here declares coverage.

## What does not ship

The publisher's tests under `test/publisher/` are not delivered and never run in an installation. Before release, they do five things:
- compare every length up to 1024 bytes and seeded inputs up to 1 MiB against the host's SHA-256;
- hash every Node KAAL ships;
- check the packed and installed package;
- challenge the verification with changed, missing and undeclared files and cases;
- check that every documented way to run the command runs the scoped package's own bin by its path, and that another package's `kaal-foundation` can never stand in for it (foundation/F18);
- check that the package publishes publicly, names its repository, and that `verify` never crashes on a changed library;
- check that the manifest is current: `test/publisher/manifest.mjs --check` is part of `test:publisher`.
