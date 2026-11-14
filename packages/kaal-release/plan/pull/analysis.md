# Pull Promotion: analysis

The CTO handover asked four questions. Evidence is from the repository and its pull requests on 12 Nov 2026 (12:47 to 12:55 UTC). Nothing was written to the repository. Interfaces named as "missing" were looked for in the workflows, the Change records and the pull requests below, not assumed.

## 1. What is readiness?

One rule, set by the Owner on 12 Nov: **a Change is scoped to one collector** and is driven there through its own PLAN, DO, Check and ACT. The ACT must have landed in that collector before the Change is eligible for promotion. Work that spans collectors is decomposed into separate Changes, each with its own identity, evidence and closing ACT; the relations between them are explicit dependencies, not phases of one Change spread over collectors. A first draft of this PLAN allowed a partial delivery increment (a DO alone) to be READY while its Change was incomplete; the CPO removed that distinction. A collector is READY when every Change in it has completed its lifecycle there, with no missing or red evidence.

| Statement | Question | Real example (release/C14, a legacy record) |
| --- | --- | --- |
| Change complete in its collector | Did every lifecycle phase (PLAN, DO, ACT) of the Change land in this collector, with its Check green? | No for `wire-fallback-template`: only DO #1458 landed there. The PLAN #1447 is in `kaal/release/fallback-template`, and there is no ACT. Neither is borrowed. |
| Collector promotion-ready | Does every Change in the collector pass, and does every owner's evidence pass? | BLOCKED, see section 3. |

**Legacy records.** release/C14 (the `.github` DO and the PLAN with the engineering part in two collectors) and release/C10 (a `.github` half and an engineering half that travelled as a pair of promotions, see its `evidence.md`) predate the rule. The Script identifies them with a reason (`legacy`) and still judges them by the rule, so they read incomplete; they are not retroactively compliant.

**Incomplete versus not judged.** Incomplete is evidence that says work is missing or red (FAIL). Not judged is evidence that is absent, still running or unowned (UNKNOWN). BLOCKED beats NOT JUDGED: a failure is never hidden by an unknown. READY needs every judgment to PASS.

**Capability first, host integration after (Owner, 12 Nov; terms corrected by the CPO, 12 Nov).** A capability `x`, its host integration (the adapter that reads GitHub) and its wiring (a hook or CI trigger that runs it) are separate Changes on separate collectors, related by explicit dependencies: the integration Change depends on the capability Change, and is not ready until the capability's collector is delivered at its current version (F8). The integration completes its own lifecycle in its own collector and borrows neither the capability's ACT nor its completion evidence (F5). The core reason is to prevent cheating: an integration that lands first lets the capability's contract be weakened until it goes green. An integration reads facts for the capability and never reimplements it; its collector is named `kaal/release/integrate-<capability>`.

