# The GitHub extension

## Intent

Bring everything the Git and GitHub controls need into one TypeScript extension, `extensions/github`, that calls KAAL and is called by workflows, so that the shell controls under `.github/scripts` can be replaced by a `.github`-only cutover in the next Change. This is the C2 step of the sequence accepted on #47: Bash dies before ROWING lands.

## Requirements

R1. `extensions/github` is an own private package with its tests beside its implementation. There is no `engineering/github`.

R2. One entry, `node extensions/github/dist/src/cli.js <control> <target-ref>`, runs the four controls the workflows enforce, `isolate-boundaries`, `contain-change`, `preserve-sealed-changes` and `preserve-seals`; exit 0 holds, 1 does not, 2 is usage.

R3. `isolate-boundaries` has the semantics of `isolate-boundaries.sh`: a change touching `packages|engineering/kaal-core` or `.github` changes nothing outside that boundary but its own Change record; the shell script's fifteen cases are cases here.

R4. The other three controls extract the target branch's `.kaal` with Git and ask KAAL, through `check-kaal-admission`, `preserve-kaal-changes` and `preserve-kaal-seals`, run from the repository root as a process. A target without `.kaal` baselines nothing; a target that is not a commit is an error.

R5. The direction is one way. KAAL, its capabilities and engineering know nothing of Git or GitHub; the extension imports nothing of KAAL and has no process vocabulary, which a test checks over its sources. No seal path, Kernel path, kernel hash or kaal-core package layout is known to it.

R6. The pre-commit hook is a Node entry in the extension; `prepare` points `core.hooksPath` at it and the shell hook `.githooks/pre-commit` is gone. It runs `check-kaal-seals` and passes its answer on.

R7. Tests exercise real operations: the controls over throwaway Git repositories, the KAAL-backed ones over a copy of this repository's real `.kaal`, its real closed Changes and seals, with failing candidates made by real edits. There is no simulator and no privileged way to advance a Change.

R8. Nothing else changes: `.github` (workflows, scripts, their tests, README), kaal-core, every other package and every sealed artifact stay as they are. The workflows keep running the shell scripts until the cutover.

## Architecture

`src/git.ts` is Git and only Git: the paths that differ from the target, and a scratch copy of the target's `.kaal`. `src/kaal.ts` runs one of the repository's KAAL commands over a baseline and a candidate directory and returns its exit status and messages; it is the only place the extension reaches KAAL, and reaches it as a process, so there is no import to depend on. `src/controls.ts` holds the four controls: the isolation policy, which is the extension's own, and three that are a baseline plus an invocation. `src/cli.ts` is the entry the workflows run. `hooks/pre-commit` is the Git hook.

The boundaries and the Change-record paths are configuration of the extension, written once in `controls.ts`: which paths may travel together is a rule of this host's repository, not of KAAL.

The package follows the engineering packages' shape: private, no dependencies, the root's `tsc` and `@types/node`, its own build and test scripts, run from the root `npm test`.

## Evidence

- `acceptance/isolate-boundaries.test.ts`: the fifteen shell cases, and an unknown target as an error.
- `acceptance/kaal-controls.test.ts`: over this repository's real `.kaal`, one new closed Change is contained and none, an unclosed one or an altered one is not; a closed Change kept and moved whole is preserved, one mutated or removed is not; Node seals kept or added are preserved, one removed or the Kernel altered is not; a baseline with no `.kaal` baselines nothing.
- `acceptance/entries.test.ts`: the CLI's exit codes, the hook running from the root and being executable, and the extension's sources free of process vocabulary.
- The whole root `npm test`, `check-kaal-install`, `check-kaal-seals` and `check-kaal-changes` pass, and `isolate-boundaries` over this branch against `kaal/genesis` holds.

## Not done here

- The workflows still run the shell scripts and `.github/README.md` still describes `.githooks/`; moving the workflows to the extension, deleting `.github/scripts` and updating that README is the `.github`-only cutover, which cannot travel with this Change.
- No immutability hardening for pushed tree or Change seals.
- ROWING (#47) is untouched.
