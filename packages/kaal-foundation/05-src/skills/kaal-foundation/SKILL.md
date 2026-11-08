---
name: kaal-foundation
description: Hash bytes with KAAL's one SHA-256, check a digest, or verify an installed @kaihacksai/kaal-foundation. Use when KAAL code needs a SHA-256 (Node ids, Seals, record or manifest digests), when a digest must be reproduced from a shell, or when deciding whether a shared helper belongs in Foundation.
---

# Using KAAL Foundation

## Description

Hash bytes with KAAL's one SHA-256, check a digest, or verify an installed `@kaihacksai/kaal-foundation`. Use it when KAAL code needs a SHA-256, when a digest must be reproduced from a shell, or when deciding whether a shared helper belongs in Foundation.

Foundation is the bottom of KAAL's packages, beside Hosting. It depends on nothing and holds a few reviewed, provisional concerns. Today the only one is SHA-256.

## When to use Foundation's SHA-256

- **In KAAL code, always.** Import `sha256` from `@kaihacksai/kaal-foundation/sha256`. Do not use `node:crypto`, Web Crypto or a copied implementation for a KAAL digest: KAAL keeps one SHA-256 (foundation/I1), and adopting it changes no digest (foundation/I2).
- **Outside KAAL code.** A host's own hash is faster. Foundation's value is that it is pure, so it gives the same digest on every host with no host module (foundation/N1).

## How to hash

`sha256(bytes)` takes a `Uint8Array`, and a `Buffer` is one. It returns 64 lowercase hexadecimal digits (foundation/F1). Only the bytes a view covers count (foundation/F2).

It refuses a string with a `TypeError` (foundation/F3). That is deliberate. Encode text as UTF-8 yourself:

```js
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
sha256(new TextEncoder().encode(text));
```

## Check a digest from a shell

The bin `kaal-foundation` has two commands, `kaal-foundation sha256` and `kaal-foundation verify`. Install the scoped package first, then run its own bin by its path, from the directory where it is installed. Never run `npx kaal-foundation` or `npm exec … kaal-foundation`: `kaal-foundation` is only the bin's name, so they run whichever installed package owns `node_modules/.bin/kaal-foundation`, and where the scoped package is not installed npx may fetch an unrelated unscoped package of that name (foundation/F18).

```sh
npm install @kaihacksai/kaal-foundation
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs sha256 <file>…   # "<digest>  <file>", one per line
printf %s "$text" | node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs sha256   # standard input; "-" does the same
```

Nothing is downloaded and nothing on `PATH` is consulted: without the scoped package installed, the command fails instead of guessing.

Exit status 0 means every file was hashed. Exit 2 means a file could not be read, or a command or option is unknown. The cause and a usage line are on standard error (foundation/F14). The digests are the library's, byte for byte.

## Verify an installation

```sh
node node_modules/@kaihacksai/kaal-foundation/bin/kaal-foundation.mjs verify
```

This checks the installed files against the shipped manifest, then runs the shipped cases (foundation/F12). Read the last line, `kaal-foundation-verification {json}`:

| Result | Exit | What to do |
| --- | --- | --- |
| `verified` | 0 | Nothing. |
| `failed` | 1 | A shipped case failed, so this copy does not behave as specified. Read `causes`, and do not rely on its digests. Reinstall it, or report it to the maintainers. |
| `cannot verify` | 2 | The copy could not be checked. A file differs from the manifest or is missing, or a case did not run. Read `causes`: usually the install was changed after npm wrote it, so reinstall. It is never a pass. |

A matching manifest is not provenance. It shows the files are the ones listed, not who packed them.

## Where a new shared concern belongs

Not in Foundation by default. Foundation is not a utilities bucket (foundation/I3). A helper belongs to the capability whose meaning it carries. Anything that touches the operating system belongs to Hosting. A concern enters Foundation only when the Owner reviews it as provisional, it is pure and dependency-free, and the README lists it as provisional (foundation/N4).
