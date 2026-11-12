# C12 change

## PLAN

1. Rename I7 and A33 to check PR Envelope and widen their text, add F17 (shared body rule, per-type contract, route, id) and the Cases T161 and T162, and add C12 with its Case T163.
2. T161, T162 and T163 are RED on `main`.

## DO

1. Add `05-src/plan-body/envelope.mjs`: it takes title, body, base, head and commits as one facts file, applies the shared body rule, the PLAN contract for PLAN and the rules of F17, holds the types as a registry of rows, reports the other types' chapters as not judged and an unknown TYPE as unsupported, and runs by hand. It reads no git or GitHub, so a later adapter gathers the facts.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## Staging and what is not judged

- The body is judged by a shared formatting rule for every TYPE and, separately, by the contract of the TYPE, which also holds the shape of the `Change` chapter, because that shape differs by TYPE. Only the PLAN contract is on `main`, so only PLAN gets chapter rules now. The other types get the shared rule only and are reported as not judged by chapter. Each later template adds one contract row.
- The types are a registry of rows, not a closed set. A TYPE outside the registry is reported as unsupported and is not judged beyond the shared rules.
- The HOTFIX route is not judged here. It comes from the Hotfix delivery-path Change, not from the HOTFIX template.
- The `Driven-by` agreement is judged for PLAN, DO and ACT only. SYNC, PROMOTION and HOTFIX are not judged, for the reason F17 gives.

## Promotion hold

Kai's hold stands: this Change is not promoted to `main` before the Hotfix route is known, which is the Hotfix delivery-path Change. The PLAN cites no document that is not on `main`.

## Decision on the commit subject

The PR title is the commit subject (Kai, 11 Nov). A squash merge takes it, so the old rule `<Area> <PHASE>: <concern>` is dropped and replaced by the title rule of F17. This Change does not check commit subjects separately.

Not in this Change: wiring, hooks, CI, merge blocking, a GitHub adapter, and the chapter contracts of DO, ACT, SYNC, PROMOTION and HOTFIX.
