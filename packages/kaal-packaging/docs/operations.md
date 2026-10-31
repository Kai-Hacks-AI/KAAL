# kaal-packaging: Operations

## Commands

```
kaal-packaging measure <artifact> [--work <dir>]
kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>]
```

Each prints what its function returns and ends on one result line, `kaal-packaging {"result":…,"exit":…,"causes":[…]}`. The exit status is 0 for verified, 1 for failed and 2 for unknown or cannot run. Without `--work`, each uses a fresh directory and removes it. `conform` runs on a packed-and-installed candidate; `--consumer` defaults to the project whose `node_modules` holds it.

The library is `kaal-packaging` (measure, attribute, compare, write, read, report) and `kaal-packaging/conformance` (conform, conformSource and the single findings). Both accept `npm`, the path of a Node script that behaves as npm (packaging/A13); without it, npm is run by name through Hosting.

## Tests

- Installed, `npm test` runs the Embedded verification (`test:embedded`, `test/verify.mjs`) against the installed copy and ends on `kaal-packaging-verification {…}`.
- In the source workspace, `npm test` runs `test:publisher` (the planned tests in `test/publisher/`, which do not ship) and then `test:embedded`.
- `npm run build:verify` writes the assembled `docs/` and `test/verify.json`; `node test/publisher/build.mjs --check` fails when either is stale.

The skill, `skills/kaal-packaging/SKILL.md`, says when to use each command and how to read its findings.
