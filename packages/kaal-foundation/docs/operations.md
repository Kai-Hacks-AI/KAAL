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

## Check a consumer's boundary

A consumer, or a lane that judges one, can ask Foundation two outer-loop questions without Foundation knowing anything about the consumer (foundation/I9). Both run the scoped package's own bin and end in `verified` (0), `failed` (1) or `cannot verify` (2):

```sh
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs check list.txt        # each line "<digest>  <file>", as `sha256` prints; no list or - reads standard input
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs boundary <consumer-directory> [list.txt]
```

`check` recomputes each stated digest with Foundation's own SHA-256 (foundation/F22). `boundary` reads the consumer's `package.json`, requires `@kaihacksai/kaal-foundation` in `dependencies` (otherwise `cannot verify`, `not a consumer`), resolves it by Node's own resolution, runs that resolved copy's own `verify`, and runs `check` on any lists (foundation/F23). It reports the two observations separately, and `digest agreement: not checked` when no list is given.

A `verified` answer covers only what ran. A matching list shows the supplied digests equal Foundation's for the same bytes. It does not show the list covers every digest the consumer states, that the consumer conforms to anything, or that it uses Foundation in its code. It never imports, runs or judges the consumer's code.

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
lib/boundary.mjs
lib/sha256.d.ts
lib/sha256.mjs
package.json
skills/kaal-foundation/SKILL.md
test/embed/architecture.test.mjs
test/embed/boundary.test.mjs
test/embed/commands.test.mjs
test/embed/requirements.test.mjs
test/run.mjs
test/verify.json
test/verify.mjs
```
