# Controls

Sealed `kaal-core` is protected by two different layers. They are independent and run as separate jobs of `workflows/kaal-core-controls.yml`; each job is its own check, named after the job.

## KAAL controls

Portable, they work without Git.

- `test-kaal`: `npm test` proves semantic correctness (KNIFE).
- `check-kaal-seals`: `npm run check-kaal-seals` proves the current checkout's seals are intact.

## Git controls

They supply memory and policy around Core. The jobs only invoke the `kaal-github` Extension (`packages/kaal-github`) as `node packages/kaal-github/dist/cli.js <control> <target>` after building it; the controls, their tests and the Git reading live in that package, and anything about a Change or a seal is asked of KAAL's own root commands. This directory holds no script and no process semantics.

- `isolate-boundaries`: keeps each protected boundary alone in a change. A change touching `packages/kaal-core/` or `engineering/kaal-core/` may change nothing outside them, and a change touching `.github/` may change nothing outside it.
- `preserve-seals`: keeps every seal present on the target branch (new seals may be added), asking `npm run preserve-kaal-seals`.
- `preserve-sealed-changes`: keeps every Change that is validly sealed on the target branch present here as a validly sealed Change with the same identity, asking `npm run preserve-kaal-changes`. A seal freezes the Change's tree and nothing else, so the Change may move or be renamed as a whole, but nothing inside it may change. Open and new Changes are free. It is separate from `preserve-seals`, which protects Node seals.
- `contain-change`: establishes that a pull request into a `kaal/*` branch contains exactly one new closed Change and that previously admitted closed history remains intact. The target branch's `.kaal` is the baseline, this checkout's is the candidate, and `npm run check-kaal-admission` decides; admission semantics belong to KAAL. It does not judge whether the Change is good or faithful to its intent; review owns that. The job runs only when the pull request's base is a `kaal/*` branch, so work staged on any other branch is not judged.

The controls are tested with the package (`npm test` in `test-kaal`), not by a job of their own.

## Lineage projection currency

`workflows/kaal-lineage.yml` runs `npm run check-kaal-install` on pushes to `kaal/**` branches and on demand: the checked-in `.kaal` and `skills/` must be what the packages deliver. It is a lineage signal and not a pull-request gate or a required check, because a change confined to a package cannot also update the projection, so the repair is its own pull request and must not be blocked by it.

`isolate-boundaries` lets the sealed record of the Change that mutates a boundary accompany it: the Change directory under `.kaal/changes/` and the seals under `.kaal/seals/changes/` and `.kaal/seals/trees/`. Every admission carries a Change, so a protected boundary could not otherwise be admitted. The control matches paths and cannot tell whose record it is, and it does not reimplement admission: `contain-change` requires exactly one new Change per proposal into a `kaal/*` branch, so there that is the Change that explains the boundary change. On a staging branch, where nothing is admitted, several records could travel beside a boundary; that is an honest limit of the composition, not something this control polices. Nothing else may accompany a boundary, a Node seal and any other part of the KAAL directory included. A semantic KAAL Change and a support-engine mutation are never one Change.

## Static security analysis

`workflows/codeql.yml` runs GitHub CodeQL on pull requests into, and pushes to, `kaal/**` branches. It scans `javascript-typescript` (the code) and `actions` (the workflows), needs no build, and is the only workflow with `security-events: write`. Alerts appear under Security > Code scanning; the failure threshold is a repository setting, not configured here. It uses an advanced-setup workflow, so GitHub's default setup for code scanning must stay off. Its actions are pinned by commit SHA.

## Dependency maintenance

`dependabot.yml` configures Dependabot version updates only: npm (the root and each `packages/*` lockfile, one monthly grouped pull request) and GitHub Actions. Security updates are a repository setting and are not configured here. Dependabot reads this file from the default branch.

## Branch protection

The ruleset `lineage` on `kaal/*` requires `test-kaal`, `check-kaal-seals`, `isolate-boundaries`, `preserve-seals`, `preserve-sealed-changes`, `codeql (javascript-typescript)` and `codeql (actions)`. `contain-change` is the control that makes admission mechanical; it is added to that list by hand.

## Pre-commit hook

`packages/kaal-github/hooks/pre-commit` (enabled by `npm install`, which points `core.hooksPath` there) runs `npm run check-kaal-seals` early, for developer feedback only. CI is authoritative.
