# A package on main equals its npmjs release: how Packaging defines the match (packaging/C22)

PLAN only, from Kai's ruling of 4 Nov: *Packaging owns the concept that a package on `main` is its npmjs release. Engineering owns the Defect and the Ratchet that drives it down. We need to see when we are out of line. Checking for a folder is not enough: the content must match npmjs.* It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication. Packaging's own 0.0.1 stays private.

## Problem

Today `packages/` on `main` holds many package folders, but only Foundation 0.0.1 and Guard 0.0.4 are on npmjs. The others (Hosting, Change, Core, Graph, Review, Testing, engineer-skill) have folders, most are unscoped on `main`, and nothing shows that a folder and a release are the same thing. A folder check cannot show it: a folder can exist with no release, a release can predate the folder's content, and a name can differ in scope.

## Definition of "matches"

For a package folder `P` on `main` (name `N`, version `V` read from its `package.json`), `P` matches npmjs when **all** hold:

1. **Name.** `N` is the name of a release on npmjs, with the scope the Owner chose for it (#622).
2. **Version.** `V` exists on npmjs under `N`.
3. **Content.** The files `npm pack` delivers for `P` are exactly the files in the published tarball of `N@V`: the same set of paths, and for each path the same bytes (SHA-256 of the file, not of the tarball). Modes and tar framing are not compared.

The tarball digest is deliberately **not** the test: a repacked artifact can differ in bytes (compression, ordering, npm version) while delivering identical files. Per-file digests make the comparison independent of the packing tool and say which file differs.

A private package (`"private": true`, for example `kaal-packaging`) is **not expected** on npmjs. It is reported as `private`, not as a mismatch, and a private package that **does** have a release is itself a finding.

## Result: five states, never silent

For each package, one of:

- **in line**: name, version and every file digest match.
- **out of line**: at least one finding of a kind below.
- **private**: declared private and absent from npmjs, as expected.
- **release-pending**: the folder raised its version in a repository promotion that the Owner explicitly marked as preceding its separately authorized npm publication, and the exception below still holds. Not a mismatch, and never shown as in line.
- **unknown**: the registry or the tool could not be read (offline, `npm` missing, refused). Unknown is never reported as in line, and a package is never assumed to match because nothing was compared.

Finding kinds (each is one stable finding, carrying evidence):

| Kind | Meaning |
| --- | --- |
| `unpublished` | no release of `N` exists on npmjs |
| `unreleased-version` | releases of `N` exist, but not `V` (main is ahead) |
| `name-differs` | the folder's name or scope is not the name of the release it is claimed to be |
| `content-differs` | `N@V` exists but its file set or a file's bytes differ; evidence lists paths added, removed and changed, with both SHA-256 values |
| `private-published` | a private package has a release |
| `pending-drift` | a folder with a valid `release-pending` record changed its content after the record bound it |
| `release-overdue` | a `release-pending` record's deadline passed with V still absent from npmjs |

## Report format (aligned with Engineering's Defect and Ratchet)

The report is an **observation list, not a verdict**, the same shape as Hosting's boundary findings: no severity, and a question for whoever decides. Each finding has a stable id `kaal-packaging/<kind>@<folder>`, keyed on the **folder** (its path under `packages/`) and the kind, and the fields `folder`, `name`, `version`, `kind`, `evidence`, and `question`. The id carries neither the package name nor the version, so a rename to a scoped name or a version bump leaves the same finding the same finding, and the Ratchet does not see one removed and another added. A folder has at most one finding of each kind; what differs (names, versions, paths, digests) is evidence. The report as a whole is deterministic JSON (sorted by id) with a text rendering.

Engineering owns what happens next: a Defect record per finding (or per collapsed pattern), and the Ratchet that lets the accepted set only shrink. To serve the Ratchet, Packaging also supplies `compareReports(before, after)`: findings added, removed and unchanged by id. A grown set is what the Ratchet rejects. Packaging does not decide acceptance and does not rank findings. **I have not seen Engineering's defect-record format (#991).** The field names above are a proposal to be aligned with it before the DO, not a claim that they already fit.

## The `release-pending` exception (Owner's explicit rule)

A version-raising promotion to `main` comes **before** its separately authorized npm publication. Without an exception, the intended sequence would show every such folder as `unreleased-version` at the wrong stage. The exception is explicit, bound, and expires. Packaging never creates it and never authorizes publication.

- **A pending record**, supplied by the caller (as `release` is), one per folder: `folder`, `name`, `version` V, the **artifact binding**, the promotion that raised the version (PR or commit), the Owner's authorization (a reference to the decision), the date it began, and a **deadline**. A record with no deadline, no authorization reference or no artifact binding is invalid and is ignored; the finding it would have excused stands.
- **When it begins:** at the promotion merge to `main` that raises the version, and only if the record exists then. It never begins before the folder is on `main` and never applies by default. It applies **only** to `unreleased-version` (earlier releases of the name exist and V is newer). `unpublished` (the name was never published) is **not** excused: it stays a finding in Engineering's accepted ratchet baseline, as the CPO asked.
- **What it binds:** the exact name, the exact version V and the artifact, meaning the **content digest** of the folder as `npm pack` delivers it at the promotion: the SHA-256 of the sorted list of each file's path and per-file SHA-256 (Foundation). It is not the tarball digest, for the reason given above.
- **While valid:** the folder is reported `release-pending`, with its age and deadline, and no finding. It stays valid only while V is still absent from npmjs, the folder's content digest still equals the bound one, and the deadline has not passed.
- **How it ends, each ending explicit:**
  - V appears on npmjs: the pending state ends at once and the ordinary comparison runs. A published artifact that differs is `content-differs`, so a failed or wrong publication surfaces immediately, not at the deadline.
  - The folder's content changes while pending: finding `pending-drift` (main no longer matches what was authorized to be published), because the publication would not equal main.
  - The deadline passes with V still absent: finding `release-overdue`. It is a new finding in the Ratchet's set, so it becomes an Engineering Defect rather than staying quietly pending. Publication that never occurs is therefore always visible.
- **The clock is an input.** `now` is caller-supplied, so a report is deterministic and a test needs no real time.

## Proposed Change

**C22: registry match.**

1. `registryMatch(packageDir, { work, release })` judges **one** package and returns its state and findings. `release(name, version)` is a caller-supplied function that resolves to `{ versions, tarball }`: `versions` is **every published version of `N`** (empty when the name was never published), and `tarball` is the path of `N@V` fetched into `work` when `V` is among them. It may instead report unreadable. Name-level status is separate from `N@V`, so the report can tell `unpublished` (no versions) from `unreleased-version` (versions exist, `V` absent), and a private folder with any release is `private-published` even when `V` is not one of them. The default fetches through Hosting (`npm view N versions`, then `npm pack N@V`, with the same cache and log isolation as `measure`). The caller-supplied function is how tests and offline runs avoid the network, and keeps Packaging free of a registry client.
2. File bytes are read from both tarballs with Packaging's existing bounded tarball reading (`packaging/N4` path refusals apply) and digested with Foundation's SHA-256. No new hard dependency: Packaging already uses Hosting for the OS boundary and Foundation for KAAL digests.
3. `registryMatchAll(root, { work, release })` sweeps the workspace folders listed in the root `package.json`, one result per folder, and a folder listed twice or unreadable is reported, not skipped. The sweep reads folders only to know where packages are; the judgment never rests on the folder.
4. Command: `kaal-packaging registry-match [dir | --all] [--json]`. Exit status separates "in line or private" from "findings" from "unknown".
5. Limits stated up front: it does not enumerate npmjs, so a release with no folder on `main` is outside it; the check starts from what `main` declares. Whether a release was *authorized* is not judged.

## Draft identifiers (provisional; reserved to avoid C10, C17 to C21)

| Id | Statement |
| --- | --- |
| packaging/F31 | `registryMatch` states for one package folder one of in line, out of line, private or unknown, from name, version and per-file content against the npmjs release of that name and version. |
| packaging/F32 | An unreadable registry or tool is unknown, never in line. A private package is private, and a private package with a release is a finding. |
| packaging/F33 | The report is a deterministic finding list with a stable id per finding and a question for the decider, no severity, plus `compareReports` for the Ratchet. |
| packaging/F34 | `registryMatchAll` judges every workspace folder and reports one that is unreadable or listed twice. |
| packaging/F38 | A valid `release-pending` record excuses only `unreleased-version`, binds the exact name, version and content digest, and is reported as `release-pending`. It ends when V appears (ordinary comparison), becomes `pending-drift` when the content changes, and `release-overdue` at its deadline. An invalid record excuses nothing. `unpublished` is never excused. |
| packaging/A23 | One comparison: per-file SHA-256 over two tarballs. No second engine, and no registry client in Packaging: the release arrives through the caller-supplied function. |

Test Case ids T68 to T77 and T87 to T92 are reserved for this Change (T78 to T86 belong to C23). Identifier numbers may move at the DO if another Change takes them first.

## Test Cases (RED first, then DO)

Fixtures only, with a fake `release` function. No test touches the network.

- **T68** A folder whose packed files equal the release's: in line.
- **T69** One file's bytes differ, one path added, one removed: out of line `content-differs`, evidence naming each path and both digests.
- **T70** Same files, differently repacked tarball (different compression and entry order): still in line. This is the case that rules out comparing tarball digests.
- **T71** No release of the name: `unpublished`. Releases exist but not `V`: `unreleased-version`. The fixture `release` returns `versions` for both, so the two are told apart by the lookup, not guessed.
- **T72** Folder named unscoped, release published under a scope: `name-differs`.
- **T73** `private` package, no release: `private`. `private` package with a release: `private-published`, including when the releases exist but `V` is not among them.
- **T74** `release` reports unreadable or the tool is missing: `unknown`, never in line.
- **T75** The report is byte-identical across runs and orders; `compareReports` returns added, removed and unchanged ids and flags a grown set. A folder renamed to a scoped name, or bumped in version, keeps its finding id for the same kind.
- **T76** `registryMatchAll` over a fixture workspace with a missing folder and a duplicated entry: both reported.
- **T77** A hostile tarball path in the release is refused as `packaging/N4` requires, and is reported as unknown, not as a mismatch.
- **T87** A valid pending record, V absent from npmjs, content digest equal, deadline ahead: `release-pending`, not a finding, with age and deadline reported.
- **T88** A record with no deadline, or no authorization reference, or no artifact binding: ignored, `unreleased-version` stands. A record for a folder whose name was never published: `unpublished` stands (never excused).
- **T89** V appears on npmjs with equal files: in line, pending ended. V appears with a different file: `content-differs`, at once and before the deadline.
- **T90** The folder's content changes after the record bound it: `pending-drift`.
- **T91** The deadline passes with V absent: `release-overdue`, and `compareReports` flags it as a grown set. The same inputs with a different `now` give the report each would, and nothing reads the real clock.
- **T92** A pending record never applies before the folder is on `main`, and never changes the id of any other finding.

## Decisions (Kai, 4 Nov)

1. **Unpublished packages count in the Ratchet's accepted set (A).** `unpublished` is a finding like any other, so the accepted set can only shrink as releases ship, and every folder that is not yet a release stays visible.
2. **The folder's own `package.json` name is the claim (A).** An Owner namespace decision (#622) changes that file. A folder never meant for npm is `private`. There is no second table of expected names.

Both are now part of the definition above and need no further question.

## Sequencing and ownership

- Packaging owns this PLAN and the generic checker. Engineering owns the Defect, the Ratchet, and when the sweep runs (for example in the release check on `main`). Hosting owns the `npm` call.
- Order: this PLAN, then RED (T68 to T77), then DO. It needs nothing from `main`. Nothing here changes #686's promotion scope: this is PLAN text under `plan/`, which does not ship.