**Minimum observable evidence for one collector:** the pieces of each Change in it (Analyze Flow's facts) against the declared lifecycle; the checks run on the collector's promotion piece, or on its head when none exists; the collector's distance to the target; the reviews of the landed pieces at their landed versions; the Change's declaration of what it needs on the target.

### The Owner's hypothesis, tested against real evidence

"Ready = PLAN, DO, Check and ACT done. Nothing red. Everything landed in the collector."

- **H1, "ACT done".** Decided by the Owner (12 Nov): the ACT lands in the collector after everything is green, so the work is done and the learning is logged; only then can the collector be promoted. A first draft argued the opposite and allowed a partial increment; both were rejected. Real: release/C14 has no ACT, so its collector is not ready.
- **H2, "PLAN and DO done".** Of the Change, in its one collector. C14's `.github` DO was promoted first so the engineering part's Cases could run green against it (#1461 says so); that is a legacy pattern the one-collector rule retires. The Script reads it as an incomplete Change and says it is legacy.
- **H3, "Everything landed in the collector".** Needs "since the last delivery": a squash promotion leaves no collector commit on `main`, so `git` cannot say what a collector still holds. Analyze Flow's facts carry the collector version a delivery carried but no landing times, so the Changes in a collector cannot be placed. Requested as the optional addition `landedAt` (section 4); until then it is UNKNOWN, not a guess.
- **H4, "Check".** The strongest evidence of "nothing red" exists only on the promotion piece, which does not exist before it is opened. Before that, only checks on the collector head, if the supplier provides them (`collector.checks`), can say anything; otherwise the honest verdict is NOT JUDGED. A consequence for the DO: OPENing a draft promotion is how the evidence is obtained, and the Script recommends it without doing it.
- **H5, "Nothing red".** Applied strictly, it BLOCKS `wire-fallback-template` on a Branching failure that is not a defect of the collector: see section 3. The Script takes the strict reading by default. Whether "nothing red" should be scoped is a CPO decision (D1 below).

## 2. Who owns each judgment?

Candidate allocations from the handover, checked against what exists. "Interface" is what a Script can read today.

| Judgment | Owner | Evidence available today | Missing interface |
| --- | --- | --- | --- |
| lifecycle | Change | The pieces of each Change in the collector (Analyze Flow facts) against the declared lifecycle; the Change record in `engineering/release-management/00-changes/<id>/` (`change.md`, `evidence.md`, `act.md` when done); the Cases named `.red.mjs` until they are green. | **M1.** The Change record names no collector and no dependencies in a form a Script can read. The first increment declares them in the consumer's declaration (dependencies, legacy). |
| verification | Testing | Check conclusions: Acceptance (three platforms), Engineering, Workspaces, Hosting (three platforms). | **M4.** Only check conclusions are visible, not which Cases ran or went green. |
| protection | Guard | Guard (three platforms) conclusions. | None for the first experiment. |
| sequencing | Release | Collector distance to the target; Branching, Promotion Source, Dependency Review (`analyze Vulnerabilities`, release/C5) and CodeQL conclusions; the lane from Analyze Flow. | **M2.** Branching reports freshness, merge method and more as one conclusion. Which verdict failed is only in its log. |
| validation | Review | The review of each landed piece and the version it was given at (Analyze Flow facts); Change Isolation (review). | None for the first experiment. |
| attribution | Engineering adapter | Which check belongs to which owner (the declaration), what the host could not supply (`gaps`). | **M3.** Landing times and collector-head checks are not in Analyze Flow's facts. |

Release orchestrates: it combines the owners' answers and decides nothing they own. No judgment is re-implemented: a check is read as the conclusion its owner produced.

## 3. The smallest end-to-end experiment

**Collector: `kaal/release/wire-fallback-template`**, the `.github` part of release/C14, recorded in [evidence/wire-fallback-template-2026-11-12.json](evidence/wire-fallback-template-2026-11-12.json) (captured from the real repository, not reconstructed). Why this one: one clearly identifiable Change; a real promotion piece (#1461) with 19 distinct checks, one of them red; a Change that spans two collectors; an Owner's hold in force. Chosen over `fallback-template`, the other collector of C14, which needs a SYNC first (#1461), and over the three promotions of the Owner's order, which the experiment must not touch.

What the real evidence says, judgment by judgment:

| Judgment | Owner | Status | Evidence |
| --- | --- | --- | --- |
| lifecycle | Change | **FAIL** | release/C14 is the one Change in the collector, and a legacy record. Only DO #1458 landed here (approved at its head by the CPO). Its PLAN #1447 is in `kaal/release/fallback-template`, and no ACT exists; neither is borrowed. |
| verification | Testing | PASS | Acceptance, Engineering, Workspaces, Hosting: success on all platforms. |
| protection | Guard | PASS | Guard: success on all platforms. |
| sequencing | Release | **FAIL** | Branching: the newest of four runs (12:30:36Z) is `failure`. Promotion Source, Dependency Review and CodeQL pass; the collector is 0 behind `main`. |
| validation | Review | PASS | #1458 approved at the version that landed. |
| attribution | Adapter | PASS | All 19 check names have a declared owner. |

Verdict **BLOCKED**, for two reasons, each traced to its owner: the Change (the lifecycle is not complete in this collector) and Release (Branching is red). The first is also a finding about the order #1461 states, "the template goes first so the Cases of the engineering part run green against it": it is the legacy pattern the one-collector rule retires.

**What a person sees in the Branching log, which the Script must not use (M2):** `Fresh: merging ... yields exactly the head's validated tree` and `Merge method: Auto-merge is disabled for this pull request into main. Enable auto-merge with squash before integration.` The collector is fresh; the red is the hold. A strict "nothing red" blocks a collector for a state the Owner chose. That is the learning of the experiment, and why D1 exists.

## 4. How does it relate to Analyze Flow?

**Reused as data, not code:** the facts (`coordination/F2`), the findings (`F4`) and the five actions; the declaration (`F3`: roles, holds, pairs, target); the delivery identity (`F13`); the supplier and the command (`F14`, `F17`), which the wiring Change (`pull/C2`) calls instead of building another. The Script imports nothing from `analyze-flow.mjs`.

**Separate, and why.** The handover asks whether Pull Promotion warrants its own Script. Decision for now: **a separate file in the same Skill**, composed by data. Reasons: Analyze Flow's Script is under active change by its own thread and a function added to it would be edited by two threads; its contract is "observe and explain", this one is "judge eligibility on other controls' evidence"; a separate Script can be folded in later at no cost to either. Fold it in if, after the DO, it adds only a verdict per pair and no input of its own beyond `readiness`.

**Where parallel development could conflict (each is a request, not a change to their files):**

- **R1.** `lane.active` is derived inside Analyze Flow (`F8`) but not in its output (`F4`). Asked to expose it.
- **R2.** `landedAt` on pieces and deliveries (F2, F13) is missing. Optional and additive.
- **R3.** `collector.checks` (checks on a collector head) is missing. Optional and additive.
- **R4.** `checks` must keep the supplier's meaning in `F14`: the newest run per name, running as pending.
- **R5.** Words. Analyze Flow's `status: ready` means an action is actionable now; this verdict's `READY` means eligible. They are different fields; the verdict is never called `status`.
- **R7.** Dependencies between Changes. Analyze Flow declares pairs as an ordered list of (collector, Change); explicit dependencies are carried in this Script's `readiness` section for now. Whether `coordination/F3`'s pair declaration should carry the same dependency is for its owner, as a later amendment.
- **R6.** The amendments of #1462 and the id scope: `pull/` is its own scope and edits no file of #1350 or `coordination/`.

## Decisions for the CPO

- **D1. Decided by the Owner, 12 Nov: strict** for the first increment (blocks the C14 collector on a hold-induced Branching red); revisit when Branching exposes its sub-verdicts (M2).
- **D2. Decided by the Owner, 12 Nov: No.** ACT is a prerequisite: it lands on the collector after everything is green, then the collector can be promoted. The PLAN follows (H1, F5).
- **D3. Decided by the Owner, 12 Nov:** a separate Script (section 4).
- **D4. Decided by the Owner, 12 Nov:** `analyze Vulnerabilities` and CodeQL evidence stay in Release for now, because all controls are born there at present.
- **D5. Decided by the Owner, 12 Nov:** a Change lives in one collector; work spanning collectors is separate Changes related by explicit dependencies, a capability and its host integration being the example. Dependencies and legacy records are declared in the consumer's declaration; the Change record can carry them once it can express them (M1). This PLAN is split accordingly: `pull/C1` here is the capability, the connected path is `pull/C2` (`plan/pull-integration`).
