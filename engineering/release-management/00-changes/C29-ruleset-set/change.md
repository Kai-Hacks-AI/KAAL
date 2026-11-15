# C29 change

## PLAN

1. Add C29 with the gap G65 and the Case T291, RED on `main`: the DO records the set in `05-src/wiring/rulesets/set.md`.
2. The record names the five rulesets, what each protects, which delivery path reaches it, and that Development (the hooks) is not a ruleset.
3. The PLAN changes no workflow, no live ruleset and no declaration.

## DO

Not authorized by this PLAN. The DO writes `set.md` in the Engineering source. The per-control needs (release/C5, release/C18, release/C28) are lined up with it by their own Changes: each names the rulesets it needs from this set.

## ACT

A 4L retrospective in `act.md`, before the promotion.

## Not in this Change

Creating, renaming, enabling or retiring any live ruleset, the required contexts of any control, and the main protection policy design for the hotfix and wire paths (a separate Change after the CPO review).

## Dependencies

release/C5 named three steps (Integration, Promotion, Publishing). This Change adds hotfixing and wiring as paths into `main`. release/C27 defines the WIRE operation.
