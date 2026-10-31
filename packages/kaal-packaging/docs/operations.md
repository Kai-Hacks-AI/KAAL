# KAAL Packaging: Operations

<!-- Shipped with kaal-packaging. The plan/ documents in the source repository record each Change that set these. -->

This is the authoritative Operations document for `kaal-packaging` (packaging/F8).

## Requirements of the host

- Node 24 or later (`engines.node`).
- npm 11.18.0 or later on the `PATH`, for `measure` and for running a package's `npm test` (packaging/N6). Hosting decides how it is started on each host.
- No network. Nothing in Packaging fetches from a registry.

## Install

`kaal-packaging` is private and never installed by name from a registry. Use it from this repository's workspace, or install the tarball packed there together with `kaal-hosting` and `@kaihacksai/kaal-foundation`:

```
npm install ./kaal-packaging-0.0.1.tgz ./kaal-hosting-0.0.1.tgz ./kaal-foundation-0.0.1.tgz
```

## Commands

The package declares one `bin`, `kaal-packaging` (packaging/F16). Each command calls the exported function and decides nothing it does not (packaging/N12).

Run it by its path, so that nothing is looked up on a registry:

- in this repository: `node packages/kaal-packaging/bin/kaal-packaging.mjs …`
- in a project that installed the tarball: `node node_modules/kaal-packaging/bin/kaal-packaging.mjs …`

Never run a bare `npx kaal-packaging` or `npm exec kaal-packaging`. The package is private, and its unscoped name is not Packaging's on any registry, so a lookup may fetch and run an unrelated package.

```
node <package>/bin/kaal-packaging.mjs measure <artifact> [--work <dir>] [--format json|text]
node <package>/bin/kaal-packaging.mjs conform <installed-dir> [--consumer <dir>] [--work <dir>] [--testing <module>] [--json]
```

- `measure` prints the measurement record of packaging/F4 (`--format json`, the default) or the text report of packaging/F5. Without `--work` it uses a scratch directory it creates and removes.
- `conform` prints one line per finding, `<result>: <requirement>: <cause>`, or with `--json` the whole report, and then one result line: `kaal-packaging-conformance {"result", "exit", "package", "causes"}`. `--consumer` defaults to the directory holding the package's first `node_modules`. Without `--work`, the behaviour probe of packaging/N9 runs in a scratch directory the command creates and removes.
- `--testing <module>` names a module file you provide that exports Testing's model functions as `check` and `tested` (testing/F24–F25). Packaging takes no dependency on Testing (packaging/N8), so the caller hands them in. Without them, a package that ships a Testing model is `unknown` for packaging/F13, and the command prints `note: packaging/F13 was not judged … This run is not a complete conformance judgement.` before its result line.

### A complete conformance run

1. Pack the candidate and its runtime dependencies once, and install them into a fresh consumer, with the dependencies coming from their registry wherever they are published.
2. Provide Testing's model functions: a file such as `testing.mjs` holding `export { check, tested } from "<Testing's model module>";`, or call `conform` from `kaal-packaging/conformance` with `{ testing }`, as Engineering's harness does.
3. Run `conform` with `--testing testing.mjs`. Only a run whose packaging/F13 was judged, and whose packaging/F7 was decided against registry resolutions, is a complete judgement of the generic contract.

| Exit | Meaning |
| --- | --- |
| 0 | `measure`: measured. `conform`: verified |
| 1 | `conform`: failed |
| 2 | `conform`: unknown. Either command: refused or could not run, including a usage error |

## Library

```js
import { attribute, compare, measure, read, report, write } from "kaal-packaging";
import { conform, conformSource, references } from "kaal-packaging/conformance";
```

The README states each function. `measure` and `conform` take an optional `npm`, the absolute location of a Node script that behaves as npm, which they run with the running Node through Hosting (packaging/A13).

## Verify an installed copy

Run `npm test` in the installed package's directory. It runs `test:embedded` only, against that copy, and ends on `kaal-packaging-verification {json}`: `verified` (exit 0), `failed` (1) or `cannot verify` (2). It writes only in the system's temporary directory, in directories it creates (packaging/N7).

## Files

Every delivered file and its SHA-256 are listed in `test/verify.json`, with the delivered cases and their Testing model (packaging/F11, packaging/F13):

- `bin/kaal-packaging.mjs`: the commands.
- `lib/`: the library. `lib/npm/` is the npm realization.
- `capability/Packaging.md`: the Capability Node.
- `skills/kaal-packaging/SKILL.md`: the skill (packaging/F17).
- `docs/`: these documents.
- `test/embed/`, `test/verify.mjs`, `test/run.mjs`, `test/verify.json`: the Embedded verification.
- `README.md`, `LICENSE`, `package.json`.

## Agents

An agent reads `skills/kaal-packaging/SKILL.md`. In this repository, `AGENTS.md` says when to use Packaging (packaging/F18).
