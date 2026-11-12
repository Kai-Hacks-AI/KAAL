# Coordination: Change (A to B)

This is `coordination/C1`, a PLAN Change. It ships no code. It adds one read-only script to the `kaal-release` Skill. Its ids are in the scope `coordination/`, which holds no `release/` id, so it cannot collide with the `release/` ids used by #1350 and by `engineering/release-management`. Whether those two collide with each other is for them to settle, not this Change.

## A: the present

- `kaal-release` is Skill-only (#1350, approved at its exact head, not yet merged; no package on `main`).
- The CPO and CTO reconstruct by hand which pull request deserves attention, whether it needs creating, review, revision or auto-merge, which collector is promoted next, and whether a SYNC prepares a promotion or only unblocks a Change.
- Nothing reports a pull request that does not exist yet, and the relationship between a promotion's SYNC and PROMOTION, or between a SYNC and the Change it unblocks, is nowhere stated.

## B: the target

One deterministic script in the Skill turns declared pairs and policy plus gathered facts into an ordered action list, derived backwards from the outcome through Publishing, Promotion, Integration and Development and printed forwards. See [requirements.md](requirements.md) and [testing.md](testing.md). Analysis: [analysis.md](analysis.md).

## The route, and the sequencing against #1350

Resolved: #1350 merges first, untouched. This PLAN neither edits nor waits inside it.

1. #1350 lands through its own protected route (CPO: no override, no manual merge).
2. This PLAN, approved by exact-head CPO review, into the `kaal/release/plan` collector. It can be reviewed now; it merges after #1350.
3. One commit on this branch applies the ten edits of [amendments.md](amendments.md) to #1350's files, after the collector is merged into the head.
4. DO: the package shape from #1350's DO exists; then the Script, the Cases going from RED to GREEN, and the refactor they allow.
5. A second Change adds the live gatherer, run on the Owner's device.

## Questions raised earlier, and where they stand

| Question | Resolution |
| --- | --- |
| Does a `scripts/` directory conform? | Yes. `kaal-engineer-skill` ships `skills/<name>/scripts/` through its `files` list, and its checker requires a referenced `scripts/` file to exist. `SKILL.md` must name the Script and the package must carry it (F1). |
| Sequencing against #1350 | Above. |
| Id scope | `coordination/`, with no `release/` id. |
| Are `OPEN PR` and `PR` acceptable words in a generic Skill | Yes. The Owner and CPO name these actions. |
| Declared file or command line for the pair order and the holds | A declared file, the declaration of F3. The pair order is the CPO's priority and must be reviewable. The Owner has not yet confirmed it. |

## Out of scope

- Any write: creating pull requests, approving, merging, enabling auto-merge, commenting.
- Gathering the facts from the host (its own Change). The gatherer reads each request's template type and named Change; the Script never parses titles or prose.
- Proposing DO or ACT pull requests from Change state.
- The HOTFIX route (reported, not modelled), the Publishing layer (reported, not modelled), hooks, CI, Guard and rulesets.
- Retiring track Work (a decision after the Script is on `main`).
