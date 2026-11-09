# PLAN: lay Engineering's controls out like a package

Status: PLAN, nothing below is built. Owner decision on 9 Nov 2026: decide this layout first; the gate ports' Architecture edits (including the closed #1318) wait for it.

## Why

A package such as Foundation keeps one folder per link of the chain: `00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-test`, `06-defects`. Engineering's controls hold the same chain, but as sections of one file, `engineering/controls/README.md` (I1, F1, A1 and "Assurance" per control). The earlier C3 PLAN in that README already proposed a directory per control with flat files, and that was never delivered: today only the README exists. The two shapes differ, which blocks tracing a port's chain with the same tool for a package and a control.

## Proposal (to decide)

One directory per control, numbered like the package, Cases beside what motivated them (the Case layout rule):

```
engineering/controls/<control>/
  <Name>.md          the Control Node: Has edges to its Intents
  01-intent/intent.md
  02-requirements/   functional, non-functional (F..., N...)
  03-architecture/   A... naming code:, workflow:, guard-check: references
  04-test/           index of the Cases that verify the claims, by reference
  06-defects/        Defects (empty until one exists)
```

Cases stay next to the code (for example `engineering/github/ports/promotion-source.parity.test.mjs`); `04-test` only refers to them by `test:<path>#<describe>`. Change records stay in `.kaal/changes/engineering/`, as Engineering's own folder holds only what improves Engineering.

## Where the code of each control lives today

Measured on `main` from the controls' Architecture lines and the Guard check declarations (`.kaal/config/guard/`). The control's chain stays in `engineering/controls/`; the implementation stays with its mechanism. "Cases" are the Cases the control cites.

