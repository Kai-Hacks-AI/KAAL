# Failures point at the route to fix: Architecture

- **testing/A35** [testing/F122–testing/F126, testing/N26]: The `route` member is added to the Case in `lib/model.mjs` (the KEYS and `check` of a Case), and `results` and `evaluate` assemble the `response` from the Case, the Run's recorded diagnostic and, when given, the `tests →` targets from `lib/traces.mjs`. No new module and no new dependency.
- **testing/A37** [testing/F123, testing/F128]: **Diagnostic capture is new work, not a pass-through.** Today `lib/reporter.mjs` emits only file, nesting, name and outcome, `lib/acceptance.mjs`'s `observed()` keeps only file, hash, test path and outcome, and the model Run's allowed members (`RUN` in `lib/model.mjs`) include no diagnostic. This Change therefore plans three additions: (1) the reporter also emits, for a `test:fail`, the failure's message and, where the error carries them, its `expected` and `actual` values, serialized to bounded text; (2) `observed()` and `lib/observed.mjs` retain that text per test, so only what Testing itself observed counts; (3) the model Run gains an optional `diagnostics` member, `{ <case>: { message?, expected?, observed? } }`, which `check` validates and `results` reads. A failure that supplies no values has `expected` and `observed` as `null`, and the `response` says so rather than guessing.
- **testing/A36** [testing/F127]: `lib/report.mjs` lists each failed or unknown Case's `response` in its markdown and JSON, ordered by identity.
- **The split.**

| Concern | Owner |
| --- | --- |
| The form: `route`, `response`, `no route declared`, ordering, determinism, verdicts unchanged | Testing |
| What a Case's route says, and that it fixes the failure | The Case's owner |
| Whether a route's action exists and is reachable (a command that runs, an event that fires), and what a missing route gates | The consumer (Engineering for release controls; it applies this rule in its recovery PLAN) |
| The graph that supplies targets and owners | Graph and the item owners |

- **Not decided here.** Whether a route can also be given on a Suite or Plan; how a route is shown in a consumer's own UI. The `route` member's effect on existing models is none: it is optional, and a model without it is unchanged.
