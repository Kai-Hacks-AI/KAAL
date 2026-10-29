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

## Verify

```sh
npm explore @kaihacksai/kaal-foundation -- npm test
```

In an installed package, `npm test` runs only the shipped consumer tests and ends in `verified`, `failed` or `cannot verify` ([Testing](testing.md)). It refuses, as `cannot verify`, a layout it cannot tell apart from a source checkout.

## Remove

```sh
npm uninstall @kaihacksai/kaal-foundation
```

Foundation keeps no state outside its package directory.

## Shipped files

```text
LICENSE
README.md
docs/architecture.md
docs/intent.md
docs/limitations.md
docs/operations.md
docs/requirements.md
docs/testing.md
lib/sha256.d.ts
lib/sha256.mjs
package.json
test/consumer/sha256.test.mjs
test/run.mjs
test/verify.mjs
```
