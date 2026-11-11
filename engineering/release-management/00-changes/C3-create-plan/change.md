# C3 change

## PLAN

1. Add I2, F2, F3, A14 and A15 with their Cases, C3 with its own Cases T48 to T53, one per gap, and the ownership review of every document under the release/C1 setup (`ownership.md`).
2. The expected RED is observed against `main` (`evidence.md`): the Cases are executed against `main` with the Cases of this PLAN laid over it. The collector of C1 and the pull requests that are open are not the baseline.
3. Nothing is moved in this PLAN. The migration waits for the agreement of the Owner and the CPO on the file tree and the ownership mapping.

## DO

1. Narrow F1 to the judgment: its rules cite F2 for the structure they evaluate, and state only the evaluation, the verdict and the evidence.
2. Move A3 and A4 under A15, together with T17 and T18, and keep their ids.
3. Deliver the template as its own `.github` change, and rename T43 to T47 from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## ACT

1. Record what the first PLAN produced from the template shows, and adjust F2 through a new Change.

## Dependencies

The common metamodel owns the relationship vocabulary, Testing owns Case design, identity, placement and expected-RED execution, and the common control contract owns verdict semantics. create Plan consumes them. This Change does not define them, does not move them and does not duplicate them.
