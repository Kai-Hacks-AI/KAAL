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
- **change/F59** [change/I28]: **Equivalence before retirement.** For each copy listed in the Intent, a Case table gives a path set and the verdict the copy gives today. The one rule must give the same verdict, and a difference is a named Defect or a decided Change, never silent. A copy retires only in its own Change after that table is GREEN against both.

### Open for the Owner

- **G14. The `check.mjs` ledger.** Whether the existing transition ledger in `engineering/change-isolation/` is migrated into authorized entries (F58) or retired when its last entry is spent. This PLAN does not choose.
- **G15. Which collectors get which sets.** The Guard acceptance boundary is declared for `kaal/guard` today. Whether the same declaration applies to every collector is the Owner's call.
