# Guarded File Reconciliation: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A1** [hosting/F1, hosting/F9, hosting/F10, hosting/F11, hosting/F12]: `reconcile` is exported from `kaal-hosting`'s main entry, beside `update`, with its types `Reconciliation` (the input) and `Reconciled` (the report). `HostingError` gains the code `STALE`, carrying the failing entries as `findings`, each with its `path`, `expected` and `found`. It also gains the code `UNRESTORED` (hosting/F11), carrying the recovery location as `kept` and the original failure as `cause`. A new exported type, `Leftover` `{ path: string; error: unknown }`, describes a directory left beside the root (hosting/F12). `Reconciled` gains an optional `leftovers?: Leftover[]`, and `HostingError` gains the same optional `leftovers`. A rejection with an error that is not a `HostingError` carries `leftovers` as a property added to that same error.
- **hosting/A2** [hosting/N2, hosting/F6, hosting/F11, hosting/F12]: It reuses what `update` already relies on. It takes the same lock (`proper-lockfile` on the root's canonical path), stages beside the root, reads back to confirm the host holds the staged files exactly, and does all file access through `graceful-fs`. Files are put in place and kept aside by renames, so the root and its parent must be on one filesystem, as for `update`.
- **hosting/A3** [hosting/F4, hosting/F5, hosting/F13]: A reconciliation never walks the whole root. A directory turned into a file is the one subtree it reads in full, to check that nothing under it would stay. A root is typically a repository, which can be large. Collisions with what is present are checked against the entries of each directory on an entry's path, and links and non-directories are found by looking at each segment without following it.
- **hosting/A4** [hosting/F2] (Option A below, decided on #374): Hosting computes the SHA-256 of present bytes with the host's own (`node:crypto`). Hosting is the host layer, so this is the host's primitive, not a KAAL implementation competing with Foundation's. The digest is standard SHA-256, so it equals what Foundation, Graph and Core compute for the same bytes. Hosting takes no dependency on Foundation, and Foundation none on Hosting.
- **hosting/A5** [hosting/I3, hosting/F7]: What `executable` means on each host is decided only inside `kaal-hosting`. Callers state the mark, and no caller branches on the OS.
- **hosting/A6** [hosting/F14]: `Reconciliation` gains an optional `expect: Expectation[]`, where `Expectation` is a new exported type `{ path: string; expect: string }`. Because it is optional, every existing caller and every existing report is unchanged. Expected paths go through the same path checks and the same per-path read (`present`) as writes and removals, and they never enter the apply, the rollback or the report.

## Options considered for hosting/A4

| Option | What happens | Cost |
| --- | --- | --- |
| **A. The host's SHA-256** (chosen) | Hosting hashes through `node:crypto`, as the layer that already owns every host call. | None. It needs no new dependency, and the digests are identical to Foundation's by definition. |
| B. Foundation's SHA-256 | Hosting depends on Foundation's package once it is promoted. | `hosting/C2` waits for Foundation's promotion, and Hosting, which today depends on no KAAL package, gains one. |

**Decision.** Option A. The Owner chose it on #374: Hosting owns host operations, and standard SHA-256 digests stay interoperable without a Foundation dependency.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C1` PLAN | Hosting | none |
| `hosting/C3` PLAN amendment: what F6 restores, and F11, the rollback that fails; hosting/T12 | Hosting | `hosting/C1` |
| `hosting/C2` DO: `reconcile`, A1–A5, and the planned tests in Hosting's lanes on all three hosts | Hosting | `hosting/C1`, `hosting/C3` |
| `hosting/C4` PLAN amendment: F12, a cleanup failure is reported as `leftovers` and never decides the outcome; hosting/T13 proving hosting/D1 | Hosting | `hosting/C2` |
| `hosting/C5` DO: fix hosting/D1 and move hosting/T13 into Hosting's lanes | Hosting | `hosting/C4` |
| `hosting/C6` PLAN amendment: F13, a file and a directory exchange places in one reconciliation; hosting/T14–T17 | Hosting | `hosting/C5` |
| `hosting/C7` DO: F13, and hosting/T14–T17 in Hosting's lanes | Hosting | `hosting/C6` |
| `hosting/C8` PLAN amendment: F14 and I4, read-only expectations; hosting/T18–T20 | Hosting | `hosting/C7` |
| `hosting/C9` DO: F14, and hosting/T18–T20 in Hosting's lanes | Hosting | `hosting/C8` |
| `core/C10` PLAN: Core applies plans through `reconcile` (`core/A7`, `core/A14`) | Core | `hosting/C1` |
| `core/C13` DO: Core's application through `reconcile` | Core | `core/C10`, and `hosting/C2` on `main` |

## Options considered for hosting/F13

Core asked for this under the Owner's #399 review: a filesystem primitive Core lacks belongs in Hosting, not in a second Hosting implementation inside Core.

| Option | What happens | Cost |
| --- | --- | --- |
| **A. Two nesting shapes in one reconciliation** (proposed) | Core states the removals and writes of a file↔directory change in one `reconcile`, and one lock, one precondition check and one rollback cover all of it. | `reconcile` accepts two exact nesting shapes, and reads in full only a directory being turned into a file. |
| B. A separate `replace` operation | Core calls a dedicated operation for each kind change. | Another entry point with its own lock and rollback, and a kind change still cannot be guarded together with the rest of an installation. |
| C. Leave it to the caller | Core keeps two reconciliations and compensates between them. | The caller re-implements rollback, which the Owner ruled out on #399. |

## Options considered for hosting/F14

The Owner asked for this on #472, as a separately owned Hosting Change. Core's `upgrade` verifies an Engine assembled from files it read, but it guards only the files it writes or removes. A file it relied on and left alone can change between verification and reconciliation.

| Option | What happens | Cost |
| --- | --- | --- |
| **A. A read-only `expect` list** (proposed) | Core lists every file it relied on with the digest it read, or `"absent"`. Hosting checks them with the writes and removals, under one lock, and never touches them. | One optional field, and one more kind of entry in the path checks. |
| B. Rewrite relied-on files with their own bytes | Each relied-on file becomes a write whose bytes equal what is there. | It touches files that did not change, and a write without `executable` strips an executable mark (hosting/F7). Core met exactly this on #472. |
| C. The caller re-checks before calling | Core reads the files again just before `reconcile`. | A change between that check and the lock still goes unseen, so nothing becomes atomic. The Owner ruled this out on #472. |
