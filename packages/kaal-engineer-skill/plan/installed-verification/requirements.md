# Installed Verification: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **engineer-skill/F8** [engineer-skill/I4]: `npm test` in an installed copy runs the consumer verification and nothing else. It needs no repository, no build, no workspace and no network, and imports only Node built-ins.
- **engineer-skill/F9** [engineer-skill/I4]: The package ships `test/verify.mjs` and a manifest `test/verify.json` holding the SHA-256 digest of every other shipped file. `files` names both.
- **engineer-skill/F10** [engineer-skill/I4]: Verification reports exactly one of `verified`, `failed` or `unknown`, with a non-zero exit for anything but `verified`. An altered byte, a deleted shipped file and a stray extra file are each `failed`. A manifest that cannot be read is `unknown`.
- **engineer-skill/F11** [engineer-skill/I4]: The source suite moves unchanged to `test:publisher`. The repository `npm test -w kaal-engineer-skill` keeps running it (through `test:all`), so no existing assertion is weakened.

## Non-functional

- **engineer-skill/N2** [engineer-skill/I4]: The shipped verification uses the package's digest convention from `@kaihacksai/kaal-foundation` (one SHA-256) only through the manifest it generates at publish time, so a broken library cannot mask itself at verify time.
