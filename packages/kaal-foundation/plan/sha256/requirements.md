# SHA-256: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **foundation/F1** [foundation/I1, foundation/I2]: `sha256(bytes)` returns the SHA-256 of exactly `bytes`, as FIPS 180-4 defines it, written as 64 lowercase hexadecimal digits.
- **foundation/F2** [foundation/I2]: `bytes` is a `Uint8Array`, including a Node.js `Buffer`, which is one. Only the bytes the array views count, so a view's offset and length are respected. The input is never modified.
- **foundation/F3** [foundation/I1]: Any other input is refused with a `TypeError`: a string, an `ArrayBuffer`, a `DataView`, another typed array, an array of numbers, `undefined`. There is no text encoding to choose, so no caller can get a different digest for the same text. A caller that has text encodes it as UTF-8 first, which is what `node:crypto` does with a string.

## Nonfunctional

- **foundation/N1** [foundation/I1]: The module is pure and deterministic. It imports nothing, neither a host module nor a package, and it uses no host global such as `crypto`, `process` or `Buffer`. The same bytes give the same digest on every host, and calls share no state.
- **foundation/N2** [foundation/I1]: The package has no dependencies of any kind, so it can sit beneath Hosting, Graph, Core and Sealing.
- **foundation/N3** [foundation/I2]: Its digest equals the host's reference SHA-256 for every input: the FIPS 180-4 examples, every length that crosses a padding boundary, large inputs, and every Node KAAL ships today.
- **foundation/N4** [foundation/I3]: The package states, for each concern it holds, that Foundation's ownership is provisional, and that the concern moves by a reviewed Change once its specialized home is known.

## Not in this Change

- Adopting the hash elsewhere. Graph, Core and Sealing each migrate in a Change of their own, owned by that Capability (`foundation/A3`). Guard stays independent and is outside Guard 0.0.2.
- Delivery. The package is `private` and is not published. Its name, `@kaihacksai/kaal-foundation`, is provisional until the package and delivery contract is reviewed, and publication is the Owner's decision.
- A Foundation KAAL Capability Node. That is planned with the delivery contract.
- Speed. A pure implementation is slower than the host's native one. Graph's migration measures admission with Core's `bench/admission.mjs` and reports the difference before Graph adopts it.
