# SHA-256: Testing

The planned outer tests live in `packages/kaal-foundation/test/plan/sha256.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `foundation/C2` turns them GREEN, adds them to the package's `npm test`, and may add Code tests of its own. The reference is the host's `node:crypto`, which the tests may use and the module may not.

| Test | Checks | Loop |
| --- | --- | --- |
| foundation/T1: the FIPS 180-4 examples (empty, `abc`, the 448- and 896-bit messages, a million `a`) give their published digests | foundation/F1 | Requirements |
| foundation/T2: every length from 0 to 1024 bytes, which crosses every padding boundary, equals the reference | foundation/F1, foundation/N3 | Requirements |
| foundation/T3: seeded pseudo-random inputs up to 1 MiB equal the reference | foundation/F1, foundation/N3 | Requirements |
| foundation/T4: a `Buffer` and a `Uint8Array` of the same bytes agree, a view counts only its own bytes, the input is unchanged, and repeated calls agree | foundation/F2, foundation/N1 | Requirements |
| foundation/T5: a string, `ArrayBuffer`, `DataView`, `Uint16Array`, array of numbers or `undefined` is refused with a `TypeError` | foundation/F3 | Requirements |
| foundation/T6: every Node KAAL ships (`.kaal/` and every package's `payload/`) hashes to the reference, so no Node id changes | foundation/N3, foundation/I2 | Requirements |
| foundation/T7: the module imports nothing and names no host global, and the package declares no dependencies | foundation/N1, foundation/N2 | Architecture |
| foundation/T8: the package's README states that each concern's ownership is provisional | foundation/N4 | Architecture |

`foundation/I1` and `foundation/I2` are validated when the Graph, Core and Sealing Changes adopt the hash and their existing evidence (Node ids, the pinned Kernel hash, Seal refs) stays unchanged.
