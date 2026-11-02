# Script assessment evidence

Date: 2026-11-02. Actor: authenticated GitHub login kaihacksai, id 297627427.
This is static inventory plus bounded agent analysis, not host qualification,
release acceptance, independent approval or a transfer of responsibility.

## Pinned observations

| Tree | Commit | Tracked exported files | Source candidates | Entrypoint signals | Inside Skill | npm scripts | Workflows |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| main | f30221f481c4682e81b092e6a772365f3d7a9f6d | 480 | 199 | 36 | 8 | 47 | 10 |
| kaal/engineering | 36b49dd855f29015da7bbeb76176bfc7e7add27d | 423 | 178 | 33 | 6 | 40 | 10 |

Both GitHub heads were rechecked after the assessment and still matched these
pins. Exports were produced from existing local Git objects. Their file-path
sets equal their recursive tracked trees, with no missing or extra path. No
export-ignore/export-subst attribute or symlink occurred in the surveyed exports.

The broader survey covers 32 separate pinned snapshots, yielding 3,278
snapshot/path candidate rows and 348 distinct paths. Old shared versions on
collectors are historical ancestry, not an assembled live product. Open feature
branches, generated outputs, dependencies and ignored/untracked files were not
exhaustively inventoried. The exact refs, CSV inventory, npm commands, workflow
sources, scanner and claim-reader results are in the saved evidence archive.

- [Searchable assessment](https://chatgpt.com/library?file_id=libfile_1727412ec25c8191aaf0ad77c730c7e6&account_id=personal)
- [Evidence archive](https://chatgpt.com/library?file_id=libfile_e1a436153a8c81919a06d9aec2c43640&account_id=personal)

These are supporting assessment artifacts, not dependencies of KAAL code or a
substitute for the source references and reproduction below.

## Reproduction and interpretation

From an authorized clone, export each pinned commit with git archive into a
scratch snapshots directory. Run the archive's scan_scripts.py with its supplied
collector-refs.json from the documented directory layout. Python enumerates
exported paths/modes and package/Skill metadata; Node invokes main's existing,
dependency-free kaal-testing/lib/attribution.mjs readClaim. No package lifecycle,
test suite, release command or workflow runs. Output files are report artifacts.

Detection includes executable mode, shebangs, package bins and source extensions;
.d.ts is excluded. The 199 main candidates comprise 94 test case modules, 69 other
modules/helpers without established direct execution, and 36 entrypoint signals.
An entrypoint signal is not proof of a public or supported execution interface.

On main, 91 candidates match a readable claim pattern: Core 47, Testing 19,
Change 18 and Graph 7. Another 108 match none. Engineering has 110 candidates
without a matching pattern. readClaim validates claim shape/scope; this assessment
did not independently admit every owner through Core or claim authoritative
attribute results. A missing match is not proof of absent responsibility.

Exact byte comparison found no duplicate candidate-source group within main or
within the Engineering collector. This does not decide semantic duplication.
Purpose and recommended stewardship were assessment labels, not contract data.
Skill mentions and literal host imports were bounded text heuristics. Dynamic
invocation, complete import graphs, actual runtime portability and published
artifact behavior remain unknown.

## Findings traced to existing sources

| Finding | Source and disposition |
| --- | --- |
| BASS is delivered but no explicit BASS decision step occurs in the authoring procedure | main packages/skills/kaal-engineer-skill/payload/BASS.md and skills/kaal-engineer-skill/SKILL.md; separate Engineer Skill PLAN |
| Engineer Skill's scope is producing/updating Skills, not all Engineering operations | main packages/skills/kaal-engineer-skill/payload/Engineer-Skill.md; preserve its meaning and identity |
| Inventory, attribution, contracts, coverage and reports already reuse owner APIs | main engineering/inventory/, contracts/, coverage/ and report/; reuse them |
| Engineering root claim covers only two root manifests | collector ownership.kaal.json and engineering/ownership/README.md; reuse C11/P3/C16 |
| Discovery is already proposed with Core-present and Core-absent paths | #610 at b2ebe649c4915bc99e1893d476451761726be126, engineering/standards/README.md; still open, do not treat as implemented |
| Agents source guidance/commands lack coherent declared delivery | kaal/agents e80327610a2e9df7a0ba9e18b3dbcfeed2c09a92, packages/skills/kaal-agents/package.json, bin/, lib/ and skills/; files only capability and no bin declaration; return to existing Agents release work |
| Branching has a specific route already | merged PLAN #797 and kaal/branching-0.0.1 b9c307e267889c076cbf019871bdece4df1ba906; current Skill supports supplied-snapshot inspection only |
| Outside-Skill package interfaces can be deliberate | Foundation and Guard bins/lib on main, Packaging bin/lib on 1c743dbd496d652c8343d2a4c0cb8a9a4950b755; no forced relocation |
| Host/digest signals need applicability review | main Graph scripts/node.mjs imports node:crypto; Core build scripts write via node:fs; consult owner contracts and preserve #828's exact bytes |
| A generic privacy detector has no justified new owner yet | Communication cfc6cd1dec465747a35e6fb9b124276fb9f48341, engineering/privacy/check.mjs; Engineering incubation, no new capability |

No test or portability result is newly established by this evidence. The proposed
PLAN files receive whitespace, relative-link and target-owned path-isolation
checks only; current required CI and independent review remain separate.
