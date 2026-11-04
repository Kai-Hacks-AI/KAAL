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

## Result: four states, never silent

For each package, one of:

- **in line**: name, version and every file digest match.
- **out of line**: at least one finding of a kind below.
- **private**: declared private and absent from npmjs, as expected.
- **unknown**: the registry or the tool could not be read (offline, `npm` missing, refused). Unknown is never reported as in line, and a package is never assumed to match because nothing was compared.

Finding kinds (each is one stable finding, carrying evidence):

| Kind | Meaning |
| --- | --- |
| `unpublished` | no release of `N` exists on npmjs |
| `unreleased-version` | releases of `N` exist, but not `V` (main is ahead) |
| `name-differs` | the folder's name or scope is not the name of the release it is claimed to be |
| `content-differs` | `N@V` exists but its file set or a file's bytes differ; evidence lists paths added, removed and changed, with both SHA-256 values |
| `private-published` | a private package has a release |

## Report format (aligned with Engineering's Defect and Ratchet)

The report is an **observation list, not a verdict**, the same shape as Hosting's boundary findings: no severity, and a question for whoever decides. Each finding has a stable id `kaal-packaging/<kind>@<package>@<version>` and the fields `package`, `folder`, `name`, `version`, `kind`, `evidence`, and `question`. The report as a whole is deterministic JSON (sorted by id) with a text rendering.

Engineering owns what happens next: a Defect record per finding (or per collapsed pattern), and the Ratchet that lets the accepted set only shrink. To serve the Ratchet, Packaging also supplies `compareReports(before, after)`: findings added, removed and unchanged by id. A grown set is what the Ratchet rejects. Packaging does not decide acceptance and does not rank findings. **I have not seen Engineering's defect-record format (#991).** The field names above are a proposal to be aligned with it before the DO, not a claim that they already fit.

## Proposed Change

**C22: registry match.**

1. `registryMatch(packageDir, { work, release })` judges **one** package and returns its state and findings. `release(name, version)` is a caller-supplied function that fetches a published tarball into `work` (default: `npm pack N@V` through Hosting, with the same cache and log isolation as `measure`), or reports not-found, or reports unreadable. The caller-supplied function is how tests and offline runs avoid the network, and keeps Packaging free of a registry client.
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
| packaging/A23 | One comparison: per-file SHA-256 over two tarballs. No second engine, and no registry client in Packaging: the release arrives through the caller-supplied function. |

Test Case ids T68 to T77 are reserved for this Change. Identifier numbers may move at the DO if another Change takes them first.

## Test Cases (RED first, then DO)

Fixtures only, with a fake `release` function. No test touches the network.

- **T68** A folder whose packed files equal the release's: in line.
- **T69** One file's bytes differ, one path added, one removed: out of line `content-differs`, evidence naming each path and both digests.
- **T70** Same files, differently repacked tarball (different compression and entry order): still in line. This is the case that rules out comparing tarball digests.
- **T71** No release of the name: `unpublished`. Releases exist but not `V`: `unreleased-version`.
- **T72** Folder named unscoped, release published under a scope: `name-differs`.
- **T73** `private` package, no release: `private`. `private` package with a release: `private-published`.
- **T74** `release` reports unreadable or the tool is missing: `unknown`, never in line.
- **T75** The report is byte-identical across runs and orders; `compareReports` returns added, removed and unchanged ids and flags a grown set.
- **T76** `registryMatchAll` over a fixture workspace with a missing folder and a duplicated entry: both reported.
- **T77** A hostile tarball path in the release is refused as `packaging/N4` requires, and is reported as unknown, not as a mismatch.

## Questions for Kai (A or B)

1. **Does an unpublished package count in the Ratchet's accepted set?**
   - **A (recommended):** yes. `unpublished` is a finding like any other, so the set can only shrink as releases ship, and we see every folder that is not yet a release.
   - **B:** no. Unpublished folders are listed as a separate state outside the Ratchet, and only mismatches of published packages are counted.
2. **Where is the claim of "which npm name this folder is" kept?**
   - **A (recommended):** the folder's own `package.json` `name` is the claim, and an Owner namespace decision (#622) changes that file. A folder whose name was never meant to be published is `private`.
   - **B:** Engineering keeps a table of expected npm names per folder, and Packaging reads it. This catches a folder named wrongly on both sides, at the cost of a second source of truth.

## Sequencing and ownership

- Packaging owns this PLAN and the generic checker. Engineering owns the Defect, the Ratchet, and when the sweep runs (for example in the release check on `main`). Hosting owns the `npm` call.
- Order: this PLAN, then RED (T68 to T77), then DO. It needs nothing from `main`. Nothing here changes #686's promotion scope: this is PLAN text under `plan/`, which does not ship.
