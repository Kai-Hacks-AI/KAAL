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

## Static security analysis

`workflows/codeql.yml` runs GitHub CodeQL on pull requests into, and pushes to, `kaal/**` branches. It scans `javascript-typescript` (the code) and `actions` (the workflows), needs no build, and is the only workflow with `security-events: write`. Alerts appear under Security > Code scanning; the failure threshold is a repository setting, not configured here. It uses an advanced-setup workflow, so GitHub's default setup for code scanning must stay off. Its actions are pinned by commit SHA.

## Branch protection

`lineage/kaal/*` requires `test-kaal`, `check-kaal-seals` and `isolate-boundaries`. `preserve-seals` reports but is not required.

## Pre-commit hook

`.githooks/` (enabled by `npm install`) runs `npm run check-kaal-seals` early, for developer feedback only. CI is authoritative.
