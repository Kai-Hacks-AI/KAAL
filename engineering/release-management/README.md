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

## Relationships

Each relationship has its own verb. Direction and meaning are fixed, and no generic link stands in for them.

| Link | Meaning |
| --- | --- |
| Change `implements` Intent | The Change carries out the Intent. |
| Requirement `serves` Intent | The Requirement provides what the Intent asks. |
| Architecture `fulfills` Requirement | The Architecture states the obligation it is designed to fulfill. Code `realizes` Architecture, and Code is not required in a PLAN. |
| Architecture `addresses` Defect | The root Architecture node names the Defect it prevents or detects. |
| Case `tests` its own element | The Case checks exactly the element it names. |
| any element `parent` same-kind element | Decomposition of one element into smaller elements of the same kind. |

- The relationship is the same in every phase. Only the evidence changes: a PLAN states what the Architecture fulfills, and implementation with verification supplies evidence that it does.
- `parent` is decomposition only. It carries no fulfillment and no inheritance.
- Each Architecture node declares its own `fulfills`. A child's `fulfills` is a subset of its parent's.
- A Case's identity is `<artefact-id>/T<n>`, it names that artefact in `tests:`, and it sits in that artefact's folder.

## Cases

- `T<n>.red.mjs` is a Case that fails for the intended missing behaviour and is wired into no lane.
- `T<n>.test.mjs` is a Case that passes and is wired into a lane.

## Language

- `00-changes/` is written as migration: baseline, gap, change.
- Every other file describes the target as a standing state.
