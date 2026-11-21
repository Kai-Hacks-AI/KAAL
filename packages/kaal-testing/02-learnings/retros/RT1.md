---
id: testing/RT1
format: 4L
reflects: [testing/C71, testing/C72, testing/C73]
---
Account of: I am the Testing agent who took over the `kaal/testing/multi-loop-sensitivity` collector after `testing/C71` merged, executed `testing/C72` and `testing/C73`, and wrote this retrospective; Kai, the CPO, and the CTO shaped the direction through review comments, and this is my own account of what held up and what blocked me.

## Liked
- subject: BASS ordering from Skill guidance down to Script checks
  keeps: landing composable loop guidance in `SKILL.md` before writing scripts prevented embedding a standing mutation runner in `npm test` while letting C73 add eleven plain assertions to `contracts.test.mjs`.
- subject: pre-freezing the Skill trial subject and assessment key in commit `cdddee30`
  keeps: baseline and updated-Skill runs in C72 saw identical prompt text and files without post-hoc tuning of the key after seeing transcripts.
- subject: separating `unknown` contract authority from `potential defect` in the four finding kinds
  keeps: uncovered implementation behaviour was held for consumer checks rather than turned into guessed assertions or premature code deletion.

## Learned
- subject: Node.js v24 synchronous `module.registerHooks` executes in-thread with `shortCircuit` load control and full CommonJS access
  source: Node.js Customization Hooks documentation read as web-search summaries (secondhand) and exercised locally in C73 on Node `v24.20.0`.
- subject: equivalent and undocumented mutants skew sensitivity counts unless paired with semantic contract review
  source: mutation-testing literature summaries on DeMillo, Lipton, and Sayward and Jia and Harman's survey via web search (secondhand), applied when evaluating uncovered implementation branches in C73.

## Lacked
- subject: concrete worked example of qualified observation reuse across claims in `skills/kaal-testing/SKILL.md`
  decision-point: evaluating whether C72 Skill-arm runs reused single observations across claims while preserving loop boundaries.
  cost: both C72 Skill runs omitted qualified observation reuse and reverted to separate-loops phrasing, and C73 had to explain single-run composition manually.
  findable: no
  address: Skill
- subject: explicit rule separating harness or setup subject from product subject across the four finding kinds
  decision-point: classifying `broken.checks.mjs` `ERR_MODULE_NOT_FOUND` and unexecuted `node:fs` imports during C72 static analysis.
  cost: both C72 Skill runs listed `broken.checks.mjs` as a verified failure of `budget-gate` despite calling it blocked `unknown` in prose, and held `node:fs` as a potential defect pending a script run.
  findable: no
  address: Skill
- subject: pre-PR completion check against all deliverables in the PLAN's architecture table
  decision-point: raising the initial C73 PR #2224 branched off collector base `69025fca` while PR #2217 was open.
  cost: omitted the planned BASS judgment and explanation of the C72 sequencing deviation from `c73-sensitivity.md`, causing a review cycle and follow-up commit `2927d9ac`.
  findable: yes
  address: AGENTS.md
- subject: Windows line-ending parity and non-symlink handling in local contract and testability checks
  decision-point: running `engineering/contracts/measure.test.mjs` and full `npm test -w kaal-testing` locally on Windows during C72 and C73.
  cost: `measure.test.mjs` failed 7/7 on Windows (CRLF byte mismatch against LF `evidence.kaal.json` hashes, unprivileged `symlinkSync` EPERM, and backslash race paths), forcing reliance on targeted suites plus Ubuntu CI.
  findable: no
  address: script

## Longed For
- subject: explicit contract clause in `packages/kaal-testing/README.md` deciding whether `review.evidence` hash sets are order-invariant (`M11`)
  worked-anyway: leaving `M11` unpinned and `lib/contracts.mjs` untouched let C73 harden all eleven documented contract invariants cleanly.
- subject: blinded multi-run agent trial with live tool execution rather than static prompt analysis
  worked-anyway: C72's bounded `n = 2` static trial was sufficient evidence to ship the Skill revision on this collector.

Decisions: none made, the owner decides.
