# Repository hygiene inventory: open PRs and remote branches (PLAN, findings only)

Capability: Engineering. Collector: kaal/engineering. Record number is provisional until integration.

Kai asked for a clean state. This is the inventory only: no PR is closed and no branch is deleted here. Each owning thread confirms its own items, then the agreed deletions run as one reviewed batch.

Snapshot: 3 November 2026, from the GitHub API and `git branch -r`. 52 open PRs, 209 remote branches. Closed-PR evidence covers the latest 400 closed PRs (#483 and up); a branch with no PR in that window is flagged for verification, not assumed dead.

## 1. Findings

- No open PR is idle for 7 days or more. The oldest activity is #271 (29 Oct, 5 days).
- Wrong base: #610 (non-collector head into main) and #787 (same); #920 (base is a feature branch, not a collector).
- Kai-authored: #810, #823, #825, #838. They go back to Kai.
- Superseded: #739 (C11 DO, replaced by the ledger rule), #766 (SYNC PREP, replaced by SYNC steps 2-3 and #906).
- Branch state: 35 `kaal/*` collectors have no open PR; 12 branches have a merged PR; 23 have a closed-unmerged PR; 70 `claude/*` or `sync/*` branches have no PR in the window.

## 2. Open PRs

| PR | Owner | Draft | Updated | Proposed action |
|---|---|---|---|---|
| #271 kaal-sealing: the SEAL Definition | sealing |  | 2026-10-29 | keep |
| #328 Promote workflow names to main | (main) |  | 2026-11-02 | keep: promotion queue (CI names); Owner decides order |
| #560 PROMOTION kaal/process → main: the Process capability a | (main) |  | 2026-11-03 | keep: promotion, CPO-approved |
| #577 guard/C118 DO: guard/T114 visibly not applicable on Win | guard-release |  | 2026-11-03 | keep |
| #605 project/C2 PLAN: the Project map | project |  | 2026-10-30 | keep |
| #610 PLAN engineering/C5: Engineering standards register, re | (main) |  | 2026-10-31 | RETARGET to kaal/engineering: only kaal/* may open into main |
| #619 controls/C6: plan a Control has its Intents | controls |  | 2026-10-30 | keep |
| #620 kaal-process: PDCA as a Process Template, consumer smok | process |  | 2026-11-03 | keep |
| #621 PROMOTION kaal/graph → main (HELD): Graph 0.0.1 release | (main) |  | 2026-11-02 | keep: held promotion (Graph waits on Hosting) |
| #643 agents/C6 DO: product docs, consumer cases and consumer | agents |  | 2026-11-03 | keep |
| #659 graph/C5 DO: scoped Graph 0.0.1 consumer contract, docs | graph | draft | 2026-11-03 | keep |
| #662 change/C8 DO: Change Nodes, succession and delivery (ch | change |  | 2026-11-03 | keep |
| #667 testing/C33 PLAN: what covered, allocated and unverifie | testing |  | 2026-10-31 | keep |
| #686 PROMOTION kaal/packaging → main: Packaging 0.0.1, priva | (main) |  | 2026-11-03 | keep: promotion; protect scope (CPO on #907) |
| #694 hosting/C20 PLAN: read excludes named directories | hosting |  | 2026-10-31 | keep |
| #714 Evidence trial only: current C129 repair + Engineering  | guard-release | draft | 2026-11-01 | CLOSE if C129 repair landed (evidence trial only); Guard confirms |
| #739 engineering/C11 DO (draft): Change Isolation by reverse | hosting | draft | 2026-11-01 | CLOSE: superseded by the ledger rule (#880) and #906 |
| #745 testing/C48 PLAN: derive Case tests → from the Case's o | testing |  | 2026-10-31 | keep |
| #746 packaging/C10 PLAN: dependency traces Graph can travers | packaging |  | 2026-10-31 | keep |
| #747 foundation/C13 PLAN: consumer boundary checks at the ou | foundation |  | 2026-11-03 | keep |
| #751 hosting/C24 DO: Hosting's ownership claim | hosting | draft | 2026-10-31 | keep |
| #765 SYNC: main → kaal/hosting — Hosting 0.0.1 preparation | hosting | draft | 2026-11-03 | keep: the live Hosting SYNC |
| #766 SYNC PREP: resolved Hosting 0.0.1 candidate — Branching | hosting | draft | 2026-11-01 | CLOSE: superseded by SYNC steps 2-3 and #906; Hosting confirms |
| #787 Engineering evidence: first C51 CI candidate and depend | (main) | draft | 2026-11-01 | CLOSE or RETARGET: evidence branch into main; C51 adoption merged (#785, #799); Engineering decides |
| #810 Engineering: unwired durable producer authority and rec | ci-gates | draft | 2026-11-01 | to Kai: Kai-authored draft idle since 1 Nov |
| #823 graph/C10: non-Core scoped Hosting compatibility (depen | graph | draft | 2026-11-01 | to Kai: Kai-authored draft idle since 1 Nov |
| #825 Core: isolate Graph collector Hosting references (depen | graph | draft | 2026-11-01 | to Kai: Kai-authored draft idle since 1 Nov |
| #838 foundation/C16 DO (dependent draft): installed authorit | foundation |  | 2026-11-03 | to Kai: Kai-authored; Foundation pin candidate, keep |
| #857 Engineering: active-reference closure for the Testing s | engineering |  | 2026-11-02 | keep |
| #859 Engineering PLAN: reuse-first interoperability acceptan | engineering |  | 2026-11-02 | keep |
| #860 Product PLAN: supporting the Owner viewpoint | product |  | 2026-11-03 | keep |
| #868 core/C48 DO (candidate): exact Foundation 0.0.2 pin, as | core | draft | 2026-11-03 | keep |
| #892 intent/C3 PLAN: Intent ownership and traceability | intent |  | 2026-11-03 | keep |
| #893 requirements/C13 PLAN: establish Requirements ownership | requirements |  | 2026-11-03 | keep |
| #905 review: prepare kaal-review on kaal/hosting for the fin | hosting |  | 2026-11-03 | keep |
| #906 Engineering: ledger rule on kaal/hosting in place of th | hosting |  | 2026-11-03 | keep |
| #907 packaging/C17 DO: general conformance profile, one judg | packaging | draft | 2026-11-03 | keep |
| #911 Testing: Foundation 0.0.2 pin (ledger-entry candidate,  | testing | draft | 2026-11-03 | keep |
| #913 review DO-1: structured review record, scripts and shor | review |  | 2026-11-03 | keep |
| #916 intent/C4 PLAN: Intent product plan and next changes | intent |  | 2026-11-03 | keep |
| #918 change DO (candidate): exact Foundation 0.0.2 pin, asse | hosting | draft | 2026-11-03 | keep |
| #919 Testing PLAN: frozen T74 classification inputs for C36 | testing |  | 2026-11-03 | keep |
| #920 agents/C7 DO: installed npm test is the consumer verifi | claude/project-thread-kt4lcb-a | draft | 2026-11-03 | FIX BASE: base is a feature branch, not a collector; Agents |
| #923 SYNC: main 9a9e896 into kaal/change (step 1: Guard jobs | change |  | 2026-11-03 | keep |
| #924 packaging PLAN: package independence and lockfile strat | packaging |  | 2026-11-03 | keep |
| #925 packaging/C18 DO: general package-engineering skill | packaging | draft | 2026-11-03 | keep |
| #928 requirements/C11: planned tests of Traceable Requiremen | requirements |  | 2026-11-03 | keep |
| #929 change/C2 PLAN amendment: FAR is Change's concept using | change |  | 2026-11-03 | keep |
| #930 Process PLAN (draft): kaal-process 0.0.1 release accept | process |  | 2026-11-03 | keep |
| #932 Process PLAN: instances with their owners, PDCA as firs | process |  | 2026-11-03 | keep |
| #933 core/C49 DO: prepare installed Core Skill navigation (s | core |  | 2026-11-03 | keep |
| #934 SYNC main → kaal/requirements: unblock #893 and #928 (G | requirements |  | 2026-11-03 | keep |

## 3. Remote branches

Deleting a remote branch is not possible from this session: the GitHub tools offer no delete-branch call. Every deletion below needs local execution (section 4).

### 3a. Merged PR head branches (delete after owner glance)

- `claude/project-thread-425sdx` (2026-10-31)
- `claude/project-thread-hspd10` (2026-11-02)
- `claude/project-thread-wz1s57` (2026-11-02)
- `claude/project-thread-wz1s57-admission-plan` (2026-11-02)
- `claude/project-thread-wz1s57-c15-focused` (2026-11-02)
- `claude/project-thread-wz1s57-hosting-route` (2026-11-02)
- `claude/project-thread-wz1s57-hosting-step3-set` (2026-11-02)
- `claude/project-thread-wz1s57-ledger-do` (2026-11-02)
- `claude/project-thread-wz1s57-ledger-main` (2026-11-02)
- `claude/project-thread-wz1s57-release-plan` (2026-11-02)
- `engineer-skill/bass-procedure-plan` (2026-11-02)
- `engineering/scripts-bass-plan` (2026-11-02)

### 3b. Closed-unmerged PR head branches (owner confirms)

- `claude/core-c34-standard-plan` (2026-10-30), PR #656
- `claude/core-sync-graph-node-dts` (2026-10-30), PR #670
- `claude/engineering-release-trial` (2026-10-31), PR #726
- `claude/foundation-c11-do` (2026-10-31), PR #749
- `claude/guard-c115-plan` (2026-10-29), PR #567
- `claude/guard-c129-trial` (2026-10-30), PR #666
- `claude/guard-c133-plan` (2026-10-29), PR #647
- `claude/guard-verify-sync-main` (2026-10-28), PR #544
- `claude/packaging-c9-do` (2026-10-31), PR #715
- `claude/packaging-sync-main-cc74d99` (2026-10-31), PR #724
- `claude/project-thread-6njaub-sync2` (2026-10-29), PR #524
- `claude/project-thread-kt4lcb-graph-c7-core` (2026-10-31), PR #687
- `claude/project-thread-wz1s57-hosting-step3-prep` (2026-11-02), PR #870
- `claude/roles-sync` (2026-11-03), PR #912
- `claude/testing-c23-cover-script` (2026-10-29), PR #628
- `claude/testing-c24-ownership-markdown` (2026-10-29), PR #633
- `core/c42-navigation-review` (2026-11-02), PR #827
- `engineering/automerge-probe` (2026-11-01), PR #792
- `sync/change-main-a141116` (2026-11-03), PR #921
- `sync/hosting-0.0.2-step2-main-dd39d3b` (2026-11-02), PR #869
- `sync/hosting-0.0.2-step2c-main-dd39d3b` (2026-11-02), PR #883
- `sync/hosting-0.0.2-step3-main-9a9e896` (2026-11-02), PR #895
- `sync/hosting-0.0.2-step4-main-01b5528` (2026-11-02), PR #900

### 3c. No PR in the window (owner verifies, then delete or keep with a reason)

- `claude/kaal-acceptance-serial-codex` (2026-10-16)
- `claude/kaal-acceptance-sync-promotion` (2026-10-17)
- `claude/kaal-agents-pointer-3` (2026-10-14)
- `claude/kaal-bacchus` (2026-10-13)
- `claude/kaal-change-isolation-merge-result` (2026-10-14)
- `claude/kaal-core-0.0.1-n8of1j-c2` (2026-10-18)
- `claude/kaal-core-0.0.1-n8of1j-codex` (2026-10-16)
- `claude/kaal-core-0.0.1-n8of1j-how` (2026-10-17)
- `claude/kaal-core-kernel-type` (2026-10-19)
- `claude/kaal-core-sync-main` (2026-10-19)
- `claude/kaal-engineer-skill-codex` (2026-10-14)
- `claude/kaal-engineer-skill-fz0uxy` (2026-10-13)
- `claude/kaal-engineering-branching-sync-4` (2026-10-16)
- `claude/kaal-graph-knife` (2026-10-20)
- `claude/kaal-hosting-casefold` (2026-10-13)
- `claude/kaal-hosting-codex-fixes` (2026-10-13)
- `claude/kaal-hosting-proto` (2026-10-13)
- `claude/kaal-hosting-within-evidence` (2026-10-16)
- `claude/kaal-probe-hosting-node24` (2026-10-13)
- `claude/kaal-promote-ci` (2026-10-14)
- `claude/kaal-promote-engineering` (2026-10-14)
- `claude/kaal-review-sync-main` (2026-10-20)
- `claude/kaal-sealing-q7rtzn` (2026-10-16)
- `claude/kaal-sealing-sync` (2026-10-16)
- `claude/kaal-sealing-sync-current` (2026-10-16)
- `claude/kaal-sealing-sync-main` (2026-10-16)
- `claude/kaal-sync-16-enforcement` (2026-10-14)
- `claude/kaal-sync-18-template` (2026-10-13)
- `claude/kaal-sync-21-license` (2026-10-13)
- `claude/kaal-sync-23-24-checker-attributes` (2026-10-14)
- `claude/kaal-sync-39-enforcement-tip` (2026-10-14)
- `claude/kaal-windows-probe` (2026-10-13)
- `claude/process-release-plan` (2026-11-03)
- `claude/product-owner-view-do` (2026-11-03)
- `claude/project-thread-59o1e0-ci-sync-5` (2026-10-17)
- `claude/project-thread-59o1e0-dependencies-sync-5` (2026-10-17)
- `claude/project-thread-59o1e0-embargo` (2026-10-16)
- `claude/project-thread-cc6edd-acceptance` (2026-10-16)
- `claude/project-thread-cc6edd-sync` (2026-10-17)
- `claude/project-thread-cc6edd-v2` (2026-10-18)
- `claude/project-thread-d5x8wr-sync` (2026-10-29)
- `claude/project-thread-ja04cd-hosting-eloop` (2026-10-16)
- `claude/project-thread-kt4lcb-core-sync2` (2026-10-17)
- `claude/project-thread-kt4lcb-intent-sync3` (2026-10-19)
- `claude/project-thread-okguir` (2026-10-16)
- `claude/project-thread-okguir-async-privacy` (2026-10-18)
- `claude/project-thread-okguir-marks-review` (2026-10-16)
- `claude/project-thread-okguir-overrides-review` (2026-10-16)
- `claude/project-thread-okguir-record-placement` (2026-10-20)
- `claude/project-thread-okguir-review` (2026-10-16)
- `claude/project-thread-okguir-signals-review` (2026-10-16)
- `claude/project-thread-t1fol6` (2026-10-28)
- `claude/project-thread-u13ksf-ratification` (2026-10-27)
- `claude/project-thread-u242ra-eee-readme` (2026-10-20)
- `claude/project-thread-u242ra-engineering-sync-2` (2026-10-19)
- `claude/project-thread-u242ra-guard-c10` (2026-10-24)
- `claude/project-thread-u242ra-guard-c11` (2026-10-24)
- `claude/project-thread-u242ra-guard-c51` (2026-10-25)
- `claude/project-thread-u242ra-guard-c79-next` (2026-10-26)
- `claude/project-thread-u242ra-guard-c8` (2026-10-24)
- `claude/project-thread-u242ra-guard-c9` (2026-10-24)
- `claude/project-thread-u242ra-guard-promo1` (2026-10-26)
- `claude/project-thread-u242ra-guard-release` (2026-10-23)
- `claude/project-thread-u242ra-guard-release-workflow` (2026-10-23)
- `claude/project-thread-ytlrli-hook` (2026-10-14)
- `claude/project-thread-ytlrli-rename` (2026-10-13)
- `claude/promotion-source-probe` (2026-10-14)
- `claude/sync-main-into-promote-engineering` (2026-10-14)
- `sync/graph-into-core` (2026-10-30)
- `sync/hosting-0.0.2-step2b-main-dd39d3b` (2026-11-02)

### 3d. `kaal/*` collectors with no open PR (owner confirms: promoted and deletable, or still wanted)

- `kaal/acceptance`
- `kaal/agents-pointer`
- `kaal/agents-pointer-2`
- `kaal/agents-pointer-3`
- `kaal/architecture`
- `kaal/automerge-probe`
- `kaal/bacchus`
- `kaal/branching`
- `kaal/branching-0.0.1`
- `kaal/change-isolation`
- `kaal/change-isolation-ledger`
- `kaal/check-names`
- `kaal/communication`
- `kaal/core-admission`
- `kaal/core-form`
- `kaal/data`
- `kaal/dependencies`
- `kaal/engineer-skill`
- `kaal/engineering-artifact-api`
- `kaal/genesis`
- `kaal/guard-package`
- `kaal/learning`
- `kaal/lineage-synchronization`
- `kaal/pre-push-hook`
- `kaal/pre-push-hook-2`
- `kaal/promote-ci`
- `kaal/promote-engineering`
- `kaal/promote-engineering-2`
- `kaal/readme`
- `kaal/roles`
- `kaal/sealing-2`
- `kaal/security`
- `kaal/service`
- `kaal/skills`
- `kaal/test-lanes`
- `kaal/test-lanes-2`

## 4. Local execution

For the agreed deletions: one reviewed batch, exact branch names, one `git push origin --delete <name>` per branch, no chaining, run in a Remote Control session on Kai's device. Nothing is deleted before the owning threads confirm their lists and Kai asks for the session.

## Scope and authorization

This record only. No PR is closed, no branch is deleted, no synchronization, promotion or publication is authorized.
