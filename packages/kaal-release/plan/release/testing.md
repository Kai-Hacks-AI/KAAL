# kaal-release 0.0.1: Testing

Cases are planned here and written RED by the DO Change. Each traces one requirement.

| Case | Requirement | What it shows |
| --- | --- | --- |
| release/T1 | F1 | the package has one Skill, one Node typed `KAAL Skill`, and `Release` states meaning and scope only |
| release/T2 | F2 | the Skill's headings contain the eight loop steps in order |
| release/T3 | F3 | each step names its decision and options, and the Skill tells the agent to read the repository's record first |
| release/T4 | F4 | `references/npm.md` exists and the Skill body names no registry |
| release/T5 | F5 | no shipped file contains a KAAL station, collector, gate or control name (list of forbidden terms read from the traced Delivery documents, not typed twice); the one pointer section names `engineering/release-management/` and nothing from inside it |
| release/T6 | F6 | every mnemonic the shipped files name exists as a Node on `main`; none is redefined |
| release/T7 | N1 | `kaal-engineer-skill`'s checker reports no `standard` or `kaal` finding |
| release/T8 | N2 | `package.json` has no KAAL runtime dependency; every file the Skill names resolves inside the skill directory |
| release/T9 | N3 | the README states Skill-level, no Script, no verification |

Cases run against the package as written and against the packed artifact installed into a clean directory. T5 is the one that keeps the general/KAAL line honest, so it fails with the offending term and file named.

## Open for the Owner

1. Package name: `@kaihacksai/kaal-release`, scoped like the other consumer-facing packages, is the default.
2. Is a Skill-only 0.0.1 the right first size, or should a generalized readiness check (a Script) be in it?
