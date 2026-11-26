# ACT library sensitivity: Architecture

- **testing/A58** [testing/F170, testing/F171, testing/F172, testing/N38]: **A pilot record and two structural Cases; no code.**
  - The pilot runs from a scratch copy of the tree at the pinned SHA. A temporary loader swaps one source file for its mutant per run, then runs release's Cases that exercise the target (found from the tree at that SHA, among them `release/T1299` and `T1310`–`T1314`) with release's own runner. It records for each mutant whether the swap was loaded, which Case and assertion failed, and any unrelated error separately. The runner is not committed.
  - The record is `plan/act-library-sensitivity/pilot.md`: the pinned SHA, the target files, the table of mutants (`| M<n> | K<n> | mutation | witness | observation | judgment |`), the survivors' handover, the justified Cases as text and a short BASS note on whether a standing script is earned (it is not committed either way).
  - `T395` and `T396` decide the structure of the record, never its prose: the pin, the twelve rows, the five columns, the claim coverage, and the judgment of each survivor.

## Carried Change set (`kaal/testing/act-library-sensitivity -> main`)

| PR / Change | Role | Scope | Depends on |
| --- | --- | --- | --- |
| `testing/C78` (this PR) | **Plan** | `plan/act-library-sensitivity/` and planned Cases `T395`–`T396` | none |
| `testing/C79` | **Do / Check (Pilot)** | run the pilot, write `pilot.md`, hand survivors to release | `testing/C78`; the ACT library settled enough to pin (`release/C122`, `C125` land first or the pin names them) |
| **ACT** | **Act (Collector Retro)** | one 4L retro reflecting `[testing/C78, testing/C79]`; its id verified unique across `kaal/testing/*` | `testing/C79` |
| **Promotion** | **Promote** | raised once the Change set and ACT land | ACT landed |

Release's own Change that lands the justified Cases, and any Defect, are theirs and follow the handover.
