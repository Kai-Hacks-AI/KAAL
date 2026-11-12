# Release: Testing (target)

Cases trace one requirement each. Which are written in which Change is in [00-changes.md](00-changes.md).

| Case | Requirement | What it shows |
| --- | --- | --- |
| release/T1 | F1 | the package has one Skill, one Node typed `KAAL Skill`, and `Release` states meaning and scope only |
| release/T2 | F2 | the Skill's headings contain the nine loop steps of F2 in order |
| release/T3 | F3 | each step names its decision and options, and the Skill tells the agent to read the repository's record first |
| release/T4 | F4 | `references/npm.md` exists; the Skill body names no registry or tool, while the npm file may name npm mechanisms |
| release/T5 | F5 | the general/KAAL line holds: shipped files contain none of the KAAL-specific identities, and generic words stay allowed (see below) |
| release/T6 | F6 | every mnemonic the shipped files name exists as a Node on `main`; none is redefined |
| release/T7 | N1 | `kaal-engineer-skill`'s checker reports no `standard` or `kaal` finding |
| release/T8 | N2 | `package.json` has no KAAL runtime dependency; every file the Skill names resolves inside the skill directory |
| release/T10 | F7 | acceptance demonstration with two consumers: see below |
| release/T11 | F8, I9 | the Skill names each delegated role (implementation, protection, verification, validation, execution) as a step and contains no protective rule, check, runner, verdict vocabulary or gate; positive fixture: a sentence requiring "evidence that change isolation holds" passes; negative fixture: a sentence defining how to run or pin that check fails |
| release/T13 | I10, F10 | readiness and outcome verification are stated as requirements on both verification and validation; the Skill defines no coverage measure and no acceptance criterion; positive fixture: "require verification evidence and a validation of the result" passes; negative fixture: a sentence defining how coverage is measured, or that Release itself judges the result, fails |
| release/T12 | F9 | the Skill covers single owner per control, one orchestration layer, distinct execution contexts, and proof of replacement coverage before retirement |
| release/T9 | N3 | the README states Skill-level guidance with the one hosted Script `analyze-flow.mjs`, and no verification of anyone's release |

Cases run against the package as written and against the packed artifact installed into a clean directory. T5 is the one that keeps the general/KAAL line honest, so it fails with the offending term and file named.

## T10: two consumers, one Skill

Two scenarios are given to the Skill's loop as fixed contexts (inputs), and the decisions it leads an agent to are recorded for each:

1. **Branch promotion**: a repository promoting a candidate branch into a protected default branch (no registry, no version).
2. **Registry publication**: a package published to npm.

T10 passes when (a) each scenario yields a complete decision for every F2 step, (b) the decisions differ where the contexts differ (identity, controls, authority, verification, recovery), (c) neither decision text, nor the Skill, uses a KAAL-specific identity (the T5 list), and (d) the npm-only mechanisms appear only in the registry scenario. Where a non-KAAL repository fixture is available, it replaces scenario 1. KAAL's own two realizations are cited by the Owner as reference consumers and are not Case inputs.

The judgment in (a) and (b) is read by a reviewer from recorded outputs; (c) and (d) are checked by script.

## T5: what it forbids and what it allows

- **Forbidden identities are sourced, not typed.** T5 reads the KAAL-specific names and decisions from the Delivery target (`engineering/release-management/03-architecture`): control names (for example `approve Publishing`), station and collector names, workflow and gate context names, and the `kaal/` branch lineage. It keeps no second list. If the Delivery target changes, T5 follows it.
- **Generic terms are allowed.** `approval`, `gate`, `control`, `candidate`, `promotion`, `publish` are ordinary release-management words and are never forbidden alone. Only the KAAL-specific identity is, such as `approve Publishing` as a control name or `gate (promotion)` as a context.
- **Both directions are shown by fixtures.** A positive fixture: a generic paragraph ("a person approves the publication; a gate may block promotion") passes. A negative fixture: the same paragraph with a KAAL control name or context fails, naming the term and the file.
- **The one pointer** to `engineering/release-management/` names the folder and nothing from inside it.

T6 keeps its condition: a mnemonic is named only if it exists as a Node on `main`. Fixtures: CARGO named while no `CARGO` Node is on `main` fails; the same sentence passes once the Node exists, and a plain-words statement of the same division passes in both states. T6 also fails if a shipped file defines a mnemonic or uses CARGO as a gate or control name.
