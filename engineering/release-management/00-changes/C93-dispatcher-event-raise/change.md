# C93 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, `final-step.mjs`, the workflow source `dispatcher-raise.yml`, the `final` command and the one changed line of `raise.mjs`, the trigger block of `dispatcher.yml`) and the Cases T1149 to T1158, all RED, next to the elements they test.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, nothing under `.github`, no variable and no setting.

## The concept, in slices

The queue is the set of open PROMOTION pull requests. Three parts, in this order:

1. **RAISE (this Change, release/C93).** The final step merges, a draft PROMOTION appears.
2. **PICK and SYNC (next Change; it holds what was planned as release/C74).** When a merge lands in `main`, take the first draft PROMOTION that is green by priority HOTFIX, then WIRE, then KAAL, then the oldest; SYNC its branch when behind (a pure SYNC, for the picked branch only); mark it ready. That ready PROMOTION is the seat. Red drafts are skipped and are shown with their state, never hidden; a draft closed by hand leaves the queue. A schedule of ten minutes returns as the safety net for PICK only.
3. **Seat, capacity and priority as policy (what was planned as release/C75).** The seat is derived (the one non-draft PROMOTION), not stored; the capacity variable and the priority order are the replaceable policy of PICK. `kaal/release/pull-lane` is harvested here: the anti-spam rule, the SYNC only for the seat holder, the class priority.

Whether a draft is green is read from its own checks (what the ruleset requires), not from the file evidence of release/C92; that is PICK's question, and it waits for the aggregating readiness check the Owner and the controls thread are designing.

## What this Change does with release/C92 (#1996)

**Close #1996. Do not land it, do not reshape it.** Its verdict scans every collector and judges readiness by counting files; the concept replaces both: readiness is the merge of a final step (RAISE) and the green checks of a draft (PICK), and the scan goes. Landing it would put a verdict module, three elements and ten Cases on `main` that the next two Changes would delete. What survives is not code but four principles, which move into the Cases of PICK: every decision names its collector, the seat is a separate line and never hides a verdict, facts (behind, age, earlier PROMOTIONs) are shown and never filter, and the order is deterministic and labelled. The branches stay as input, like `kaal/release/pull-lane`: `kaal/release/dispatcher-honest-verdict` and `claude/project-thread-bhawu4-verdict-plan` (45ef8f5a). Its ids, release/I51, F69, A64, T1139 to T1148, stay unused and are not reused. The stray branch `kaal/release/dispatcher-verdict` is the Owner's to delete.

## Mechanism

