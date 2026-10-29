# Engineering's gate controls

> PLAN (engineering/C3): nothing below exists yet. This PLAN names the Control Nodes Engineering will document for its own gates, and what each is realized by. Its DO waits for Controls (`kaal-controls`, with the `Control` and `Realized by` Definitions) to be on `main` and synchronized into `kaal/engineering`, as the change graph of `controls/C1` (#584) orders it.

Engineering owns how Changes are gated in this repository: which checks run before a push and before a merge, and what a protected branch requires. Controls owns what a control is and what may be claimed about it. Engineering documents its own controls as Nodes typed by `Control`, here, and Controls holds none of them (Owner, #575).

## The Control Nodes planned

Each is one Node in `engineering/controls/`, typed by `Control`. Its text states what the control is meant to do, in the terms of `Controls` (objective and type). It carries one Edge typed by `Realized by` for each Node that realizes it. Type is the design; nothing here claims that a control operates or is effective.

| Control | Objective | Type, by design | Realized by (mechanism) | Enforced by (references) |
| --- | --- | --- | --- | --- |
| Change Isolation | Core changes and `.github` changes each land in a Change of their own | Preventive at merge. Detective before a push, because a hook can be skipped | Guard, Branching | `guard-check:Change-Isolation`, `guard-check:push`, `workflow:change-isolation.yml#change-isolation`, `branching:branches` |
| Lineage | A pull request lands only on the branch its base allows: working branch into `kaal/<capability>`, `kaal/*` into `main` | Preventive at merge. Detective before a push | Guard, Branching | `guard-check:Branching`, `guard-check:push`, `workflow:lineage-synchronization.yml#lineage-synchronization`, `branching:engineer`, `branching:synchronize` |
| Promotion source | Only a `kaal/*` collector promotes into `main` | Preventive at merge | Guard, Branching | `guard-check:Promotion-Source`, `workflow:promotion-source.yml#promotion-source`, `branching:promote` |
| Lineage audit | An open pull request that breaks the branching policy is found, even if no new push re-judges it | Detective | Guard, Branching | `guard-check:Branching-audit`, `workflow:branching-audit.yml#audit` |
| Required tests | No Change lands while KAAL's own tests fail: acceptance, Engineering, Hosting and the workspaces | Preventive at merge | Guard, Branching | `guard-check:Acceptance`, `guard-check:Engineering`, `guard-check:Hosting`, `guard-check:Workspaces`, `workflow:ci.yml#hosting`, `workflow:ci.yml#acceptance`, `workflow:ci.yml#lane`, `workflow:ci.yml#guard`, `workflow:ci.yml#guard-hosts`, `workflow:guard-acceptance-boundary.yml#acceptance-boundary` |
| Review before merge | A Change lands on a protected branch only after review is complete | Preventive at merge | Branching | `branching:branches` |
| One promotion at a time | Promotions into `main` go up one pair at a time, in queue order | Directive today, kept by hand. Preventive once engineering/C2's Test Cases are green | Branching | `branching:promote` |

**Two kinds of link, kept apart.**
- **`Realized by`** is the Graph Edge to the mechanism as a whole, Guard or Branching. It is mechanism-level traceability, and it is kept.
- **Enforced by** names each actual enforcement point by a stable reference. The identity of each one belongs to the owner of what it names, and a Control only cites it:
  - `guard-check:<name>` is the repository's Guard check declaration `.kaal/config/guard/<name>.md`. The declarations are Engineering's data in Guard's format, and the name is the file's.
  - `workflow:<file>#<job>` is a job in `.github/workflows/<file>` that a pull request or a schedule runs. It is Engineering's workflow.
  - `branching:<section>` is a section of `engineering/github/branching.md`, Branching's rule text, by its existing heading.

**Gates outside these seven.** `workflow:codeql.yml#analyze` and `workflow:dependency-review.yml#dependency-review` are security gates. They are not among the seven controls proposed here, so they are listed once, here, as known and not yet documented, and the test reads this list. `workflow:guard-release.yml` runs only by dispatch and gates no Change.

- **Kept apart.** The automated checks and the review are separate controls, as Controls requires: evidence of one never stands for another. A required check only states that the check must pass. What its pass means is the check's own, and Testing's.
- **What a Realized by Edge claims.** Only where the control is claimed to be realized. It is not evidence that the check is configured as required, that it ran, or that the control works.

## What the DO also needs

- **Branching as a Node.** `Realized by` must point at a Node. Guard is one already (`engineering/guard/Guard.md`, a KAAL Capability). Branching is a plain page, `engineering/github/branching.md`. The DO gives it frontmatter, `name: Branching`, typed by `KAAL Definition`, as MOVE and GLUE are in `engineering/`. Its text does not change. This is the Owner's decision below.
- **Test Cases.** A new Engineering test, `engineering/controls/controls.test.mjs`, joins `npm run test:engineering`. Each behavioural case is first observed RED against a deliberately broken fixture. A RED that shows only that a module or Node is missing counts as blocked, not as evidence.
  - Each Node in `engineering/controls/` is typed by `Control`, and each of its `Realized by` Edges resolves through Graph's `identify` to Guard or Branching.
  - Each Enforced by reference resolves to exactly one mechanism: one declaration file, one job in one workflow, or one heading in `branching.md`. Fixture: a Control citing `guard-check:Nonexistent` makes the case RED.
  - **No undocumented gate.** The set of gates is every `.kaal/config/guard/*.md` declaration plus every job in a workflow that a pull request, a push or a schedule runs. Each must be cited by at least one Control or listed under "Gates outside these seven". Fixtures: a copy of the repository with a new `.kaal/config/guard/New.md`, and one with a new job in `ci.yml`, must each make the case RED, naming the new gate.
  - **What the test does not claim.** Coverage is not effectiveness. The test shows that every repository-declared gate is documented by a Control. It does not show that a check is required by a ruleset, that it ran, or that the control works. The required checks and review settings of GitHub rulesets live outside the repository, and the test reports them as not verified rather than inferring them.

## Contracts reused

Core's admission (`register`, `catalog`), Graph's `identify` and Edge form, and Controls' `Control` and `Realized by`. Nothing new is added to any of them.

## Owner decisions

1. **Branching's Node**: A give `branching.md` frontmatter typed by `KAAL Definition` (recommended), or B have Branching's Control Edges point at Guard only and leave Branching undocumented as a Node.
2. **The table**: whether these seven are the right gates to document first. The DO documents exactly the approved list. The Enforced by references above are the per-check coverage you asked for on #585, and the two security gates are named as outside the seven.

Approving this PLAN authorizes the engineering/C3 DO only, after Controls is on `main`. It authorizes no promotion and no change to any check, ruleset or workflow.
