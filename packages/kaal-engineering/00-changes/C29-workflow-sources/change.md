# C29 change

The Owner's rule is that the workflows in `.github` go to Engineering first: a source under the owning capability, a normal Change, then a WIRE installs it (`.github` travels alone). Asked where those sources sit, the answer was: 6 of the 21 workflows have a source, all in one release folder in the old layout; 15 have none. The Owner saw the same challenge as `.githooks` (old and new) and asked Engineering to drive it. This page is engineering's answer, to be judged before anything moves.

## The answer in five lines

1. **Home:** `13-source/workflows/<name>.yml` in the capability that owns the workflow. `13-source` is the machinery folder, "written only in packages and deployed elsewhere"; a workflow is exactly that. One template edit adds `workflows` to its closed children (F62).
2. **Owner:** each workflow has one owning capability (table below). Release keeps only what release owns.
3. **Move shape:** an unchanged copy, one capability per Change, pinned by sha256 as C26 pinned the legacy hook. No byte changes; the WIRE is unaffected because an installed file that equals its source needs no install.
4. **Old and new coexist:** the 6 existing sources stay where they are until the Owner's go; a name never has two sources.
5. **The control is release's:** the detective control that names a workflow with no source or a differing one is a release control (see below), measured as a per-workflow coverage ratchet. It is not part of this Change.

## Why `13-source/workflows`

- `13-source` already says that the copy outside `packages` must match its source. The workflow is such a copy.
- The `.githooks` precedent (release/C26) put the hook source under `05-src/wiring/hooks`: the source in Engineering first, the install as a WIRE. This only changes whose folder it is.
- Alternatives: `13-source/wiring/workflows` (one more level, nothing it buys; YAGNI); one shared `wiring` folder under release, as now (rejected: release would own sources it does not own, and a Change would touch a capability that is not its own).

## Inventory: 21 workflows, owner and status

The owner column is a proposal read from each workflow's own header and from where its checker lives; questions 2 and 3 ask to confirm it.

| Workflow | Owner | Source today |
| --- | --- | --- |
| analyze-vulnerabilities, dispatcher, dispatcher-raise, lineage-synchronization, sync-review, verify-triggers | release | yes, `release-management/05-src/wiring/workflows` |
| change-isolation, change-isolation-review, change-isolation-review-relay, merge-group-admission, merge-group-review | change-isolation | none |
| branching-audit, promotion-source, merge-group | github | none |
| ci, guard-acceptance-boundary | guard | none |
| codeql, dependency-review | dependencies | none |
| engineering, engineering-merge-group | release (verify Stages is release/C35) | none |
| release | release (publishing) | none |

Not installed: `show-wip-page.yml` and `verify-history.yml` have a source and no installed file. They are staged, not a defect.

## Order of the moves

By what protects the wiring itself, the risky and the publishing ones last:

