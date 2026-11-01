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
test/embed/requirements.test.mjs
test/run.mjs
test/verify.json
test/verify.mjs
```
