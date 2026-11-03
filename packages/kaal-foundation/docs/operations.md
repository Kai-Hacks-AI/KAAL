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

From a shell, in the directory where it is installed, run the scoped package's own bin by its path ([Requirements](requirements.md), foundation/F18):

```sh
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs sha256 README.md
printf abc | node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs sha256
```

Nothing on `PATH` can stand in for it: where the scoped package is not installed, the command fails, and another package's `kaal-foundation` is never run. Never run `npx kaal-foundation` or `npm exec … kaal-foundation`: they run whichever installed package owns `node_modules/.bin/kaal-foundation`, even with `--package`, and npx may fetch an unrelated unscoped package named `kaal-foundation`.

An agent's guide is the shipped skill, `skills/kaal-foundation/SKILL.md`.

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
type reference and lifecycle boundary are specified in [Requirements](requirements.md).
Installing or reading the package registers nothing. An explicit Core operation
validates and registers the owner bytes; npm upgrade/removal leaves any existing
Engine snapshot alone. No Foundation installation record is supplied or created.

## Verify

```sh
npm explore @kaihacksai/kaal-foundation -- npm test
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs verify
```

Both check the installed copy against its manifest and run the shipped cases. They end in `verified`, `failed` or `cannot verify`, and the last line is `kaal-foundation-verification {json}` ([Testing](testing.md)). `npm test` refuses, as `cannot verify`, a layout it cannot tell apart from a source checkout.

## Remove

```sh
npm uninstall @kaihacksai/kaal-foundation
```

Foundation keeps no state outside its package directory.

## Shipped files

```text
LICENSE
README.md
bin/kaal-foundation.mjs
capability/Foundation.md
docs/architecture.md
docs/intent.md
docs/limitations.md
docs/operations.md
docs/requirements.md
docs/testing.md
lib/sha256.d.ts
lib/sha256.mjs
package.json
skills/kaal-foundation/SKILL.md
test/embed/architecture.test.mjs
test/embed/commands.test.mjs
test/embed/declaration-embedded.test.mjs
test/embed/requirements.test.mjs
test/run.mjs
test/verify.json
test/verify.mjs
```
