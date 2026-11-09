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
 | gate (collectors)| ---> |   motion, accept |      |   Promotion       |
 |                  |      |   Capability     | ---> | out:  (none yet)  |
 |                  |      | gate (main)      |      +-------------------+
 |                  |      | out: version     |
 +------------------+      |   Package        |
                           +------------------+
```

Stations exist only in this drawing: they are not folders, and a control's station is traced by graph edge, not by path. Station `13-change-branch` is dropped for now (Owner, 9 Nov). Pull-oriented: each station owns its **in** move, and the sender owns its **out** check; the same station's out and the next station's in may be different controls. The drawing reads left to right (work moves toward npm) and the receiver pulls. This PLAN designs only the border `11-main` to `10-npmjs`; `the root controls (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies) serve both 11 and 12. Control names are the Owner's; existing checks and files keep their names.

## Components and requirements allocation

Architecture names the components and allocates each requirement to exactly one of them (requirements allocation). A requirement and its component are linked by a graph edge; the tables are the readable form. Controls are requirements and components realize them, so a component holds several controls, and some controls are realized by a native setting or a tool we use and have no source.

**Four components (Owner, 9 Nov), all peers in `05-src/`:** `pipeline/` (the end-to-end piece that spans the stations and holds the five shared controls) and the stations `npmjs/`, `main/` and `collectors/`. Every folder is a node in the architecture and there are no loose files. Rule: a station may use `pipeline/` but never another station. The name follows Domain-Driven Design, with release-management as the bounded context. A control's Cases sit next to its code in its component. The drawing above shows the stations. `release-management` itself is traced as an element of the Delivery architecture.

