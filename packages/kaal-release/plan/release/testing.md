# Release: Testing (target)

Cases trace one requirement each. Which are written in which Change is in [00-changes.md](00-changes.md).

| Case | Requirement | What it shows |
| --- | --- | --- |
| release/T1 | F1 | the package has one Skill, one Node typed `KAAL Skill`, and `Release` states meaning and scope only |
| release/T2 | F2 | the Skill's headings contain the eight loop steps in order |
| release/T3 | F3 | each step names its decision and options, and the Skill tells the agent to read the repository's record first |
| release/T4 | F4 | `references/npm.md` exists; the Skill body names no registry or tool, while the npm file may name npm mechanisms |
| release/T5 | F5 | the general/KAAL line holds: shipped files contain none of the KAAL-specific identities, and generic words stay allowed (see below) |
| release/T6 | F6 | every mnemonic the shipped files name exists as a Node on `main`; none is redefined |
| release/T7 | N1 | `kaal-engineer-skill`'s checker reports no `standard` or `kaal` finding |
| release/T8 | N2 | `package.json` has no KAAL runtime dependency; every file the Skill names resolves inside the skill directory |
| release/T9 | N3 | the README states Skill-level, no Script, no verification |

Cases run against the package as written and against the packed artifact installed into a clean directory. T5 is the one that keeps the general/KAAL line honest, so it fails with the offending term and file named.

## T5: what it forbids and what it allows

- **Forbidden identities are sourced, not typed.** T5 reads the KAAL-specific names and decisions from the Delivery target (`engineering/release-management/03-architecture`): control names (for example `approve Publishing`), station and collector names, workflow and gate context names, and the `kaal/` branch lineage. It keeps no second list. If the Delivery target changes, T5 follows it.
- **Generic terms are allowed.** `approval`, `gate`, `control`, `candidate`, `promotion`, `publish` are ordinary release-management words and are never forbidden alone. Only the KAAL-specific identity is, such as `approve Publishing` as a control name or `gate (promotion)` as a context.
- **Both directions are shown by fixtures.** A positive fixture: a generic paragraph ("a person approves the publication; a gate may block promotion") passes. A negative fixture: the same paragraph with a KAAL control name or context fails, naming the term and the file.
- **The one pointer** to `engineering/release-management/` names the folder and nothing from inside it.

T6 keeps its condition: a mnemonic is named only if it exists as a Node on `main`.
