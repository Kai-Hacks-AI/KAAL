# C5 naming

Undecided. The Owner rejected the first proposal, which put the words IN and OUT into names. `IN`, `OUT` and the place are the Owner's locator for where a control applies, and they stay inside the declarations as that locator. They are not the name of a ruleset, an aggregate, a workflow or a job. Nothing in this PLAN renames anything, and no name below is applied before the Owner picks.

## Frame

SIPOC: a process step has Suppliers, Inputs, Process, Outputs and Customers. A step is named by what it does (Develop, Integrate, Promote, Publish), and a control is located at the Input or Output of a step. The locator is written once, in the declaration, for example `at: integrate/input`.

## Options, per kind

| Kind | Option 1 | Option 2 | Option 3 (SIPOC) |
| --- | --- | --- | --- |
| Ruleset | by step: `Integrate`, `Promote`, `Publish` | by line it protects: `Collectors`, `Main`, `Releases` | by input: `Integrate input`, `Promote input`, `Publish input` |
| Aggregate check | `guard Integrate`, `guard Promote` | `guard Collectors`, `guard Main` | `guard Integrate input`, `guard Promote input` |
| Workflow of a control | the control: `verify Dependencies` | the subject only: `Dependencies` | prefixed so all controls group: `Control: verify Dependencies` |
| Job of a control | the step: `Integrate`, `Promote` | the step and its side: `Integrate input`, `Promote input` | the SIPOC side only where a step has both: `input`, `output` |

Control names stay `<verb> <Subject>` with the verb its class: guard preventive, verify detective, clear or drain corrective, direct directive. The words Station, Gate and Hook name no check.

## What stays true whatever is picked

- Only the aggregate of a step is ever a context in a ruleset; its name must be unique. The jobs of controls are never bound, so they need not be unique.
- Renaming a required context is a ruleset change and is made with its control. Renaming a ruleset is free, because nothing in the repository matches it by name.
- The old context `Dependency Review` disappears with its workflow.
- That GitHub sorts the list by "workflow / job" is not verified (`acceptance.md` A6).
