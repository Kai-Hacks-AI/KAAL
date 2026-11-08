# hosting/affected: decide the cases a platform finding governs on the parsed tree

Answers the stop-patching ruling of 8 November 2026 (Owner chose A: rewrite `affected` over the parsed tree before promoting). Hosting/D11, D12, D13 and D14 each came from the text heuristic that `affected` used to decide which test cases a platform finding governs; `couplings` already runs on the TypeScript parser. Separate Change after the D13/D14 fix.

## Change

`05-src/skills/kaal-hosting/scripts/boundary-core.ts`: the text scanner (`structure`, brace and statement-end search, regular expressions for calls and suites) is replaced. `affected` parses the test file with the TypeScript parser and decides on the tree:

- the case a finding sits in is the innermost literal-titled `it`/`test` call containing it;
- a finding in a suite's selector or options, before its body, governs every case the suite encloses;
- a finding in an `if` condition governs the cases in its branches, and, when a branch leaves its function (return, uncaught throw, `process.exit`), every case registered after it in that function or the module, except the ones the guard is not on the way to.

`05-src/skills/kaal-hosting/scripts/couplings.ts`: `scopeEnd` takes the parsed file instead of re-parsing text, and its excluded ranges now also hold the catch handler a returning guard in a `try` block bypasses, and the clauses of an enclosing `switch` the guard cannot reach, fall-through followed (the two limits recorded in D13). Nothing else in the classification changes.

## Acceptance

The Cases are unchanged: T227 to T254 (D11 to D14 RED Cases and their controls) and the Cases behind the superseded challenges (T82, T90, T91, T92, T98, T99, T100) all pass. Three controls are new: T255 (a returning guard in a try block does not challenge the catch handler), T256 (a guard in one switch clause does not challenge a clause it cannot reach) and T257 (a clause that falls through, one not ending in break, return, throw or continue, does reach the next clause, which stays challenged; found by Codex on the first push). Linux, Node 24, after `npm run build`: `06-defects` all pass except the stale `unscoped-specifiers.red.mjs` (ENOENT on `skills/`, superseded by T140 to T142, unchanged by this Change); `npm run test:publisher` passes.

## Mutation challenges superseded, old and new side by side

The old challenges mutated literal lines of the built text scanner, which no longer exist, so they cannot apply ("mutation did not apply"). The Cases they guard stay; the challenges are replaced by `04-test/engineering-check/publisher/affected-mutations.mjs`, which runs on the new code and is killed by the same Case.

| Case | Old challenge (text scanner line) | New challenge (parsed-tree line) |
| --- | --- | --- |
| T82 | `if (close < call.start && call.start < end)` → `if (false)` | `for (const call of inside(from, end))` → `for (const call of [])` |
| T90 | `if (title)` → `if (false && title)` | the `whenTrue` alternative of a conditional callee is not visited |
| T91 | `if (branch) {` made to return the whole mask | the guard's range ends at the end of the file |
| T92 | `const newline = /[\r\n]/.test(...)` → `false` | the guard's range extends 200 characters past its end |
| T98 | the comma removed from `/[.([?:,+\-*/%<>=&|^]/` | the guard's range is cut one character after its start |
| T99 | `text.startsWith("/") ? " " : "0"` made constant | a case starting after the range end is taken as inside it |
| T100 | the `:` removed from the continuation set | the guard's range is cut one character after its start |

`attribution-mutations.mjs` stays byte for byte as it was and is no longer run (every challenge in it is superseded). The `omit-controlled-cases` entry is removed from `defect-mutations.mjs`; its other four challenges are unchanged. `package.json` runs `affected-mutations.mjs` in place of `attribution-mutations.mjs`. Each new challenge was run and died by assertion, not by setup.

## What still is not claimed

A finding inside a nested callback of a case belongs to the innermost case only. Reach of a real `process.exit` beyond the module being tested is not claimed. `titles()` (the set of registered titles used for the unregistered-case check) is still a regular expression over the test text; it decides nothing about which case a finding governs.
