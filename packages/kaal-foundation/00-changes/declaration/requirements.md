# Declaration delivery: Requirements

- **foundation/F25** [foundation/I10]: Foundation 0.0.2 ships the exact C12
  `capability/Foundation.md` bytes. The stable public data export
  `@kaihacksai/kaal-foundation/capability` resolves to that file. It is UTF-8
  Markdown data, not an executable module. Node's public resolution followed by
  the caller's approved byte reader acquires it; no source-checkout path, deep
  import, metadata inference, Node synthesis or unscoped fallback is needed.
  There is one declaration, not a generated second copy. Its content digest and
  type reference remain those recorded in intent.md.
- **foundation/F26** [foundation/I10]: The declaration is listed in the committed
  verification manifest and exact documented inventory. Installed verification
  checks it independently against the manifest, then a delivered case checks
  its accepted name/type/content identity. Changed or missing bytes with the
  committed manifest give cannot verify. Wrong declaration bytes behind a
  refreshed manifest fail the delivered behavioral case, never verified.
- **foundation/F27** [foundation/I10]: This is declaration-only delivery.
  Installing, resolving, reading, upgrading or uninstalling the npm package
  creates or changes no Engine, registration or Foundation installation record.
  Core explicitly binds this package export to CASE kind Capability, validates
  and registers the exact owner bytes, and owns the registration operation and
  its Engine lifecycle. Foundation supplies no installation contract or
  Foundation-owned state file for Core to invent or write on its behalf.
  Reading bytes proves neither admission nor use. npm upgrade/removal does not
  silently replace/remove an already registered snapshot: a later explicit Core
  operation must apply Core's admission, preservation and refusal contracts.
  If Core's implementation needs additional owner lifecycle authority, settle
  that in an owner-reviewed contract before its initialization DO.
- **foundation/N15** [foundation/I10]: Source and normal `npm pack` use the
  committed declaration and manifest without repair. There is no new build or
  prepack hook, install hook, generated declaration or runtime dependency.
  Explicit `npm run manifest` regenerates the manifest for review; its existing
  `--check` rejects stale state. Authoritative declaration bytes survive Git
  checkout unchanged, including a Windows autocrlf checkout.
- **foundation/N16** [foundation/I10]: `ownership.kaal.json` stays repository-only
  and claims exactly packages/kaal-foundation/. Published 0.0.1 is unchanged;
  the proposed package version is exactly 0.0.2. SHA-256 library bytes and its
  public API, bin ownership and explicit source/installed test entry remain.

## Explicit amendments requiring independent PLAN review

| Existing statement/assertion | Exact bounded amendment | Preserved discriminator |
| --- | --- | --- |
| C3 F4 and publisher T9 `assert.equal(m.version, "0.0.1")` | Candidate version is exactly `0.0.2`; change only that literal and matching title wording | Scoped name, publishability and every no-dependency assertion remain |
| C11 N11, A11 and T36 Node exclusion | Capability Node now ships at the same path and is in manifest.files; ownership claim still never ships | T35 stays byte-for-byte unchanged; T36 still rejects an exported claim, any path outside Foundation, and both root-file claims |
| T36 `for (const path of [NODE, CLAIM])` exclusion loop | Exclude CLAIM alone, preserving the capability-folder guard by replacing it with an explicit exact inclusion assertion for NODE and rejecting any additional capability entry | Packing ownership.kaal.json or another capability file still fails; packed NODE and manifest NODE must both be present |
| Shipped docs/testing.md C11 line | Distinguish the shipped owner declaration from the repository-only claim | Existing publisher attribution check and full source/installed distinction remain |

The historical C11 PLAN documents remain historical evidence; this PLAN is the
explicit successor for N11/A11. T36's title and comment must identify that
amendment. No other existing Case or assertion is changed. C13's consumer
boundary commands, result-observation changes and their tests remain separate.