| Component | Allocated requirements | Realized by (today's code) |
| --- | --- | --- |
| `05-src/pipeline/` | F5 audit Lineage, F6 isolate Change, F7 verify Ancestry, F8 scan Vulnerabilities, F9 scan Dependencies | `lineage.ts` (establishment, collectors, working-branches, freshness, synchronization, claim) with `holds.json` and `branching-audit.sh`/`branching.sh`; `engineering/change-isolation/` and `change-isolation.sh`; scans are tools, below |
| `05-src/npmjs/` | F1 approve Publishing, F2 verify Package Promotion | A2, A3: `release.yml` Publish and Accept, `publishable()`, `provenance()` (G5 to G11) |
| `05-src/main/` | F3 version Package, F10 bind Merge, F11 approve Promotion, F12 test Candidate (FAR: F18), F13 serialize Promotion, F14 accept Capability | A1: `readiness()` in `engineering/release/release.mjs` (G1 to G4); `lineage.ts` source and auto-merge, `promotion-source.sh`; `bind-group.sh`; `engineering/lanes/` for test Candidate |
| `05-src/collectors/` | F15 approve Change, F16 test Integration (FAR: F18) | `engineering/lanes/` for test Integration; approve Change has no source |

Each of F1 to F3 and F5 to F16 is allocated to exactly one component above. F4 (naming aligned) is cross-cutting and allocated to the naming map below, not to a component; F17 (pinned to `main`) is cross-cutting and allocated to the wiring rule (T8). A1 = version Package, A2 = approve Publishing, A3 = verify Package Promotion keep their ids.

**Realized by a native setting or a tool, not by source** (recorded here, no folder; the component only holds the requirement and its Case where one can check it):

- approve Change (F15): the `kaal/*` ruleset (code owner review, approval of the most recent push).
- approve Promotion (F11): the `main` ruleset, same settings.
- serialize Promotion (F13): the merge queue's one-at-a-time setting.
- bind Merge (F10): the merge queue, plus the merge-method verdict (`lineage.ts` auto-merge) and `bind-group.sh`.
- approve Publishing (F1): the `npm` environment's required reviewer, plus the binding in `publishable()`.
- scan Vulnerabilities (F8): the CodeQL action (`codeql.yml`), used, not built.
- scan Dependencies (F9): `dependency-review-action` and Dependabot (`dependency-review.yml`), used, not built.

Shared code lives in `pipeline/`: `main/` uses `lineage.ts` verdicts that live there, so a station never imports a sibling. The lane code (`engineering/lanes/`) serves test Candidate (`main/`) and test Integration (`kaal/`); where it lives is decided in those Changes. The `claim` verdict (one Change Record per squash Change) is allocated to isolate Change (F6), subject to the Owner.

Nothing above changes `.github` in this PLAN; `.github` changes travel alone as their own Change.

## Decision: how collectors are named (Owner, 9 Nov 2026; recorded, not yet applied)

Collectors are named by capability, and a sub-capability is allowed, with one clean concept:

- A collector is always `kaal/<capability>/<leaf>`, never a bare `kaal/<capability>`, because git cannot hold the ref `kaal/<capability>` and the refs under `kaal/<capability>/` at the same time.
- The leaf is the **version** for a versioned capability (`kaal/foundation/0.0.2`) and a **descriptive name** otherwise (`kaal/engineering/release-management`).
- The Owner will change the ruleset pattern to `kaal/**`.
- Link to *version Package* (`11-main` out): the collector's version leaf should match the package version that gets released.
- Consequence for the control: `accept Capability` (formerly accept Collector, today's promotion source) judges that a promotion comes from a capability's collector.

Nothing is renamed by this PLAN: existing branches (including this PLAN's own collector `kaal/engineering-release-management`, which would be `kaal/engineering/release-management`), rulesets and the Promotion Source check keep their names. Migration is a later Change.

## Decision: how PR checks are named and nested (Owner, 9 Nov 2026; recorded, not yet applied)

GitHub lists a check as `workflow name / job name`, and a ruleset matches the **job name only**. The names are:

- **Workflow** = `release/<station>`: `release/npmjs`, `release/main`, `release/collectors`. The root `audit Lineage` stays its own scheduled workflow.
- **Job** = the control name (`test Candidate`, `approve Change`, ...). A control with lanes (for example `test Candidate`) may call a reusable workflow, which GitHub shows one level deeper (`release/main / test Candidate / Hosting (Linux)`).
- **One gate job per ruleset**, named `gate (main)` and `gate (collectors)` (Owner, 9 Nov: these two only). It `needs:` every control job of its station, runs with `if: always()`, and fails unless every needed job succeeded (a skipped job counts as passing for GitHub, so the gate must check results itself). Each gate has a distinct job name because contexts are matched by job name. A ruleset then lists only its gate as required check.
- **No `gate (npmjs)`**: npmjs has no branch ruleset, so it needs no gate. The `npm` environment approval stays the npmjs control (*approve Publishing*); `Publish` waits on that approval directly.

**Design: a gate that depends on root controls across workflows.** `needs:` works only inside one workflow, and a `pull_request_target` workflow must never share a run with jobs that check out PR code (today's trust split). So:

- **Root controls are reusable workflows** (`on: workflow_call`), one per control, and `release/main` and `release/collectors` call them (`release/main / isolate Change`). One definition, called from both stations, which is what a root control spanning two stations needs. The trusted controls (isolate Change, verify Ancestry, accept Capability, bind Merge) are called from a `pull_request_target` caller that never checks out the candidate; the lane controls (test Candidate, test Integration, scan Vulnerabilities, scan Dependencies) are called from a `pull_request` caller (and a `merge_group` caller), because they run candidate code.
- **The gate is a job in the trusted caller.** It `needs:` the trusted controls in its own run, and for the lane controls, which run under another event, it waits on their check runs by API and fails closed, the pattern `merge-group-review.yml` already uses. No shared run, no trust mixing.
- **Use vs build:** `workflow_call` and the existing wait-by-API pattern are used; `re-actors/alls-green` is not (not used anywhere in `.github` today; it would add a third-party Action needing a SHA pin and an Actions-policy allowance from the Owner) and it cannot join jobs across events anyway.
- **To prove before the Changes:** that a required context from a job called through `workflow_call` is matched by the *called* job's name or the `caller / called` composite. A throwaway branch settles it; if the composite is what the ruleset sees, the gates' own names (`gate (main)`, `gate (collectors)`) are unaffected because they are plain jobs.

**Assumption, Owner-confirmed 9 Nov:** npmjs has no branch ruleset. Rulesets and the `npm` environment are not readable from the repository, so this is not verified there.

**Mapping gaps to fill (F4 would flag them today):** `Dependency Review` (to `scan Dependencies`), `CodeQL` (to `scan Vulnerabilities`), the lane names that come from `${{ matrix.check }}` (Workspaces, Engineering), and `Guard Acceptance Boundary`. The map must say which `Guard` is meant: a workflow, a job and a check all carry that name, and `KAAL` names three workflows.

## Naming map (control names across surfaces)

One row per control: the name in the records (this folder), the component path under `05-src/` (`pipeline/`, `npmjs/`, `main/`, `collectors/`), and the job in the GitHub UI. Spellings may differ if each is self-explanatory; the map is what a parser follows. Graph ids will replace the first column later (deferred). Rows are filled as each Change lands; the pattern is `approve Publishing` | `05-src/npmjs/` | `release/npmjs / approve Publishing`.

## Target: into `main` now, without `pull_request_target` (Owner, 9 Nov 2026)

This work is driven into `main` now, and it is also how the repository gets off `pull_request_target`. GitHub blocks that event by default from 2 Dec 2026; today the gates run only under a temporary repository Actions policy (a workflow-execution exception). The Owner prefers `merge_group` over a policy exception, so the gate design must run without `pull_request_target`, and the `merge_group` move is part of this work, not a separate PLAN.

Today four workflows use `pull_request_target`: `change-isolation.yml` (Change Isolation), `promotion-source.yml` (Promotion Source), `lineage-synchronization.yml` (Branching) and `merge-group-admission.yml` (the pull request side of `Change Isolation (review)`, retired above). They use it so that the **default branch's** definition and checker run, and the candidate's commits are read as Git data only. The merge-group side already has the matching pattern: `merge-group.yml` runs for the group and checks out the default branch's checker.

**What replaces it (to settle with the Owner and prove on a throwaway branch):**
- The controls run on `merge_group` and on `pull_request` (no `_target`), checking out the default branch's checker and reading the candidate as Git data, as the merge-group jobs do today. The pull-request run supplies the context a pull request needs in order to enter the queue; the merge-group run is the judgment that counts.
- **Trust gap, closed by isolate Change:** on `merge_group` and `pull_request` the workflow definition comes from the candidate's side, but `.github travels alone` is a failing check (F6, T7), so a workflow change reaches `main` only as a lone `.github` change with human approval. "Require workflows to pass" pinned to `main` is an optional extra layer, unverified here.
- The `gate (main)` and `gate (collectors)` jobs then need no cross-event wait: with the controls on the same events, a gate can `needs:` its controls in one workflow, and `alls-green` becomes an option again (still a new Action: SHA pin and Actions-policy allowance).

Priority (Owner, 9 Nov): this goes into `main` ahead of Foundation 0.0.2 and does not depend on it or wait for it.

**Order into `main` (each step additive, promotions in flight not blocked, each exact-head reviewed):**
1. This PLAN lands.
2. `pipeline/` controls, with the `release/*` workflows on `merge_group` and `pull_request` alongside the old checks (add-new).
3. `npmjs/`, `main/`, `collectors/` controls in the order of `00-changes`.
4. The Owner adds the new contexts, then removes the old contexts (`Change Isolation (review)` first).
5. Delete the four `pull_request_target` workflows, then remove the temporary Actions policy before 2 Dec 2026.

## The merge queue and serialize Promotion (Owner, 9 Nov 2026)

`merge_group` replaces `pull_request_target` for `main`: the merge queue is where the gates judge what actually lands. GitHub has one queue per base branch.

**Established by trial (Owner, 9 Nov):** GitHub refuses a merge queue rule on a pattern ruleset (`Merge queue rules are only supported for named branches or the default branch`). So a queue can exist only for a named branch or the default branch, and a `kaal/**` ruleset cannot give each collector a queue. One ruleset per collector is rejected by the Owner. **Result: a queue on `main` only; collectors have no queue.**

**What is known about `main`'s queue** (read from the live ruleset): `merge_method: SQUASH`, `max_entries_to_build: 1`, `min_entries_to_merge: 1`, `max_entries_to_merge: 1`, `min_entries_to_merge_wait_minutes: 0`, `grouping_strategy: ALLGREEN`, `check_response_timeout_minutes: 60`. The `lineage` ruleset (`kaal/*`) has none. The queue's temporary validation branches are named for the base branch (`gh-readonly-queue/<base>/…`).

**serialize Promotion** is the queue configuration on `main`: it makes promotions land in order. It is not a counting rule of ours and nothing is parsed from the head ref. Whether more than one entry may build at once is the Owner's setting, to raise only after `bind Merge` handles a group of several entries (it binds one today, `bind-group.sh`).

**Collectors keep their merge model** (Owner): squash for a Change, merge commit for a synchronization, chosen per pull request, which a queue with one `merge_method` could not do. They land without a queue. So for `kaal/*`:
- approve Change and the `collectors` gate run on `pull_request` (not `_target`), with no `merge_group` run;
- ordering comes from the ruleset's strict up-to-date policy (on) and the Branching merge-method verdict (moving to `bind Merge`);
- **protection against a candidate editing the workflow that judges it (Owner, 9 Nov):** collectors check features on `pull_request`, and `main` (queue, `merge_group`) is the hard regression gate. Self-editing is stopped by isolate Change: `.github travels alone` is a failing check (requirement F6, Case T7), so a workflow change cannot ride in a collector's feature Change and reaches `main` only as a lone `.github` change with human approval. "Require workflows to pass" pinned to `main` stays an optional extra layer, unverified on a pattern ruleset, and is not a must.

## Release controls are hard-pinned (Owner, 9 Nov 2026)

Rationale (I4): Delivery architecture changes independently of Solution architecture. The release controls, the workflow wiring and the test machinery are Delivery elements: they change in their own Changes and judge a candidate as `main`'s copy. Product code and the Cases that test it are Solution content and travel in candidates.

Every control of `pipeline/`, `npmjs/` and `main/`, and `collectors/` for its release controls (approve Change), runs the checker **from `main`** on both `pull_request` and `merge_group`: the job checks out `ref: main` (the default branch's tip, read at run start, never the event's base) and runs the logic from `engineering/release-management/05-src/`. The candidate is read as Git data only and never checked out, built or run, as the existing jobs do. `.github` holds only the wiring: which control runs on which event, the checkout of `main` and the call to the checker. The logic lives in `05-src`. The pin is protected because `.github travels alone` (F6, T7): the wiring can change only in a lone `.github` change with human approval, and the checker can change only through a promotion, so a candidate is always judged by the checker `main` already holds.

Consequence: a change to a control's logic takes effect after it is promoted, not in its own pull request, which is the intended behavior (the same as today's Change Isolation and Branching).

**Testing controls apply FAR (F18, Owner, 9 Nov).** The test machinery is Delivery and pinned. Regression (the target's own Cases) runs as `main`'s copy and protects the target; Features (the candidate's new or changed Cases, Solution content) travel with the candidate and test the incoming change; Accepts is a short, explicit, reviewed list and the only door through which a candidate can weaken a Regression Case. Each run tests Features and Regression both and reports the Accepts entries it applied (which Regression Case was weakened and how) in its check output, so the reviewer sees it at the decision point. test Candidate (`main/`) and test Integration (`collectors/`) share the rule.
