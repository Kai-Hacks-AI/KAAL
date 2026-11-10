# Release management

Release management owns the end-to-end release of KAAL capabilities. Each release control is specified as an Intent, Requirements, Architecture and Defects, and is tested by Cases that sit beside the artefact they test.

## Layout

Every artefact lives in a folder named `<ID>-<slug>/`. Ids are flat, and a `parent:` link places an artefact in its hierarchy.

| Folder | Holds |
| --- | --- |
| `00-changes/` | Migrations from the current state to the target: baseline, gap, change. Kept as history. |
| `01-intent/` | Intents (`I<n>`): why a control exists. |
| `02-requirements/` | Requirements (`F<n>`): what a control provides. |
| `03-architecture/` | Architecture nodes (`A<n>`): where and how a control is applied, as deployment target, feature and component. |
| `06-defects/` | Defects (`D<n>`): enduring conditions a control prevents or detects. |

## Traces

- A Change implements an Intent.
- A Requirement serves an Intent.
- An Architecture node traces to a Requirement and to a Defect, directly or through its parent.
- A Case tests exactly one artefact. Its identity is `<artefact-id>/T<n>`, it names that artefact in `tests:`, and it sits in that artefact's folder.

## Cases

- `T<n>.red.mjs` is a Case that fails for the intended missing behaviour and is wired into no lane.
- `T<n>.test.mjs` is a Case that passes and is wired into a lane.

## Language

- `00-changes/` is written as migration: baseline, gap, change.
- Every other file describes the target as a standing state.
