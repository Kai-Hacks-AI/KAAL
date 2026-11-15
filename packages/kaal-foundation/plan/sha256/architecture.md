# SHA-256: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A1** [foundation/F1–foundation/F3, foundation/N1, foundation/N2]: `packages/kaal-foundation`, a workspace whose package depends on nothing. It is plain ESM with a handwritten declaration file, so it has no build step and Graph, which is plain ESM, consumes it as Core does. Each concern is its own subpath export. SHA-256 is `@kaihacksai/kaal-foundation/sha256` (`lib/sha256.mjs` and `lib/sha256.d.ts`), exporting `sha256(bytes: Uint8Array): string`. A consumer imports only the concern it uses, and a concern can later move without touching the others.
- **foundation/A2** [foundation/F1, foundation/N3]: `foundation/C2` writes the implementation, using the pure FIPS 180-4 SHA-256 in `core/C4`'s `packages/kaal-core/src/sha256.ts` (#357) as its source. That implementation is already tested against the host's SHA-256 at every padding boundary. Foundation's copy records where it came from.
- **foundation/A3** [foundation/I1, foundation/I2]: The dependency position, with Foundation and Hosting as siblings at the bottom:

  ```
  kaal-foundation    kaal-hosting        (siblings; neither depends on the other or on anything above)
         ↑    ↖           ↑
     kaal-graph ──────────┘
         ↑
     kaal-core
         ↑
     kaal-sealing (full)
  ```

  Each migration is a separate Change, owned by its Capability:

  | Change | Owner | Depends on |
  | --- | --- | --- |
  | `foundation/C1` PLAN, this Change | Foundation | |
  | `foundation/C2` DO: the implementation, GREEN tests, `npm test` | Foundation | `foundation/C1` |
  | promotion `kaal/foundation` → main | Foundation | `foundation/C2` |
  | a Graph Change: `sha256` and Node ids through Foundation, all ids unchanged | Graph | the promotion |
  | a Core Change: `core/C4`'s `src/sha256.ts` replaced by Foundation | Core | the promotion, `core/C4` on main |
  | a Sealing Change: `artifactId` through Foundation, all ids unchanged | Sealing | the promotion |

  Hosting needs no hash for this Change. Whether its guarded file reconciliation uses Foundation is decided in Hosting's own PLAN.

## Name

Core already uses "foundation" for its genesis Nodes: the Kernel's `## Foundation` section, `foundation()`, the `Foundation` type and `kaal init`'s "already holds the foundation". The Capability's name is the Owner's, so this Change keeps it and asks whether Core's term should change in a Core Change, or the two should coexist.
