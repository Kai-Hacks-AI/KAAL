# Guarded File Reconciliation: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A1** [hosting/F1, hosting/F9, hosting/F10]: `reconcile` is exported from `kaal-hosting`'s main entry, beside `update`, with its types `Reconciliation` (the input) and `Reconciled` (the report). `HostingError` gains the code `STALE`, carrying the failing entries as `findings`, each with its `path`, `expected` and `found`.
- **hosting/A2** [hosting/N2, hosting/F6]: It reuses what `update` already relies on. It takes the same lock (`proper-lockfile` on the root's canonical path), stages beside the root, reads back to confirm the host holds the staged files exactly, and does all file access through `graceful-fs`. Files are put in place and kept aside by renames, so the root and its parent must be on one filesystem, as for `update`.
- **hosting/A3** [hosting/F4, hosting/F5]: A reconciliation never walks the whole root. A root is typically a repository, which can be large. Collisions with what is present are checked against the entries of each directory on an entry's path, and links and non-directories are found by looking at each segment without following it.
- **hosting/A4** [hosting/F2] (Option A below, decided on #374): Hosting computes the SHA-256 of present bytes with the host's own (`node:crypto`). Hosting is the host layer, so this is the host's primitive, not a KAAL implementation competing with Foundation's. The digest is standard SHA-256, so it equals what Foundation, Graph and Core compute for the same bytes. Hosting takes no dependency on Foundation, and Foundation none on Hosting.
- **hosting/A5** [hosting/I3, hosting/F7]: What `executable` means on each host is decided only inside `kaal-hosting`. Callers state the mark, and no caller branches on the OS.

## Options considered for hosting/A4

| Option | What happens | Cost |
| --- | --- | --- |
| **A. The host's SHA-256** (chosen) | Hosting hashes through `node:crypto`, as the layer that already owns every host call. | None. It needs no new dependency, and the digests are identical to Foundation's by definition. |
| B. Foundation's SHA-256 | Hosting depends on Foundation's package once it is promoted. | `hosting/C2` waits for Foundation's promotion, and Hosting, which today depends on no KAAL package, gains one. |

**Decision.** Option A. The Owner chose it on #374: Hosting owns host operations, and standard SHA-256 digests stay interoperable without a Foundation dependency.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C1` PLAN, this Change | Hosting | none |
| `hosting/C2` DO: `reconcile`, A1–A5, and the planned tests in Hosting's lanes on all three hosts | Hosting | `hosting/C1` |
| `core/C10` PLAN: Core applies plans through `reconcile` (`core/A7`, `core/A14`) | Core | `hosting/C1` |
| `core/C13` DO: Core's application through `reconcile` | Core | `core/C10`, and `hosting/C2` on `main` |
