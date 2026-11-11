# C2 change

## PLAN

1. State the one id grammar and the derived, separately validated placement in `README.md` and `AGENTS.md`, and the id grammar and the placement rule in rules 4 and 5 of F1.
2. Add C2 with its own Cases T1 to T4, one per gap, and the target Case release/T14.
3. release/T14 is the expected RED. The interim runner `run-red.mjs` of C1 executes it against the baseline, where every plan is accepted, and the assertion about the unfulfilled id grammar fails.
4. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

1. Write every node id of verify Plan as `<capability>/<kind><n>`, and number the Cases across the capability instead of under each element. Update every link and every Case.
2. Change the judgment so that it checks the id grammar, derives the place of a Case from its `tests` list, treats the capability as a place and validates the stated place separately from the id.
3. Rename release/T14 from `T14.red.mjs` to `T14.test.mjs` and wire it into its lane.

## ACT

1. Record what the first enforced PLAN shows about the id grammar, and adjust F1 through a new Change.

## Dependencies

The common metamodel owns the relationship vocabulary, and Testing owns Case design, identity and placement of Cases in general, and the testing loops. This Change fixes the id grammar and the placement of Cases in this layout for verify Plan only. It adds no loop-specific id convention, does not define a repository-wide id scheme and does not touch other capabilities or controls.
