# Seeded Property and Adversarial Testing: Evidence

Baseline commit: `origin/main` at `d046b2d1` (after promotion `#2239` of `kaal/testing/multi-loop-sensitivity`), observed on Windows (`win32`, Node `v24.20.0`).

## RED of this PLAN (`testing/T392`)

Run on `d046b2d1` (plain Hold-visible `T392.test.mjs`, single-quoted ids):

```sh
node packages/kaal-testing/test/plan/seeded-properties/run-red.mjs
```

Observed output (`exit 0`):

```text
RED    testing/T392 (T392.test.mjs) [testing/F165, testing/N37]: "Testing loops" does not contain "**Seeded property and adversarial testing.**"
Summary: 1 RED-observed, 0 GREEN, 0 ERROR
```

## Throwaway Reference Verification (Passes and Fails for the Right Reasons)

Verified against a temporary copy of `skills/kaal-testing/` (`KAAL_TESTING_SKILL_DIR`, removed immediately afterward) without modifying the shipped Skill:

| Variant | Result | Observed message |
| --- | --- | --- |
| Clean reference (`**Seeded property and adversarial testing.**` inserted between `**Targeted Mutation Verification.**` and `**Uncovered behaviour.**`) | `GREEN` (`0 RED-observed, 1 GREEN, 0 ERROR`) | — |
| `M1` (missing marker) | `RED` (`1 RED-observed, 0 GREEN, 0 ERROR`) | `"Testing loops" does not contain "**Seeded property and adversarial testing.**"` |
| `M2` (marker placed after `**Uncovered behaviour.**`) | `RED` (`1 RED-observed, 0 GREEN, 0 ERROR`) | `"**Seeded property and adversarial testing.**" must stand after "**Targeted Mutation Verification.**" and before "**Uncovered behaviour.**"` |
| `M3` (contains `.kaal/` inside `## Testing loops`) | `RED` (`1 RED-observed, 0 GREEN, 0 ERROR`) | `section must stay consumer-agnostic (found ".kaal/")` |

## Known Product Counterexample Reported During PLAN Review (Input to `testing/C77`)

- **Reported by CTO (`#issuecomment-7063104446` on PR #2249):** By inspection against [contracts.mjs](../../lib/contracts.mjs) (`L78`, `L103`), `classify(mapping, files)` throws a `TypeError` instead of returning `unknown` when `problems(mapping, owner)` returns `[]` and a statement's `source` is an inherited `Object.prototype` property (`"toString"`, `"__proto__"`, `"constructor"`) on a plain `files` object (`Buffer.from` rejects the inherited function/object). This breaches `"every statement is unknown, with its reason"` (`README.md:113`) and was missed by `testing/C73`'s mutations. Carried forward into `testing/C77` as **known input** (not a fresh `C77` discovery), to be routed as a Defect and a parked RED Case rather than silently fixed.

## Baseline Suite Observations on `d046b2d1`

Run:

```sh
node --test packages/kaal-testing/test/plan/duplicates.test.mjs packages/kaal-testing/test/duplicates-inputs.test.mjs packages/kaal-testing/test/contracts.test.mjs packages/kaal-testing/test/plan/multi-loop-sensitivity.test.mjs packages/kaal-testing/test/boundary.test.mjs
```

Observed output: **28/28 pass** (`6` suites, `0` fail, `0` skipped — comprising `boundary.test.mjs` `3`, `contracts.test.mjs` `14`, `duplicates-inputs.test.mjs` `2`, `duplicates.test.mjs` `6`, `multi-loop-sensitivity.test.mjs` `3`).
