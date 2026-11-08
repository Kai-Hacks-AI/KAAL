# Testing's own package name: before and after

Testing 0.0.1 is `@kaihacksai/kaal-testing`. Under the Owner's ruling that a planned Case may change in its name or path clause only, each clause below changes and nothing else in these Cases does. The Hosting name clauses are in `hosting-name-supersessions.md`.

## Planned Cases

| Case | Before | After |
| --- | --- | --- |
| testing/T74 (`test/plan/release.test.mjs`), repository path | `packages/skills/kaal-testing` | `packages/kaal-testing` (the flat package layout) |
| testing/T74, repository root | three directories above the package | two directories above the package (the same flat layout) |
| testing/T74, old-name search | every match of the quoted old name fails | every match fails unless `exceptions.json` classifies that exact line (path and SHA-256 of its text), so an operational reference still fails by name and an unreviewed line is a finding |
| testing/T74, runtime dependencies | `{ c8, <Hosting> }` as dependencies | `{ <Hosting> }` as the dependency and `{ c8 }` as the exact peer, as testing/T13 already asserts and the c8 Defect decided |
| testing/T78 (`test/plan/release.test.mjs`), Hosting directory | `packages/extensions/kaal-hosting` | `packages/kaal-hosting` |

The dependency clause is the one that is not a name or a path. It records a decision already taken and tested (c8 is an optional, exactly pinned peer) so that T74 no longer contradicts T13; the CPO is asked to confirm it.

## Operational references, by owner

Every import, dependency entry, workspace selector and acquisition selector that named the old package now names the scoped package, with its export suffix unchanged. No alias is added. Other owners' files change in these lines only:

- `engineering/acceptance/embed.test.mjs`
- `engineering/acceptance/execution.test.mjs`
- `engineering/boundary.test.mjs`
- `engineering/contracts/measure.mjs`
- `engineering/coverage/measure.mjs`
- `engineering/delivery/pack.mjs`
- `engineering/delivery/pack.test.mjs`
- `engineering/execution/test/plan/adoption.case.mjs`
- `engineering/inventory/attribute.mjs`
- `engineering/inventory/measure.mjs`
- `engineering/lanes/acceptance.mjs`
- `engineering/release/run.mjs`
- `engineering/report/measure.mjs`
- `package-lock.json`
- `packages/kaal-change/package.json`
- `packages/kaal-change/test/acceptance/packed.test.mjs`
- `packages/kaal-change/test/acceptance/skill.test.mjs`
- `packages/kaal-change/test/publisher/package-only.mjs`
- `packages/kaal-change/test/publisher/product.test.mjs`
- `packages/kaal-engineer-skill/test/acceptance/engineer-skill.test.mjs`
- `packages/kaal-graph/package.json`
- `packages/kaal-graph/test/acceptance/graph.test.mjs`
- `packages/kaal-graph/test/ownership.test.mjs`
- `packages/kaal-review/package.json`
- `packages/kaal-review/test/review.test.mjs`

## Left as they are, by classification

`exceptions.json` lists the lines that still hold the old spelling and why: historical evidence keeps the identity actually observed, Core's registered holders are its fixture data, the Agent Skill's directory and name are distinct from the npm scope, test titles are prose, a deferred export is not implemented, and this migration's own planning records quote the old name. Their owners decide their meaning.
