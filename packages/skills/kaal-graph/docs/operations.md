# Graph: Operations (how)

How to install `@kaihacksai/kaal-graph`, use it and verify it. What each export and command promises is in the [README](../README.md) and [Requirements](requirements.md).

## Prerequisites

- Node 24 or later.
- The package's runtime dependencies, Hosting's package and `yaml`, which npm installs with it.

## Install

```sh
npm install @kaihacksai/kaal-graph
```

The installation holds exactly these files:

- `LICENSE`
- `README.md`
- `docs/architecture.md`
- `docs/intent.md`
- `docs/limitations.md`
- `docs/operations.md`
- `docs/requirements.md`
- `docs/testing.md`
- `package.json`
- `payload/Graph.md`
- `payload/KNIFE.md`
- `skills/kaal-graph/SKILL.md`
- `skills/kaal-graph/references/edges.md`
- `skills/kaal-graph/scripts/edges.d.ts`
- `skills/kaal-graph/scripts/edges.mjs`
- `skills/kaal-graph/scripts/form.d.ts`
- `skills/kaal-graph/scripts/form.mjs`
- `skills/kaal-graph/scripts/graph.mjs`
- `skills/kaal-graph/scripts/node.d.ts`
- `skills/kaal-graph/scripts/node.mjs`
- `skills/kaal-graph/scripts/structure.mjs`
- `test/embedded/cycles.test.mjs`
- `test/embedded/composition.test.mjs`
- `test/embedded/declarations.test.mjs`
- `test/embedded/graph.test.mjs`
- `test/embedded/structure.test.mjs`
- `test/verify.json`
- `test/verify.mjs`

## Use

From code, import the API from `@kaihacksai/kaal-graph`, or only the Form from `@kaihacksai/kaal-graph/form`, which imports no host module. The [README](../README.md) states each export.

The package name is scoped; the CLI command and Agent Skill identifier remain `kaal-graph`.

From the command line:

```sh
npx --no kaal-graph check <dir>...
npx --no kaal-graph out <id> <dir>...
npx --no kaal-graph in <id> <dir>...
npx --no kaal-graph named <name> <dir>...
npx --no kaal-graph resolve <name> <id> <dir>...
```

`check` exits 0 when there is nothing to report and 1 when there is. Misuse, and a lookup that finds nothing, exit 2.

An Agent loads the Skill from `node_modules/@kaihacksai/kaal-graph/skills/kaal-graph/SKILL.md`.

## Register the Node

The Skill Node joins an Engine through Core alone:

```sh
npx kaal register skill kaal-graph node_modules/@kaihacksai/kaal-graph/payload
```

## Verify the installation

```sh
npm explore @kaihacksai/kaal-graph -- npm test
```

This runs `test/verify.mjs` against the installed copy (graph/F6). It checks the shipped files against `test/verify.json`, runs every embedded case in a scratch directory it removes, checks that your project is unchanged, and ends in exactly one result:

- **verified (0):** every shipped file matches the manifest, and every declared case ran and passed.
- **failed (1):** a declared case failed, or your project changed during the run. Each cause is named.
- **cannot verify (2):** a prerequisite is missing; the manifest is absent, cannot be read or declares no cases; an installed file differs from the manifest, is missing or is not in it; a declared case was skipped, marked todo or did not run; or a case ran that the manifest does not declare. Each cause is named, with its next step. When the installed files differ, reinstall the package, then run the command again.

Its last line is the summary, `kaal-graph-verification ` followed by JSON, for a program to read: the result, its cause, evidence and next step, the package's name, version and location, the platform and Node version, the digest of the installed files, and every declared case with its outcome.

`node node_modules/@kaihacksai/kaal-graph/test/verify.mjs` runs the same verification directly. It needs no network and no KAAL source checkout, and it builds nothing.
