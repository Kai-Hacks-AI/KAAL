# Packaging Readiness (LOVE): Architecture

Each element names, in brackets, the Requirements it answers.

- **architecture/A1** [architecture/F1, architecture/F2, architecture/N1]: `contract.json` sits at the package root and is listed in `files`. Nothing in the package imports Core to conform. Engineering runs Core's conformance Test Cases against the instance, as it does for every Capability's.
- **architecture/A2** [architecture/N1]: Core realizes the contract and registers `payload/` as the Capability's contribution. Architecture's own lifecycle is the contract alone. A standalone lifecycle such as Guard's is not planned, because nothing needs one.
- **architecture/A3** [architecture/F3, architecture/F4]: `payload/Architecture.md` is retyped and its id changes. `ownership.kaal.json` and the tests follow the new id. URBAN's bytes, and so its id, are unchanged.
- **architecture/A4** [architecture/F5]: `skills/kaal-architecture/SKILL.md` gains `## Description`. Its frontmatter stays `name`, `description` and `license`, and its instructions are unchanged.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `architecture/C1` the capability, URBAN and the Agent Skill (#274) | Architecture | none |
| `architecture/C2` PLAN, this Change | Architecture | `architecture/C1` |
| `architecture/C3` SYNC main → kaal/architecture, for Core's Installation Contract and Agent Realization | Architecture | `architecture/C2` |
| `architecture/C4` the planned tests, written and recorded RED | Architecture | `architecture/C3` |
| `architecture/C5` DO: `contract.json`, the retype, the Requirements boundary, the canonical Skill; GREEN | Architecture | `architecture/C4` |
| `engineering/C…` Core's conformance Test Cases run against Architecture's instance | Engineering | `architecture/C5` |

Promoting `kaal/architecture` to `main`, and any publication, are separate Owner decisions and are not planned here.
