# Architecture

## The flow (system view)

```
   ROOT:  audit Lineage | isolate Change | verify Ancestry
          scan Vulnerabilities | scan Dependencies

   12-collectors (kaal/*)       11-main                      10-npmjs
 +------------------+      +------------------+      +-------------------+
 | in:  approve     |      | in:  bind Merge  |      | in:  approve      |
 |   Change, test   |      |   approve Promo, |      |   Publishing      |
 |   Integration    |      |   test Candidate,|      | stock: verify     |
 |                  |      |   serialize Pro- |      |   Package         |
 |gate (integration)| ---> |   motion, accept |      |   Promotion       |
 |                  |      |   Capability     | ---> | out:  (none yet)  |
 |                  |      | gate (promotion) |      +-------------------+
 |                  |      | out: version     |
 +------------------+      |   Package        |
                           +------------------+
```

Stations exist only in this drawing: they are not folders, and a control's station (its control target) is traced by graph edge, not by path. Station `13-change-branch` is not part of this architecture (Owner, 9 Nov). Pull-oriented: each station owns its **in** move, and the sender owns its **out** check; the same station's out and the next station's in may be different controls. The drawing reads left to right (work moves toward npm) and the receiver pulls. The root controls (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies) serve both 11 and 12. Control names are the Owner's.

## Components and requirements allocation

Architecture names the components and allocates each requirement to exactly one of them (requirements allocation). A requirement and its component are linked by a graph edge; the tables are the readable form. Controls are requirements and components realize them, so a component holds several controls, and some controls are realized by a native setting or a tool we use and have no source.