| Control | Decides (checker) | Run by (script via Guard, workflow) | Cases |
| --- | --- | --- | --- |
| Change Isolation | `engineering/change-isolation/check.mjs` | `engineering/github/change-isolation.sh` (to port), `change-isolation.yml`; before a push, `push-check.sh` | `engineering/change-isolation/check.test.mjs` |
| Lineage | `engineering/github/lineage.ts` (`synchronization`, `methodFor`, `autoMerge`, `landing`) | `engineering/github/branching.sh` (to port), `lineage-synchronization.yml`; before a push, `push-check.sh` | `engineering/github/lineage.test.ts` |
| Promotion source | `engineering/github/lineage.ts` (`promotionSource`, `promotionFreshness`) | `engineering/github/promotion-source.mjs` (ported, #1317), `promotion-source.yml` | `lineage.test.ts`; parity Case `engineering/github/ports/promotion-source.parity.test.mjs` |
| Lineage audit | `lineage.ts` (`establishment`, `collector`, `workingBranch`), `engineering/github/holds.json` | `engineering/github/branching-audit.sh` (to port), `branching-audit.yml` | `lineage.test.ts` |
| Required tests | none: the lanes themselves | `npm run test:*` through Guard, `ci.yml`, `guard-acceptance-boundary.yml` | `engineering/lanes/evidence.test.mjs` |
| Review before merge | none: GitHub branch protection, outside the repository | none | none (validated by the reviewer) |
| One promotion at a time | none: directive today | none | none yet |

This is why the chain folders cannot live under `github/`: not all controls are GitHub-bound, and two have no code.

## An eighth control: the merge queue (proposed)

The merge queue is a control that has not been named. It enforces rules today, in `merge-group.yml`, `merge-group-review.yml`, `merge-group-admission.yml` and `.github/scripts/bind-group.sh`, with no control, Intent or Requirements above them. Proposed name: **Merge queue** (`merge-queue`).

**Intent (I1).** What lands on a protected branch is exactly what was reviewed and judged: the queued pull request at its current head, on the base it lands on, judged again at merge time and never on an earlier result.

**Requirements the code already enforces** (from the files named; each to be confirmed by the CPO against the code):
- **F1.** The merge group is exactly the queued pull request at its current head on the group's base, in one of the two shapes GitHub's queue produces: one parent equal to the base with the tree that merging the head into the base gives (squash), or the base as first parent with the head an ancestor of the group (merge). Anything else, or anything that cannot be established, is "cannot judge" (exit 2). Source: `bind-group.sh`.
- **F2.** Change Isolation, Branching and Promotion Source each judge the merge group itself, with the default branch's checker, never pass the pull request's earlier result through, and run only for a `merge_group` event. Source: `merge-group.yml`.
- **F3.** A ledger entry a promotion carries is attested at merge time: the job `Change Isolation (review)` is the last required check to finish, reads the approvals, judges, reads them once more, and fails on a different answer. Source: `merge-group-review.yml`.
- **F4.** A pull request can enter the queue: the admission job gives its head the context `Change Isolation (review)`. It reads and judges nothing and authorizes nothing, so the pull request path and the merge group path never share a token or event. Source: `merge-group-admission.yml`.
- **N1.** Every one of these fails closed: a fact that cannot be read, a queued pull request that cannot be found or a group that does not contain it is a failure.

**Architecture and Cases (as they stand).** Checker and scripts: `.github/scripts/bind-group.sh` (to port), the three `merge-group*.yml` workflows, and the default branch's checkers. Cases: the RED Cases in `engineering/github/` (`bind-group.red.mjs`, `queue-workflows.red.mjs`, `handler-deferred.red.mjs`, `activation.red.mjs`), which are hand-run today. Whether they are all GREEN and in `test:engineering` is to be checked. **Unresolved:** that the queue is required and was used on a given Change. A ruleset declares it and is not evidence of it. Mechanism level: Program.

Note: `merge-group-admission.yml` is a `pull_request_target` workflow, so it is one of the four gates GitHub's default `pull_request_target` block (from 2 December 2026) would stop.

So three of the original seven controls are implemented by GitHub scripts and workflows, plus Change Isolation (own checker folder) and Required tests (the lanes), and the new Merge queue. Two controls have no code at all.

## Naming the controls by business concern

The Owner's direction: a control is named by the concern it protects, not by its mechanism. The names below are proposals, taken from each control's Intent. Folder names would follow (`engineering/controls/<concern>/`). Renaming a control is a re-id of its Nodes, so it needs the incoming-edge impact list first and is its own Change.

| Today (mechanism) | Intent in one line | Proposed concern name |
| --- | --- | --- |
| `change-isolation` | a Change to Core and one to `.github/` can each be reviewed, reverted and promoted on its own | **Changes stand alone** |
| `lineage` | work reaches `main` only through its Capability's collector | **Work comes through its owner** |
| `promotion-source` | only a Capability's own collector changes `main`, validated against the `main` it lands on | **Only owners release** |
| `lineage-audit` | a pull request or collector that has fallen out of policy is found even when nothing is pushed | **Drift is found** |
| `required-tests` | no Change lands while KAAL's own tests fail | **Tested before landing** |
| `review-before-merge` | a Change lands only after its review is complete | **Reviewed before landing** |
| `one-promotion` | promotions go up one at a time, each validated against the `main` it lands on | **Validated against current main** |
| `merge-queue` (proposed) | what lands is exactly what was reviewed and judged, judged again at merge time | **What lands is what was judged** |

Observation, not a decision: three of these overlap. `lineage`, `promotion-source` and `one-promotion` all speak of promotions into `main` through a Capability's collector, validated against the `main` they land on. Naming them by concern may show that they are one or two concerns, not three. That is for the Owner and the CPO to judge.

## Where the port Cases live

`engineering/github/ports/` is not a good home: it is named for a mechanism, and it holds three different kinds of thing. The rule is that a Case sits next to what motivated it.

| Case | Motivated by | Proposed home |
| --- | --- | --- |
| Parity Case of one port (for example `promotion-source.parity.test.mjs`, ports/T2) | that one script and its control's requirement that output and exit codes stay as they were | beside the script it ports: `engineering/github/promotion-source.parity.test.mjs`, next to `promotion-source.mjs` and `lineage.test.ts` |
| Shell inventory Case (ports/T1) and the final three-shim byte pin | the repo-wide requirement that the must-be-shell list stays small and each shim is pinned | a new folder about shell as such: `engineering/shell/` |
| The ports PLAN (`engineering/github/ports/PLAN.md`) | the same repo-wide requirement | `engineering/shell/` as well, with its Intent, Requirements and Architecture in the numbered folders above |

Moving them changes only paths (and the `test:engineering` list); the Cases' bytes stay the same. It is its own Change, after the layout is decided.

## Running it control by control

Owner direction: take the controls one at a time, and use it to learn what the Controls capability (kaal-control) needs. Each control goes through the same steps, and the next one starts only when the previous one is done:

1. **Concern name** (the proposal above, or the Owner's own words).
2. **Chain folders:** its Intent, Requirements, Architecture and Test index in the numbered folders, with the bytes of each section unchanged. Defects folder created empty.
3. **Cases:** the Cases it cites, in their homes (parity Cases beside the script, shell Cases in `engineering/shell/`).
4. **Port,** where the control has a shell script: the port and its parity Case, with the Architecture line naming the `.mjs`.
5. **Promotion** of that control's collector, on its own, with the Owner's go and the CPO's exact-head review.
6. **Lessons:** what the step showed about the Controls capability, written into the log below before the next control starts.

**First control: Promotion source.** Its port has already landed in the collector (#1317), it has one Intent and two Requirements, and its checker (`lineage.ts`) is shared with Lineage, so the first pass also shows how a control relates to a checker it shares. Proposed order after it: Lineage, Lineage audit, Change Isolation, then the controls that have no port (Required tests, Review before merge, One promotion at a time) and the merge queue, last, because its scripts also depend on the `pull_request_target` decision.

### What we learn about kaal-control (log)

Filled in as each control is done. Questions to answer on the way:
- Does a control's chain read the same as a package's chain with the same tool (the traceability computer)?
- Where does a Case that several controls share belong (for example `lineage.test.ts`)?
- Can a control with no code (Review before merge) still carry a chain, and what does its Test index say?
- What does a rename by business concern cost in incoming edges?

## Decisions for the Owner

1. **Numbered folders (package-like) or the C3 flat files** (`intent.md`, `requirements.md`, `architecture.md`, `testing.md`)? Recommendation: numbered, so one traceability computer reads both.
2. **The term "Assurance".** It is the existing README heading for how each claim is checked. In the new layout it disappears as a heading: the claims' state is read from the Cases in `04-test` by trace.
3. **Brackets or typed edges.** Today `[F1]` brackets are the traces. Keep them now; typed edges follow when Requirements and Architecture define them.
4. **Case homes.** Parity Cases beside their script, the inventory and byte-pin Cases and the ports PLAN in `engineering/shell/`. Recommendation: yes.
5. **Where the chain folders live: `engineering/controls/` or `engineering/github/controls/`.** A control is an enduring concern, kept apart from any mechanism (a Control carries `Has` edges and nothing else), and not all seven are about GitHub: Change Isolation's checker is `engineering/change-isolation/`, Required tests belongs to the lanes. Under `github/controls/` those would have no home, and every control would be tied to one provider. Recommendation: chain folders stay in `engineering/controls/<control>/`; the scripts and their parity Cases stay in `engineering/github/`, where the mechanism is. If the Owner prefers `github/controls/`, only the controls whose mechanism is a GitHub workflow (at least Lineage, Promotion source and Lineage audit; the others are to be checked one by one) would move there, and the rest stay behind.
6. **Names.** Name each control by business concern, using the table above (or the Owner's own words), and decide whether the overlapping three stay separate.
7. **Migration.** Control by control, as in the section above, starting with Promotion source. Bytes of each section stay unchanged, each control is its own Change. The ports' Architecture edits then land in the new place, once.

## Not in this PLAN

No file is moved, no Node re-id'd, no promotion, version bump, SYNC, ledger entry, release dispatch or publication.
