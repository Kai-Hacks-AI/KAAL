# Operations

## Install

```sh
npm install @kaihacksai/kaal-foundation
```

It needs Node 24 or later and installs no other package.

## Use

```js
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

sha256(new TextEncoder().encode("abc"));
```

From a shell, in the directory where it is installed, run the scoped package's own bin by its path ([Requirements](../../../docs/requirements/functional/requirements.md), foundation/F18):

```sh
node node_modules/@kaihacksai/kaal-foundation/dist/skills/kaal-foundation/scripts/kaal-foundation.mjs sha256 README.md
printf abc | node node_modules/@kaihacksai/kaal-foundation/dist/skills/kaal-foundation/scripts/kaal-foundation.mjs sha256
```

Nothing on `PATH` can stand in for it: where the scoped package is not installed, the command fails, and another package's `kaal-foundation` is never run. Never run `npx kaal-foundation` or `npm exec … kaal-foundation`: they run whichever installed package owns `node_modules/.bin/kaal-foundation`, even with `--package`, and npx may fetch an unrelated unscoped package named `kaal-foundation`.

An agent's guide is the shipped skill, `dist/skills/kaal-foundation/SKILL.md`.

## Read the Capability declaration

The public `@kaihacksai/kaal-foundation/capability` export is a Markdown data
file. In Node, resolve it through the scoped package's public export, then read
the exact bytes with your environment's approved reader. For example:

```js
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const bytes = readFileSync(require.resolve("@kaihacksai/kaal-foundation/capability"));
```

The example shows Node's data-file acquisition. KAAL consumers that already use
Hosting read the resolved path through Hosting's `readFile`. Do not import the
Markdown as JavaScript, infer a Node from package metadata, or fall back to an
unscoped package. Missing Foundation or a missing export is an error.

The Node is named `Foundation` and has CASE kind Capability. Its content ID,
type reference and lifecycle boundary are specified in [Requirements](../../../docs/requirements/functional/requirements.md).
Installing or reading the package registers nothing. An explicit Core operation
validates and registers the owner bytes; npm upgrade/removal leaves any existing
Engine snapshot alone. No Foundation installation record is supplied or created.

## Verify

```sh
npm explore @kaihacksai/kaal-foundation -- npm test
node node_modules/@kaihacksai/kaal-foundation/dist/skills/kaal-foundation/scripts/kaal-foundation.mjs verify
```

Both check the installed copy against its manifest and run the shipped cases. They end in `verified`, `failed` or `cannot verify`, and the last line is `kaal-foundation-verification {json}` ([Testing](../../../test/package-check/testing.md)).

## Find a second SHA-256 elsewhere (Boundary Check)

```sh
node engineering/boundary/engine.mjs --tests node_modules/@kaihacksai/kaal-foundation/dist/test/boundary-check/boundary-check.md --target <path>... [--base <dir>]
```

Foundation ships its Boundary Tests as a definition, and Engineering's Boundary Engine runs it. The engine reads the files and directories you name and reports each place where the SHA-256 Foundation owns is done somewhere else: a copy of Foundation's library (`copy`), the algorithm written out (`implementation`), or the platform asked for SHA-256 (`crypto`). The definition names no target of its own: you name them, so a new target needs no change here. The last line is `kaal-boundary-scan {json}`, with the result `complete` or `unknown`, the coverage, and the findings (`id`, `rule`, `file`, `line`, `digest`, `owner`). The exit is 0 when complete, including with findings, and 2 when unknown.

A finding is audit, a place to look at and not a fault. Decisions about findings are held by the repository against the finding `id` and `digest`, never in the package. An empty list says only that nothing was found within the coverage. The record is `dist/test/boundary-check/boundary-check.md`.

## Remove

```sh
npm uninstall @kaihacksai/kaal-foundation
```

Foundation keeps no state outside its package directory.

## Shipped files

```text
LICENSE
README.md
dist/AGENTS.md
dist/docs/architecture/architecture.md
dist/docs/architecture/architecture.test.mjs
dist/docs/intent/intent.md
dist/docs/requirements/functional/declaration.test.mjs
dist/docs/requirements/functional/requirements.md
dist/docs/requirements/functional/requirements.test.mjs
dist/docs/requirements/non-functional/requirements.md
dist/kaal/Foundation.md
dist/skills/kaal-foundation/SKILL.md
dist/skills/kaal-foundation/references/limitations.md
dist/skills/kaal-foundation/references/operations.md
dist/skills/kaal-foundation/scripts/kaal-foundation.mjs
dist/skills/kaal-foundation/scripts/kaal-foundation.test.mjs
dist/skills/kaal-foundation/scripts/sha256.d.ts
dist/skills/kaal-foundation/scripts/sha256.mjs
dist/test/boundary-check/boundary-check.md
dist/test/package-check/collect.mjs
dist/test/package-check/testing.md
dist/test/package-check/verify.json
dist/test/package-check/verify.mjs
package.json
```
