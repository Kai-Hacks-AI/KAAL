# Cut GitHub over to the kaal-github Extension

## Intent

C3 of the accepted sequence: the repository's pull-request controls are invoked from `packages/kaal-github` and the Bash scripts are deleted. This is `.github`-only: workflows are invocation, with no process semantics in shell. It also adds the lineage projection-currency signal that was folded into this step.

## Requirements

R1. Jobs `isolate-boundaries`, `preserve-seals`, `preserve-sealed-changes` and `contain-change` keep their names and their triggers (`contain-change` still only for bases `kaal/*`); each builds `kaal-github` and runs `node packages/kaal-github/dist/cli.js <control> origin/<base>`.

R2. `.github/scripts/*` (the four scripts and the three Bash tests) are deleted; nothing in `.github` runs a shell script. The tests of the controls run in `test-kaal` with the package.

R3. A new workflow `kaal-lineage.yml` runs `npm run check-kaal-install` on pushes to `kaal/**` and on demand; it is not a pull-request check and cannot block the repair of a lagging projection.

R4. `.github/README.md` describes the controls as invocations of the Extension, the lineage signal, and the Node hook location; no other file changes except this Change's own record. No Core, no package, no engineering change.

R5. `test-kaal`, `check-kaal-seals`, the CodeQL workflow, Dependabot and the PR template are untouched.

## Architecture

Each Git control job: checkout with full history, Node 22, `npm ci`, build the package, run its CLI against the base branch. Delegated controls reach KAAL through root commands, which build what they run. Parity with the Bash scripts was established by the package's case tests; this Change is the first run of the CLI in CI.

## Evidence

- Locally, each of the four CLI invocations against `origin/kaal/genesis` was run on this branch; `check-kaal-seals`, `check-kaal-changes`, `check-kaal-install` and root `npm test` pass.
- On the pull request, all nine checks are reported by the new jobs under unchanged names.

## Not done here

- Branch protection is the owner's setting: `contain-change` is still added to the ruleset by hand.
- `kaal-lineage.yml` runs only after the merge, so its first result appears on `kaal/genesis`.
- SHA-pinning `checkout`/`setup-node` in the controls workflow stays Kai's open call.
