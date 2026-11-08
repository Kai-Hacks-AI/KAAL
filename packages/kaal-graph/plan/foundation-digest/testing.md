# One SHA-256 for Graph: Testing

The planned test lives in `packages/skills/kaal-graph/test/plan/foundation-digest.test.mjs`. DO and CHECK do not change it. It runs outside `npm test`.

| Test | Checks | Today |
| --- | --- | --- |
| graph/T19: fixed SHA-256 vectors for `sha256` and for `identify(...).id`, so no Node id changes | graph/F17 | GREEN, and stays GREEN |
| graph/T21: public `sha256` accepts what it accepts today (a string as UTF-8, a `Buffer`, a `Uint8Array`, and a `Uint16Array` and a `DataView` as the bytes they view) and throws a `TypeError` for a number, `null`, `undefined`, a plain object, an array and an `ArrayBuffer` | graph/F18 | GREEN, and stays GREEN |
| graph/T20: the shipped scripts name no `node:crypto`; `node.mjs` imports `sha256` from `@kaihacksai/kaal-foundation/sha256` | graph/F16 | RED |

graph/T14 (graph/N7) is revised in place in `test/plan/release.test.mjs`, with the Owner's confirmation recorded in its title: no other Graph file, and from outside only `node:` built-ins and packages that `package.json` declares. It no longer lists externals, so the EEE rule stays the one policy on what may be declared. It is GREEN now, and it keeps protecting the copy; once `graph/C17` imports Foundation it stays GREEN only if Foundation is declared (graph/N11). graph/T20 keeps the digest checks and no longer repeats an import list.

## RED evidence

`node --test packages/skills/kaal-graph/test/plan/foundation-digest.test.mjs`: graph/T19 and graph/T21 pass, graph/T20 fails (`node.mjs` imports `node:crypto`).
