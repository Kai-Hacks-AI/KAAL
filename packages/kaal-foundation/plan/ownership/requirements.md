# Foundation's ownership claim: Requirements

Each Requirement names, in brackets, the Intents it serves. The claim's format is Testing's (`kaal-testing/attribution`), and the Capability Node's form is Core's. This PLAN restates neither.

## Functional

- **foundation/F20** [foundation/I8]: **Capability Node.** `packages/kaal-foundation/capability/Foundation.md` is a Node named `Foundation` and typed by KAAL Capability, under the same type reference as Core's own Node (`packages/kaal-core/capability/Core.md`). Its body states Foundation's responsibility as the README does.
- **foundation/F21** [foundation/I8]: **Ownership claim.** `packages/kaal-foundation/ownership.kaal.json` holds exactly `owner` and `paths`.
  - `owner` is `{ kind: "capability", name: "Foundation", id }`, where `id` is the Node's identity: the SHA-256 of `capability/Foundation.md`'s bytes, as for Core and Testing.
  - `paths` is exactly `["packages/kaal-foundation/"]`.

## Nonfunctional

- **foundation/N11** [foundation/I8]: **Repository data only.** Neither the Node nor the claim ships. `files` in `package.json` stays as it is, so the packed file list, `test/verify.json` and every digest are unchanged.
- **foundation/N12** [foundation/I8]: **Only its own folder.** No claim of Foundation's names a path outside `packages/kaal-foundation/`. In particular, Foundation does not claim the repository's root `package.json` or `package-lock.json`.
