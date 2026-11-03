# One SHA-256 for Graph: Testing

The planned test lives in `packages/skills/kaal-graph/test/plan/foundation-digest.test.mjs`. DO and CHECK do not change it. It runs outside `npm test`.

| Test | Checks | Today |
| --- | --- | --- |
| graph/T19: fixed SHA-256 vectors for `sha256` and for `identify(...).id`, so no Node id changes | graph/F17 | GREEN, and stays GREEN |
| graph/T20: the shipped scripts name no `node:crypto`; `node.mjs` imports `sha256` from `@kaihacksai/kaal-foundation/sha256`; every import of the four copyable files is in the allowed set of graph/N7 (amended) | graph/F16, graph/N7 | RED |

graph/T14 (the unamended N7) is superseded by graph/T20 only when the Owner confirms graph/Q3. Until then it stays as it is.

## RED evidence

`node --test packages/skills/kaal-graph/test/plan/foundation-digest.test.mjs`: graph/T19 passes, graph/T20 fails (`node.mjs` imports `node:crypto`).