1. change-isolation (5): the gates behind "Core travels alone, `.github` travels alone".
2. github (3): Branching audit, Promotion Source and the merge group.
3. guard (2).
4. dependencies (2). The `kaal/dependencies` SYNC question (#2154) is open with the Owner; this waits for it.
5. release (3: `engineering`, `engineering-merge-group`, `release`). `release.yml` publishes to npm, so its move is the last and still only a copy.

Each move is a PLAN that names the files and their sha256, and then a DO that copies them. Nothing is installed by a move.

## The shape of a move

- One capability per Change; it adds files only under `<cap>/13-source/workflows/`.
- The Change records the sha256 of each installed file at the move (the evidence) and one Case per Change pins the source by that sha256 and says the file in `.github/workflows` was equal when the move was made. The Case pins the source, not the installed file: a later, legitimate change of the source (Engineering first, then a WIRE) must not turn the Case RED. Comparing the two over time is the control's job.
- Capabilities still in the old layout get `13-source/workflows/` beside their legacy files; the layout check does not judge them yet, and migration to C27 comes later (not authorized).

## The control

A detective control reads the installed workflows and every workflow source, and says for each installed workflow whether it has exactly one source and whether the text equals it. A source with no installed workflow is staged, not a failure; a name found in two places (the old place and the new) is a finding. It belongs to release: the wiring and the WIRE judge are release's, its `verify Triggers` is the same shape (a pure judge over two maps), and engineering's Skill may hold only the one layout check (engineering/N19, T1177). Release owns the control and the WIRE, Engineering owns the source layout. Engineering asks release for it as a separate PLAN. Detective first; advisory and preventive only after demonstrated reliable operation and the Owner's go; no job runs it and no ruleset requires it until then.

### The ratchet (CPO review, 21 Nov)

The control is the measure of a coverage ratchet, per workflow and not per capability, so a partial migration keeps its protection. Engineering states what the ratchet must hold; release plans it.

- **Baseline:** 21 installed, 6 with a verified source, 15 without. What is counted is verified equivalence (exactly one source, equal to the installed text), not the existence of a file. The baseline names the 6, written once.
- **Up only:** a workflow in the baseline must keep exactly one equal source. Removing its source, adding a second one or letting it diverge from the installed copy is a finding. Each move adds its workflows to the baseline in the same Change.
- **The 15 stay visible, and block nothing:** an unsourced workflow is reported and does not fail unrelated work.
- **At 21/21:** the baseline is closed. A new installed workflow needs an equivalent reviewed source before it is installed. The WIRE already installs only a target equal to a source on main, so closing the baseline makes the control agree with the WIRE.
- **Not this Change:** the ratchet is a release control with release's own ids. Engineering's part here is that every move lands its names in the baseline, and that a move is never counted before its source is verified equal.

One tension is stated for the Owner and the CPO (question 6): Engineering first means a source changes before its WIRE installs it, so a baselined workflow can legitimately differ for a while. The ratchet should block a loss or a duplicate and report divergence as a finding, not fail on it.

## What this changes

The layout template (`13-source` gets the child `workflows`) and the Case that pins its children (T1223, amended at the DO), and the order section of `package-layout.md` (one line).

## What this does not do

Move or install any workflow, migrate the 6 existing sources, add a job or a ruleset, add the control, migrate any capability to the C27 layout.

## Ids

Change engineering/C29, Requirement engineering/F62, gap G119, Case T1335. Release confirmed (21 Nov) that it uses none of them. The Cases of the control belong to release.

## DO

After the merged PLAN, and after the C28 collector (`research-home`: `retros`, `research`, `rehearsals`, `reviews` in `02-learnings`) is on this collector by a SYNC or on `main`: the DO edits `13-source.children` of the template in place, adding `workflows`. It never moves `draft/` over the template, because the draft is the template as of `main` f61a2ca2 and would remove C28's four learnings folders. The DO then removes `draft/`, amends T1223 to the four children, renames T1335 to `.test.mjs`, adds one line to the order section of `package-layout.md`, and runs T1245 and T1331 to T1334 to show C28 is intact.

## Questions for review

1. Is `13-source/workflows/<name>.yml` the home? Recommended: yes, in the capability that owns the workflow.
2. Are the proposed owners right, above all `github` for `merge-group` (it judges Change Isolation, Branching and Promotion Source) and `release` for `engineering` and `engineering-merge-group`?
3. Is the order right, and does the move of `dependencies` wait for #2154?
4. May a capability in the old layout hold `13-source/workflows/` beside its legacy files before it migrates? Recommended: yes (the check does not judge it).
5. The 6 sources under `release-management/05-src/wiring/workflows` move only on the Owner's go. Release relies on their path in Cases (T1155, T1328) and in a pending WIRE's Source line, so that move needs a path update there. Not part of this PLAN.
6. Should the ratchet block a divergence of a baselined workflow, or only a loss and a duplicate and report divergence? Recommended: the second, because Engineering first makes a short divergence legitimate between a source's merge and its WIRE.
7. Per CPO review, the owners are proposals and are validated against each capability's real responsibility before its own migration, not now.

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
