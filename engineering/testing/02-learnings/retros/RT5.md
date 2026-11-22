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
- subject: first-line and target-missing are informational in existing Testing code rather than authoritative defects
  source: CTO review of #2331 citing packages/kaal-testing/lib/observe.mjs and hold-adapter Case T390, which copy first-line and target-missing without acting on them; treating either as authoritative FAIL would turn the 135 incomplete-resolver targets into false FAILs.
- subject: an explicitly inert placement DO may land ahead of its upstream producers when rollout remains gated on those prerequisites
  source: CPO review ruling on #2331 distinguishing file placement from operational readiness: CTL1 stays detective and designed, unwired, with declared evidence obligations rather than claimed real-tree evidence until upstream producers reconcile kaal-testing/case-form@1.

## Lacked
- subject: checking existing C69 and C74 ownership before drafting a standalone regex parser and frontmatter-only subject harvester in PLAN #2308
  decision-point: drafting parseCase and a frontmatter-only subject scan inside C80 instead of separating Hosting shared source inspection, Testing Case-form checking (C69/C74), and contextual Control judgment.
  cost: multiple PLAN revision rounds on #2308 (including fixing template/comment spoofing, non-callable run, false-PASS on incomplete reports, wildcard exemption policies, and .red.mjs parking) before reaching the four-layer split and CPO approval.
  findable: yes
  address: Skill
- subject: explicit C30 Case-placement rule for PLAN RED Cases in package-layout folders
  decision-point: placing T397 to T401 under engineering/testing/01-changes/C80-verify-case/ during PLAN #2308 and then removing them to DO after Engineering and Workspaces CI failed.
  cost: CI run 44965325563 failed Engineering (5 RED Cases + pull/T34) and Workspaces (pull/T37), a wrong detour removing the Cases per C120 precedent, and a CPO correction to restore them in destination 10- to 14- folders per C30 (#2316 -> #2318).
  findable: yes
  address: Skill
- subject: an automated check verifying every kind in a Control judge's FAIL_KINDS list against F173's enumerated authoritative defects plus a discriminating UNKNOWN Case
  decision-point: carrying extra unestablished kinds (case-id, id-differs, target-missing, first-line) in judge-verify-case.mjs FAIL_KINDS during DO #2331.
  cost: CTO review, CPO changes request, CRO review, and a follow-up revision commit (fa8a16b9) removing the four unestablished kinds and adding discriminating UNKNOWN assertions in T399 and unit tests.
  findable: yes
  address: script

## Longed For
- subject: a single command that runs check-layout, find-controls, check-controls, and collectCases together on a capability folder
  worked-anyway: each script ran individually in seconds and caught every layout and control issue before push.

Decisions: none made, the owner decides.
