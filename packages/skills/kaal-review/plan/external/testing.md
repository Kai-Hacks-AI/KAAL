# Review External acceptance: Testing

Planned Test Cases, RED until the DO Change. T17 to T19 are deterministic and run in the package. T20 is the independent acceptance trial, not a package test: its evidence and scenario belong to Testing and its checker is not the author.

| Test Case | Requirement | Planned verdict |
| --- | --- | --- |
| review/T17 | E0, E1, E2, E5 | `references/standalone.md` exists, is linked from `SKILL.md`, and states standing alone, the optional commands and their Node requirement, the intended effects in the R5 vocabulary, no authority, the version rule and the schema `kaal-review/1`. The README and Nodes do not restate it. |
| review/T18 | E3 | A test runs `check-record` and `collect` on fixtures inside a temporary directory and asserts the directory is unchanged and nothing is written except standard output. A static check asserts the scripts import only `node:` built-ins and local files. |
| review/T19 | E4, N3 | Every file the declaration names exists in the package at the same version; `SKILL.md` stays under 100 lines; no capability or role name appears. |
| review/T20 | E6, E7 | Independent acceptance trial per #978 section 6: unrelated repository, no Engine, plain text at a named commit, a real review task chosen by someone other than the author, a checker who is not the author, measured against Review's claims, every effect checked against the declaration and the authorization given (an undeclared or unauthorized effect fails; absence of writes alone is not a pass). Confirmed shortfalls become Defects with RED Test Cases. |
