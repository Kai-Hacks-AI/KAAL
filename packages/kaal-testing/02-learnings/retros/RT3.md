---
id: testing/RT3
format: 4L
reflects: [testing/C75, testing/C76, testing/C77]
---
Account of: I am the Testing agent who planned `testing/C75` (`#2249`), executed `testing/C76` (`#2260`) and `testing/C77` (`#2275`) on collector `kaal/testing/seeded-properties`, and wrote this retrospective; Kai, the CTO, the CPO, and relayed review comments shaped every Change, and this is my own account.

## Liked
- subject: strictly sequential Change dependencies across PRs from PLAN to Skill DO to Pilot DO
  keeps: landing each stage on the collector before starting the next kept diffs non-overlapping and prevented executing the pilot on a stale pre-Skill head.
- subject: pre-classifying every property as authoritative invariant or exploratory hypothesis before running
  keeps: unexpected non-JSON coercion throws (`Symbol` and `Object.create(null)`) stayed open `unknown` contract questions instead of becoming invented defects.
- subject: routing contract breaches to `15-defects/` separately from passing fixed-seed additions in `scripts.test`
  keeps: reproducible product failures (`s.source` and sibling `e.file`) stayed preserved in a parked RED Case without turning `npm test` red or sneaking fixes into `lib/`.

## Learned
- subject: `Object.hasOwn` inspects direct own properties without reading inherited `Object.prototype` keys
  source: MDN Web Docs `Object.hasOwn()` summary via web search (secondhand), clarifying why plain-object indexing `files[key]` resolved `"toString"`, `"__proto__"`, and `"constructor"` to functions or objects in `lib/contracts.mjs`.
- subject: QuickCheck-style random generation with deterministic shrinking reduces complex failures into minimal counterexamples
  source: Claessen and Hughes QuickCheck literature summary via web search (secondhand), informing generator/shrinker separation in `C77` even though the triggered failures were already single-item inputs.

## Lacked
- subject: active-PR ID collision check and plain `.test.mjs` Hold-visibility rule before raising `testing/C75` (`#2249`)
  decision-point: claiming requirement/Case IDs (`F163`, `F164`, `T390`) and writing `T390.red.mjs` with double-quoted metadata for the PLAN PR.
  cost: collided with active sibling PRs (`#2240`, `#2120`) and left `T390` invisible to Hold behind `.red.mjs` and double quotes, requiring renumbering (`F165`, `F166`, `T392.test.mjs`) in commit `e9d46533`.
  findable: yes
  address: AGENTS.md
- subject: separating counterexample reproduction from contractual authority in initial `C76` `SKILL.md` wording
  decision-point: writing the `**Seeded property and adversarial testing.**` paragraph in `packages/kaal-testing/skills/kaal-testing/SKILL.md` (`#2260`).
  cost: calling shrunk counterexamples `(verified failure)` and omitting owner handoff weakened the authoritative-vs-exploratory distinction, requiring follow-up commit `e27355b9` and PR title cleanup.
  findable: no
  address: Skill
- subject: tight matching between committed test assertions, pilot table claims, and actual runtime checks in `C77` (`#2275`)
  decision-point: committing `pilot.md` and fixed-seed assertions into `test/contracts.test.mjs`.
  cost: included `{ forEach() {} }` inside `badJsonVals`, omitted `files` snapshotting and `p.length > 0` in the committed check, generalized `Map`/`Set` prototype immunity in `pilot.md`, and named an unused hypothetical defect id in prose, requiring cleanup commit `7ac996b3`.
  findable: no
  address: Skill

## Longed For
- subject: dedicated Testing corrective Change resolving open Defect `testing/D1` and migrating `T393`/`T394` to the discoverable Case lifecycle
  worked-anyway: parking `15-defects/D1-classify-inherited-file-keys.md` and `classify-inherited-keys.red.mjs` preserved exact reproduction on `ec31e685` while allowing `C77` to close cleanly without editing `lib/contracts.mjs`.
- subject: explicit note in `packages/kaal-testing/README.md` stating whether `problems()` assumes decoded JSON values or guards arbitrary JavaScript primitives (`Symbol`, null-prototype objects)
  worked-anyway: logging `P-C3`'s three throws as an `unknown` API-scope question allowed JSON-typed hostile checks to pass cleanly in `test/contracts.test.mjs` without overclaiming a defect.

Decisions: none made, the owner decides.
