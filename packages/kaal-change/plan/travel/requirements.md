# A Set of Paths Travels Alone: Requirements

Use or build, decided here. Using: git's own pathspec syntax and `git diff --name-only` are the parser and the lister of changed paths, so Change implements no glob or path matcher (a parser does it). Native GitHub rulesets restrict who may touch a path, but cannot state that a Change touching it touches nothing else, so there is nothing to use for the rule itself. Building: the judgment over already-classified paths, which is small.

- **change/F55** [change/I26]: **A declaration.** A path set is `{ name, include, companions, owner }`.
  - `include` is a nonempty list of git pathspecs (`:(glob)` or literal) that define membership.
  - `companions` is a possibly empty list of pathspecs that may travel with the set and nothing else.
  - `name` is unique. `owner` is the capability or repository role that answers for the set.
  - Overlapping sets are a finding when one path belongs to two sets with no declared precedence, and the declaration is then refused whole.
- **change/F56** [change/I26, change/I27]: **A judgment.** `travelsAlone(declaration, classified)` takes the declaration and the changed paths as git classified them: for each set, the paths inside it, the paths that are only a companion, and the paths outside every set. It gives `{ verdict, sets, findings }`.
  - `pass` when no set is touched, or when each touched set's Change holds only its set and its companions.
  - `fail` when a touched set's Change holds a path outside the set and its companions. Each finding names the set, the offending path and a remedy: move those paths into a Change of their own.
  - `cannot judge` when the paths were not listed, the declaration is malformed, or a rename's two sides were not both supplied. Never `pass`.
  - Verdicts use Guard's vocabulary and exit meanings; Change defines no new ones.
- **change/F57** [change/I27]: **Pure.** The function reads no file, process, clock, Git state or branch name, and the same input gives the same result (change/N10 and Change's other judgments).
- **change/F58** [change/I27]: **Exceptions are Accepts.** A spanning Change is admitted only by an entry authorized by an accepted PLAN (change/F50), keyed to the Change and to the exact path set and path blobs it admits, valid for one boundary (change/F53), ending by an end condition (change/F52), and unknown authorization fails closed (change/F54). This rule holds no ledger and does not read one.
- **change/F59** [change/I28]: **Equivalence before retirement.** For each copy listed in the Intent, a Case table gives a path set and the verdict the copy gives today. The one rule must give the same verdict, and a difference is a named Defect or a decided Change, never silent. A copy retires only in its own Change after its whole row of the change/F60 matrix is GREEN against both, and with an Owner go.

- **change/F60** [change/I28]: **The equivalence proof is a matrix, per set and per event.** Each cell is a Case, and nothing retires on the strength of a cell that is missing.
  - **Sets (rows).** Core with its supporting files; `.github`; the Guard acceptance boundary (`packages/kaal-guard/test/acceptance/`, `engineering/guard/acceptance/`).
  - **Events (columns).** A pull request into a collector or `main`; a merge group; the Guard acceptance boundary job (a pull request into `kaal/guard`); and a verified synchronization, which today is not applicable and stays so.
  - **Outcomes in each cell.** `pass` (set alone, set with companions, set untouched), `fail` (set with another path, each named), and the fail-closed outcomes of change/F61. Each `fail` cell is a RED Case: it is written first, shown RED against an absent rule, and GREEN only when the one rule gives it.
  - **Both sides.** For each cell the table records what the hand-written copy gives, taken by running it, and what the one rule gives. A difference is a named Defect or a decided Change, never silent.
- **change/F61** [change/I28]: **Missing and skipped fail closed.** The check not running, not required, skipped, unable to fetch the candidate, unable to list changed paths, or answering with anything but `pass` is not a pass. Specifically: a required check that is absent or skipped on an event blocks like a failure; `cannot judge` blocks; and "not applicable" is allowed only for the declared exemptions (a synchronization already admitted on the default branch), each with a Case. A control that is retired must leave no event on which the rule is neither run nor required.

### Open for the Owner

- **G14. The `check.mjs` ledger.** Whether the existing transition ledger in `engineering/change-isolation/` is migrated into authorized entries (F58) or retired when its last entry is spent. This PLAN does not choose.
- **G15. Which collectors get which sets.** The Guard acceptance boundary is declared for `kaal/guard` today. Whether the same declaration applies to every collector is the Owner's call.
