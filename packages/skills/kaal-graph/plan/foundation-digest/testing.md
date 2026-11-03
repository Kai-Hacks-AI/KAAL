# One SHA-256 for Graph: Testing

The planned test lives in `packages/skills/kaal-graph/test/plan/foundation-digest.test.mjs`. DO and CHECK do not change it. It runs outside `npm test`.

| Test | Checks | Today |
| --- | --- | --- |
| graph/T19: fixed SHA-256 vectors for `sha256` and for `identify(...).id`, so no Node id changes | graph/F17 | GREEN, and stays GREEN |
| graph/T20: the shipped scripts name no `node:crypto`; `node.mjs` imports `sha256` from `@kaihacksai/kaal-foundation/sha256` | graph/F16 | RED |

graph/T14 (graph/N7) is revised in place in `test/plan/release.test.mjs`, with the Owner's confirmation recorded in its title: no other Graph file, and from outside only `yaml`, `node:` built-ins and Foundation's `sha256`. It stays GREEN, since `node.mjs` does not import Foundation yet, and it keeps protecting the copy. graph/T20 keeps the digest checks and no longer repeats the import list.

## RED evidence

`node --test packages/skills/kaal-graph/test/plan/foundation-digest.test.mjs`: graph/T19 passes, graph/T20 fails (`node.mjs` imports `node:crypto`).
