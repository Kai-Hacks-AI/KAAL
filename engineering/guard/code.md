# Guard: Code

Guard is developed in KAAL Engineering. Nothing is implemented before the Owner authorizes it.

Lift what already works in KAAL: the exit-status verdicts, the narrow-adapter rule ("supply facts, act on the exit code") and the trusted checker read from the target ref all run today in `.githooks/pre-push` and the workflows.

## Change map, in dependency order

| Change | Scope | Done when |
| --- | --- | --- |
| **C0a** PLAN | The Guard Capability Node, these six concerns, and both parts of the outer acceptance boundary, clean RED. No Guard code. | Every behavioural outer test is RED for the intended reason, and the Owner accepts the boundary. |
| **C0b** Boundary | The `Guard Acceptance Boundary` job, for pull requests into `kaal/guard`. It travels alone. | It fails a test DO Change that touches the boundary. It lands before any DO Change. |
| **C1** Runner | The runner, `guard.json` with `managed` and named outcomes, the verdicts and gates, the execution contract, in `packages/kaal-guard/`. | G1–G3, G7, G9, G10 and the package Architecture tests are GREEN. |
| **C2** KAAL Git adapter | `.githooks/pre-push` calls Guard with KAAL's `guard.json`. KAAL's checks keep their meaning. | G4 and I5's hook part are GREEN, with today's verdicts on today's scenarios. It travels alone. |
| **C3** KAAL CI integration | Existing jobs call `kaal-guard run --check`. Names, matrices and triggers are unchanged; the `Guard` job is added. | G5, G10 and I5 are GREEN, and every pre-migration check identity still reports. It travels alone. |
| **C4** Embed | `init`, `upgrade` and `remove` with safe ownership, and the consumer docs. | I1, I2, I4, G8 and N1 are GREEN on all three OSes, from the packed package alone. |
| **C5** External | The External tooling and its instructions in `engineering/guard/external/`. | I3 and N5 are GREEN, and a delivered Change contains no KAAL element. |

## Stopping conditions

- **Checkpoint E**, after C3: outcomes 1 to 4 are met. A pause point, not completion.
- **Checkpoint M**, after C4: outcome 5 is also met. Still a pause point.
- **Completion**, after C5: outcomes 1 to 6 are all met, and every outer test is GREEN on all three OSes. Only this is done.
- Pausing at a checkpoint is the Owner's decision. While paused, the unmet outcomes are recorded as unmet.
- A planned outer test that cannot pass without changing the boundary is a PLAN defect. It goes back to PLAN as a new PLAN Change.
- A required check name or OS matrix entry on `main` never changes without the Owner.
