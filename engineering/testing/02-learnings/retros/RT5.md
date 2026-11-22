---
id: testing/RT5
format: 4L
reflects: [testing/C80]
---
Account of: I am the coding agent who drafted and revised the testing/C80 PLAN (#2308), opened the collector SYNC (#2312), and executed and revised the C80 DO (#2331) on collector kaal/testing/verify-case; the user, CTO, CPO, and CRO steered the four-layer split, C30 Case placement, and fail-closed classification, and this is my own account.

## Liked
- subject: four-layer producer/consumer boundary separating Hosting inspection, Testing form checking, and contextual Control judgment
  keeps: testing/CTL1 stays a thin consumer of kaal-testing/case-form@1 without duplicating a source parser or confusing structural validity with substantive test adequacy.
- subject: throwaway DO scratch verification before opening the DO pull request
  keeps: every T397 to T401 assertion and check-layout rule was proved against a disposable copy first, so the live DO turned 5/5 GREEN on the first run.

## Learned
- subject: token-state lexing vs line-anchored regexes for ESM top-level exports
  source: es-module-lexer documentation (github.com/guybedford/es-module-lexer and npmjs.com/package/es-module-lexer): a JavaScript token state machine tracks comments and template literals so export keywords inside strings or block comments never produce false top-level exports.
- subject: tri-state fail-closed handling of incomplete static-analysis evidence
  source: fail-closed static-analysis policy guidance (nhimg.org): lack of evidence proving safety is not evidence of safety, so policy engines model ALLOW, DENY, and UNKNOWN separately and never default incomplete or unestablished evidence to ALLOW or an authoritative DENY.

## Lacked
- subject: explicit C30 Case-placement rule for PLAN RED Cases in package-layout folders
  decision-point: placing T397 to T401 under engineering/testing/01-changes/C80-verify-case/ during PLAN #2308 and then removing them to DO after Engineering and Workspaces CI failed.
  cost: CI run 44965325563 failed Engineering (5 RED Cases + pull/T34) and Workspaces (pull/T37), a wrong detour removing the Cases per C120 precedent, and a CPO correction to restore them in destination 10- to 14- folders per C30 (#2316 -> #2318).
  findable: yes
  address: Skill
- subject: checking FAIL_KINDS strictly against F173 before opening the DO pull request
  decision-point: keeping extra producer kinds (case-id, id-differs, target-missing, first-line) in FAIL_KINDS of judge-verify-case.mjs during DO #2331.
  cost: CTO review, CPO changes request, CRO review, and a follow-up revision commit (fa8a16b9) to remove the four unestablished kinds and add discriminating UNKNOWN assertions.
  findable: yes
  address: Skill
- subject: cross-platform Windows path handling in kaal-release test helpers
  decision-point: running npm test -w @kaihacksai/kaal-release locally on Windows to verify pull/T37 before pushing.
  cost: local test run failed on unrelated POSIX slash splits (.split('/packages/')[0]) and CRLF line endings, forcing reliance on Ubuntu CI for Workspaces verification.
  findable: no
  address: script

## Longed For
- subject: a single command that runs check-layout, find-controls, check-controls, and collectCases together on a capability folder
  worked-anyway: each script ran individually in seconds and caught every layout and control issue before push.

Decisions: none made, the owner decides.
