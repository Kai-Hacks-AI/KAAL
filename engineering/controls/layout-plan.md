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

## Where the port Cases live

`engineering/github/ports/` is not a good home: it is named for a mechanism, and it holds three different kinds of thing. The rule is that a Case sits next to what motivated it.

| Case | Motivated by | Proposed home |
| --- | --- | --- |
| Parity Case of one port (for example `promotion-source.parity.test.mjs`, ports/T2) | that one script and its control's requirement that output and exit codes stay as they were | beside the script it ports: `engineering/github/promotion-source.parity.test.mjs`, next to `promotion-source.mjs` and `lineage.test.ts` |
| Shell inventory Case (ports/T1) and the final three-shim byte pin | the repo-wide requirement that the must-be-shell list stays small and each shim is pinned | a new folder about shell as such: `engineering/shell/` |
| The ports PLAN (`engineering/github/ports/PLAN.md`) | the same repo-wide requirement | `engineering/shell/` as well, with its Intent, Requirements and Architecture in the numbered folders above |

Moving them changes only paths (and the `test:engineering` list); the Cases' bytes stay the same. It is its own Change, after the layout is decided.

## Decisions for the Owner

1. **Numbered folders (package-like) or the C3 flat files** (`intent.md`, `requirements.md`, `architecture.md`, `testing.md`)? Recommendation: numbered, so one traceability computer reads both.
2. **The term "Assurance".** It is the existing README heading for how each claim is checked. In the new layout it disappears as a heading: the claims' state is read from the Cases in `04-test` by trace.
3. **Brackets or typed edges.** Today `[F1]` brackets are the traces. Keep them now; typed edges follow when Requirements and Architecture define them.
4. **Case homes.** Parity Cases beside their script, the inventory and byte-pin Cases and the ports PLAN in `engineering/shell/`. Recommendation: yes.
5. **Where the chain folders live: `engineering/controls/` or `engineering/github/controls/`.** A control is an enduring concern, kept apart from any mechanism (a Control carries `Has` edges and nothing else), and not all seven are about GitHub: Change Isolation's checker is `engineering/change-isolation/`, Required tests belongs to the lanes. Under `github/controls/` those would have no home, and every control would be tied to one provider. Recommendation: chain folders stay in `engineering/controls/<control>/`; the scripts and their parity Cases stay in `engineering/github/`, where the mechanism is. If the Owner prefers `github/controls/`, only the controls whose mechanism is a GitHub workflow (at least Lineage, Promotion source and Lineage audit; the others are to be checked one by one) would move there, and the rest stay behind.
6. **Migration.** One control first (promotion-source, the pilot), bytes of each section unchanged, as its own Change. The other six follow once it is reviewed. The ports' Architecture edits then land in the new place, once.

## Not in this PLAN

No file is moved, no Node re-id'd, no promotion, version bump, SYNC, ledger entry, release dispatch or publication.
