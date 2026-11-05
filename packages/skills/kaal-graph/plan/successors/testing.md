# Nodes as a structure: Testing

The planned test lives in `packages/skills/kaal-graph/test/plan/successors.test.mjs`. DO and CHECK do not change it. `graph/C15` turns it GREEN. It runs outside `npm test`, like the other planned tests.

| Test | Checks |
| --- | --- |
| graph/T18: every held Node is a key, an Edge-less Node maps to nothing, `type` keeps only Edges of exactly that type, a target that is not held is left out, the result is the same in any order of adding Nodes and is read-only, the input graph is unchanged, `reverse(successors)` gives the incoming relation, and `reach(successors, id)` equals `traverse(id)`'s ids | graph/F14, graph/F15, graph/N10 |

## RED evidence

`node --test packages/skills/kaal-graph/test/plan/successors.test.mjs`: `graph.successors` is not a function.
