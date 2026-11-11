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

Every node has the same stable id grammar: `<capability>/<kind><n>`. The kind is `I`, `F`, `N`, `A`, `D`, `G`, `C` or `T`, so `release/F1` is a Requirement, `release/G1` is a Gap and `release/T13` is a Case. A Gap id never names the Change that closes it. Ids are globally unique.

Identity is not placement. No id encodes where a node sits, in either direction: a Case is `release/T13` wherever it sits, and it keeps that id when it moves.

The capability names the owner of the node, not the folder it sits in, so a folder name does not repeat it. A node that is owned elsewhere moves to its owner and takes the owner's capability in its id. Every link (`parent`, `serves`, `addresses`, `implements`, `resolves`, `closes`, `tests`) names the full id. Testing owns the design of Cases. This grammar only fixes how a Case is named in this layout.

## Relationships

Each relationship has its own verb. Direction and meaning are fixed, and no generic link stands in for them.

| Link | Meaning |
| --- | --- |
| Change `implements` Intent | The Change carries out the Intent. |
| Change `resolves` Defect | The Change removes the Defect. A Change has at least one of the two drivers. A Defect needs no Intent. |
| Change `closes` Gap | The Change closes the Gap, a Change-oriented delta between the baseline and the intended state. A Change closes at least one Gap and may close several, and every Gap has exactly one closing Change. A Defect is not a Gap: it is `resolved`. |
| Gap `parent` Gap | A Gap that needs several Changes is decomposed into child Gaps. Every tested kind behaves the same way. |
| Requirement `serves` Intent | The Requirement provides what the Intent asks. |
| Architecture `addresses` Requirement or Defect | The Architecture element exists for at least one functional Requirement, nonfunctional Requirement or Defect. Code `realizes` Architecture, and Code is not required in a PLAN. |
| Case `tests` one or more targets | The Case checks the elements or Gaps it names. A target never references a Case. |
| any element `parent` same-kind element | Decomposition of one element into smaller elements of the same kind, from child to parent. It carries no coverage, and a parent is done only when its children are done, which may happen in the same Change. |

- The relationship is the same in every phase. Only the evidence changes: a PLAN states what an element addresses, and implementation with verification supplies evidence.
- `parent` exists, has the correct kind and forms no cycle.

## Cases

- A Case id is `<capability>/T<n>`, like every node, and is unique.
- The `tests` list states what the Case covers. A Case declares no place. Its place is derived from `tests`, and the reader observes the folder it sits in: the nearest shared semantic or decomposition ancestor of its targets, then the common Intent, then the capability itself. A Case with one target sits beside that target.
- Placement is validated separately from identity. When `tests` changes and the derived place changes, the Case moves and its id stays.
- One Case may cover several targets or gaps.
- Change-oriented Cases prove identified gaps closed and sit under `00-changes/`. Target-oriented Cases prove the target.
- `T<n>.red.mjs` is a Case that is expected to fail while its target is unfulfilled and is wired into no lane.
- `T<n>.test.mjs` is a Case that passes and is wired into a lane.
- A PLAN carries at least one meaningful observed RED condition. A passing Case is allowed beside it.

## Language

- `00-changes/` is written as migration: baseline, gap, change.
- Every other file describes the target as a standing state.
