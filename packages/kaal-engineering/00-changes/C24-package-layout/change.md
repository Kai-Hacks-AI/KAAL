# C24 change

## PLAN

1. Add the Intent I3, the Requirements F45 to F51 and N20, the Architecture A3 and the gap G114 under `packages/kaal-engineering/`. Each element states what verifies it done, under "Done when". Their Cases T1220 to T1229 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against the collector (`evidence.md`) and show that each Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file. `draft/skills/kaal-engineering/` holds the intended reference (a page and its data, `package-layout.json`) and the one added line of `SKILL.md`, for review only.
4. The Cases test the template as data (kinds, order, verifying folders, deployment rules) and never the wording of the page. Changing a role sentence in the data keeps them green; breaking a rule turns one RED.

## Ids

Proposed, to be confirmed by the allocator: Change engineering/C24, Intent engineering/I3, Requirements engineering/F45 to F51 and N20, Architecture engineering/A3, Cases T1220 to T1229, gap G114. They are the next free at the collector tip `80e4a987`, and they skip the ids the parked registration PLAN (#1954) holds.

## The layout

```
packages/<cap>  =  engineering/<cap>  =  .kaal/<cap>     one layout, three places
  AGENTS.md  README.md  LICENSE  package.json  *.kaal.json
  00-backlog/   01-changes/   02-controls/
  10-intent/{intent, test-cases/}      11-requirements/{requirements, test-cases/}
  12-architecture/{architecture, test-cases/}
  13-source/{skill/, scripts/, unit-tests/}
  14-defects/{defects, test-cases/}
  dist/
```

- **Machinery** (`AGENTS.md`, `13-source`, `dist`, the root files) is written only in `packages/`. N+1 is deployed to `engineering/`, N through npmjs to `.kaal/`. A deployed copy matches its source, so a hand edit there is waste.
- **Content** (`00-backlog` to `14-defects`, including `02-controls`) is content in context: owned locally, never deployed, never compared. In a package it is the capability's own; in `engineering/` and `.kaal/` it is the consumer's data, produced by the capability. A defect about our repository lives in `engineering/<cap>/14-defects`: defects are local, and the Defect Skill only helps find them.
- **Four AGENTS.md**, each serving something else, the repository root on top: `AGENTS.md` (work across the repository), `packages/AGENTS.md` (work across packages), `packages/<cap>/AGENTS.md` (work on the package, not shipped) and `packages/<cap>/dist/AGENTS.md` (ships; guides consumers; built from `13-source`). The shipped one sits above the Skill and points to `SKILL.md` without repeating it; the Skill and its references guide use.
- **Controls are contextual, not shippable.** The consumer owns its controls, their evidence and operational state; each control links to the Intent it serves and finds machinery through that Intent's Requirements and Architecture. The capability ships solution elements and machinery. `02-controls` in a package holds only controls over the package itself.
- A repository with no KAAL packages has only `.kaal/<cap>`.
- Every element kind (intent, requirement, architecture, defect) says what verifies it done, and the layout gives that a place: `test-cases/`; the source has `unit-tests/`.
- The numbers only order folders for people. Only scripts, unit tests and test-cases are deterministic; the rest is validated by review. `02-controls` holds only controls over the package itself; consumer controls are consumer space. `dist` is generated, never edited, not committed. The layout is owned by kaal-engineering.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change: add `skills/kaal-engineering/references/package-layout.md` and `package-layout.json` from `draft/` and the one line in `SKILL.md`. The Cases become `.test.mjs` when they are green. No package is moved.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Not in this Change

No migration of any package, including Hosting. No change to Hosting's `AGENTS.md`: its "Packaging" pointer should move to kaal-engineering in a later Change. No script, no control, no publication, no change outside `packages/kaal-engineering/`. This Change is separate from C23 and does not wait for its promotion, but it is built on the C23 package, so it travels in the same collector.

## Owner questions

1. The existing packages use `00-changes`, `01-intent` and so on, and this layout uses `01-changes`, `02-controls`, `10-intent`. The reference states the target and does not move anything. Is a later migration per package, with the Skill as its guide, what you want?

## Owner question

`dist/AGENTS.md` is built from `13-source`, but the layout does not say which file there is its source. Should `13-source` get a child for it (for example `agent/`), or is it generated from the Skill? Not decided here: the template says only "built from 13-source".
