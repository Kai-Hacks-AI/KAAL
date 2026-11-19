# C24 change

## PLAN

1. Add the Intent I3, the Requirements F45 to F49 and N20, the Architecture A3 and the gap G114 under `packages/kaal-engineering/`. Their Cases T1220 to T1227 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against the collector (`evidence.md`) and show that each Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file. `draft/skills/kaal-engineering/` holds the intended reference and the one added line of `SKILL.md`, for review only.

## Ids

Proposed, to be confirmed by the allocator: Change engineering/C24, Intent engineering/I3, Requirements engineering/F45 to F49 and N20, Architecture engineering/A3, Cases T1220 to T1227, gap G114. They are the next free at the collector tip `80e4a987`, and they skip the ids the parked registration PLAN (#1954) holds.

## The layout

```
packages/<capability>/
  AGENTS.md  README.md  LICENSE  package.json  *.kaal.json
  00-backlog/   01-changes/   02-controls/
  10-intent/{intent, test-cases/}
  11-requirements/{requirements, test-cases/}
  12-architecture/{architecture, test-cases/}
  13-source/{skill/, scripts/, unit-tests/}
  14-defects/{defects, test-cases/}
  dist/
```

Rules: the numbers only order folders for people; each concern carries its own tests; only scripts, unit tests and test-cases are deterministic, the rest is validated by review; `02-controls` holds only controls over the package itself; consumer controls are consumer space; `dist` is generated, never edited, not committed; the layout is owned by kaal-engineering.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change: add `skills/kaal-engineering/references/package-layout.md` from `draft/` and the one line in `SKILL.md`. The Cases become `.test.mjs` when they are green. No package is moved.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Not in this Change

No migration of any package, including Hosting. No change to Hosting's `AGENTS.md`: its "Packaging" pointer should move to kaal-engineering in a later Change. No script, no control, no publication, no change outside `packages/kaal-engineering/`. This Change is separate from C23 and does not wait for its promotion, but it is built on the C23 package, so it travels in the same collector.

## Owner questions

1. The existing packages use `00-changes`, `01-intent` and so on, and this layout uses `01-changes`, `02-controls`, `10-intent`. The reference states the target and does not move anything. Is a later migration per package, with the Skill as its guide, what you want?
