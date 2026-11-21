# testing/C77 Pilot Record: Seeded Property & Adversarial Testing on `lib/duplicates.mjs` and `lib/contracts.mjs`

- **Change:** `testing/C77` (`testing/c77-do` → `kaal/testing/seeded-properties`, continuing merged `testing/C75` PLAN and `testing/C76` Skill DO at commit `ec31e685`).
- **Subjects tested (`lib/` unmodified):** `packages/kaal-testing/lib/duplicates.mjs` and `packages/kaal-testing/lib/contracts.mjs` at `ec31e685`.
- **Environment & runner:** Windows (`win32`), Node `v24.20.0`, temporary one-off scratch runner using explicit integer seeds with a `mulberry32` PRNG and deterministic list shrinking (`N = 250` cases per property, not committed to `packages/kaal-testing/`).

## 1. Pre-Classified Property Matrix (`N = 250` per Property)

Every property was classified **before** execution as either an `authoritative invariant` (breach routes to Defect + parked RED Case) or an `exploratory hypothesis` (unexpected failure raises an `unknown` question rather than an automatic Defect).

| Property | Target | Pre-run classification | Seed & N | Outcome & Counterexample | Routing / Judgment |
| --- | --- | --- | --- | --- | --- |
| `P-A1`: `schedule()` run-key uniqueness by `(file, sha256, subject, platform, node)` and 1-to-1 read-to-request conservation & correspondence | `lib/duplicates.mjs` | `authoritative invariant` | `seed = 1001`, `N = 250` | **Passed** (`0` failures across 0–7 requests, 1–4 files/request, overlapping/duplicated entries) | Promoted passing `seed = 1001` fixed-seed property check (`N = 80`) into `test/duplicates-inputs.test.mjs` |
| `P-A2`: Non-mutation of `requests`, `runs`, and `execution` (`structuredClone` before/after on valid and malformed lists) | `lib/duplicates.mjs` | `authoritative invariant` | `seed = 1002`, `N = 250` | **Passed** (`0` mutations observed) | Covered in `test/duplicates-inputs.test.mjs` fixed-seed check |
| `P-A3`: Permutation invariance (`schedule`, `duplicates`) over valid and documented malformed lists | `lib/duplicates.mjs` | `authoritative invariant` | `seed = 1003`, `N = 250` | **Passed** (`0` order discrepancies across shuffled valid & malformed inputs) | Covered in `test/duplicates-inputs.test.mjs` fixed-seed check |
| `P-A4`: Order-independence under extreme-magnitude IEEE-754 finite floats (`0`, `1e-12`, `0.1`, `0.2`, `0.3`, `1e16`, `MAX_SAFE_INTEGER`, `1e100`), hostile shapes, and prototype keys (`toString`, `__proto__`, `constructor`) | `lib/duplicates.mjs` | `exploratory hypothesis` | `seed = 1004`, `N = 250` | **0 float failures, 0 crashes** (`Map`/`Set` immune to prototype keys; sorting durations L47–48 preserved permutation invariance). Exploratory note: same requester passing two distinct `sha256` digests for one `path` gets two `reads` with identical `file` pointing to distinct `run` indices | No defect; keep observation noted (`schedule` distinguishes distinct `(file, sha256)`) |
| `P-C1`: Valid `problems(m, owner) === []` never throws in `classify(m, files)` and returns `"unknown"` with a non-empty reason for each statement (`README.md:113`, `lib/contracts.mjs:95-96`) | `lib/contracts.mjs` | `authoritative invariant` | `seed = 2001`, `N = 250` safe paths + targeted inherited-key check | **`P-C1a` safe paths: passed** (`250/250`). **`P-C1b` inherited keys (`"toString"`, `"__proto__"`, `"constructor"`) on plain `{}` `files`:** threw **`TypeError`** at `s.source` (CTO's **known input** from `#2249`) AND confirmed the sibling **`e.file` path in `offered()` (L78–80)** throws `TypeError` (`SubtleCrypto.digest` rejects inherited property) even when `s.source` is validly present | Routed CTO's known `s.source` input + confirmed sibling `e.file` breach together under Defect **`testing/D1`** ([15-defects/D1-classify-inherited-file-keys.md](../../15-defects/D1-classify-inherited-file-keys.md)) and parked RED Case **`testing/T393`** ([classify-inherited-keys.red.mjs](../../15-defects/classify-inherited-keys.red.mjs), outside `scripts.test`). Safe-key fixed-seed check (`seed = 2001`, `N = 60`) added to `test/contracts.test.mjs` |
| `P-C2`: Non-mutation of `mapping` and own `files` entries across `problems()` and `classify()` | `lib/contracts.mjs` | `authoritative invariant` | `seed = 2002`, `N = 250` | **Passed** (`0` mutations across 250 generated mappings) | Covered in `test/contracts.test.mjs` fixed-seed check |
| `P-C3`: Hostile nested JS inputs to `problems()` (`null`, `NaN`, `-0`, `Symbol('s')`, `Object.create(null)`, wrong field types at depths 0–4) | `lib/contracts.mjs` | `exploratory hypothesis` | `seed = 2003`, `N = 250` | **`3/250` uncaught `TypeError` throws** at `depth: 4` (`caseIndex: 39, 179, 234`): `TypeError: Cannot convert a Symbol value to a string` and `Cannot convert object to primitive value` inside `/^[0-9a-f]{64}$/.test(e.sha256 ?? "")` (`lib/contracts.mjs:60`; same pattern at L48, L54) | **`unknown` contract question (no Defect raised):** `mapping` is specified as JSON data (`Symbol` / null-prototype objects are non-JSON JS values). Raised as an open API-hardening question rather than an invented defect; JSON-typed hostile checks added to `test/contracts.test.mjs` |

## 2. Repo Consumer Check & Evidence Composition

### Repo Consumer Check (`git grep`)
- **`kaal-testing/duplicates`:** `engineering/acceptance/execution.test.mjs:34`, `engineering/execution/test/plan/adoption.case.mjs:152`, `packages/kaal-testing/test/acceptance/duplicates.test.mjs:11`, `test/duplicates-inputs.test.mjs:4`, `test/plan/duplicates.test.mjs:17`.
- **`kaal-testing/contracts`:** `engineering/contracts/measure.mjs:27` (`measure.mjs` resolves repo files via `Hosting` and constructs `files` as `{}` at L125 of `contracts.test.mjs` / per-mapping bytes dictionary in `measure.mjs` — in real repo mappings `s.source` / `e.file` use paths like `packages/...`, whereas any caller passing untrusted mapping JSON directly into `classify(mapping, {})` hits `testing/D1`), `engineering/boundary.test.mjs:23`, `packages/kaal-testing/test/contracts.test.mjs:6`.
- **Public export caveat:** Both `./duplicates` and `./contracts` are public package exports; zero observed repo failures/callers for non-JSON `Symbol`/`Object.create(null)` inputs (`P-C3`) or same-path/different-hash `schedule()` reads (`P-A4`) does **not** settle external consumer expectations.

### Evidence Composition & Boundaries
- **Supported by added fixed-seed checks (`duplicates-inputs.test.mjs`, `contracts.test.mjs`):** Deterministic behaviour of workspace `lib/duplicates.mjs` and safe-path `lib/contracts.mjs` across the generated shapes at seeds `1001` and `2001`.
- **Still requires separate evidence boundaries:**
  - Fresh tarball installation and public-export behaviour on supported hosts → `test/acceptance.test.mjs`, `test/acceptance/duplicates.test.mjs`.
  - Static Hosting import boundary (`lib/contracts.mjs`, `lib/duplicates.mjs` using no forbidden builtins) → `test/boundary.test.mjs`.
  - Symlink containment (`Hosting` `kind()`/`within()`) → `engineering/contracts/measure.test.mjs`.
  - Open defect fix verification → parked `15-defects/classify-inherited-keys.red.mjs` (`testing/T393`, `testing/T394`) runnable on demand outside `npm test`.

## 3. Technique Effectiveness vs. Skill Guidance Assessment

CPO requirement (`#issuecomment-7063131068`): distinguish **technique results** from how `skills/kaal-testing/SKILL.md` actually guided choices in this pilot (factual observations only, no score or comparison arm).

- **Where `SKILL.md` actively helped:**
  1. **Pre-classifying properties prevented defect inflation (`P-C3`):** The explicit rule to label properties as `authoritative invariant` vs. `exploratory hypothesis` before execution directly prevented turning `Symbol` / `Object.create(null)` throws in `problems()` into an uncontracted Defect (`testing/D2`).
  2. **Explicit ownership & separate routing (`testing/D1`):** The instruction not to break normal suites or silently patch `lib/` under a testing pilot drove clean routing of the CTO's known `s.source` bug + the pilot-discovered `e.file` sibling into `15-defects/D1-classify-inherited-file-keys.md` + `classify-inherited-keys.red.mjs` outside `scripts.test`.
  3. **Supplementing `C73` mutations cleanly:** Triggering seeded/adversarial testing specifically for *input breadth* (where `C73` tested *clause sensitivity*) confirmed `offered()` (`L78`) shared the inherited-key bug (`e.file`) and surfaced `RegExp.prototype.test` coercion (`Symbol`/`Object.create(null)`), neither of which `C73`'s mutations tested.
- **Where `SKILL.md` was bypassed or only partially tested:**
  1. **Known counterexample vs. unforced discovery:** For `s.source` inherited keys, execution verified the CTO's pre-specified counterexample rather than testing whether `SKILL.md` alone would have led a naive agent to pick prototype keys independently (though testing `e.file` and `RegExp.prototype.test` coercion was agent-chosen).
  2. **Mechanical list shrinking not heavily stressed:** `P-A1`–`P-A3` passed (`0` failures to shrink) and `P-C1b`/`P-C3` counterexamples were already 1-item minimal shapes (`s.source` / `e.file` / 1 malformed statement), so list/AST shrinkers in a complex multi-step counterexample were not exercised in earnest.

## 4. Explicit BASS Judgment (`Bare < Agent < Skill < Script`)

Following KAAL's `BASS` definition (`packages/kaal-engineer-skill/payload/BASS.md`), grounded in this pilot's evidence:

- **Stays at Skill (`skills/kaal-testing/SKILL.md`):** Deciding which properties are `authoritative invariant` vs. `exploratory hypothesis`, constructing domain generators (`mapping`, `requests`), interpreting `"toString"`/`Symbol` failures against contract scope, and routing counterexamples cleanly are judgment tasks — they remain **Skill** guidance.
- **Promoted to Script (`test/duplicates-inputs.test.mjs`, `test/contracts.test.mjs`, `15-defects/classify-inherited-keys.red.mjs`):** The passing fixed-seed regression checks (`seed = 1001` and `seed = 2001`) and the parked reproduction cases (`T393`, `T394`) must repeat deterministically — they belong as plain tests (**Script**).
- **Reusable PRNG/property Script (`skills/kaal-testing/scripts/`): NOT earned.** Writing `mulberry32` + property loops directly took ~20 lines per domain because 85%+ of the effort lay in domain-specific mapping/request generators and oracle predicates rather than generic PRNG mechanics. Introducing a reusable `forAll` / shrinking runner in `skills/kaal-testing/scripts/` now would add maintained surface for a single pilot without demonstrating cross-capability demand; keep `skills/kaal-testing/scripts/` absent and revisit only if repeated capability work proves a recurring mechanical need.
