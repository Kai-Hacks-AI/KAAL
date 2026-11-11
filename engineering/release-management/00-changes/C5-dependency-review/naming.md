# C5 naming

Proposed on the Owner's choice of ruleset names. The rulesets are named by the noun of the step they protect: `Integration` (branch based, the collectors `kaal/**`), `Promotion` (branch based, `main`) and `Publishing` (tag based). The rest of the set follows from them. Nothing in this PLAN renames anything live, and the Cases of this PLAN do not decide a name: they look for a dependency check by what it does, not by what it is called.

## The set

| Kind | Name | For this control |
| --- | --- | --- |
| Ruleset | the step as a noun | `Integration` (now `integration`), `Promotion` (now `promotion`), `Publishing` (now `publishing`) |
| Aggregate check, preventive | `guard <Step>`, as workflow and as job | `guard Integration`, `guard Promotion` |
| Workflow of a control | the control, `<verb> <Subject>` | `verify Dependencies` |
| Job of a control | the step | `Integration`, `Promotion` |
| Declaration | the control's subject in `.kaal/config/guard/` | a file for the control, at its Change |
| Locator, internal to the declaration | SIPOC side of a step | for example `at: integration/input`; never part of a name |

What a person sees: `verify Dependencies / Integration` for the control's own view, and `guard Integration` for the one check that admits. The control's verb is its class: guard preventive, verify detective, clear or drain corrective, direct directive. The words Station, Gate, Hook, IN and OUT name no check or ruleset.

## What stays true

- Only the aggregate of a step is ever a context in a ruleset, so only its name must be unique. A control's job is never bound.
- Publishing is tag based and has no dependency control here. It keeps its name and is not touched.
- Renaming a ruleset is free, because nothing in the repository matches it by name. It is applied on the Owner's go and is not part of this PLAN. Renaming a required context is a ruleset change and is made with its control.
- The old context `Dependency Review` disappears with its workflow.
- That GitHub sorts the list by "workflow / job" is not verified (`acceptance.md` A6).
