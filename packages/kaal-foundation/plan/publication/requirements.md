# Publication Readiness: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **foundation/F4** [foundation/I4, foundation/I5]: The package is publishable. `package.json` is not marked `private`, keeps the name `@kaihacksai/kaal-foundation` and the version `0.0.1`, and declares no dependencies of any kind (`foundation/N2`).
- **foundation/F5** [foundation/I4]: The packed artifact holds exactly `package.json`, `README.md`, `LICENSE`, `lib/sha256.mjs` and `lib/sha256.d.ts`. Installed from that tarball into a fresh directory outside any KAAL repository, `@kaihacksai/kaal-foundation/sha256` imports and gives the FIPS 180-4 digest of `abc`.
- **foundation/F6** [foundation/I4, foundation/I5]: The README tells a consumer how to install the package (`npm install @kaihacksai/kaal-foundation`), and no longer says that the package is private or not published. It states that each concern's ownership is provisional (`foundation/N4`).

## Nonfunctional

- **foundation/N5** [foundation/I5]: Readiness changes nothing a consumer computes. `lib/` is unchanged, so every digest stays the same.

## Not in this Change

- Publication, the version and the release workflow. They are the Owner's.
- Delivered tests inside the installed package. kaal-core 0.0.1 ships them to meet Guard's consumer bar (`core/C28`). Whether Foundation 0.0.1 must as well is a question for the Owner on this PR. The default here is no: Foundation is a single pure function whose tests are the publisher's.
- A Foundation KAAL Capability Node, which `foundation/C1` left for the delivery contract. It is not needed to install or use the package, so it stays a later Change.
- Renaming Core's own "foundation" term (`foundation/C1`, Name).
