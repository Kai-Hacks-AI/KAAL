# Pull Promotion: the declaration lists the candidate collectors, without recorded value (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F45 is relaxed. The report stays advisory.

- **pull/F46. Each candidate collector is declared with a scope that fits its real layout.** `declaration.json` lists `kaal/engineering/collector-capability` (scope `^engineering/collector-capability/`), `kaal/guard/registration` (`^engineering/guard/`) and `kaal/retro/skill` (`^packages/kaal-retro/`). Every file the collector added to its branch matches its scope, and a file that belongs to another candidate does not. The twelve existing entries are unchanged.
- **pull/F47. The evidence patterns recognize the layout the collectors already use, and explain what they do not count.**
  - Every `*.test.mjs` file of a candidate's delta is a Case under a declared Case pattern or is declared `other`; none is left "neither a Case nor declared".
  - The collector-capability Cases `T268` to `T279` are read as Cases (ids `T268` to `T279`). The retro node tests are declared `other`, not Cases.
  - PLAN evidence is found in each candidate's delta.
- **pull/F48. Declaring does not weaken any rule.** The PLAN and DO evidence patterns, the ACT file pattern (`concluding-act.md`), the four 4L headings and the history patterns are not narrowed. A collector with no concluding ACT, no executed Case or no DO is still reported as not qualifying, with what is missing.
- **pull/F49. Value, size and unit are Owner inputs and are never invented.** Each newly declared entry carries all of `value`, `size` and `unit` or none of them. While they are absent, the report orders the candidates by judgment, never by a guess. The report names any entry with a partial triple, and any invalid field, in `problems` (a partial triple is the one small Script change of this Change).
