# Release management (Engineering)

PLAN, nothing here is built. The root holds the full loop for how a package moves from a working branch out to the world. The stations below it repeat the same loop, one station at a time. Each station has **in** (the receiver's check), **stock** (what holds while work sits at the station) and **out** (the sender's check), so what is out of one station and what is in to the next may be different controls.

| Folder | What it is | State |
| --- | --- | --- |
| `01-intent/` to `04-test/` | the overarching view of the root: Intent, Requirements, Architecture (the flow drawing), planned Cases | this PLAN |
| `05-src/` | components (architecture elements), all peers, named by what the code is (`lineage/`, `release-engine/`, `lanes/`, ...); no station folders | planned; created by each Change |
| `00-changes/` | one planned Change per control: add job, move code to `05-src`, retire the old check | this PLAN |

Layout (Owner, 9 Nov): the folder is only the root loop, `00-changes` to `06-defects`, and it is traced as an element of the Delivery architecture (Delivery vs Solution placement). `05-src/` holds components, all peers, each an element of the architecture with no loose files. Controls are matters of concern, traced through the root documents (Intent entry, requirement, allocation, Cases, Defects where any); a component carries its own Intent, Requirements and Cases only when it moves. The station is the control target, a separate attribute recorded as a traced edge in `03-architecture` and not a folder; its workflow is named by the process step, `release/<step>` (`integrate`, `promote`, `publish`) (the target `collectors` is named so it is not confused with KAAL as a whole). A control may be realized by a native setting or a tool and have no component; a component may realize several controls. A component uses another only through a declared `uses` edge. The name follows Domain-Driven Design, with release-management as the bounded context. Source-code tests always sit next to the code in its component; the root only traces them. Folders are created when they hold something, so `00-changes`, `05-src` and `06-defects` do not exist yet. Station `13-change-branch` is dropped for now (Owner, 9 Nov).

Existing controls (`engineering/controls/`), their checks and files, and the release engine (`engineering/release/`, `.github/workflows/release.yml`) are untouched by this PLAN; their checks are renamed later, one Change per control (`00-changes/`), add-new then remove-old. The names below are the Owner's, agreed 9 Nov 2026.

## Path to `main` (overarching plan)

Owner, 9 Nov: this goes into `main` ahead of Foundation 0.0.2 and does not wait for it. Each step is additive, exact-head reviewed, with no admin override, and keeps #1278 and #1272 (10 Nov 18:03 UTC) unblocked.

1. This PLAN (#1320) lands in its collector. A landed PLAN is a go for the steps below, except promotions into `main`, which keep their own explicit Owner go.
2. Proof on a throwaway branch (see Conditions below): the actual required-check identity of a reusable-workflow job, and that a merge-queue run executes the trusted checker from `main`. The branches `trial/q-a` and `trial/q-b` are kept until their evidence is retained in the repository and this proof no longer needs them.
3. Per control, in the build order (audit Lineage first, then the `npmjs` controls, then `main`, then `collectors`): an Engineering Change moving the code into `05-src` with parity Cases, then a `.github`-only Change adding the job under `release/<step>`. Old checks stay until the new context is live.
4. The testing controls (test Candidate, test Integration) do not wait for the `kaal-change/far` DO (F18). They follow the Foundation pattern: an interim version is built now, marked **temporary** in its code, Case names and check output, and replaced once FAR's DO lands. The interim reads the same `far.json` record shape as `change/F7` to `F10`, so the replacement swaps the module and not the record.
5. The two gates, `gate (main)` and `gate (collectors)`, once their controls exist.
6. Promotion of the collector into `main` in reviewed slices, each with the Owner's explicit go.
7. Only as verified migration steps (not as part of approving this PLAN), the Owner adds the new contexts to the rulesets, enables the pins and queue settings named in `03-architecture`, and removes the old contexts (`Change Isolation (review)` first, `Branching` last). Then delete the four `pull_request_target` workflows and remove the temporary Actions policy, before 2 Dec 2026.

## Later: kaal-release 0.0.1 (out of scope for this PLAN)

The final, later step on the overarching plan: **kaal-release 0.0.1**, the general release capability, as BASS (Bare, Agent, Skill, Script), that does not force KAAL's approach on consumers. It is what is left over once these controls prove the approach in KAAL's own repository. Nothing in this PLAN designs, names its contents or ships it.


## Conditions before promotion (CPO, 9 Nov)

1. **Control continuity.** Every replacement control is operational and independently verified before its predecessor is removed. "Operational" means observed running on a real pull request and merge group, not only configured; "independently verified" means checked by someone other than the author of the control, against its Cases, with the evidence kept in the Change record. The reusable-workflow proof must establish (a) the actual required-check identity of a job called through `workflow_call` (the context string the ruleset must list, and that a ruleset on that string is satisfied by the called job), and (b) that a merge-queue run executes the intended trusted checker: the job prints the commit of the `main` checkout it ran and it equals `main`'s tip at run start. No predecessor is removed until both are recorded.
2. **Approval assurance.** Retiring `Change Isolation (review)` loses its ledger-digest attestation (an approval bound to the ledger entry's bytes); native approvals give a different assurance (bound to the head SHA). The Owner records that decision in the repository before the retirement, and the removal order keeps effective protection at every point: native settings on and verified first, then the context removed, then the four workflows, then the attestation code (see `00-changes`).

The 2 Dec 2026 deadline is a planning constraint, not grounds for bypassing either condition. No ruleset change and no removal of the temporary Actions policy is part of approving this PLAN.
