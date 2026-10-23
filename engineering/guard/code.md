# Guard: Code (how)

Code implements Guard within the boundaries of [Architecture](architecture.md), test first: Code tests are the fourth loop, written in DO. Guard is developed in KAAL Engineering. Nothing is implemented before the Owner authorizes it.

Lift what already works in KAAL: the exit-status verdicts, the narrow-adapter rule ("supply facts, act on the exit code") and the trusted checker read from the target ref all run today in `.githooks/pre-push` and the workflows.

## Change map, in dependency order

Each Change (`C…`) is a KAAL Change, carried by a pull request. It names the contracts it affects and the tests that are its evidence.

| Change | Scope | Done when |
| --- | --- | --- |
| **C0a** PLAN | The Guard Capability Node, these six concerns, and both parts of the outer acceptance boundary. No Guard code. | Every outer test that is not guarding what exists is RED, blocked or behavioural as [Testing](testing.md#red-evidence) reports, and the Owner accepts the boundary. |
| **C0b** Boundary | The `Guard Acceptance Boundary` job, for pull requests into `kaal/guard`. It travels alone. | It fails a test DO Change that touches the boundary. It lands before any DO Change. |
| **C1** Runner | The runner and `kaal-guard run`, with `guard.json`, named outcomes and GitHub reporting (A3, A5, A7). | T6, T7, T11–T13, T15, T19, T21–T23, T25 and T27–T31 are GREEN. |
| **C2** KAAL Git adapter | KAAL's `.githooks/pre-push` calls Guard with KAAL's `guard.json` (A11). It travels alone. | T5 is GREEN, with today's verdicts on today's scenarios. |
| **C3** KAAL CI integration | KAAL's existing jobs call `kaal-guard run --check`; names, matrices and triggers are unchanged; the `Guard` job is added (A11). It travels alone. | T32–T35 are GREEN, and every pre-migration check identity still reports. |
| **C4** Embed | `verify`, `init`, `upgrade` and `remove`, the adapter templates, and the consumer docs (A4–A6). | T1, T2, T4, T8–T10, T14, T16–T18, T20, T24 and T26 are GREEN on all three OSes (N1), from the packed package alone; ready to publish as `kaal-guard@0.0.1`. |
| **C5** External | The External tooling and its instructions (A10). | T3 is GREEN, and a delivered Change contains no KAAL element. |

## Stopping conditions

- **Checkpoint E**, after C3: I1 to I4 are met. A pause point, not completion.
- **Checkpoint M**, after C4: I5 is also met. Still a pause point.
- **Completion**, after C5: I1 to I6 are all met, and every outer test is GREEN on all three OSes. Only this is done.
- Pausing at a checkpoint is the Owner's decision. While paused, the unmet outcomes are recorded as unmet.
- A planned outer test that cannot pass without changing the boundary is a PLAN defect. It goes back to PLAN as a new PLAN Change.
- A required check name or OS matrix entry on `main` never changes without the Owner.
