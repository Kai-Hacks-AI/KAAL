# Witness paths: Testing

The planned test lives in `packages/skills/kaal-graph/test/plan/witness.test.mjs`. DO and CHECK do not change it. `graph/C13` turns it GREEN.

| Test | Checks |
| --- | --- |
| graph/T17: the route is shortest, ties go to the first-discovered by sorted successors, `path(s, x, x)` is `[x]`, an unreachable target is `undefined`, a cycle terminates, the result is frozen and the input unchanged, the answer is the same under any key and successor order, and `path(reverse(s), a, b)` reads against the edges | graph/F13, graph/N9 |

## RED evidence

`node --test packages/skills/kaal-graph/test/plan/witness.test.mjs`: the import of `path` from `kaal-graph` fails, because the export does not exist.
