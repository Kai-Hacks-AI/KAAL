# Composing reach, reverse and cycles: Testing

The planned test lives in `packages/skills/kaal-graph/test/plan/composition.test.mjs`. DO and CHECK do not change it. `graph/C9` turns it GREEN and adds it to Graph's tests.

| Test | Checks | Loop |
| --- | --- | --- |
| graph/T16: the relation `reverse` returns, and a caller's own read-only Map, compose with `reach`, `cycles` and `reverse` with every edge kept. `reach(reverse(s), x)` yields `x`'s predecessors transitively, `cycles(reverse(s))` equals `cycles(s)`, and `reverse(reverse(s))` has `s`'s successors. A plain object still works | graph/F4, graph/I7, graph/F1–graph/F3 | Requirements |

## Defects

| Defect | Proven RED by | Found | Corrected |
| --- | --- | --- | --- |
| **graph/D1**: `cycles`, `reach` and `reverse` read the relation `reverse` returns, and any read-only Map other than a `Map`, as a plain object with no keys, and silently drop every edge | graph/T16 | the Owner on #621 (comment 6535618294) | `graph/C9`: graph/T16 GREEN in Graph's `npm test` |

## RED evidence

graph/T16 runs with `node --test packages/skills/kaal-graph/test/plan/composition.test.mjs`, outside Graph's `npm test`. On `kaal/graph` it is RED, and it is discriminating: `kaal-graph` exports all three functions, and the first failing assertion is behavioural. `reach(reverse(s), "c")` yields `["c"]` where `["c", "b", "a"]` is due. That RED establishes graph/D1.

## GREEN evidence

At `graph/C9`, `normalize` reads any iterable with `entries()` through `entries()` (graph/A9), and graph/T16 runs in Graph's `npm test`. It is GREEN there, which records graph/D1 as corrected. The confirmed Defect stays recorded.
