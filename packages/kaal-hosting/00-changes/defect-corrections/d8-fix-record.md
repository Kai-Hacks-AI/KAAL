# hosting/D8 fix: do-record

Answers hosting/D8 (see `06-defects/D8-one-line-function-body.md`). Separate Change after the RED Case.

## Change

`05-src/skills/kaal-hosting/scripts/couplings.ts`: the `inPattern` exclusion treated any unclosed `{` before a use as a destructuring pattern. It now looks at the innermost unclosed brace: that brace excludes the use only when it is a binding brace, and not when it opens a block (after `)`, `=>`, `else`, `try`, `finally` or `do`). A binding pattern nested inside a one-line block stays excluded (Codex P2 on #1079). Nothing else in the scan changes.

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

## Second Codex finding: object literal versus binding pattern

A completed nested object before a query (`const config = { metadata: {}, platform: host() };`) kept the outer brace on the stack and was read as a binding pattern, which dropped a real query. The scan now classifies each brace: a binding pattern follows `const`, `let`, `var` or a function's opening parenthesis, or sits inside one; blocks (function and arrow bodies, else, try, finally, do) and object literals are not patterns. Verified ad hoc (nested literal, arrow body, call argument: findings kept; destructuring default: excluded), T137 to T139, D5, D6 and the publisher suite pass.

## Third Codex finding: destructured parameters

A destructured parameter that shadows an imported alias (`({ host = "d" }) => {}`, or a second parameter) was reported as a query. A brace now also counts as a binding pattern when its closing brace is followed by an assignment or by the end of a parameter list (`) =>` or `) {`). Verified ad hoc: arrow parameter, second parameter and one-line-body parameter are excluded; nested literal, arrow body, call argument, call in `if` and literal-held arrow body are findings. T137 to T139, D5, D6 and the publisher suite (192 pass, 1 skipped, 0 fail; release 15 pass) pass.

## Fourth Codex finding: braces inside string literals

A brace character inside a quoted default (`({ host = "}" }) => {}`) was counted as syntax when locating a pattern's closing brace. Both brace scans now skip quoted literals. Verified ad hoc (`"}"` and `'{'` defaults excluded; a literal holding `"}"` before a real query is still a finding); T137 to T139, D5, D6 and the publisher suite pass.

## Fifth Codex finding: TypeScript annotations on patterns

A type annotation between a pattern's closing brace and the parameter list's end (`({ host = "d" }: Options): void {}`) or before an assignment (`const { host }: Options = x`) hid the binding pattern. Both pattern tests now allow annotations. Verified ad hoc (typed parameter, return type, arrow, declaration excluded; a typed literal holding a real query is a finding); T137 to T139, D5, D6 and the publisher suite pass.
