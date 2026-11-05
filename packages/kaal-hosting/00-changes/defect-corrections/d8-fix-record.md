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

## Sixth and seventh Codex findings: regular-expression literals and default-argument objects

A regular-expression default containing a brace (`({ host = /}/ }) => {}`) was counted as syntax, and an object literal in a parameter default (`f(options = { metadata: {}, platform: host() }) {}`) ended before `) {` and so looked like a parameter pattern. Both brace scans now share one literal skipper (strings, templates, regular expressions), and a top-level brace that follows `=` is an object literal in value position, never a pattern. Verified ad hoc: the regex default is excluded, the default-argument literal and a literal after a division are findings; T137 to T139, D5, D6 and the publisher suite (192 pass, 1 skipped, 0 fail; release 15 pass) pass.

## Eighth and ninth Codex findings: parameter boundaries and nesting

A binding pattern followed by another pattern or a callback default (`({ host = "d" }, {}) {}`, `(…, cb = () => {}) {}`) was not recognised, because the suffix test refused braces and parentheses in the rest of the parameter list. The test now walks the rest of the list with balanced brackets and literals to the `)` that closes it, then requires a body or `=>`, with an optional return-type annotation. The value-position rule no longer depends on the enclosing braces: a brace after `=` is an object literal unless it sits directly inside a binding pattern. Verified ad hoc: both parameter cases and a method parameter are excluded; a default-argument literal nested in another function and a call with two arguments are findings; T137 to T139, D5, D6 and the publisher suite (192 pass, 1 skipped, 0 fail; release 15 pass) pass.

## Regression Cases and known limits

Under the CPO's review of f958dff, the boundary between a use of a platform query and a same-named local binding now has its own regression Cases: hosting/T143 to hosting/T158 in `06-defects/binding-pattern-boundaries.mjs`, GREEN at this Change. T143 to T150 are findings (nested literal, default-argument object at top level and nested in a function, one-line arrow body, literal holding an arrow function, call argument, object after a quoted brace, block after a two-argument call). T151 to T158 are local bindings and not findings (second destructured parameter, callback default, arrow parameter, later parameter, quoted-brace default, regular-expression default, type annotations, destructuring declaration in a one-line block). T137 to T139, D5 and D6 are unchanged.

The scan is a lexical heuristic over one line of context, not a parser. Two limits remain and are surfaced for the Owner and CPO to decide before 0.0.1:

1. A destructured parameter or pattern that spans several lines is not recognised, so a local binding that shares an import's name is reported as a query (false positive). Seen on `function f({\n  host = "d",\n}) {}`. This predates D8.
2. A platform query written as a default inside a destructuring pattern (`const { a = host() } = x;`) is not reported (false negative). This predates D8.

Alternatives: (A) accept both limits for 0.0.1 and list them in the README Limitations; (B) replace the heuristic with a real parser (the package already depends on `es-module-lexer`, which gives imports and exports only, so a parser dependency such as a TypeScript or acorn-class parser would be new); (C) accept limit 2, fix limit 1 by reading the full statement. Recommendation: A for 0.0.1 and B as a separate Change, because a parser is a dependency decision and every further heuristic round has produced new false positives.

## Tenth and eleventh Codex findings: control-flow conditions and array patterns

An object literal used as a control-flow condition (`if ({ …, platform: host() }) {}`) satisfied the parameter-list test and was dropped; an object binding inside an array pattern (`const [{ host = "d" }] = x`, `function f([{ host = "d" }]) {}`) was not recognised. The parameter-list test now refuses a parenthesis that opens `if`, `while`, `for`, `switch` or `with`, and square brackets are tracked like braces. Regression Cases T159 to T162 are added to `binding-pattern-boundaries.mjs`. T137 to T139, D5, D6 and the publisher suite pass.

## Twelfth and thirteenth Codex findings: statements in callback defaults and default-expression operators

A semicolon inside a callback default (`cb = () => { return 1; }`) stopped the parameter-list walk even though it was nested; it now stops only at depth zero. An object literal after `||`, `&&`, `??`, `?` or `:` in a default is now in value position like one after `=`. Regression Cases T163 to T165 added to `binding-pattern-boundaries.mjs` (now T143 to T165). T137 to T139, D5, D6 and the publisher suite (192 pass, 1 skipped, 0 fail; release 15 pass) pass.
