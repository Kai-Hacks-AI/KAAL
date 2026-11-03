# Installation Record and Cross-Installer Interoperability: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A14** [core/F33, core/F34, core/F35, core/F38, core/N10]: The record's shape is part of the `Installation Contract` Definition, so the Definition's text and the repository's `.kaal/core/` copy change in `core/C13`. `kaal-core/installation` gains:
  - `checkRecord(record)`, the findings for one record;
  - `register({ contract, record, written })`, a pure function from a contract, the current record (or `undefined`), and the SHA-256 Core wrote by path. It returns the next record. It registers only paths that are asset files of the contract and that Core wrote, and it keeps every other entry and member.
- **core/A15** [core/F36, core/F37]: `realize` (`core/A6`) gains one optional input, `contracted`: the names of the Skills a contract delivers, each with whether its canonical asset is already registered in the Capability's record. For a contracted Skill, the plan's canonical writes go to the contract's record through `register`, and Core's own `record` holds only the provider deployments. Surface-gated assets are never in a plan. Without `contracted`, `realize` behaves exactly as `core/C4` planned it (`core/T14`–`core/T22` are unchanged).
- **core/A7** stays: Core plans and Hosting realizes. `core/C13` reads the present files and both records through Hosting, and applies writes, keeps and prunes through `hosting/C2`'s guarded reconciliation. A precondition that fails leaves the repository unchanged.

## Options considered for the record's owner

| Option | What happens when Core realizes a Capability | Cost |
| --- | --- | --- |
| **A. The Capability's record, written by Core** (recommended, `core/F34`, `core/F36`) | Core registers the canonical assets in the record the contract names. The standalone lifecycle reads its own record and finds them. | Core must write a record in the Capability's shape. That shape is the Definition's (`core/F33`), so Core needs no Capability-specific code. |
| B. Core's record takes the role | Core keeps every file in its own record, as `guard/F29`'s last bullet currently says. | The standalone lifecycle must read Core's record to upgrade or remove, which adds a dependency from every Capability on Core's state, the opposite of `guard/N12`. Two records can claim one file. |

**Decided: Option A** (Owner, review 5641784016 on #373). The Capability's installation record is authoritative for its canonical assets, even when Core performs the installation, and Core's own record is limited to its provider deployments. That avoids competing ownership and keeps the Capability's standalone lifecycle independent of Core. Guard amends the last bullet of `guard/F29` in a Guard-owned Change ("When Core manages the installation, Core registers Guard's assets in this record"). The record shape in `core/F33`, `assets` by path with `sha256` and `version`, and the asset marker `surface` in `core/F37` are the ones `guard/C25` ships, so Guard's record needs no migration.

Both `core/C13` and Engineering's round trip keep two cases apart: a file that merely matches catalogued bytes, and a file the Capability's record registers. Only the second is the Capability's. No installer claims a file by its content alone (`core/F35`), and the Capability's own members of the record are kept unchanged (`core/F33`).

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `core/C10` PLAN, this Change | Core | none |
| `hosting/C1` PLAN: guarded file reconciliation | Hosting | none |
| `hosting/C2` DO | Hosting | `hosting/C1` |
| The amended `guard/F29` | Guard | `core/C10` |
| `core/C13` DO: `checkRecord`, `register`, `contracted`, the Definition text, Hosting application | Core | `core/C10`, `hosting/C2` |
| `engineering/C…`: the round trip | Engineering | `core/C13`, `guard/C25` |

`core/C12`, Core's move to Foundation's SHA-256, is independent of this graph.
