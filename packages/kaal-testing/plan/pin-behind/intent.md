# Pin-behind in the acceptance evidence: Intent

This is `testing/C57` (number provisional), a PLAN Change. It ships no code, export or package change. It answers Engineering's request of 9 November 2026, made under `foundation/C19` (a consumer may stay on an older published Foundation, `foundation/I13`), which Foundation's 0.0.2 layout Change needs to pass the Acceptance lane.

**What fails today.** `findings` in `lib/acceptance.mjs` reads npm's record of what each installation host holds. For every held entry whose package the run packed, it emits a `verified failure` when the entry's integrity differs from the packed tarball's (testing/F83 family). Under `foundation/C19` npm nests the registry `@kaihacksai/kaal-foundation` 0.0.1 under Core, Change, Testing and other consumers, while the run packed 0.0.2. That nested older copy is not the packed tarball, so the Acceptance lane fails with "holds ... from registry ..., not the packed tarball", although the Owner's decision (C19) is that this state is allowed and must be visible.

**What is missing.** Testing reports the evidence and never decides a consumer's policy (testing/N2). Today it has one verdict for "a held copy differs from the packed bytes", and that verdict cannot tell a copy a consumer deliberately stays on from a copy that proves the run did not test what it packed.

- **testing/I34**: A nested copy of a packed package that is strictly older than the packed version is reported as `pin-behind`: visible, naming the consumer, the package, the held version and the packed version, and never a verified failure by itself.
- **testing/I35**: Every other way a held copy differs from the packed bytes stays a verified failure: the top-level copy, a nested copy of the same version, a nested copy of a newer version, and any copy whose version cannot be compared. Testing fails closed.

Floors and which packages may be nested are the consumer's policy (Engineering's classifier for the embed scenario, `foundation/F32`). Testing supplies the facts that classifier needs and does not read a floor.
