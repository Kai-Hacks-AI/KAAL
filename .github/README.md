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

- `preserve-sealed-changes`: `scripts/preserve-sealed-changes.sh` keeps every Change that is validly sealed on the target branch the same validly sealed Change here: same path, same identity, seal in place. It asks the repository's own `npm run list-sealed-changes` which Changes are closed in the target's `.kaal` and in this checkout's, and compares the two lists; it never hashes anything. Open and new Changes are free. `scripts/preserve-sealed-changes.test.sh` challenges it on a throwaway repository (edit, rename, move, add, delete, delete the directory or the seal, substitute a seal) and runs first in the same job. It is separate from `preserve-seals`, which protects Node seals.

## Branch protection

`lineage/kaal/*` requires `test-kaal`, `check-kaal-seals` and `isolate-boundaries`. `preserve-seals` reports but is not required.

## Pre-commit hook

`.githooks/` (enabled by `npm install`) runs `npm run check-kaal-seals` early, for developer feedback only. CI is authoritative.
