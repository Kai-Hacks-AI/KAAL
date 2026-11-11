# C2 change

## PLAN

1. State the identity rule in `README.md` and `AGENTS.md`, and the id form and the placement fallback in rules 4 and 5 of F1.
2. Add C2 with its own Cases T1 to T4, one per gap, and the target Case F1/T13.
3. F1/T13 is the expected RED. The interim runner `run-red.mjs` of C1 executes it against the baseline, where every plan is accepted, and the assertion about the unfulfilled id form fails.
4. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

1. Write every id, link and Case identity of verify Plan as `<capability>/<kind><n>`.
2. Change the judgment so that a Case is placed by its identity, the capability is a place, and an id without its capability fails with a Recovery.
3. Rename F1/T13 from `T13.red.mjs` to `T13.test.mjs` and wire it into its lane. Remove the separate location from the Cases of F1.

## ACT

1. Record what the first enforced PLAN shows about the id form, and adjust F1 through a new Change.

## Dependencies

The common metamodel owns the relationship vocabulary, and Testing owns Case identity and placement. This Change fixes the id form for verify Plan only. It does not define a repository-wide id scheme and does not touch other capabilities or controls.
