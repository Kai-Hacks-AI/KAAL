# Requirements

- **The digest.** `sha256(bytes)` returns the SHA-256 of exactly `bytes`, as FIPS 180-4 defines it, written as 64 lowercase hexadecimal digits.
- **The input.** `bytes` is a `Uint8Array`, a Node.js `Buffer` included. Only the bytes the array views count, so a view's offset and length are respected. The input is never modified.
- **Refusals.** Anything else is refused with a `TypeError`: a string, an `ArrayBuffer`, a `DataView`, another typed array, an array of numbers, `undefined`. There is no text encoding to choose, so no caller gets a different digest for the same text.
- **Purity.** The module imports nothing, uses no host global, and keeps no state between calls. The same bytes give the same digest on every host.
- **No dependencies.** The package declares none.

[Testing](testing.md) says which of these the shipped tests check.
