# Pull Promotion: analysis

The CTO handover asked four questions. Evidence is from the repository and its pull requests on 12 Nov 2026 (12:47 to 12:55 UTC). Nothing was written to the repository. Interfaces named as "missing" were looked for in the workflows, the Change records and the pull requests below, not assumed.

## 1. What is readiness?

Three different statements, kept apart because KAAL delivers a Change in more than one promotion:

| Statement | Question | Real example (release/C14) |
| --- | --- | --- |
| Change complete | Did every piece type of the Change land on the target? | No: PLAN #1447 is in `kaal/release/fallback-template`, DO #1458 in `kaal/release/wire-fallback-template`, no ACT yet. Nothing is on `main`. |
| Increment complete | Did what this promotion carries, closed by its ACT, land in the collector since its last delivery? | No for `wire-fallback-template`: its increment is the `.github` DO #1458, with no ACT yet. |
| Collector promotion-ready | Is the increment complete and does every owner's evidence pass? | BLOCKED, see section 3. |

**Incomplete versus not judged.** Incomplete is evidence that says work is missing or red (FAIL). Not judged is evidence that is absent, still running or unowned (UNKNOWN). BLOCKED beats NOT JUDGED: a failure is never hidden by an unknown. READY needs every judgment to PASS.

**Minimum observable evidence for one collector:** the declared increment and the pieces of the Change (Analyze Flow's facts); the checks run on the collector's promotion piece, or on its head when none exists; the collector's distance to the target; the reviews of the landed pieces at their landed versions; the Change's declaration of what it needs on the target.

### The Owner's hypothesis, tested against real evidence

"Ready = PLAN, DO, Check and ACT done. Nothing red. Everything landed in the collector."

- **H1, "ACT done".** Confirmed by the Owner (12 Nov, D2): the ACT lands on the collector after everything is green, so the work is done and the learning is logged; only then can the collector be promoted. An increment is therefore closed by its ACT (`readiness.closing`), on top of what it declares it `carries`. A first draft of this PLAN argued the opposite (ACT lands after PLAN and DO reach `main`, so it cannot precede their promotion); the Owner decided against it. Consequence for the real collector: C14 has no ACT, so its increment is incomplete.
- **H2, "PLAN and DO done".** True of a Change, not of an increment. C14's `.github` DO is promoted first so that the engineering part's Cases run green against it (PR #1461 says so); the PLAN follows with the next promotion. So the declared carries of this increment are the DO only. The same pattern is in the evidence of C10 (the `.github` half and the engineering half "must travel as a pair").
- **H3, "Everything landed in the collector".** Needs "since the last delivery": a squash promotion leaves no collector commit on `main`, so `git` cannot say what a collector still holds. Analyze Flow's facts carry the collector version a delivery carried but no landing times, so the increment cannot be placed. Requested as the optional addition `landedAt` (section 4).
- **H4, "Check".** The strongest evidence of "nothing red" exists only on the promotion piece, which does not exist before it is opened. Before that, only checks on the collector head, if the supplier provides them (`collector.checks`), can say anything; otherwise the honest verdict is NOT JUDGED. A consequence for the DO: OPENing a draft promotion is how the evidence is obtained, and the Script recommends it without doing it.
- **H5, "Nothing red".** Applied strictly, it BLOCKS `wire-fallback-template` on a Branching failure that is not a defect of the collector: see section 3. The Script takes the strict reading by default. Whether "nothing red" should be scoped is a CPO decision (D1 below).

## 2. Who owns each judgment?

Candidate allocations from the handover, checked against what exists. "Interface" is what a Script can read today.

| Judgment | Owner | Evidence available today | Missing interface |
| --- | --- | --- | --- |
| increment | Change | The pieces of the Change (Analyze Flow facts); the Change record in `engineering/release-management/00-changes/<id>/` (`change.md`, `evidence.md`, `act.md` when done); the Cases named `.red.mjs` until they are green. | **M1.** The Change record has no machine-readable route: nothing says "this increment carries the DO of C14, the next carries the PLAN". The first increment declares it in the consumer's declaration. |
| verification | Testing | Check conclusions: Acceptance (three platforms), Engineering, Workspaces, Hosting (three platforms). | **M4.** Only check conclusions are visible, not which Cases ran or went green. |
| protection | Guard | Guard (three platforms), CodeQL, Dependency Review conclusions. | Dependency Review is Release's `analyze Vulnerabilities` (release/C5); whether it is Guard's evidence or Release's is for the CPO (D4). |
| sequencing | Release | Collector distance to the target; Branching and Promotion Source conclusions; the lane from Analyze Flow. | **M2.** Branching reports freshness, merge method and more as one conclusion. Which verdict failed is only in its log. |
| validation | Review | The review of each landed piece and the version it was given at (Analyze Flow facts); Change Isolation (review). | None for the first increment. |
| attribution | Engineering adapter | Which check belongs to which owner (the declaration), what the host could not supply (`gaps`). | **M3.** Landing times and collector-head checks are not in Analyze Flow's facts. |

Release orchestrates: it combines the owners' answers and decides nothing they own. No judgment is re-implemented: a check is read as the conclusion its owner produced.

## 3. The smallest end-to-end experiment

**Collector: `kaal/release/wire-fallback-template`**, the `.github` part of release/C14, recorded in [evidence/wire-fallback-template-2026-11-12.json](evidence/wire-fallback-template-2026-11-12.json) (captured from the real repository, not reconstructed). Why this one: one clearly identifiable Change; a real promotion piece (#1461) with 19 distinct checks, one of them red; a Change that spans two collectors; an Owner's hold in force. Chosen over `fallback-template`, the other collector of C14, which needs a SYNC first (#1461), and over the three promotions of the Owner's order, which the experiment must not touch.

What the real evidence says, judgment by judgment:

| Judgment | Owner | Status | Evidence |
| --- | --- | --- | --- |
| increment | Change | **FAIL** | DO #1458 landed in the collector (approved at its head by the CPO), no open piece of C14 into it, Change Isolation passes; but no ACT of C14 has landed in the collector, and an increment is closed by its ACT. |
| verification | Testing | PASS | Acceptance, Engineering, Workspaces, Hosting: success on all platforms. |
| protection | Guard | PASS | Guard, CodeQL, Dependency Review: success. |
| sequencing | Release | **FAIL** | Branching: the newest of four runs (12:30:36Z) is `failure`. Promotion Source passes; the collector is 0 behind `main`. |
| validation | Review | PASS | #1458 approved at the version that landed. |
| attribution | Adapter | PASS | All 19 check names have a declared owner. |

Verdict **BLOCKED**, for two reasons, each traced to its owner: the Change (no ACT closes the increment) and Release (Branching). Next: the Owner's hold on #1461 (draft, auto-merge off, "no promotion go yet", from the Owner's order C7, C10, C9) makes the recommendation WAIT, escalate, for the owner. Nothing is executed.

**What a person sees in the Branching log, which the Script must not use (M2):** `Fresh: merging ... yields exactly the head's validated tree` and `Merge method: Auto-merge is disabled for this pull request into main. Enable auto-merge with squash before integration.` The collector is fresh; the red is the hold. A strict "nothing red" blocks a collector for a state the Owner chose. That is the learning of the experiment, and why D1 exists.

## 4. How does it relate to Analyze Flow?

**Reused as data, not code:** the facts (`coordination/F2`), the findings (`F4`) and the five actions; the declaration (`F3`: roles, holds, pairs, target); the delivery identity (`F13`); the supplier and the command (`F14`, `F17`), which the connected path calls instead of building another. The Script imports nothing from `analyze-flow.mjs`.

**Separate, and why.** The handover asks whether Pull Promotion warrants its own Script. Decision for now: **a separate file in the same Skill**, composed by data. Reasons: Analyze Flow's Script is under active change by its own thread and a function added to it would be edited by two threads; its contract is "observe and explain", this one is "judge eligibility on other controls' evidence"; a separate Script can be folded in later at no cost to either. Fold it in if, after the DO, it adds only a verdict per pair and no input of its own beyond `readiness`.

**Where parallel development could conflict (each is a request, not a change to their files):**

- **R1.** `lane.active` is derived inside Analyze Flow (`F8`) but not in its output (`F4`). Asked to expose it.
- **R2.** `landedAt` on pieces and deliveries (F2, F13) is missing. Optional and additive.
- **R3.** `collector.checks` (checks on a collector head) is missing. Optional and additive.
- **R4.** `checks` must keep the supplier's meaning in `F14`: the newest run per name, running as pending.
- **R5.** Words. Analyze Flow's `status: ready` means an action is actionable now; this verdict's `READY` means eligible. They are different fields; the verdict is never called `status`.
- **R6.** The amendments of #1462 and the id scope: `pull/` is its own scope and edits no file of #1350 or `coordination/`.

## Decisions for the CPO

- **D1. Decided by the Owner, 12 Nov: strict** for the first increment (blocks the C14 collector on a hold-induced Branching red); revisit when Branching exposes its sub-verdicts (M2).
- **D2. Decided by the Owner, 12 Nov: No.** ACT is a prerequisite: it lands on the collector after everything is green, then the collector can be promoted. The PLAN follows (H1, F5).
- **D3. Decided by the Owner, 12 Nov:** a separate Script (section 4).
- **D4.** Which control owns `analyze Vulnerabilities` and CodeQL evidence: Guard or Release.
- **D5.** Where the increments of a Change are declared (M1): the consumer's declaration now, the Change record later.
