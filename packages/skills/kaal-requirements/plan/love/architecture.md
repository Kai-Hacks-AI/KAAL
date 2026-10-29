# Packaging Readiness (LOVE): Architecture

Each element names, in brackets, the Requirements it answers.

- **requirements/A7** [requirements/F7, requirements/F8, requirements/N3]: `contract.json` sits at the package root and is listed in `files`. Nothing in the package imports Core to conform. Engineering runs Core's conformance Test Cases against the instance, as it does for every Capability's. Core confirmed (2026-10-29) that file assets under `.kaal/capabilities/<cap>/` and an empty `provides` conform.
- **requirements/A8** [requirements/F9, requirements/N3]: Requirements' lifecycle is the contract alone. A standalone lifecycle such as Guard's is not planned, because Requirements has no Skill or hook to place. Applying a Capability's Node assets, replacing them by version and unregistering them is Core's, in `core/C29` (proposed). Requirements does not work around its absence.
- **requirements/A9** [requirements/F10]: The Node gains one sentence. Its id changes, and `ownership.kaal.json` and the tests follow the new id. `Requirement` and `Placement Observation` keep their bytes.
- **requirements/A10** [requirements/F11]: `files` lists `capability` and `contract.json`. The ownership claim and `plan/` stay repository data and are not delivered.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| #276, #553 the Capability and the Requirement Definition, merged | Requirements | none |
| `requirements/C1` PLAN, optional composition with Architecture (#590), merged | Requirements | #276 |
| `requirements/C5` PLAN, this Change | Requirements | #553 |
| `core/C29` (proposed) contribution lifecycle: registration recorded against a Capability's contract, replacement by version, unregister | Core | none |
| `requirements/C6` the planned tests, written and recorded RED | Requirements | `requirements/C5` |
| `requirements/C7` DO: `contract.json`, the Defect boundary, `files` and README; GREEN except requirements/T13 | Requirements | `requirements/C6`, the Defect owner's alignment on F10 |
| `requirements/C8` SYNC main → kaal/requirements, once `core/C29` is on main | Requirements | `requirements/C7`, `core/C29` |
| `requirements/C9` requirements/T13 GREEN against Core's contribution lifecycle | Requirements | `requirements/C8` |
| `engineering/C…` Core's conformance Test Cases run against Requirements' instance | Engineering | `requirements/C7` |

`requirements/C1`'s own steps (C2–C4) are unchanged. Its Acceptance scenarios that remove or upgrade a package also rest on `core/C29`, and its tests Change will say so. Promoting `kaal/requirements` to `main`, and any publication, are separate Owner decisions and are not planned here.
