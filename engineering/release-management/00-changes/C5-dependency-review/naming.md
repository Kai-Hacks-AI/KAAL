# C5 naming

Proposed on the Owner's choice of ruleset names. The rulesets are named by the noun of the step they protect: `Integration` (branch based, the collectors `kaal/**`), `Promotion` (branch based, `main`) and `Publishing` (tag based). The rest of the set follows from them. Nothing in this PLAN renames anything live, and the Cases of this PLAN do not decide a name: they look for a dependency check by what it does, not by what it is called.

## The set

A check is named `control (target)`: the control as `<verb> <Subject>`, and the target in brackets.

| Kind | Name | For this control |
| --- | --- | --- |
| Ruleset | the step as a noun | `Integration` (now `integration`), `Promotion` (now `promotion`), `Publishing` (now `publishing`) |
| Check of a control | `control (target)`, as the job `name:` | `verify Dependencies (Integration)`, `verify Dependencies (Promotion)` |
| Aggregate check, preventive | `guard (target)`, as the job `name:` | `guard (Integration)`, `guard (Promotion)` |
| Workflow | one word for the family, so the list groups | `Controls` for the checks of controls, `Guards` for the aggregates |
| Locator, internal to the declaration | SIPOC side of a step | for example `at: integration/input`; never part of a name |

## How the UI shows it

GitHub shows a check as `<workflow name> / <job name>`, and a ruleset matches the check by its job name alone. So a job `name:` alone produces the part Kai wants, `verify Dependencies (Integration)`, and it is exactly what a ruleset would bind. It cannot remove the workflow prefix, which is always shown. The shortest honest result is `Controls / verify Dependencies (Integration)`, and the checks of one family sort together. A workflow with no `name:` would show its file path instead, which is worse.

Each target is its own workflow with its own triggers, so the job `name:` is a plain literal and nothing is skipped: the workflow for Integration runs on pull requests into `kaal/**`, and the workflow for Promotion runs on pull requests into `main` and on merge groups. A matrix would also print `(Integration)`, but it cannot vary the target by event and would leave skipped results, so it is not used. Both statements about GitHub are to be observed in A6, not assumed.

The control's verb is its class: guard preventive, verify detective, clear or drain corrective, direct directive. The words Station, Gate, Hook, IN and OUT name no check or ruleset.

## What stays true

- Only the aggregate of a target is ever a context in a ruleset, so only its name must be unique. The check of a control is never bound.
- Publishing is tag based and has no dependency control here. It keeps its name and is not touched.
- Renaming a ruleset is free, because nothing in the repository matches it by name. It is applied on the Owner's go and is not part of this PLAN. Renaming a required context is a ruleset change and is made with its control.
- The old context `Dependency Review` disappears with its workflow.
- That GitHub sorts the list by "workflow / job" is not verified (`acceptance.md` A6).
