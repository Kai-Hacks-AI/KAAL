# Evidence

What was run on the Work as it stands, and what it showed. Review round 01 found the Work did not yet realize the Intent; this is the realization and its proof.

## What changed

- `packages/kaal-changing/skills/kaal-changing/scripts/change-state.mjs` is new: the process compass, `compass({ identity, markers })` and a command, `node scripts/change-state.mjs <kaal-dir> <change>`. The evaluator and the Change layout it needs were moved into it from `engineering/change-seal` (`process.ts`, `changes.ts`); nothing was reimplemented beside it.
- `engineering/change-seal/helpers/compass.ts` is new and binds the script to the Sealing scripts already used. `process.ts`, `changes.ts` and `change-id.ts` now consult the script; they keep only what writes (seal work, seal Change) and the admission and preservation checks.
- The Skill, its `rowing.md` reference and the package README point at the script. The installed `skills/kaal-changing/` was refreshed by `npm run install-kaal`; nothing under `.kaal/` other than this Change changed.
- `kaal-core`, `.github/**`, the Nodes and every seal are untouched.

## Requirements 1, 3, 4, 5, 7: an installed KAAL answers on its own

`engineering/kaal-changing/acceptance/compass.test.ts` builds a directory holding only the two shipped Skills under `skills/` (`kaal-changing` and `kaal-sealing`, taken from the packages' `payload()`) and a `.kaal/` beside it, and runs the script with that directory as the working directory. There is no repository, no `engineering/` and no root `package.json`; the test asserts the directory holds only `.kaal` and `skills`. In it the script answers every stage from `WORK OPEN` through `CHANGE CLOSED` with the role in each `next:`, with the Work identity equal to what `kaal-sealing`'s `artifact-id.mjs --named --domain "KAAL Tree v1"` prints, and it reports a tampered sealed Work with exit 1 and the restore instruction. It writes nothing (the whole tree is compared before and after). Without `kaal-sealing` beside it, it refuses with `kaal-sealing is not installed beside kaal-changing` and prints no state. A Change closed before review existed (`genesis/26/10/05/01`, copied from this repository) is `CHANGE CLOSED` by its own seal. The script's source is checked to carry no host word and no hashing or writing.

## Requirement 2: the same answer

`engineering/change-seal/acceptance/process.test.ts` runs the repository's `state` command and the installed `skills/kaal-changing/scripts/change-state.mjs` over every Change of this repository's `.kaal`, and compares stdout and exit code: identical. The 65 existing acceptance tests of the process, sealing, admission and preservation pass unchanged apart from the one that scanned `process.ts` for host words, which now scans the script that holds the process. `npm run state-kaal-change` is the same code as the script, not a copy.

## Whole suite

From the repository root: `npm test` passes (including `kaal-changing` acceptance, 39 tests, and `change-seal`, 66), and `npm run check-kaal-install`, `check-kaal-seals` and `check-kaal-changes` exit 0. `kaal-changing`'s own package tests pass.

## Not shown

That an actual embedding elsewhere than this repository installs both Skills: the installer delivers exactly the Skills Core's `installedSkills()` reports, and nothing here makes `kaal-sealing` a declared dependency of `kaal-changing`. Requirement 6 is shown by the diff touching no Core. The one new coupling, `kaal-changing` asking the sibling `kaal-sealing`, is described in `03-architecture.md` and left to the Owner.
