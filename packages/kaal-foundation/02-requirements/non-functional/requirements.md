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

## The package as a whole

- **foundation/N3** [foundation/I2]: **The reference digest.** Its digest equals the host's reference SHA-256 for every input: the FIPS 180-4 examples, every length that crosses a padding boundary, large inputs, and every Node KAAL ships.
- **foundation/N6** [foundation/I4]: **Dependency-free, tests included.** Foundation stays dependency-free. The delivered Cases, the verifier and the collector import only Node's built-in modules and the package itself.
- **foundation/N7** [foundation/I7]: **No OS knowledge, in tests either.** No file in Foundation, tests included, reads `process.platform`, names `win32`, writes or runs a `.cmd` launcher, or passes `shell`. npm runs as its CLI script under the running Node, named by `npm_execpath`. The command reads files with `node:fs` only. Hosting is the only OS boundary.
- **foundation/N8** [foundation/I7]: **Thin commands.** `kaal-foundation` decides nothing the library does not. Its digests are `sha256.mjs`'s, and `verify` is `dist/test/package-check/verify.mjs`. The command adds argument parsing, reading, printing and exit statuses only.
- **foundation/N9** [foundation/I7, foundation/I2]: **Nothing a digest user computes changes.** `sha256.mjs` and `sha256.d.ts` under `05-src/skills/kaal-foundation/scripts/` are byte for byte the ones `main` holds. The package still declares no dependency (foundation/N2, foundation/N6).
- **foundation/N10** [foundation/I7]: **An independent check.** The installed verification checks the manifest with the host's SHA-256 (`node:crypto`), never with Foundation's own library, so a broken library cannot hide itself. Foundation writes the manifest and the host checks it on every installation. The verifier keeps no SHA-256 implementation of its own.
- **foundation/N11** [foundation/I8]: **Repository data only.** The ownership claim does not ship, and the packed file list, `verify.json` and every digest are unchanged by it.
- **foundation/N12** [foundation/I8]: **Only its own folder.** No claim of Foundation's names a path outside `packages/kaal-foundation/`. In particular, Foundation does not claim the repository's root `package.json` or `package-lock.json`.
