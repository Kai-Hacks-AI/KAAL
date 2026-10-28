# Engineering's gate controls

> PLAN (engineering/C3): nothing below exists yet. This PLAN names the Control Nodes Engineering will document for its own gates, and what each is realized by. Its DO waits for Controls (`kaal-controls`, with the `Control` and `Realized by` Definitions) to be on `main` and synchronized into `kaal/engineering`, as the change graph of `controls/C1` (#584) orders it.

Engineering owns how Changes are gated in this repository: which checks run before a push and before a merge, and what a protected branch requires. Controls owns what a control is and what may be claimed about it. Engineering documents its own controls as Nodes typed by `Control`, here, and Controls holds none of them (Owner, #575).

## The Control Nodes planned

Each is one Node in `engineering/controls/`, typed by `Control`. Its text states what the control is meant to do, in the terms of `Controls` (objective and type). It carries one Edge typed by `Realized by` for each Node that realizes it. Type is the design; nothing here claims that a control operates or is effective.

| Control | Objective | Type, by design | Realized by |
| --- | --- | --- | --- |
| Change Isolation | Core changes and `.github` changes each land in a Change of their own | Preventive at merge. Detective before a push, because a hook can be skipped | Guard (its `Change-Isolation` and `push` checks), Branching (the required check on protected branches) |
| Lineage | A pull request lands only on the branch its base allows: working branch into `kaal/<capability>`, `kaal/*` into `main` | Preventive at merge. Detective before a push | Guard (its `Branching` and `push` checks), Branching (its lineage rules and their required check) |
| Promotion source | Only a `kaal/*` collector promotes into `main` | Preventive at merge | Guard (its `Promotion-Source` check), Branching |
| Lineage audit | An open pull request that breaks the branching policy is found, even if no new push re-judges it | Detective | Guard (its `Branching-audit` check), Branching |
| Required tests | No Change lands while KAAL's own tests fail: acceptance, Engineering, Hosting and the workspaces | Preventive at merge | Guard (its `Acceptance`, `Engineering`, `Hosting` and `Workspaces` checks), Branching (their required checks) |
| Review before merge | A Change lands on a protected branch only after review is complete | Preventive at merge | Branching (protected branches require review) |
| One promotion at a time | Promotions into `main` go up one pair at a time, in queue order | Directive today, kept by hand. Preventive once engineering/C2's Test Cases are green | Branching (the rule and `promotionOrder`, engineering/C2) |

- **Kept apart.** The automated checks and the review are separate controls, as Controls requires: evidence of one never stands for another. A required check only states that the check must pass. What its pass means is the check's own, and Testing's.
- **What a Realized by Edge claims.** Only where the control is claimed to be realized. It is not evidence that the check is configured as required, that it ran, or that the control works.

## What the DO also needs

- **Branching as a Node.** `Realized by` must point at a Node. Guard is one already (`engineering/guard/Guard.md`, a KAAL Capability). Branching is a plain page, `engineering/github/branching.md`. The DO gives it frontmatter, `name: Branching`, typed by `KAAL Definition`, as MOVE and GLUE are in `engineering/`. Its text does not change. This is the Owner's decision below.
- **Test Cases.** A new Engineering test, `engineering/controls/controls.test.mjs`, joins `npm run test:engineering`. It is RED first, because no Control Node exists:
  - each Node in `engineering/controls/` is typed by `Control`, and each of its `Realized by` Edges resolves through Graph's `identify` to Guard or Branching;
  - each gating check under `.kaal/config/guard/` is named by at least one Control's Realized by line, so a new gate without a documented control fails the test.

## Contracts reused

Core's admission (`register`, `catalog`), Graph's `identify` and Edge form, and Controls' `Control` and `Realized by`. Nothing new is added to any of them.

## Owner decisions

1. **Branching's Node**: A give `branching.md` frontmatter typed by `KAAL Definition` (recommended), or B have Branching's Control Edges point at Guard only and leave Branching undocumented as a Node.
2. **The table**: whether these seven are the right gates to document first. The DO documents exactly the approved list.

Approving this PLAN authorizes the engineering/C3 DO only, after Controls is on `main`. It authorizes no promotion and no change to any check, ruleset or workflow.
