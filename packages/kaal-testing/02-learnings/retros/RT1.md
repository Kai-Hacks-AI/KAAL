---
id: testing/RT1
format: 4L
reflects: [testing/C71, testing/C72, testing/C73]
---
Account of: I am the Testing agent who planned and revised `testing/C71` (`#2213`) earlier in this conversation, then executed `testing/C72` (`#2217`) and `testing/C73` (`#2224`) on collector `kaal/testing/multi-loop-sensitivity` and wrote this retrospective; Kai, the CPO, the CTO, and external review insights shaped the Changes, and this is my own account.

## Liked
- subject: BASS ordering from Skill guidance down to Script checks
  keeps: landing composable loop guidance in `SKILL.md` before writing scripts prevented embedding a standing mutation runner in `npm test` while letting C73 add eleven plain assertions to `contracts.test.mjs`.
- subject: pre-freezing the Skill trial subject and assessment key in commit `cdddee30` before editing `SKILL.md`
  keeps: baseline and updated-Skill runs in C72 saw identical prompt text and trial fixtures without post-hoc tuning, even though `trial/key.json` still named terms expected from the planned edit (`#2217` review limit).
- subject: separating `unknown` contract authority from `potential defect` in the four finding kinds
  keeps: uncovered implementation behaviour was held for consumer checks rather than turned into guessed assertions or premature code deletion.

## Learned
- subject: Node.js v24 synchronous `module.registerHooks` executes in-thread with `shortCircuit` load control and full CommonJS access
  source: Node.js Customization Hooks documentation read as web-search summaries (secondhand) and exercised locally in C73 on Node `v24.20.0`.
- subject: equivalent and undocumented mutants skew sensitivity counts unless paired with semantic contract review
  source: mutation-testing literature summaries on DeMillo, Lipton, and Sayward and Jia and Harman's survey via web search (secondhand), applied when evaluating uncovered implementation branches in C73.

## Lacked
- subject: pre-PR completion check against all deliverables in the PLAN's architecture table
  decision-point: raising the initial C73 PR #2224 branched off collector base `69025fca` while PR #2217 was open.
  cost: omitted the `M11` clarification owner (raised by the CTO review on `#2224`) and omitted the planned BASS judgment and `C72` sequencing explanation (raised in the review Kai relayed on `#2224`), requiring follow-up commit `2927d9ac`.
  findable: yes
  address: AGENTS.md
- subject: Windows line-ending parity and non-symlink handling in local contract and testability checks
  decision-point: running `engineering/contracts/measure.test.mjs` and full `npm test -w kaal-testing` locally on Windows during C72 and C73.
  cost: `measure.test.mjs` failed 7/7 on Windows (CRLF working-tree bytes on `boundary.test.mjs` and other pinned files mismatching their LF SHA-256 pins in `evidence.kaal.json`, unprivileged `symlinkSync` EPERM, and backslash race paths), forcing reliance on targeted suites plus Ubuntu CI.
  findable: no
  address: script

## Longed For
- subject: follow-up Change by Testing clarifying whether `review.evidence` hash sets are order-invariant in `packages/kaal-testing/README.md` (`M11`)
  worked-anyway: Testing owns `packages/kaal-testing/README.md` and `lib/contracts.mjs` so Testing owns raising that clarification Change (`c73-sensitivity.md` §4), while holding `M11` unpinned and untouched let `C73` harden all eleven documented contract invariants cleanly.
- subject: concrete worked example of qualified observation reuse across claims in `skills/kaal-testing/SKILL.md`
  worked-anyway: whether an added example changes agent behaviour is unknown (qualified reuse remains an open validation gap from `C72`), and `C73` documented single-run composition without one.
- subject: explicit subject-vs-claim separation guidance for blocked harnesses and static import checks in `skills/kaal-testing/SKILL.md`
  worked-anyway: whether extra prose changes static-review classifications is unknown, and `C73` kept harness errors (`M16`) apart from product behaviour without it.
- subject: blinded multi-run agent trial with live tool execution rather than static prompt analysis
  worked-anyway: `C72`'s bounded `n = 2` static trial was enough for the CPO's bounded approval of the Skill revision, with qualified reuse and live execution kept as open gaps.

Decisions: none made, the owner decides.
