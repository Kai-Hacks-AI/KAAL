# C5 naming

Proposed on the Owner's choice of ruleset names. The rulesets are named by the noun of the step they protect: `Integration` (branch based, the collectors `kaal/**`), `Promotion` (branch based, `main`) and `Publishing` (tag based). The rest of the set follows from them. Nothing in this PLAN renames anything live, and the Cases of this PLAN do not decide a name: they look for a dependency check by what it does, not by what it is called.

## The set

A check is named `control (target)`: the control as `<verb> <Subject>`, and the target in brackets.

| Kind | Name | For this control |
| --- | --- | --- |
| Ruleset | the step as a noun | `Integration` (now `integration`), `Promotion` (now `promotion`), `Publishing` (now `publishing`) |
| Check of a control | `control (target)`, as the job `name:` | `analyze Dependencies (Integration)`, `analyze Dependencies (Promotion)` |
| Workflow | `KAAL <owning capability>` | `KAAL release` |
| Locator, internal to the declaration | SIPOC side of a step | for example `at: integration/input`; never part of a name |

## How the UI shows it

GitHub shows a check as `<workflow name> / <job name>`, and a ruleset matches the check by its job name alone. So a job `name:` alone produces the part Kai wants, `analyze Dependencies (Integration)`, and it is exactly what a ruleset would require. It cannot remove the workflow prefix, which is always shown. The result is `KAAL release / analyze Dependencies (Integration)`. Every KAAL check sorts together, apart from CodeQL and others, and its owner is the second word. A workflow with no `name:` would show its file path instead, which is worse.

Each target is its own workflow with its own triggers, so the job `name:` is a plain literal and nothing is skipped: the workflow for Integration runs on pull requests into `kaal/**`, and the workflow for Promotion runs on pull requests into `main` and on merge groups. A matrix would also print `(Integration)`, but it cannot vary the target by event and would leave skipped results, so it is not used. Both statements about GitHub are to be observed in A6, not assumed.

The control's verb is its class: guard preventive, verify detective, clear or drain corrective, direct directive. The words Station, Gate, Hook, IN and OUT name no check or ruleset.

## Prefix `KAAL` and the owning capability

- **Owner.** The capability is `release`. It owns analyze Dependencies, which is Intent I4 of its own.
- **One name across files.** Each target is still its own workflow file. Several files may carry the same workflow `name:`, which is observed in A6, not assumed.
- **Trade-off, length.** The line is about 50 characters and GitHub's checks list truncates long names, so the job name may be cut first on a very narrow screen.
- **Trade-off, a mixed list.** Existing checks (Branching, Engineering, Hosting and others) carry no prefix until each is migrated, so for a while the list mixes prefixed and unprefixed names.
- **No effect on rulesets.** A ruleset binds the job name only, so the prefix changes what a person reads and never what is bound.

## What stays true

- A ruleset requires a check by its job name alone, so a job name must be unique where it is required. `analyze Dependencies (Integration)` and `(Promotion)` are.
- Publishing is tag based and has no dependency control here. It keeps its name and is not touched.
- Renaming a ruleset is free, because nothing in the repository matches it by name. It is applied on the Owner's go and is not part of this PLAN. Renaming a required context is a ruleset change and is made with its control.
- The old context `Dependency Review` disappears with its workflow.
- That GitHub sorts the list by "workflow / job" is not verified (`acceptance.md` A6).

## Later

A single check per target that fans in many controls (named `KAAL / guard (Integration)` by the Owner) is a later design and is not part of this Change.
