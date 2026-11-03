# Foundation digest-ownership boundary

foundation/C18 PLAN. Input to the Owner's open question "Sealing vs Foundation and Packaging digests".

- **foundation/I12**: **Foundation supplies the digest of given bytes; the meaning of an identity belongs to the
  capability that carries it.** Which bytes a file or directory identity covers, their order, any domain
  separation, and what a Seal binds are meaning. Foundation's SHA-256 takes bytes and returns 64 hex digits
  (foundation/I1, foundation/F1), and adds no knowledge of files, directories, streams or artifacts.

## Why now

Three consumers ask the same question from different sides, observed 2026-11-03:
- **Sealing** (`kaal/sealing`, M1): file and directory identity and Seals. Its script imports `sha256` from
  `kaal-core` and builds the directory stream itself. The portfolio view flags overlap with Foundation's
  SHA-256 ownership and an Owner decision before any thread starts.
- **Process** (#930): wants a SHA-256 to compare shipped files with a manifest. Foundation answered on #930:
  declare an exact-pin runtime dependency and import `./sha256`.
- **Packaging**: package digests and the manifest check in installed verification.

## Foundation's position (recommendation, not a decision)

1. Foundation keeps exactly what it holds: the byte-level SHA-256 (foundation/I1, foundation/I2). It is not a
   utilities bucket (foundation/I3).
2. Sealing, Packaging and Process each build their identity on `@kaihacksai/kaal-foundation/sha256` through a
   declared exact-pin dependency. None copies the implementation, and none uses `node:crypto` for a KAAL digest.
3. No file, directory or stream helper moves into Foundation. It would carry meaning (order, separation,
   what counts as the artifact) that is Sealing's to define and change.
4. Where Core's `sha256` is currently what a consumer imports, Core's own relationship to Foundation's
   (a re-export or a second copy) is Core's to state. foundation/I1 requires one KAAL SHA-256.

This PLAN does not decide Sealing's place, a package, or a capability, and reverses no Owner decision.
