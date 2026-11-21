# Seeded Property and Adversarial Testing: Requirements

Each Requirement answers `testing/I46`.

## Functional

- **testing/F163** [testing/I46]: **Seeded property guidance inside `## Testing loops`.** `testing/C76` adds one concise bold subsection `**Seeded property and adversarial testing.**` inside `## Testing loops` in `skills/kaal-testing/SKILL.md` (right after `**Targeted Mutation Verification.**` and before `**Uncovered behaviour.**`), keeping all eight top-level `## ` headings unchanged. The guidance must cover:
  - **Non-overlapping triggers ("when to use what"):** Behavioural RED (before coding: fail on assertion rather than setup), Targeted Mutation Verification (after GREEN: prove assertion sensitivity against known contract clauses), and Seeded Property & Adversarial Testing (for pure/algebraic/parser/validator contracts: test input breadth across permutations, round-trips, idempotence, non-mutation, and adversarial shapes that authors rarely hand-write).
  - **Real invariants over tautologies:** Verify structural, algebraic, differential, or crash-free-refusal laws rather than re-implementing production logic inside the oracle.
  - **Explicit seeds & minimal counterexamples:** Use a deterministic seed (never unseeded randomness) and shrink any failing input so failures reproduce identically as `verified failure`.
  - **Four-kind triage & promotion:** Check contract authority and consumers first using the four existing finding kinds (`unknown` for uncontracted edges, `verified failure` / `potential defect` only for contract breaches), and promote justified counterexamples (or small fixed-seed checks) into ordinary deterministic suite tests without embedding heavy fuzz loops into `npm test`.

- **testing/F164** [testing/I46]: **Bounded A + C Pilot (`lib/duplicates.mjs` and `lib/contracts.mjs`) & BASS Judgment.** Strictly after `testing/C76` merges, `testing/C77` runs a bounded, one-off seeded property & adversarial pass across `packages/kaal-testing/lib/duplicates.mjs` (algebraic laws: permutation invariance, floating-point duration accumulation, input non-mutation, `schedule()` → `duplicates()` round-trip, arbitrary malformed-input refusal without throws) and `packages/kaal-testing/lib/contracts.mjs` (supplementing `C73`: checking whether any `problems(m, owner) === []` input crashes `classify(m, files)`, adversarial path/key strings such as `"toString"` / `"constructor"` / `"__proto__"`, `evidence`/`review` permutations, and non-mutation). `testing/C77`:
  - executes with a temporary one-off runner (not committed to `packages/kaal-testing/`), preserving exact seeds, generators, case counts, properties, shrunk counterexamples, repo/external consumer considerations for public exports (`./duplicates`, `./contracts`), explicit evidence composition, and any `unknown` contract questions in `packages/kaal-testing/plan/seeded-properties/pilot.md`;
  - promotes only justified contract counterexamples into existing executed suites (`test/contracts.test.mjs`, `test/duplicates-inputs.test.mjs`), keeping uncontracted discoveries (`unknown`) clearly separated; and
  - records an explicit **BASS judgment** assessing whether a reusable deterministic PRNG/runner Script under `skills/kaal-testing/scripts/` is earned for a future Change or remains premature.

## Nonfunctional

- **testing/N37** [testing/I46]: **Strict BASS Skill-first boundary and surface lock.** `testing/C75`–`C77` introduce no `skills/kaal-testing/scripts/` directory, no extra `references/` files (`skills/kaal-testing/` holds only `SKILL.md` and `references/findings.md`), no new `package.json` exports or dependencies, no hardcoded KAAL repository paths inside `SKILL.md` (`.kaal/`, `engineering/`, `packages/`), and no changes to `T156`/`T160` heading pins or `T381`–`T383` (`checkSkill("kaal-testing", ...)` continues passing with zero findings or warnings). No synthetic agent prompt trial is run in this collector.
