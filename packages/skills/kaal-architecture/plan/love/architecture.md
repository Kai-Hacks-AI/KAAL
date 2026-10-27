# Packaging Readiness (LOVE): Architecture

Each element names, in brackets, the Requirements it answers.

- **architecture/A1** [architecture/F1, architecture/F2, architecture/N1]: `contract.json` sits at the package root and is listed in `files`. Nothing in the package imports Core to conform. Engineering runs Core's conformance Test Cases against the instance, as it does for every Capability's.
- **architecture/A2** [architecture/N1]: Core realizes the contract and registers `payload/` as the Capability's contribution. Architecture's own lifecycle is the contract alone. A standalone lifecycle such as Guard's is not planned, because nothing needs one.
- **architecture/A3** [architecture/F3, architecture/F4]: `payload/Architecture.md` is retyped and its id changes. `ownership.kaal.json` and the tests follow the new id. URBAN's bytes, and so its id, are unchanged.
- **architecture/A4** [architecture/F5]: `skills/kaal-architecture/SKILL.md` stays as `architecture/C1` shipped it: frontmatter `name`, `description` and `license`, unchanged instructions, and no `## Description` section. Engineer Skill owns how it is read, and Core owns deploying its bytes unchanged.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `architecture/C1` the capability, URBAN and the Agent Skill (#274), kept as scoped: `Architecture` stays typed `KAAL Skill` there | Architecture | none |
| `architecture/C2` PLAN, this Change | Architecture | `architecture/C1` |
| `architecture/C3` SYNC main → kaal/architecture, for Core's Installation Contract and Agent Realization | Architecture | `architecture/C2` |
| `architecture/C4` the planned tests, written and recorded RED | Architecture | `architecture/C3` |
| `architecture/C7` PLAN amendment: Core deploys the shipped Skill bytes (core/C22, core/C23) and Engineer Skill reads `SKILL.md` (engineer-skill/C1, engineer-skill/C2), so F1, F5, A4, T2 and T3 no longer rest on Core rendering the Skill | Architecture | `architecture/C4` |
| `architecture/C6` SYNC main → kaal/architecture, once `kaal/engineer-skill` and `kaal/core` are promoted with those Changes | Architecture | `architecture/C7` |
| `architecture/C5` DO: the retype to `KAAL Capability` with its new id and claim (the Owner's decision on #274), `contract.json`, the Requirements boundary, the canonical Skill; GREEN | Architecture | `architecture/C6` |
| `engineering/C…` Core's conformance Test Cases run against Architecture's instance | Engineering | `architecture/C5` |

Promoting `kaal/architecture` to `main`, and any publication, are separate Owner decisions and are not planned here.
