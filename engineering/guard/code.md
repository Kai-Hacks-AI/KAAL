# Guard: Code (how)

Code is the *how*. It is written in DO, test first, to turn the planned outer tests from RED to GREEN; its own inner Code tests, the fourth loop, evolve with it. Code has no identifier series and no structural trace to Architecture: the Architecture conformance tests are what hold it to Architecture. Guard is developed in KAAL Engineering. Nothing is implemented before the Owner authorizes it.

Lift what already works in KAAL: the exit-status verdicts, the narrow-adapter rule ("supply facts, act on the exit code") and the trusted checker read from the target ref all run today in `.githooks/pre-push` and the workflows.

## Change map, in dependency order

Each Change (`C…`) is a KAAL Change, carried by a pull request. A Change carries zero or more Intents: that is its only traceability link. Its Requirements, Architecture and Tests are reached through those Intents and are not linked again. A Change may carry none, as bounded technical or corrective work does.

| Change | Carries | Scope | Done when |
| --- | --- | --- | --- |
| **C0a** PLAN | I1–I6 | The Guard Capability Node, these six concerns, and both parts of the outer acceptance boundary. No Guard code. | The outer tests are RED as [Testing](testing.md#red-evidence) reports, and the Owner accepts the boundary. |
| **C0b** Boundary | — | The `Guard Acceptance Boundary` job, for pull requests into `kaal/guard`. It travels alone. | It fails a test DO Change that touches the boundary. It lands before any DO Change. |
| **C1** Runner | I1, I2 | The runner and `kaal-guard run`, with `guard.json`, named outcomes and GitHub reporting. | The outer tests that need only `run` are GREEN. |
| **C2** KAAL Git adapter | I4 | KAAL's `.githooks/pre-push` calls Guard with KAAL's `guard.json`. It travels alone. | KAAL's hook gives today's verdicts on today's scenarios, through Guard. |
| **C3** KAAL CI integration | I4 | KAAL's existing jobs call `kaal-guard run --check`; names, matrices and triggers are unchanged; the `Guard` job is added. It travels alone. | Every pre-migration check identity still reports, through Guard. |
| **C4** Embed | I3, I5 | `verify`, `init`, `upgrade` and `remove`, the adapter templates, and the consumer docs. | The packed package alone passes its outer tests on Linux, macOS and Windows, ready to publish as `kaal-guard@0.0.1`. |
| **C5** External | I6 | The External tooling and its instructions. | A delivered Change works in a fresh target and contains no KAAL element. |

## Stopping conditions

- **Checkpoint E**, after C3: I1 to I4 are met. A pause point, not completion.
- **Checkpoint M**, after C4: I5 is also met. Still a pause point.
- **Completion**, after C5: I1 to I6 are all met, and every outer test is GREEN on all three OSes. Only this is done.
- Pausing at a checkpoint is the Owner's decision. While paused, the unmet outcomes are recorded as unmet.
- A planned outer test that cannot pass without changing the boundary is a PLAN defect. It goes back to PLAN as a new PLAN Change.
- A required check name or OS matrix entry on `main` never changes without the Owner.
