# Solution protection: Architecture

Each element names, in brackets, the Requirements it answers.

- **guard/A20 Registration reader** [guard/F41, guard/F42, guard/F43, guard/N16]: `lib/registration.mjs` finds `guard.json` files and `aggregates.json` through Git objects at the base and at the candidate, validates them as a strict closed schema (like `lib/config.mjs`), and returns the baseline, the additions and the refusals. It runs nothing.
- **guard/A21 Completeness check** [guard/F44]: `lib/completeness.mjs` lists the `package.json` files with a `test` script and compares them to the registrations and `exempt`. Pure.
- **guard/A22 Plan and fold** [guard/F45, guard/F46, guard/N14]: `lib/aggregate.mjs` holds two pure functions, `plan(registrations, always)` and `fold(expected, reports)`. `fold` is the only place the pass rule lives.
- **guard/A23 Report** [guard/F48]: `lib/report.mjs` writes `guard-report.json` and the step summary text. The runner (guard/A3) gains `--report` and nothing else.
- **guard/A24 Workflow template** [guard/F47]: `templates/solution.yml` is an installed asset like `templates/guard.yml`: plan job, matrix job with one upload of the per-check report, fold job that downloads them. `init --solution` offers it and never overwrites. Installing it is a WIRE.
- **Dependency direction.** The command depends on A20 to A23, A22 depends on nothing, A20 depends on the Git adapter's object reads only. Nothing depends on the template, and the runner (guard/A3) learns no aggregate.

## Design questions for the CPO

| Question | Recommendation |
| --- | --- |
| **Q1.** Registration in `guard.json` or in more `.md` declarations? | `guard.json` beside the thing, as Kai asked: the package owns its entry and a new package cannot forget the central list. The `.md` declarations stay for the legacy and delivery checks and are never aggregate members. |
| **Q2.** Why per-check reports and not job results? | A matrix reports one combined result in `needs`, so a fold from job results cannot tell which entry is absent. A report per check is evidence of each entry, and is the `guard-report.json` the agent needs anyway. |
| **Q3.** Which checks run on a pull request? | All of the aggregate, on both events (YAGNI). Selection by changed paths is a later Change; the full set is what keeps a combined red off main. |
| **Q4.** Overlap with the Workspaces lane and C165? | Registered suites also run in the lane until the lane is retired by its own go (the soak rule). Running twice is harmless. |
| **Q5.** Release's aggregators (C168, C170) and Guard's fold? | Same pass rule, separate scope: Release's three aggregators fold one delivery check each; Guard's `Solution protection` folds the suites. Whether Release's names later become members of Guard's `delivery` fold is open and is not decided here. |
| **Q6.** The required name? | `Solution protection`, to be confirmed with Release so that no name clashes with `Guard`, `Guard checks` or the legacy names. |
