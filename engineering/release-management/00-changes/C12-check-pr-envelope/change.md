# C12 change

## PLAN

1. Rename I7 and A33 to check PR Envelope and widen their text, add F17 and the Cases T161 to T162, and add C12 with its Case T163.
2. T161, T162 and T163 are RED on `main`.

## DO

1. Add `05-src/plan-body/envelope.mjs`: it takes title, body, base, head and commits as one facts file, applies the body check and the rules of F17, and runs by hand. It reads no git or GitHub, so a later adapter gathers the facts.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## Promotion hold

This Change is not promoted to `main` before create Hotfix (release/C11) has defined the HOTFIX route. The route rule of F17 for HOTFIX is stated from that route before promotion, and the PLAN does not cite C11 because it is not on `main`.

## Decision on the commit subject

The PR title is the commit subject (Kai, 11 Nov). A squash merge takes it, so the old rule `<Area> <PHASE>: <concern>` is dropped and replaced by the title rule of F17. This Change does not check commit subjects separately.

Not in this Change: wiring, hooks, CI, merge blocking, id agreement for SYNC, PROMOTION and HOTFIX, a GitHub adapter.
