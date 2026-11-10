# Failures point at the route to fix: Architecture

- **testing/A35** [testing/F122–testing/F126, testing/N26]: The `route` member is added to the Case in `lib/model.mjs` (the KEYS and `check` of a Case), and `results` and `evaluate` assemble the `response` from the Case, the Run's reported text and, when given, the `tests →` targets from `lib/traces.mjs`. No new module and no new dependency. The reporter (`lib/reporter.mjs`) already carries a test's reported text; it passes `expected` and `observed` through unchanged.
- **testing/A36** [testing/F127]: `lib/report.mjs` lists each failed or unknown Case's `response` in its markdown and JSON, ordered by identity.
- **The split.**

| Concern | Owner |
| --- | --- |
| The form: `route`, `response`, `no route declared`, ordering, determinism, verdicts unchanged | Testing |
| What a Case's route says, and that it fixes the failure | The Case's owner |
| Whether a route's action exists and is reachable (a command that runs, an event that fires), and what a missing route gates | The consumer (Engineering for release controls; it applies this rule in its recovery PLAN) |
| The graph that supplies targets and owners | Graph and the item owners |

- **Not decided here.** Whether a route can also be given on a Suite or Plan; how a route is shown in a consumer's own UI. The `route` member's effect on existing models is none: it is optional, and a model without it is unchanged.
