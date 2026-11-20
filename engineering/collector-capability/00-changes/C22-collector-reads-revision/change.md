# engineering/C22 collector check reads its revision through Hosting

Provisional ids: C22 and T386–T389 were checked against `main` and every remote branch on 19 November 2026 (only T390 and T391 appear among T386–T399); they are confirmed again at the DO.

This is the first consumer of `hosting/C110` (`readRevision`, in the collector `kaal/hosting/read-revision`). It is Engineering's code, so it is its own Change; Hosting's Change did not touch it.

## From

`engineering/collector-capability/check.mjs` reads the base's Markdown by itself: one `git ls-tree`, then one `git show` per Markdown file, each through `execute`, decoding the bytes as UTF-8. On this repository that is 1,070 Git starts for 1,069 files (3.0 MB) and about 3.7 seconds. The Git handling in the script is its own.

## To

The script makes one `readRevision(process.cwd(), base)` call and keeps the `.md` files of what it returns. Nothing else about the check changes: the same report, the same lines, status 0 for a report, status 1 when the base cannot be read, report-only, nothing written. On the same repository the call took 112 ms for all 2,089 files (7.7 MB). The check's own Git handling is gone.

## Because

One home for reading a revision: Hosting says so (`hosting/I18`), and this check is the smallest first caller that proves the function against a real consumer. It also removes the per-file process cost.

## FAR (because of Features we have to Accept Regression)

1. Regression Cases, protecting what exists, GREEN on `main` today and after the DO:
   - engineering/T387: the report over a base with Markdown, a non-Markdown file and a nested folder is unchanged.
   - engineering/T388: a base that names no commit stops the check with status 1 and `collector-capability: cannot list <base> (…)`.
2. Accept list: none of the existing Cases is allowed RED. One behaviour changes visibly and is a Feature, not a loss: a base holding a symbolic link or submodule used to be stepped over in silence; `readRevision` refuses it (`REVISION_ENTRY`), so the check stops with status 1 and names it. `main` holds none today (checked: no mode 120000 or 160000 entry among 2,089).
3. Feature Cases, RED on `main` today:
   - engineering/T386: the check starts Git the same number of times for 12 Markdown files as for 24, and never `git show`.
   - engineering/T389: a base holding a symbolic link stops the check with status 1, naming the link.

## Sequence

The DO needs `readRevision` in the in-repo `@kaihacksai/kaal-hosting` workspace package, so it can only be raised from a `main` that already holds `hosting/C110`: the hosting PROMOTION comes first. This PLAN may merge before that. No npm publish and no pin move: the check uses the workspace package, not the one on npmjs.

## Not in this Change

Other revision readers, a GitHub transport entry, enforcement of the collector check by any ruleset or workflow, and any change to `collector-capability.mjs` or `evidence.mjs`.
