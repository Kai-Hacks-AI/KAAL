# The GitHub Extension package

## Intent

Give the repository's Git and GitHub controls a home that is KAAL-shaped and Bash-free: `packages/kaal-github`, the first Extension package, typed by Core's admitted `Extension`. This is C2' of the sequence accepted on #52/#54: the controls' logic moves from `.github/scripts/*.sh` into tested TypeScript, ready for the `.github`-only cutover (C3). The dependence is one way: GitHub workflow → kaal-github → KAAL commands across a process boundary; KAAL knows no Git or GitHub.

## Requirements

R1. `packages/kaal-github` is an independent npm package (MIT, own lockfile, `kaal/`, `src/`, `test/`) whose Node `GitHub` is typed by Core's `Extension` (`b2bf7b53…`) and sealed; `payload()` returns `{ kaal }`.

R2. It is delivered by the installer like any capability: registered into `.kaal` through `registerExtension`, resolved by exact Node ID; `check-kaal-install` is green.

R3. Controls `isolate-boundaries`, `contain-change`, `preserve-sealed-changes`, `preserve-seals` are available as `kaal-github <control> <target-ref>` with the same verdicts as the Bash scripts they replace. Everything about Changes and seals is delegated to KAAL's root commands by process; the package imports nothing of KAAL and holds no knowledge of seal paths or kernel files. Its one rule of its own is which paths may only be changed alone.

R4. The pre-commit hook is Node, delivered by this package; `.githooks` is gone and `prepare` points `core.hooksPath` at the package.

R5. `.github` is not touched: the Bash scripts and workflows stay live until C3. No Core change.

## Architecture

`src/git.ts` reads changed paths and materializes a baseline `.kaal` with `git archive`; `src/kaal.ts` runs `npm run -s <command> -- <baseline> <candidate>` in the root; `src/controls.ts` composes them; `src/cli.ts` is the invocation surface. Tests sit beside the implementation. The install acceptance test now expects the Extension among installed capabilities.

## Evidence

- Package tests (37) cover the isolation rule case by case, the three KAAL-backed controls against real `.kaal` copies, CLI exit codes, the hook, the payload, and that sources carry no process vocabulary.
- Root `npm test`, `check-kaal-install`, `check-kaal-seals`, `check-kaal-changes` pass.

## Not done here

- C3: workflows still call the Bash scripts; `.github/README.md` still mentions `.githooks/`; the lineage projection-currency control.
- Parity against the Bash scripts on live PRs is established only when C3 runs the CLI in CI.
