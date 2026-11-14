# C25 change

## PLAN

1. Add C25 with its gap G58 and the Case T200. T200 is RED on `main` (`evidence.md`).
2. The cue is exactly the line of release/C24 (`engineering/release-management/05-src/plan-body/cue.mjs`), written once as the first visible line of the body of each installed template, after any leading declaration or comment: `sync.md` and the default are byte-identical in that respect to the capability texts of release/C24 where they have one; `plan`, `do`, `act` and `promotion` take the line between their opening comment and their first chapter.
3. T200 is independent of the capability-text Cases of release/C24. It reads the installed files with the judge's own `stripComments` and asserts: (a) the named mandatory templates `plan`, `do`, `act`, `sync`, `promotion` and `pull_request_template.md` exist and open their visible text with the cue exactly once; (b) discovery: every other `.md` in `.github/PULL_REQUEST_TEMPLATE/`, `hotfix.md` once it exists, meets the same rule; (c) release/T117 and T121 name neither the cue nor its stripping, so the transitional branch of release/C24 cannot remain.
4. T117 and T121 compare the installed SYNC template with `sync-template.md` byte for byte, with no cue handling.

## Split

`.github` travels alone (Change Isolation), as for release/C16:

- Collector `kaal/release/wire-envelope-cue`: `.github` only, the six installed files. It reaches `main` first.
- Collector `kaal/release/wire-envelope-cue-engineering`: this Change's files, T200 renamed from `.red.mjs`, and T117 and T121 without the transitional branch. It is synchronized after the `.github` collector is on `main` and reaches `main` second.

## DO

1. DO 1 (`.github` collector): insert the cue in the six files.
2. DO 2 (engineering collector): after the synchronization, rename T200 to `T200.test.mjs` and delete the transitional branch from T117 and T121.

## ACT

A 4L retrospective in `act.md`, with the rerun of the reader trial (same two links, a pull request opened from the new templates) recorded as validation evidence and not as an answer key.

## Not in this Change

A template registry, the declaration migration of the default template (it stays undeclared as it is), the `hotfix.md` template (HOTFIX delivery), hooks, CI, ruleset changes and merge blocking.
