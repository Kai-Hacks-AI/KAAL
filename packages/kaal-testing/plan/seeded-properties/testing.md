# Seeded Property and Adversarial Testing: Testing

Verification splits cleanly into structural placement/boundary Cases (`testing/T390`) and practical property-testing execution in `testing/C77` (no synthetic LLM trial).

## Deterministic Planned Case (`testing/T390`)

Lives in `packages/kaal-testing/test/plan/seeded-properties/T390.red.mjs` with runner `run-red.mjs` (outside `package.json` `scripts.test` until `testing/C76` promotes it):

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| `testing/T390` | `testing/F163`, `testing/N37` | All 8 existing `## ` headings of `skills/kaal-testing/SKILL.md` remain unchanged, `**Seeded property and adversarial testing.**` stands inside `## Testing loops` strictly after `**Targeted Mutation Verification.**` and before `**Uncovered behaviour.**`, and `## Testing loops` names no hardcoded KAAL repository paths (`.kaal/`, `engineering/`, `packages/`) |

Note: Skill directory surface (`SKILL.md` + `references/findings.md` only, zero `scripts/`) and `checkSkill("kaal-testing", ...)` conformance are already enforced by `testing/T382` in `test/plan/multi-loop-sensitivity/T382.test.mjs`; `T390` does not duplicate `T382`.

## Practical Pilot Protocol (`testing/C77`, After `testing/C76` Merges)

Execute via a temporary scratch runner (not committed) with fixed explicit integer seeds (e.g. deterministic PRNG such as Mulberry32/SplitMix32) and deterministic shrinking:

1. **Pilot A — `packages/kaal-testing/lib/duplicates.mjs` (`schedule`, `duplicates`):**
   - **Properties:**
     - *Permutation invariance (`testing/N19`):* `duplicates({ runs: shuffle(runs) })` and `schedule(shuffle(requests))` yield deep-equal outputs for generated valid inputs (including mixed fractional/large `ms` durations) and malformed request/run lists.
     - *Purity:* neither `runs` nor `requests` is mutated (`structuredClone` deep-equal before/after).
     - *Round-trip / conservation:* converting every planned run in `schedule(requests).runs` into a single observed execution (`case: "C/" + i, ms`) yields `duplicates(...).result === "unchallenged"`, `challenges: []`, `wastedMs: 0`, provided distinct files/cases.
     - *Adversarial refusal:* arbitrary malformed/hostile shapes (non-objects, missing/whitespace fields, `NaN`/`Infinity`/`-0`/`-1`, `Array.isArray` edge values, prototype property strings like `"__proto__"`, `"toString"`, `"constructor"` in `by`/`platform`/`node`/`file`) return structured `{ result: "unknown" }` or non-empty `findings` with `runs: [], reads: []` without throwing uncaught exceptions.
2. **Pilot C — `packages/kaal-testing/lib/contracts.mjs` (`LOOPS`, `problems`, `classify`):**
   - **Supplementing `C73`'s mutations:** `C73` checked assertion kills against known contract rules; `C77` checks input breadth and composition between `problems()` and `classify()`:
     - *Valid mapping safety:* for any generated `mapping` and `owner` where `problems(mapping, owner)` returns `[]`, calling `await classify(mapping, files)` over adversarial `files` records (missing files, stale bytes, altered quotes, `"toString"` / `"constructor"` / `"__proto__"` paths, missing `review`, empty/reordered `review.evidence`) returns well-formed `unknown` classifications without crashing or modifying inputs.
     - *Adversarial `problems()` refusal:* hostile nested structures (`mapping`, `statements`, `evidence`, `review` fields with wrong types, `-0`, `NaN`, control characters, backslashes, `..` variants) produce strings in `problems()` without uncaught `TypeError`/`RangeError`.
     - *Permutation & review hash properties:* examine whether `statements` or `evidence` reordering reveals any uncontracted assumptions (preserving `M11` `.sort()` as `unknown` / documented rather than inventing invariants).
3. **Output, promotion, and BASS judgment (`plan/seeded-properties/pilot.md`):**
   - Record exact seed(s), generator bounds, case counts (`>= 200` cases per property), every shrunk counterexample or unexpected exception, repo/external consumer implications for `./duplicates` and `./contracts`, explicit composition boundaries (vs. `acceptance.test.mjs`, `boundary.test.mjs`, `engineering/contracts/measure.test.mjs`), justified promoted tests in `test/contracts.test.mjs` / `test/duplicates-inputs.test.mjs`, and an explicit **BASS judgment** on whether a Skill `scripts/` PRNG/runner is now earned.
