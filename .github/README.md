# Controls

Sealed `kaal-core` is protected by two different layers. They are independent and run as separate jobs of `workflows/kaal-core-controls.yml`; each job is its own check, named after the job.

## KAAL controls

Portable, they work without Git.

- `test-kaal`: `npm test` proves semantic correctness (KNIFE).
- `check-kaal-seals`: `npm run check-kaal-seals` proves the current checkout's seals are intact.

## Git controls

They supply memory and policy around Core and know only paths and diffs, never what a seal or a Node means.

- `isolate-boundaries`: `scripts/isolate-boundaries.sh` keeps each protected boundary alone in a change. A change touching `packages/kaal-core/` or `engineering/kaal-core/` may change nothing outside them, and a change touching `.github/` may change nothing outside it. `scripts/isolate-boundaries.test.sh` tests this on a throwaway repository and runs first in the same job.
- `preserve-seals`: `scripts/preserve-seals.sh` keeps every seal present on the target branch (new seals may be added). A seal is a token in a seal-record file or the name of a seal artifact in a seals directory; both forms are read.
- `preserve-sealed-changes`: `scripts/preserve-sealed-changes.sh` keeps every Change that is validly sealed on the target branch present here as a validly sealed Change with the same identity, seal in place. A seal freezes the Change's tree and nothing else, so the Change may move or be renamed as a whole, but nothing inside it may change. It asks the repository's own `npm run list-sealed-changes` which Changes are closed in the target's `.kaal` and in this checkout's, and compares the identities; it never hashes anything. Open and new Changes are free. `scripts/preserve-sealed-changes.test.sh` challenges it on a throwaway repository (edit, rename, move or add inside it, delete a file, the directory or the seal, substitute a seal, reseal) and proves a whole-Change move passes and runs first in the same job. It is separate from `preserve-seals`, which protects Node seals.

- `contain-change`: `scripts/contain-change.sh` establishes that a pull request into a `kaal/*` branch contains exactly one new closed Change and that previously admitted closed history remains intact. The target branch's `.kaal` is the baseline, this checkout's is the candidate, and the repository's own `npm run check-kaal-admission` decides; admission semantics belong to KAAL, and this control only supplies the two directories and passes on the exit code. Zero, several, an incomplete Change, or altered or removed closed history are each refused with the reason. It does not judge whether the Change is good or faithful to its intent; review owns that. The job runs only when the pull request's base is a `kaal/*` branch, so work staged on any other branch is not judged, and the steps of a Change that is not yet finished live there. `scripts/contain-change.test.sh` challenges it on a throwaway repository (including an empty baseline) and runs first in the same job.

`isolate-boundaries` lets the sealed record of the Change that mutates a boundary accompany it: the Change directory under `.kaal/changes/` and the seals under `.kaal/seals/changes/` and `.kaal/seals/trees/`. Every admission carries a Change, so a protected boundary could not otherwise be admitted. The control matches paths and cannot tell whose record it is, and it does not reimplement admission: `contain-change` requires exactly one new Change per proposal into a `kaal/*` branch, so there that is the Change that explains the boundary change. On a staging branch, where nothing is admitted, several records could travel beside a boundary; that is an honest limit of the composition, not something this control polices. Nothing else may accompany a boundary, a Node seal and any other part of the KAAL directory included. A semantic KAAL Change and a support-engine mutation are never one Change.

## Static security analysis

`workflows/codeql.yml` runs GitHub CodeQL on pull requests into, and pushes to, `kaal/**` branches. It scans `javascript-typescript` (the code) and `actions` (the workflows), needs no build, and is the only workflow with `security-events: write`. Alerts appear under Security > Code scanning; the failure threshold is a repository setting, not configured here. It uses an advanced-setup workflow, so GitHub's default setup for code scanning must stay off. Its actions are pinned by commit SHA.

## Dependency maintenance

`dependabot.yml` configures Dependabot version updates only: npm (the root and each `packages/*` lockfile, one monthly grouped pull request) and GitHub Actions. Security updates are a repository setting and are not configured here. Dependabot reads this file from the default branch.

## Branch protection

The ruleset `lineage` on `kaal/*` requires `test-kaal`, `check-kaal-seals`, `isolate-boundaries`, `preserve-seals`, `preserve-sealed-changes`, `codeql (javascript-typescript)` and `codeql (actions)`. `contain-change` is the control that makes admission mechanical; it is added to that list by hand once this lands.

## Pre-commit hook

`.githooks/` (enabled by `npm install`) runs `npm run check-kaal-seals` early, for developer feedback only. CI is authoritative.