**Controls are matters of concern, components are architecture elements (Owner, 9 Nov, revises the four-component layout).** A control is traced through the root documents: an Intent entry (a sentence on why it exists, under I1 to I4), its requirement (F#), its allocation to a component, its **control target**, its Cases (T#) and, where one exists, its Defect. A Case `tests` a Node and no Node points at a Case. Intent, Requirements, Architecture and Test are managed at this root only. A component is an element of the architecture, chosen for what the code is and what moves together, not for where the control is applied. Components are solution building blocks: while they stay reasonably stable where they sit they share this overarching documentation, and functional placement decides where each belongs. A component does not carry its own Intent, Requirements or Cases while it stays here; **only when a component moves (for example into its own capability) do its Intent, Requirements, Architecture and Cases follow it.** The control target (`npmjs`, `main`, `collectors`, or several) is a separate attribute: a traced edge `applied at` from the control to a Target node, defined once in the drawing above. Components sit in `05-src/`, all peers, named by what the code is; there are no station folders (`pipeline/`, `npmjs/`, `main/`, `collectors/`), and no loose files. One component may realize several controls, and a control may use a setting or tool and have no component. A component uses another only through a declared `uses` edge. Source-code tests (unit and parity Cases) always sit next to the code in its component, whichever way the documents are arranged (test layout rule); the root only traces them to their requirement. Following Domain-Driven Design, release-management stays the bounded context.

| Component (`05-src/`) | Realizes (control, requirement) |
| --- | --- |
| `lineage/` | audit Lineage F5, verify Ancestry F7, bind Merge F10 (merge-method verdict), isolate Change F6 (synchronization and claim verdicts) |
| `change-isolation/` | isolate Change F6 (the isolation judge) |
| `release-engine/` | version Package F3, approve Publishing F1 (the binding of record, run, commit and digest), verify Package Promotion F2 |
| `promotion-source/` | accept Capability F14 |
| `merge-group/` | bind Merge F10 (queue binding) |
| `lanes/` | test Candidate F12, test Integration F16 (FAR: F18) |
| `envelope/` | verify Envelope F19 (the judgment of a pull request's title and body, and the trusted activation policy) |

| Control | Requirement | Control target (applied at) | Component or other realization |
| --- | --- | --- | --- |
| audit Lineage | F5 | scheduled, all | `lineage/` |
| isolate Change | F6 | main, collectors | `change-isolation/`, `lineage/` |
| verify Ancestry | F7 | main, collectors | `lineage/` |
| scan Vulnerabilities | F8 | main, collectors | tool: CodeQL |
| scan Dependencies | F9 | main, collectors | tool: dependency-review, Dependabot |
| bind Merge | F10 | main | `lineage/`, `merge-group/`, merge queue |
| approve Promotion | F11 | main | setting: `main` ruleset |
| test Candidate | F12 | main | `lanes/` |
| serialize Promotion | F13 | main | setting: merge queue |
| accept Capability | F14 | main | `promotion-source/` |
| approve Change | F15 | collectors | setting: `kaal/*` ruleset |
| test Integration | F16 | collectors | `lanes/` |
| version Package | F3 (A1) | main | `release-engine/` |
| approve Publishing | F1 (A2) | npmjs | setting: `npm` environment, `release-engine/` |
| verify Package Promotion | F2 (A3) | npmjs | `release-engine/` |

Each of F1 to F3, F5 to F16 and F19 is allocated to a component, setting or tool above and has one or more control targets. F4 (naming aligned) is cross-cutting and allocated to the naming map below, not to a component; F17 (pinned to `main`) is cross-cutting and allocated to the wiring rule (T8). The allocations of the `npmjs` and `main` controls of the release engine keep their ids:

- **release-management/A1.** version Package: F3 is allocated to `release-engine/` and applied at `main`.
- **release-management/A2.** approve Publishing: F1 is allocated to the `npm` environment and `release-engine/` and applied at `npmjs`.
- **release-management/A3.** verify Package Promotion: F2 is allocated to `release-engine/` and applied at `npmjs`.

**Realized by a native setting or a tool, not by source** (recorded here, no folder; the component only holds the requirement and its Case where one can check it):

- approve Change (F15): the `kaal/*` ruleset (code owner review, approval of the most recent push).
- approve Promotion (F11): the `main` ruleset, same settings.
- serialize Promotion (F13): the merge queue's one-at-a-time setting.
- bind Merge (F10): the merge queue, plus the merge-method verdict (`lineage/`) and the queue binding (`merge-group/`).
- approve Publishing (F1): the `npm` environment's required reviewer, plus the binding of record, run, commit and digest (`release-engine/`).
- scan Vulnerabilities (F8): the CodeQL action, used, not built.
- scan Dependencies (F9): the dependency-review action and Dependabot, used, not built.

The `claim` verdict (one Change Record per squash Change) is allocated to isolate Change (F6), subject to the Owner.

## Decision: how collectors are named (Owner, 9 Nov 2026)

Collectors are named by capability, and a sub-capability is allowed, with one clean concept:

- A collector is always `kaal/<capability>/<leaf>`, never a bare `kaal/<capability>`, because git cannot hold the ref `kaal/<capability>` and the refs under `kaal/<capability>/` at the same time.
- The leaf is the **version** for a versioned capability (`kaal/foundation/0.0.2`) and a **descriptive name** otherwise (`kaal/engineering/release-management`).
- The ruleset pattern is `kaal/**`.
- Link to *version Package* (`11-main` out): the collector's version leaf should match the package version that gets released.
- Consequence for the control: `accept Capability` (formerly accept Collector, the promotion source) judges that a promotion comes from a capability's collector.

## Decision: how PR checks are named and nested (Owner, 9 Nov 2026)

GitHub lists a check as `workflow name / job name`, and a ruleset matches the **job name only**. The names are:

- **Workflow** = `KAAL / release / <step>`, named by the process step it performs (Owner, 9 Nov): `KAAL / release / integrate` (a Change into a collector, control target `collectors`), `KAAL / release / promote` (a promotion into `main`, target `main`) and `KAAL / release / publish` (target `npmjs`). The step is the process term; the station is the systems-thinking and lean view behind the design, and appears as the control target. The prefix `KAAL /` (Owner, 9 Nov, long form) is part of the workflow's `name:`, so a PR lists `KAAL / release / promote / gate (promotion)`; it does not enter the required context, because a check run is named by its job (the ruleset still lists `gate (promotion)`). The root `audit Lineage` stays its own scheduled workflow.
- **Job** = the control name (`test Candidate`, `approve Change`, ...). A control with lanes (for example `test Candidate`) may call a reusable workflow, which GitHub shows one level deeper (`KAAL / release / promote / test Candidate / Hosting (Linux)`).
- **One gate job per ruleset**, named `gate (promotion)` and `gate (integration)` (Owner, 9 Nov: these two only). It `needs:` every control job of its station, runs with `if: always()`, and fails unless every needed job succeeded (a skipped job counts as passing for GitHub, so the gate must check results itself). Each gate has a distinct job name because contexts are matched by job name. A ruleset then lists only its gate as required check.
- **No `gate (publish)`**: npmjs has no branch ruleset, so it needs no gate. The `npm` environment approval stays the npmjs control (*approve Publishing*); `Publish` waits on that approval directly.

**Design: a gate that depends on root controls across workflows.** `needs:` works only inside one workflow, and a workflow that runs the default branch's checker never shares a run with jobs that check out PR code. So:

- **Root controls are reusable workflows** (`on: workflow_call`), one per control, and `KAAL / release / promote` and `KAAL / release / integrate` call them (`KAAL / release / promote / isolate Change`). One definition, called from both stations, which is what a root control spanning two stations needs. **Every caller runs on `pull_request` and `merge_group`, and no control uses `pull_request_target`** (Owner, 9 Nov; no temporary Actions policy is needed). The trusted controls (isolate Change, verify Ancestry, accept Capability, bind Merge) never check out or run the candidate: they check out `main` (the hard pin, F17) and read the candidate as Git data only. The lane controls (test Candidate, test Integration, scan Vulnerabilities, scan Dependencies) run candidate code, also under the pin and FAR (F18).
- **The gate is a job in the caller of its step.** It `needs:` every control job in one run, with no cross-event wait.
- **Use vs build:** `workflow_call` is used; `re-actors/alls-green` is not (it would add a third-party Action needing a SHA pin and an Actions-policy allowance from the Owner).

**Owner-confirmed 9 Nov:** npmjs has no branch ruleset.

## Naming map (control names across surfaces)

One row per control: the name in the records (this folder), its component under `05-src/` and its control target, and the job in the GitHub UI. Spellings may differ if each is self-explanatory; the map is what a parser follows. The pattern is `approve Publishing` | `05-src/release-engine/` | `KAAL / release / publish / approve Publishing`; a root control is called from the workflow of each station it serves.

| Control | Intent | Requirement | Control target | Component (`05-src/`) | Job in the GitHub UI | Cases |
| --- | --- | --- | --- | --- | --- | --- |
| version Package | I5 | F3 | main | `release-engine/` | `KAAL / release / promote / version Package` | T1, T2, T3, T11 |
| approve Publishing | I6 | F1 | npmjs | `release-engine/` | `KAAL / release / publish / approve Publishing` | T4, T11 |
| verify Package Promotion | I7 | F2 | npmjs | `release-engine/` | `KAAL / release / publish / verify Package Promotion` | T5, T11 |
| audit Lineage | I1 | F5 | scheduled, all | `lineage/` | `audit Lineage` (its own scheduled workflow) | T8 |
| isolate Change | I1, I4 | F6 | main, collectors | `change-isolation/`, `lineage/` | `KAAL / release / integrate / isolate Change`, `KAAL / release / promote / isolate Change` | T7, T8 |
| verify Ancestry | I1 | F7 | main, collectors | `lineage/` | `KAAL / release / integrate / verify Ancestry`, `KAAL / release / promote / verify Ancestry` | T8 |
| scan Vulnerabilities | I1 | F8 | main, collectors | tool: CodeQL | `KAAL / release / integrate / scan Vulnerabilities`, `KAAL / release / promote / scan Vulnerabilities` | T8 |
| scan Dependencies | I1 | F9 | main, collectors | tool: dependency-review, Dependabot | `KAAL / release / integrate / scan Dependencies`, `KAAL / release / promote / scan Dependencies` | T8 |
| bind Merge | I1 | F10 | main | `lineage/`, `merge-group/`, merge queue | `KAAL / release / promote / bind Merge` | T8 |
| approve Promotion | I1 | F11 | main | setting: `main` ruleset | the ruleset's approval settings | T8 |
| test Candidate | I1, I4 | F12 | main | `lanes/` | `KAAL / release / promote / test Candidate` | T8, T9 |
| serialize Promotion | I1 | F13 | main | setting: merge queue | the queue's one-at-a-time setting | T8 |
| accept Capability | I1 | F14 | main | `promotion-source/` | `KAAL / release / promote / accept Capability` | T8 |
| approve Change | I1 | F15 | collectors | setting: `kaal/*` ruleset | the ruleset's approval settings | T8 |
| test Integration | I1, I4 | F16 | collectors | `lanes/` | `KAAL / release / integrate / test Integration` | T8, T9 |

## Without `pull_request_target` (Owner, 9 Nov 2026)

The gates run without `pull_request_target`, and the `merge_group` move is part of the design. The Owner prefers `merge_group` over a repository Actions-policy exception. The controls run the **default branch's checker** and read the candidate's commits as Git data only. The guarantee has two parts that are kept apart: the checker is pinned by checking out `main`, and the workflow definition that calls it, together with the identity of the check it reports, is trusted independently by the trust root below. Checking out `main` pins the checker, not the workflow definition.

- The controls run on `merge_group` and on `pull_request` (no `_target`), checking out the default branch's checker and reading the candidate as Git data. The pull-request run supplies the context a pull request needs in order to enter the queue; the merge-group run is the judgment that counts.
- On these events the workflow definition and the check's identity would come from the candidate's side, so `.github travels alone` plus human approval is a process guard and not a trust root: a `.github`-only candidate could alter or omit its own gate, or emit a job that looks like the required context. `ref: main` for the checker's code does not authenticate the workflow that calls it. The trust root below does.
- The `gate (promotion)` and `gate (integration)` jobs need no cross-event wait: with the controls on the same events, a gate `needs:` its controls in one workflow, and `alls-green` is an option (a new Action: SHA pin and Actions-policy allowance).

## The merge queue and serialize Promotion (Owner, 9 Nov 2026)

`merge_group` replaces `pull_request_target` for `main`: the merge queue is where the gates judge what actually lands. GitHub has one queue per base branch.

GitHub supports a merge queue rule only for a named branch or the default branch (`Merge queue rules are only supported for named branches or the default branch`), so a `kaal/**` ruleset cannot give each collector a queue. One ruleset per collector is rejected by the Owner. **Result: a queue on `main` only; collectors have no queue.**

**The queue on `main`:** `merge_method: SQUASH`, `max_entries_to_build: 1`, `min_entries_to_merge: 1`, `max_entries_to_merge: 1`, `min_entries_to_merge_wait_minutes: 0`, `grouping_strategy: ALLGREEN`, `check_response_timeout_minutes: 60`. The ruleset of `kaal/*` has no queue. The queue's temporary validation branches are named for the base branch (`gh-readonly-queue/<base>/…`).

**serialize Promotion** is the queue configuration on `main`: it makes promotions land in order. It is not a counting rule of ours and nothing is parsed from the head ref. Whether more than one entry may build at once is the Owner's setting, to raise only after `bind Merge` handles a group of several entries (`merge-group/` binds the group to the queued pull request).

**Collectors keep their merge model** (Owner): squash for a Change, merge commit for a synchronization, chosen per pull request, which a queue with one `merge_method` could not do. They land without a queue. So for `kaal/*`:
- approve Change and the `collectors` gate run on `pull_request` (not `_target`), with no `merge_group` run;
- ordering comes from the ruleset's strict up-to-date policy (on) and the merge-method verdict of `bind Merge`;
- **protection against a candidate editing the workflow that judges it:** collectors check features on `pull_request`, and `main` (queue, `merge_group`) is the hard regression gate (Owner, 9 Nov). Whether the workflow definition and check identity are trustworthy on these events is the trust-root requirement below.

## Release controls are hard-pinned (Owner, 9 Nov 2026)

Rationale (I4): Delivery architecture changes independently of Solution architecture. The release controls, the workflow wiring and the test machinery are Delivery elements: they change in their own Changes and judge a candidate as `main`'s copy. Product code and the Cases that test it are Solution content and travel in candidates.

Every release control (all but the testing controls, pinned through F18), runs the checker **from `main`** on both `pull_request` and `merge_group`: the job checks out `ref: main` (the default branch's tip, read at run start, never the event's base) and runs the logic from `engineering/release-management/05-src/`. The candidate is read as Git data only and never checked out, built or run, as the existing jobs do. `.github` holds only the wiring: which control runs on which event, the checkout of `main` and the call to the checker. The logic lives in `05-src`. The pin is protected because `.github travels alone` (F6, T7): the wiring can change only in a lone `.github` change with human approval, and the checker can change only through a promotion, so a candidate is judged by the checker `main` already holds, called from a workflow definition that the trust root authenticates.

Consequence: a change to a control's logic takes effect after it is promoted, not in its own pull request, which is the intended behavior.

**Testing controls apply FAR (F18, Owner, 9 Nov).** The test machinery is Delivery and pinned. Regression (the target's own Cases) runs as `main`'s copy and protects the target; Features (the candidate's new or changed Cases, Solution content) travel with the candidate and test the incoming change; Accepts is Change's Accept (`far.json` in the Change record, `change/A6`; `kaal-change/far`, built by its DO; Owner 9 Nov) and the only door through which a candidate can weaken a Regression Case. Each run tests Features and Regression both and reports the Accepts entries it applied (which Regression Case stays RED, and why) in its check output, so the reviewer sees it at the decision point. test Candidate (`main/`) and test Integration (`collectors/`) share the rule.

## Trust root and gate specification (CPO, 9 Nov)

**Requirement.** The workflow definition that judges a candidate, and the identity of the required check it reports, must come from a source the candidate cannot change. `ref: main` for the checker's code is necessary but not sufficient.

**The trust root** is a repository ruleset "Require workflows to pass", pinned to `refs/heads/main`, so the workflow that produces the required check is the one `main` holds, whatever the candidate contains.

**Gate specification (applies to `gate (promotion)` and `gate (integration)`, whichever mechanism):**
- **Binding.** The gate judges the exact `pull_request` head SHA, or on `merge_group` the group's head SHA (`github.sha`), and it prints that SHA and the SHA of the `main` checkout it ran (which must equal `main`'s tip read at run start). `merge-group/` binds the group to the queued pull request.
- **Expected identities.** The gate lists the controls it requires by name and by check-run app (the GitHub Actions app) and workflow path; a check of the right name from another app or workflow is not accepted.
- **Fail closed.** Absent, skipped, neutral, stale (another SHA), cancelled, timed-out or unreadable runs of a required control fail the gate. Success only when every required control completed successfully on that SHA.
- **Retries and timeouts.** A bounded wait (the merge queue's `check_response_timeout_minutes` is 60); a re-run is judged afresh against the SHA; a flaky read is a failure, not a pass.
- **Spoofing.** The gate does not read a candidate-supplied result; it reads check runs by API with the workflow's own token.

**Negative Cases (live, T10):** (a) a `.github`-only candidate that deletes or edits the gate or a control job; (b) a candidate workflow that emits a job named like a required context; (c) a candidate that skips a required control (condition, path filter, `if: false`). Each must leave the required context failed or absent. T7 and T8 stay as additional guards, not as the trust root.
