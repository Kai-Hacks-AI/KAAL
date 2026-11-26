# Seeded Property and Adversarial Testing: Testing

Verification splits cleanly into structural placement/boundary Cases (`testing/T392`) and practical property-testing execution in `testing/C77` (no synthetic LLM comparison trial).

## Deterministic Planned Case (`testing/T392`)

Lives as plain `packages/kaal-testing/test/plan/seeded-properties/T392.test.mjs` (single-quoted ids, Hold-visible, never renamed) with temporary PLAN runner `run-red.mjs` (outside `package.json` `scripts.test` until `testing/C76` adds `seeded-properties.test.mjs` and removes `run-red.mjs`):

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| `testing/T392` | `testing/F165`, `testing/N37` | All 8 existing `## ` headings of `skills/kaal-testing/SKILL.md` remain unchanged, `**Seeded property and adversarial testing.**` stands inside `## Testing loops` strictly after `**Targeted Mutation Verification.**` and before `**Uncovered behaviour.**`, and `## Testing loops` names no hardcoded KAAL repository paths (`.kaal/`, `engineering/`, `packages/`) |

Note: Skill directory surface (`SKILL.md` + `references/findings.md` only, zero `scripts/`) and `checkSkill("kaal-testing", ...)` conformance are already enforced by `testing/T382` in `test/plan/multi-loop-sensitivity/T382.test.mjs`; `T392` does not duplicate `T382`.

## Pre-Classified Pilot Protocol (`testing/C77`, After `testing/C76` Merges)

Execute via a temporary scratch runner (not committed) with explicit deterministic integer seeds (e.g. Mulberry32/SplitMix32) and shrinking. **Every property declares its status before running** — either **`authoritative invariant`** (failure can establish a contract breach → route to Defect + parked RED Case without silent fixes) or **`exploratory hypothesis`** (failure raises an `unknown` question, never automatically a defect).

### Pilot A — `packages/kaal-testing/lib/duplicates.mjs` (`duplicates`, `schedule`)

| Property | Classification before run | Basis / Check |
| --- | --- | --- |
| `schedule()` key uniqueness & read-request correspondence/conservation (`runs` unique by `(file, sha256, subject, platform, node)`, and each deduplicated requested `(by, file)` pair has one `read` pointing at a `run` with matching `file`, `sha256`, conditions, and `by` in `run.for`, so `reads.length` equals total deduplicated requested files) | `authoritative invariant` | `testing/F91`, `testing/T106`, `lib/duplicates.mjs:68-98` (replaces the earlier vacuous round-trip sketch) |
| Non-mutation (`structuredClone` deep-equal before/after for valid and malformed `runs` and `requests`) | `authoritative invariant` | `testing/T107`, `testing/T108` (`test/plan/duplicates.test.mjs:124,137`) |
| Order-independence for documented valid request/run lists and known malformed rows | `authoritative invariant` | `testing/N19`, `testing/T108`, `test/duplicates-inputs.test.mjs:28-40` |
| Order-independence under arbitrary extreme-magnitude IEEE-754 finite floats and arbitrary hostile shapes/types (`__proto__`, `toString`, nested proxies/symbols, mixed whitespace) | `exploratory hypothesis` | `lib/duplicates.mjs:47-48` sorts `ms`, and input-refusal edges beyond documented cases stay `unknown` unless contracted |

### Pilot C — `packages/kaal-testing/lib/contracts.mjs` (`LOOPS`, `problems`, `classify`)

- **Known input from `#2249` review (not credited as fresh `C77` discovery):** During PLAN review of PR #2249 (`#issuecomment-7063104446`), the CTO identified by hand that `classify(mapping, files)` throws a `TypeError` instead of returning `unknown` when a valid mapping (`problems(mapping, owner) === []`) names an inherited `Object.prototype` key (`"toString"`, `"__proto__"`, `"constructor"`) as `s.source` on a plain `files` object (`files[s.source]` evaluates before own-property check and `Buffer.from` rejects the inherited function/object). `testing/C77` treats this as **known input**, verifies the failing witness, and routes it to a **Defect** record and a **parked RED Case** (outside `scripts.test`, zero silent fix to `lib/contracts.mjs`).

| Property | Classification before run | Basis / Check |
| --- | --- | --- |
| Any `mapping` where `problems(mapping, owner) === []` never throws in `await classify(mapping, files)` and returns `"unknown"` with a reason for every statement | `authoritative invariant` | `README.md:113`, `lib/contracts.mjs:95-96` (`Every statement is unknown, with its reason`; expected to fail on CTO's known inherited-key input and check whether own-property evidence keys or other valid mappings also fail) |
| Non-mutation (`structuredClone` deep-equal on `mapping` and own entries of `files`) | `authoritative invariant` | Pure classification contract (`README.md:107-113`) |
| Hostile nested input shapes to `problems()` and `statements`/`evidence` reordering vs. uncontracted edges (`M11` `.sort()`, inherited prototype keys on evidence `e.file`) | `exploratory hypothesis` | Unexpected throws or uncontracted edge handling raise `unknown` contract questions or check whether they share CTO's known breach mechanism |

### Pilot Deliverables (`packages/kaal-testing/plan/seeded-properties/pilot.md`)

1. Record exact integer seeds, generator shapes, run counts (`>= 200` cases per property), shrunk counterexamples, separate routing (passing fixed-seed/regression additions in `scripts.test` vs. Defect + parked RED Case for product breaches vs. `unknown` questions), repo/external consumer checks for `./duplicates` and `./contracts`, and explicit evidence composition boundaries (`acceptance`, `boundary`, `measure`).
2. **Guidance vs. Technique Assessment:** Small factual record citing actual pilot decisions where `skills/kaal-testing/SKILL.md` helped, was insufficient, or was bypassed (without a score, comparison arm, or synthetic trial, and without claiming technique outputs prove Skill effectiveness).
3. **BASS Judgment:** Explicit judgment on whether a deterministic seeded Script in `skills/kaal-testing/scripts/` is earned for a separate future Change or remains premature.
