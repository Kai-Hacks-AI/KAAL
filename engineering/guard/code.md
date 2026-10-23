# Guard: Code (how)

Code implements Guard within the boundaries of [Architecture](architecture.md), test first. Guard is developed in KAAL Engineering. Nothing is implemented before the Owner authorizes it.

Lift what already works in KAAL: the exit-status verdicts, the narrow-adapter rule ("supply facts, act on the exit code") and the trusted checker read from the target ref all run today in `.githooks/pre-push` and the workflows.

## Code elements

Code elements are named `C1…`. Each names, in brackets, the Architecture elements it realizes. Its Code tests, written in DO, trace to it.

- **C1 Runner** [A3]: `lib/runner.mjs`.
- **C2 Command** [A7]: `bin/kaal-guard.mjs`, with `run`, `verify`, `init`, `upgrade` and `remove`.
- **C3 GitHub reporting and static coverage** [A5]: `lib/github.mjs`.
- **C4 Lifecycle** [A6]: `lib/lifecycle.mjs`.
- **C5 Git adapter template** [A4]: `templates/pre-push`.
- **C6 GitHub adapter template** [A5]: `templates/guard.yml`.
- **C7 KAAL integration** [A11]: KAAL's `guard.json`, its `.githooks/pre-push` and the check steps of its existing jobs.
- **C8 External tooling** [A10]: `engineering/guard/external/`.

## Change map, in dependency order

Changes are named `CH…`, so they never collide with Code elements. CH0a is the Change the Owner authorized as C0a.

| Change | Scope | Done when |
| --- | --- | --- |
| **CH0a** PLAN | The Guard Capability Node, these six concerns, and both parts of the outer acceptance boundary. No Guard code. | Every outer test that is not guarding what exists is RED, blocked or behavioural as [Testing](testing.md#red-evidence) reports, and the Owner accepts the boundary. |
| **CH0b** Boundary | The `Guard Acceptance Boundary` job, for pull requests into `kaal/guard`. It travels alone. | It fails a test DO Change that touches the boundary. It lands before any DO Change. |
| **CH1** Runner | C1, C2 (`run`) and C3, with `guard.json` and named outcomes. | T6, T7, T11–T13, T15, T19, T21–T23, T25 and T27–T31 are GREEN. |
| **CH2** KAAL Git adapter | C7's hook: KAAL's `.githooks/pre-push` calls Guard with KAAL's `guard.json`. It travels alone. | T5 is GREEN, with today's verdicts on today's scenarios. |
| **CH3** KAAL CI integration | C7's jobs: existing jobs call `kaal-guard run --check`; names, matrices and triggers are unchanged; the `Guard` job is added. It travels alone. | T32–T35 are GREEN, and every pre-migration check identity still reports. |
| **CH4** Embed | C4, C5, C6, C2 (`verify`, `init`, `upgrade`, `remove`) and the consumer docs. | T1, T2, T4, T8–T10, T14, T16–T18, T20, T24 and T26 are GREEN on all three OSes (N1), from the packed package alone; ready to publish as `kaal-guard@0.0.1`. |
| **CH5** External | C8 and its instructions. | T3 is GREEN, and a delivered Change contains no KAAL element. |

## Stopping conditions

- **Checkpoint E**, after CH3: I1 to I4 are met. A pause point, not completion.
- **Checkpoint M**, after CH4: I5 is also met. Still a pause point.
- **Completion**, after CH5: I1 to I6 are all met, and every outer test is GREEN on all three OSes. Only this is done.
- Pausing at a checkpoint is the Owner's decision. While paused, the unmet outcomes are recorded as unmet.
- A planned outer test that cannot pass without changing the boundary is a PLAN defect. It goes back to PLAN as a new PLAN Change.
- A required check name or OS matrix entry on `main` never changes without the Owner.
