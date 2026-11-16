# C34 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The set is a copy of what is live plus four deliberate differences, each a `changed` or `new` row: no "up to date", Guard in promotion, and the two new rulesets `hotfixing` and `wiring`. Nothing is invented.
- One table (`controls.md`) with the JSON beside it, checked by a Case in both directions, makes every setting a control with its place.

## Learned

- The first home (`engineering/rulesets`) was wrong: the Owner placed the rulesets in release management, in the `05-src/wiring/rulesets/<target>.json` layout release/C18 already uses. Moving the PLAN cost one commit because the Cases used one helper for the paths.
- `target` and `bypass_actors` are settings too; T455 had to read them from the JSON to keep source and table complete.
- A Case file exports `id`, `tests`, `title` and `run`; the PLAN's node:test files had to be converted when they turned green.

## Lacked

- release/C18's `integration.json` and `promotion.json` sit on another collector, 21 commits behind `main`. They carry the same names with `analyze Vulnerabilities` contexts, so that collector must be synchronized and reconciled with this set before both reach `main`.
- Guard for tags (an OPEN row), the WIRE judge and the hotfix qualifier are not in set 1, by the Owner's minimal-setup direction.

## Longed For

- The Owner installs set 1 beside the old three; then `#1705` is admitted by `wiring` (baseline 0), and the old three drain control by control.

## Follow-ups

- Reconcile with release/C18 (the two analyze Vulnerabilities contexts become rows of `controls.md`).
- `Promotion Source` (C16) is a bridge; a separate required home for freshness comes before it retires.
