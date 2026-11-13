# analyze Flow: Change (A to B)

> **Superseded in scope (CPO, 12 Nov 2026).** The delivery is now the minimal Show WIP v1 of [requirements.md](requirements.md). This document describes the earlier, larger analyze Flow design and is kept for the trace; where it differs, requirements.md and testing.md win.

This is `coordination/C1`, a PLAN Change. It ships no code. It adds one read-only script to the `kaal-release` Skill, the detective control `analyze Flow` (Owner, 12 Nov 2026): it makes the flow transparent and authorizes nothing. Its ids are in the scope `coordination/`, which holds no `release/` id, so it cannot collide with the `release/` ids used by #1350 and by `engineering/release-management`. Whether those two collide with each other is for them to settle, not this Change.

## A: the present

- `kaal-release` is Skill-only (#1350, approved at its exact head, not yet merged; no package on `main`).
- The CPO and CTO reconstruct by hand which piece deserves attention, whether it needs opening, review, revision or landing, which collector is promoted next, and whether a SYNC prepares a promotion or only unblocks a Change.
- Nothing reports a piece that does not exist yet, and the relationship between a promotion's SYNC and PROMOTION, or between a SYNC and the Change it unblocks, is nowhere stated.

## B: the target

One deterministic script in the Skill turns declared pairs and policy plus gathered facts into an ordered action list, derived backwards from the outcome through Publishing, Promotion, Integration and Development and printed forwards. See [requirements.md](requirements.md) and [testing.md](testing.md). Analysis: [analysis.md](analysis.md).

## The route, and the sequencing against #1350

Resolved: #1350 merges first, untouched. This PLAN neither edits nor waits inside it.

The delivery is an end-to-end vertical slice, not the Script alone (CPO, 12 Nov). Order:

1. #1350 lands through its own protected route (CPO: no override, no manual merge).
2. This PLAN, approved by exact-head CPO review, into the `kaal/release/plan` collector. It can be reviewed now; it merges after #1350.
3. One commit on this branch applies the ten edits of [amendments.md](amendments.md) to #1350's files, after the collector is merged into the head.
4. **The contract**: F2, F3 and F14 to F17 define what crosses from supplier to Script, how the real host's facts and delivery provenance are obtained, and what happens when the host cannot supply one.
5. **The minimal slice (DO)**: the supplier, the Script and the command, so that T18 to T21 go from RED to GREEN and T22 runs on the real repository and prints one recommendation naming a real piece. Separately owned Changes may build the Skill's Script and the consumer's supplier, but the slice is not accepted until the connected path (T19, T22) passes.
6. **Expansion**: the remaining Cases (T1 to T17: pairs, development SYNCs, missing pieces, HOTFIX and fallback, ordering) go green on that path, then the refactor they allow.

## Questions raised earlier, and where they stand

| Question | Resolution |
| --- | --- |
| Does a `scripts/` directory conform? | Yes. `kaal-engineer-skill` ships `skills/<name>/scripts/` through its `files` list, and its checker requires a referenced `scripts/` file to exist. `SKILL.md` must name the Script and the package must carry it (F1). |
| Sequencing against #1350 | Above. |
| Id scope | `coordination/`, with no `release/` id. |
| Host-neutral words | Resolved by the Owner (12 Nov): the contract says piece, into, from, at, fit, LAND and CHECK, built on PLAN, DO, CHECK, ACT, HOTFIX and REVIEW. The gatherer maps the host's terms. |
| Declared file or command line for the pair order and the holds | A declared file, the declaration of F3. The pair order is the CPO's priority and must be reviewable. The Owner has not yet confirmed it. |

## Out of scope

- Any write: opening, approving or landing a piece, commenting.
- Running it inside a workflow, scheduling it, or posting its findings anywhere (each its own Change; F12 only makes it possible). The first increment is run on demand, on a person's machine.
- Anything beyond the supplier's read-only mapping: the Script never parses titles or prose, and the supplier writes nothing to the host.
- Proposing DO or ACT pieces from Change state.
- The HOTFIX route (reported, not modelled), the Publishing layer (reported, not modelled), hooks, CI, Guard and rulesets.
- Retiring track Work (a decision after the Script is on `main`).
