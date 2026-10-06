# GitHub extension

The one place in this repository that knows Git and GitHub. It runs the controls the workflows enforce, as plain Git mechanics plus an invocation of KAAL, and keeps the local pre-commit hook.

Direction is one way: a GitHub workflow calls this extension, and this extension calls KAAL through the repository's own commands. KAAL knows nothing of Git or GitHub, and this extension imports nothing of KAAL, so how KAAL decides can never move into it. It carries no process vocabulary: what a Change is, when it is closed, what a seal means are KAAL's.

## Controls

`node extensions/github/dist/src/cli.js <control> <target-ref>`, from the root of the checkout under test; exit 0 holds, 1 does not, 2 is usage. Build first with `npm run build --prefix extensions/github`.

| Control | Decides |
| --- | --- |
| `isolate-boundaries` | A change touching `kaal-core` or `.github` changes nothing outside it, but its own Change record. The only policy this extension owns. |
| `contain-change` | KAAL's `check-kaal-admission` over the target branch's `.kaal` and this checkout's. |
| `preserve-sealed-changes` | KAAL's `preserve-kaal-changes`, the same way. |
| `preserve-seals` | KAAL's `preserve-kaal-seals`, the same way. |

The target branch's `.kaal` is extracted with `git archive` into a scratch directory; a target without one baselines nothing.

## Hook

`hooks/pre-commit` is a Node entry that runs `npm run check-kaal-seals`. `npm install` points `core.hooksPath` at this directory. It is local feedback only; CI is authoritative.

## Tests

`npm test --prefix extensions/github` (part of the root `npm test`). The isolation matrix runs over throwaway Git repositories; the other controls run over throwaway repositories holding a copy of this repository's real `.kaal`, with failing candidates made by real edits to it.
