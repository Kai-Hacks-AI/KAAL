# C64 change

## PLAN

1. Add the drafts in `interface.md` (page renderer, build command, theme, workflow source) and the Cases T840 to T843 (RED).
2. Observe the expected RED, and that each Case can pass with the DO's content (`evidence.md`).
3. The PLAN adds no source file, no `.github` file, no workflow and no setting.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C64`, Cases T840 to T849 (four used). No gap id.

## DO

On the merged PLAN, into the collector of this Change:

1. Add `05-src/show-wip/page.mjs`, `build-page.mjs`, `cvi.json` and `05-src/wiring/workflows/show-wip-page.yml`, equal to the drafts, and a paragraph in `05-src/show-wip/README.md`.
2. Rename the Cases from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- The WIRE that installs the workflow under `.github/workflows` is its own step, alone, after the promotion. Until then nothing runs.
- Owner steps, in this order: enable GitHub Pages for the repository with the source GitHub Actions (Settings, Pages) once the WIRE has landed; run the job once by hand (`workflow_dispatch`) to see the first page. The WIRE does not enable Pages and the job does not either.
- The `settled` section needs release/C61 on `main`. Until then `run.mjs` does not know that view, the build fails and nothing is published. The WIRE therefore comes after release/C61 is on `main`.
- The `settled` and `overview` runs each print the open-piece board first, so the two sections repeat it. Cutting the repeat is a later step, if the page reads badly.
- An email or pinned-issue update is a later Change, if Kai wants it.
- The page is public if the repository's Pages are public; what it lists (branch names, counts) is the Owner's call before Pages are enabled.
