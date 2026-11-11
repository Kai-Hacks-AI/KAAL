# Release management

Release management owns the end-to-end release of KAAL capabilities. Each release control is specified as an Intent, Requirements, Architecture and Defects, and is tested by Cases that sit beside the artefacts they test.

verify Plan is a detective control. It judges whether a PLAN is valid and returns PASS, FAIL or UNKNOWN with findings and a Recovery. It consumes the shared relationship model, the Testing model and the control contract, and owns none of them.

## Layout

Every artefact lives in a folder named `<kind><n>-<slug>/`. A `parent:` link places an artefact in its hierarchy.

| Folder | Holds |
| --- | --- |
| `00-changes/` | Migrations from the current state to the target: baseline, gap, change. Kept as history. |
| `01-intent/` | Intents (`I<n>`): why a control exists. |
| `02-requirements/` | Functional (`F<n>`) and nonfunctional (`N<n>`) Requirements: what a control provides. |
| `03-architecture/` | Architecture elements (`A<n>`): where and how a control is applied, as deployment target, feature and component. |
| `06-defects/` | Defects (`D<n>`): independent, requirement-like negative expectations that a control prevents or detects. |

## Identity

Every id is globally unique and starts with its capability: `<capability>/<kind><n>`, for example `release/F1`. The capability is the folder the artefacts sit in, so a folder name does not repeat it. Every link (`parent`, `serves`, `addresses`, `implements`, `resolves`, `tests`) and every Case names the full id.

## Relationships

Each relationship has its own verb. Direction and meaning are fixed, and no generic link stands in for them.

| Link | Meaning |
| --- | --- |
| Change `implements` Intent | The Change carries out the Intent. |
| Change `resolves` Defect | The Change removes the Defect. A Change has at least one of the two drivers. A Defect needs no Intent. |
| Requirement `serves` Intent | The Requirement provides what the Intent asks. |
| Architecture `addresses` Requirement or Defect | The Architecture element exists for at least one functional Requirement, nonfunctional Requirement or Defect. Code `realizes` Architecture, and Code is not required in a PLAN. |
| Case `tests` one or more targets | The Case checks the elements it names. A target never references a Case. |
| any element `parent` same-kind element | Decomposition of one element into smaller elements of the same kind, from child to parent. It carries no coverage. |

- The relationship is the same in every phase. Only the evidence changes: a PLAN states what an element addresses, and implementation with verification supplies evidence.
- `parent` exists, has the correct kind and forms no cycle.

## Cases

- A Case is identified as `<placement id>/T<n>`, for example `release/F1/T3`, and the identity is unique. The identity is the only statement of where the Case sits.
- A Case sits beside the nearest shared semantic or decomposition ancestor of its targets, then beside the common Intent, then at the capability itself, as `<capability>/T<n>`. A Case with one target sits beside that target.
- One Case may cover several targets or gaps.
- Change-oriented Cases prove identified gaps closed and sit under `00-changes/`. Target-oriented Cases prove the target.
- `T<n>.red.mjs` is a Case that is expected to fail while its target is unfulfilled and is wired into no lane.
- `T<n>.test.mjs` is a Case that passes and is wired into a lane.
- A PLAN carries at least one meaningful observed RED condition. A passing Case is allowed beside it.

## Language

- `00-changes/` is written as migration: baseline, gap, change.
- Every other file describes the target as a standing state.
