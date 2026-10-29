# Architecture

- **One subpath per concern.** SHA-256 is `@kaihacksai/kaal-foundation/sha256`, `lib/sha256.mjs` with its declarations in `lib/sha256.d.ts`. It is plain ESM with no build step. A consumer imports only the concern it uses.
- **Position.** Foundation and Hosting are siblings at the bottom of KAAL's packages. Neither depends on the other or on anything above.
- **Verification ships.** `test/consumer/` holds the tests a consumer runs. `test/verify.mjs` runs them and reports the result. `test/run.mjs` is `npm test`: in an installed package it runs only the consumer verification. See [Operations](operations.md).
