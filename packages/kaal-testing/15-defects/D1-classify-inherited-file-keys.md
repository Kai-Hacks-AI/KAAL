# testing/D1: `classify(mapping, files)` throws `TypeError` for inherited `Object.prototype` keys

Owner: Testing. Initial `s.source` counterexample identified by the CTO during PLAN review of PR #2249 (`#issuecomment-7063104446`), carried as known input into the `testing/C77` pilot and reproduced on `ec31e685`; sibling `e.file` failure in `offered()` confirmed during `testing/C77` under the same lookup bug (`lib/contracts.mjs` reads `files[...]` on plain objects instead of checking own properties).

## Record

```json
{
  "id": "testing/D1",
  "context": "testing (kaal-testing/contracts, classify and offered)",
  "expected": "Any mapping with problems(mapping, owner) === [] never throws in classify(mapping, files): every statement is classified as unknown with a reason, and an absent s.source or e.file is reported as stale or missing (`packages/kaal-testing/README.md:113`, `packages/kaal-testing/lib/contracts.mjs:95-96`).",
  "observed": "When files is a plain object lacking key k in {\"toString\", \"__proto__\", \"constructor\"}, (1) setting s.source = k passes problems() and causes classify() at lib/contracts.mjs:103 to pass the inherited function/object to Buffer.from(...) and throw TypeError; (2) when s.source is validly present in files and e.file = k, offered() at lib/contracts.mjs:78-80 passes the inherited property to sha256(...) and throws TypeError ('Failed to execute \"digest\" on \"SubtleCrypto\"').",
  "where": "packages/kaal-testing/lib/contracts.mjs, offered() line 78 (`files[e.file]`) and classify() line 103 (`files[s.source]`)",
  "status": "open",
  "tests": ["testing/T393"]
}
```

## Cases

| Identity | Role | File |
| --- | --- | --- |
| `testing/T393` | RED on `ec31e685`: inherited keys `toString`, `__proto__`, `constructor` in `s.source` and `e.file` on plain `files` object | [classify-inherited-keys.red.mjs](classify-inherited-keys.red.mjs) |
| `testing/T394` | Control (passes on `ec31e685`): safe absent paths `x/README.md` / `x/test/a.test.mjs`, and inherited key on null-prototype `Object.create(null)` `files` map, classify as `unknown` without throwing | same file |

**Confirming Run (21 Nov 2026, Node `v24.20.0`, `win32`, commit `ec31e685`):** `testing/T394` passes; `testing/T393` fails with `TypeError` as expected. Fix is out of scope for `testing/C77` and belongs to a separate fix Change; do not edit [classify-inherited-keys.red.mjs](classify-inherited-keys.red.mjs) to pass.
