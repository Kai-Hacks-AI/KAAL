# C15 change

## PLAN

1. Add the gap G92, the Intent I9, the Requirement F28 and the Architecture A14, with the draft in `interface.md`, and the Cases T1086 to T1090. The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, no control and no workflow, and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Add the `evidence` line to the finder, `scripts/evidence.mjs`, the `--records` option of `check-controls.mjs`, and the two reference texts, as drafted in `interface.md`.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green. The package keeps its 42 Cases green and `SKILL.md` stays within 600 words.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- Engineering (KAAL's numbers per control, where the records live, how a `kaal-testing` report becomes records, the flag and the WIRE that flips it, and the Dispatcher's go-hot gate) is a separate Change that depends on this one.
- Without `--records` a `tested` claim is not judged. Engineering must pass its records for the claim to mean anything; this Change does not make it.
- The package does not import the runner. A record mirrors a runner's outcome and Case id, so a converter in the repository that uses both can fill it.
