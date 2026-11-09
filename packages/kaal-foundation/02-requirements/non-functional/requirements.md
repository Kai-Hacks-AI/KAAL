# Non-functional requirements

## The digest

- **foundation/N1** The module imports nothing, uses no host global, and keeps no state between calls. The same bytes give the same digest on every host.
- **foundation/N2** The package declares no dependency of any kind.
- **foundation/N4** The README states, for each concern, that Foundation's ownership of it is provisional.

## Foundation's own Capability declaration

- **foundation/N15** Normal packing ships committed bytes without repair. `dist/` is
  built reproducibly from committed sources by `prepack` (byte-for-byte copies, so
  building twice is equal; amended by foundation/C20). There is no prepare or
  install hook, generated declaration or runtime dependency.
  The publisher explicitly regenerates the manifest for review and checks it
  before release. Git never rewrites the authoritative declaration's bytes.
- **foundation/N16** The repository ownership claim does not ship and claims only
  `packages/kaal-foundation/`. The Node's identity is its exact content, independent
  of npm version. Foundation 0.0.2 preserves the existing SHA-256 API and CLI;
  published 0.0.1 remains immutable.
- **foundation/N20** **Read only.** The scan reads files. It never imports, requires or runs what it reads, writes nothing, touches no network and starts no process.
- **foundation/N21** **No new reach.** The scan uses only Node's built-in modules and the `sha256.mjs` shipped beside it. The package still declares no dependency (foundation/N2). `scripts/sha256.*` are unchanged (foundation/N9).
- **foundation/N22** **No hard-coded target and no hard-coded role.** Neither the scan, nor the record, nor any shipped document names a repository path, another package's directory, or a decision role. A new target needs no change to Foundation.