- **The event is data.** The workflow runs on `pull_request` closed, for pull requests into `kaal/**`, `hotfix/**`, `wire/**`, only if the pull request merged. It never uses `pull_request_target`, never checks out the pull request or its branch, and the event (base, merge commit, body) reaches the script only through `env`. The scripts come from the default branch. The pure `decideFinal` has no network call.
- **Which workflow definition runs.** GitHub reads it from the integration branch at the event, which the Owner accepts: the same as `main` when the branch is synchronized, newer means the next version of `main`, and older, or absent, means the branch raises nothing until a SYNC brings it. A branch that never got the workflow is therefore silent; PICK's safety net cannot see it either, because it only looks at PROMOTIONs. Said here so it is not a surprise: the first collectors to use it are the ones created from, or synced with, `main` after the WIRE.
- **A final step** is recognised by the chapters of the template of the pull request, and by the class of the branch: ACT (`Change` and `Records`) into a collector; a pull request with a `Defect` chapter into a hotfix branch; a WIRE copy into a wire branch, recognised positively and not by exclusion (see below). The body is written by the author of a pull request that was reviewed before it merged; the script reads only chapter titles and the first line of `Change`, and the raised body keeps the characters `raise.mjs` already allows.
- **The WIRE contract (positive).** A pull request into `wire/<name>` is a final step only if its body has the chapters `Source`, `Target` and `Verification` (the structure every WIRE so far has used, release/C73 and release/C91's among them), the first code span of `Target` is one file under `.github/` or `.githooks/` (no `..`, no other root, no spaces), and the opening paragraph names at least one Change id. Everything else into a wire branch is refused with a reason (T1157 lists the malformed ones: empty or absent body, free text, a Change only, no `Source`, no `Verification`, a target outside `.github`/`.githooks`, traversal, a bare root, a space, an absolute path, no Change id), and a WIRE body into a collector, or an ACT into a wire branch, is refused too. The title is `PROMOTION: WIRE <file>` and the Change chapter is `<ids>: WIRE <file>`. A WIRE pull request template would make this contract the template's own; it is a separate, later Change, and this contract reads the chapters that exist today.
- **The raise contract is extended, explicitly.** `readDecision` of release/C73 accepts as head only `kaal/<capability>/<concern>`. `raise.mjs` now accepts a collector, `hotfix/<name>` or `wire/<name>`, and no other branch (T1158), and its refusal message is `the head is not an integration branch`. T1154 runs the whole path for the three classes, from the merge event through `decideFinal` and `raiseAll` to the single draft `POST` (and to nothing for a PROMOTION closed by hand, a moved tip and a dry run), and it is RED today because the hotfix and wire heads are refused.
- **Raise.** The decision has the shape `raise.mjs` reads (head, base `main`, revision = the merge commit, title, body). `raise.mjs` gains `draft: true`. It keeps its look for an earlier PROMOTION of the revision in any state, so a PROMOTION closed by hand is not raised again for that revision, its re-read of the tip (a branch that moved on since the merge raises nothing; the later merge raises its own), and GitHub's refusal of a second open pull request for the same head and base. Dry run unless `KAAL_DISPATCH_RAISE` is `on`; it stays unset.
- **The scan stops.** `dispatcher.yml` loses its schedule and keeps its manual start. Otherwise a variable turned `on` would also make the old scan raise drafts for every old collector whose last merge was an ACT. The DO amends release/T946, which fixes the schedule, and release/T944, which fixes the exact body of the creation, and names both in its pull request.
- **Cost of a draft.** CI runs on it and nobody has to review it. Whether a draft starts the checks of the ruleset, and whether the PICK may mark it ready, are proven in the dry run of PICK, not here.

## Installing

A WIRE copies `dispatcher-raise.yml` and the amended `dispatcher.yml` into `.github/workflows`; both reach `main` by a PROMOTION, each with CPO review. `KAAL_DISPATCH_RAISE` is Kai's, and stays unset until the dry run of the event has been read.

## Open question

Whether `pull_request` closed starts for a merge done by auto-merge or the merge queue. It does for a squash merge by auto-merge as far as I know GitHub; the dry run of the DO on this Change's own pull request is the proof, and is the first thing the DO observes.

## Ids

Change `release/C93`, Intent `release/I52`, Requirement `release/F70`, Architecture `release/A65`, Cases T1149 to T1158, allocated 19 Nov 2026 from the next free ids of the release thread. No Gap id, no control (release/CTL21 stays free). Next free: T1159, I53, F71, A66, C94, CTL21.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector `kaal/release/dispatcher-event-raise`: add `I52.md`, `F70.md`, `A65.md`, `final-step.mjs`, the `final` command in `dispatch.mjs`, the `draft: true` line and the extended head pattern in `raise.mjs`, the workflow source `dispatcher-raise.yml`, and the manual-only trigger block in the `dispatcher.yml` source; rename T1149 to T1158 from `.red.mjs` to `.test.mjs` when green; amend release/T944 (the creation now carries `draft: true`) and release/T946 (the schedule), each named in the pull request, none skipped.

## ACT

A 4L retrospective in `act.md`. T1149 to T1158 are element Cases and stay beside their elements; this Change holds no change-semantic Case.
