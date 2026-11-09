# Transformation (A to B)

The route from the present controls (`current-state.md`) to the target (the root documents), the conditions on it, the order of its steps and the Changes that have landed. It references the target by id and restates none of it.

## Per-control Changes

One Change per control, each through the full loop as graph Nodes (Intent, Requirement, Architecture, Cases; a Case `tests` a Node and no Node points at a Case). Because `.github` travels alone (F6, T7), a control's work is two Changes, not one: an Engineering Change that moves the code into `05-src` (and adds its Cases), and a `.github`-only Change that adds the job and wiring. Together they do four things, in this order, and nothing else (names aligned per F4):

**Step 1.** **Add** the control as a job named by the control inside the workflow `KAAL / release / <step>`, running the code from its component under `05-src/`; a control realized by a native setting or a used tool moves no code.

**Step 2.** **Move** the code from where it lives now into `05-src` (history kept with `git mv`; the old path keeps a full-facade shim (F20) only if a required check, hook or other capability's Case still calls it, and the shim is removed in a later Engineering Change, after the `.github` Change has rewired its last caller).

**Step 3.** **Retire** the old check name once the Owner has added the new context to the ruleset by hand, and only when that makes sense: a control with no old equivalent retires nothing.

**Step 4.** **Prove** it with Cases that sit next to the code (test layout rule); parity Cases pin that the moved code behaves as before.

Order of every rename is **add-new, Owner adds the context to the ruleset, remove-old**, so no step blocks a promotion in flight (#1278, #1272). `Branching` retires only after all three halves have a new home (verify Ancestry, isolate Change, bind Merge), each add-new first. Two gates close the set, `gate (promotion)` and `gate (integration)`, added once the controls they need exist; the Owner adds those two contexts and then removes the old per-control contexts from the rulesets. Each Change has its own record under `.kaal/changes/` when it starts, and adds the control's traced entries at the root: its Intent entry, requirement, allocation and `applied at` target in `03-architecture`, Cases and Defects where any.

`Branching` itself is retired by splitting: freshness to verify Ancestry, the synchronization shape to isolate Change, the merge method to bind Merge, add-new before remove-old.

Build order (agreed): audit Lineage first, then the npmjs controls, then main, then collectors (by control target).

## The controls

- **audit Lineage**

  Target: F5, `lineage/`.

  Difference: the code is `branching-audit.sh`, `holds.json`; the check is `Branching audit`. Retires `Branching audit`.

- **isolate Change**

  Target: F6, `change-isolation/`, `lineage/`.

  Difference: the code is `engineering/change-isolation/` and `change-isolation.sh` plus the synchronization shape of `Branching` (`lineage.ts` `synchronization`); the check is `Change Isolation`. Retires `Change Isolation`.

- **verify Ancestry**

  Target: F7, `lineage/`.

  Difference: the code is the freshness half of `Branching` (`lineage.ts` `freshness`, `branching.sh`). Retires `Branching`, together with bind Merge and isolate Change.

- **scan Vulnerabilities**

  Target: F8.

  Difference: `codeql.yml` with `CodeQL (actions)` and `CodeQL (javascript-typescript)`. Retires the two `CodeQL` names.

- **scan Dependencies**

  Target: F9.

  Difference: `dependency-review.yml` with `Dependency Review`. Retires `Dependency Review` (a rename).

- **approve Change**

  Target: F15.

  Difference: the native settings of the `kaal/*` ruleset; nothing on `kaal/*` requires `Change Isolation (review)` now. Retires none.

- **test Integration**

  Target: F16, `lanes/`.

  Difference: `engineering/lanes/` with `Hosting`, `Workspaces`, `Acceptance`, `Engineering` and `Guard` x3 (`Guard` as a job is meant, not the workflow). Retires the lane names, as they become jobs of the control.

- **accept Capability**

  Target: F14, `promotion-source/`.

  Difference: `engineering/github/promotion-source.sh` on `main`; the approved `.mjs` port (#1317) is pending promotion, whichever `main` holds when the Change runs is moved, and the `.sh` is not reintroduced. Retires `Promotion Source`.

- **bind Merge**

  Target: F10, `lineage/`, `merge-group/`.

  Difference: `.github/scripts/bind-group.sh` and the merge queue, plus the merge-method half of `Branching` (`lineage.ts` `auto-merge`). Retires `Branching` (last of the three halves to move).

- **approve Promotion**

  Target: F11.

  Difference: the native settings of the `main` ruleset; today also `Change Isolation (review)`. Retires `Change Isolation (review)`, by the sequence below.

- **test Candidate**

  Target: F12, `lanes/`.

  Difference: the lanes on `kaal/*` to `main`. Retires the lane names.

- **serialize Promotion**

  Target: F13.

  Difference: the merge queue, one promotion at a time; no named check. Retires none.

- **version Package**

  Target: F3, `release-engine/`.

  Difference: `engineering/release/release.mjs` `readiness()`, now in the component. Retires none; the gaps G1 to G4 are in `gaps.md`.

- **approve Publishing**

  Target: F1, `release-engine/`.

  Difference: the workflow's `environment: npm` job, `Publish` on `main` and `approve Publishing` on the collector. Retires none.

- **verify Package Promotion**

  Target: F2, `release-engine/`.

  Difference: the Accept job and `provenance()`, `Accept` on `main` and `verify Package Promotion` on the collector. Retires none.

## Changes that have landed

- **#1320**

  Target: I1, I4, F4.

  Difference: the PLAN of Release management: root layout, controls, naming and the path to `main`.

- **#1323**

  Target: F4, F17, `lineage/`, `change-isolation/`, `release-engine/`, `promotion-source/`, `merge-group/`, `lanes/`.

  Difference: the revised PLAN: controls traced at the root, components in `05-src`, workflows `KAAL / release / <step>`, gates `gate (integration)` and `gate (promotion)`.

- **#1324**

  Target: F1, F2, F3, `release-engine/`.

  Difference: the engine moved into `05-src/release-engine/` with parity Cases, and full-facade shims at the old path.

- **#1325**

  Target: F20, `release-engine/`.

  Difference: T13 judges the end of the migration by F20's own end condition.

- **#1326**

  Target: F1, F2.

  Difference: the engine and the records name `publish.yml` (`SOURCE.workflow`, the `npm trust` step), and keep the present and the target file apart.

- **#1327**

  Target: F1, F2, A2, A3.

  Difference: the `.github`-only rename of `release.yml` to `publish.yml`, the workflow name `KAAL / release / publish`, the jobs `approve Publishing` and `verify Package Promotion`, and the engine's new path in every step.

## Path to `main`

Owner, 9 Nov: this goes into `main` ahead of Foundation 0.0.2 and does not wait for it. Each step is additive, exact-head reviewed, with no admin override, and keeps #1278 and #1272 (10 Nov 18:03 UTC) unblocked.

**Step 1.** The PLAN (#1320) lands in its collector. A landed PLAN is a go for the steps below, except promotions into `main`, which keep their own explicit Owner go.

**Step 2.** Proof on a throwaway branch (see the conditions below): the actual required-check identity of a reusable-workflow job, and that a merge-queue run executes the trusted checker from `main`. The branches `trial/q-a` and `trial/q-b` are kept until their evidence is retained in the repository and the proof no longer needs them.

**Step 3.** Per control, in the build order: an Engineering Change moving the code into `05-src` with parity Cases, then a `.github`-only Change adding the job under `KAAL / release / <step>`. Old checks stay until the new context is live.

**Step 4.** The testing controls (test Candidate, test Integration) do not wait for the `kaal-change/far` DO (F18). They follow the Foundation pattern: an interim version is built, marked temporary in its code, Case names and check output, and replaced once FAR's DO lands (`interim-states.md`).

**Step 5.** The two gates, `gate (promotion)` and `gate (integration)`, once their controls exist.

**Step 6.** Promotion of the collector into `main` in reviewed slices, each with the Owner's explicit go.

**Step 7.** Only as verified migration steps, the Owner adds the new contexts to the rulesets, renames the rulesets to match the gates (`kaal/*` ruleset `lineage` to `integration`, the `main` ruleset to `promotion`; checked beforehand that no code, workflow or setting references a ruleset by its name, only comments and these records do, which are updated in the same step), enables the pins and queue settings named in `03-architecture`, and removes the old contexts (`Change Isolation (review)` first, `Branching` last). Then the four `pull_request_target` workflows are deleted and the temporary Actions policy is removed, before 2 Dec 2026.

**Step 8.** **Terminate the migration: a final Change that also lands in `main`** (learned 9 Nov). Once the old checks are retired and the new ones are live, an Engineering Change deletes the remaining shims and `change-requirements.md` (F20 and its Cases), and closes the migration record, as the migration's last step. It is a promotion into `main`, so it keeps its own explicit Owner go, and it comes before `kaal-release 0.0.1`.

The order into `main` for the `pull_request_target` move: the five root controls (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies) with the `KAAL / release / *` workflows on `merge_group` and `pull_request` next to the old checks (add-new); then the `npmjs`, `main` and `collectors` controls in the build order; then the Owner adds the new contexts and removes the old ones (`Change Isolation (review)` first); then the four workflows are deleted and the Actions policy removed before 2 Dec 2026.

## Conditions before promotion (CPO, 9 Nov)

**Control continuity.** Every replacement control is operational and independently verified before its predecessor is removed. "Operational" means observed running on a real pull request and merge group, not only configured; "independently verified" means checked by someone other than the author of the control, against its Cases, with the evidence kept in the Change record. The reusable-workflow proof establishes (a) the actual required-check identity of a job called through `workflow_call` (the context string the ruleset lists, and that a ruleset on that string is satisfied by the called job), and (b) that a merge-queue run executes the intended trusted checker: the job prints the commit of the `main` checkout it ran and it equals `main`'s tip at run start. No predecessor is removed until both are recorded. Whether a context from a called job is matched by the called job's name or by the `caller / called` composite is settled by a throwaway branch; if the composite is what the ruleset sees, the gates' own names are unaffected because they are plain jobs.

**Approval assurance.** Retiring `Change Isolation (review)` loses its ledger-digest attestation (an approval bound to the ledger entry's bytes); native approvals give a different assurance (bound to the head SHA). The Owner records that decision in the repository before the retirement, and the removal order keeps effective protection at every point: native settings on and verified first, then the context removed, then the four workflows, then the attestation code.

The 2 Dec 2026 deadline is a planning constraint, not grounds for bypassing either condition. No ruleset change and no removal of the temporary Actions policy is part of approving a PLAN.

## Retiring `Change Isolation (review)` (Owner, 9 Nov)

Reason: the native ruleset settings (code owner review, approval of the most recent push, dismiss on push) carry the approval when set up correctly. The check's one extra, binding the approval to the ledger entry's digest, is given up (`ledger-in-promotion-plan.md` called the plain approval "not recommended" for that reason; the Owner has decided otherwise). Native approval stays bound to the head by dismiss-on-push.

Order (add-new, settings, remove-old), each step safe before the next:

**Owner, rulesets (settings, nothing breaks).** `kaal/*` (ruleset `lineage`, to be renamed `integration`): turn Require review from Code Owners on (off now); effect to accept: a code owner approves every collector PR. `main` and `kaal/*`: turn Require approval of the most recent push on (off now), so the last pusher cannot be the only approver. Already on and kept: 1 approval, dismiss stale approvals on push, thread resolution, extra approval for unattributed changes (both); code owner review on `main`. Keep the existing `CODEOWNERS`; when a second owner exists, add the ledger path as its own line.

**Owner, `main` ruleset.** Remove the required context `Change Isolation (review)`, only after the settings are verified (a real pull request into `main` shows the code owner review and last-push approval enforced) and the Owner's decision to give up the ledger-digest attestation is recorded in the repository, so there is never a window without an approval rule.

**Change, `.github` only (travels alone).** Delete `merge-group-admission.yml`, `merge-group-review.yml`, `change-isolation-review.yml` and `change-isolation-review-relay.yml` (the jobs named `Change Isolation (review)` and `(review event)`).

**Change, Engineering.** Retire the attestation code and documents that only served them (`attest.mjs`, `attesters.json`, `ledger-in-promotion-plan.md`, their Cases), and decide what `change-isolation.sh` does with `KAAL_ATTESTATION` (strict path unused). A ledger entry is then admitted by the ledger match plus the native approval.

Not blocked: nothing here touches the required contexts that #1278 and #1272 depend on. The `main` ruleset step is the only ruleset removal.

## Later: kaal-release 0.0.1 (out of scope)

The final, later step on the overarching plan: **kaal-release 0.0.1**, the general release capability, as BASS (Bare, Agent, Skill, Script), that does not force KAAL's approach on consumers. It is what is left over once these controls prove the approach in KAAL's own repository. Nothing here designs, names its contents or ships it.

## Decided by the Owner (9 Nov)

Lanes stay separate jobs; `CodeQL` is `scan Vulnerabilities` and `dependency-review.yml` is `scan Dependencies`, both at the root; `isolate Change` and `verify Ancestry` at the root; the approval half is `approve Change` on `kaal/*` and `approve Promotion` on `main`; `Branching` is split; the gate design is in `03-architecture`.

The collectors are renamed to `kaal/<capability>/<leaf>`, and the ruleset pattern to `kaal/**`, as a later Change: existing branches (including `kaal/engineering-release-management`, which would be `kaal/engineering/release-management`), rulesets and the Promotion Source check keep their names until then.
