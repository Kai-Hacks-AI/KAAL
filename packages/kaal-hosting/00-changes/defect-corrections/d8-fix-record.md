# hosting/D8 fix: do-record

Answers hosting/D8 (see `06-defects/D8-one-line-function-body.md`). Separate Change after the RED Case.

## Change

`05-src/skills/kaal-hosting/scripts/couplings.ts`: the `inPattern` exclusion treated any unclosed `{` before a use as a destructuring pattern. It now excludes a use only when that brace is a binding brace, and not when it opens a block (after `)`, `=>`, `else`, `try`, `finally` or `do`). Nothing else in the scan changes.

## Run

Linux, Node 24, after `npm run build`:

| File | Before | After |
| --- | --- | --- |
| `06-defects/one-line-function-body.red.mjs` | T139 pass, T137 and T138 fail | all pass (answers hosting/D8) |
| `06-defects/destructured-require.red.mjs` | file does not load (stale import path) | all 4 pass |
| `06-defects/early-return.red.mjs` | file does not load (stale import path) | all 3 pass |

## Path-only supersession (Owner ruling A: path clauses of immutable Cases may change; listed before and after)

| Case file | Before | After |
| --- | --- | --- |
| `06-defects/destructured-require.red.mjs` | `import … from "../dist/couplings.js"` | `"../dist/skills/kaal-hosting/scripts/couplings.js"` |
| `06-defects/early-return.red.mjs` | `import … from "../dist/boundary-core.js"` | `"../dist/skills/kaal-hosting/scripts/boundary-core.js"` |

Case titles, assertions and identities are unchanged. These two files could no longer load after the layout move, so their evidence could not be re-run; this restores it.

## Not fixed here

`06-defects/unscoped-specifiers.red.mjs` (hosting/T108, hosting/D7) also fails to run after the layout move, and a path change alone does not repair it: the shipped D7 record under `dist/docs/defects` itself quotes the unscoped names the Case forbids. Repairing it changes the Case's meaning, so it is left for an Owner ruling.
