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

From a shell, in a project that has it installed:

```sh
npx kaal-foundation sha256 README.md
echo -n abc | npx kaal-foundation sha256
```

An agent's guide is the shipped skill, `skills/kaal-foundation/SKILL.md`.

## Verify

```sh
npm explore @kaihacksai/kaal-foundation -- npm test
npx kaal-foundation verify
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
