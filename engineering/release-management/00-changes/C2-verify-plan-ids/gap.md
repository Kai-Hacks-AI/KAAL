# C2 gap

One row per target artefact. Each gap is a Gap with a global id that a Change-oriented Case can test. The Change that closes it carries a `closes` link.

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G6 | Layout (`README.md`, `AGENTS.md`) | Ids are flat and a Case id names its placement | The one id grammar, the rule that identity is not placement and the derived placement are stated only in the target wording |
| release/G7 | F1 plan-pr | F1 states no id form and no capability place | Rules 4 and 5 and Case release/T14 state the id grammar and the derived placement |
| release/G8 | Ids of I1, F1, A1 to A13, D1, C1 and their Cases and links | Flat ids, and Case ids numbered under their placement | Every node id is `<capability>/<kind><n>`, and Cases are numbered across the capability |
| release/G9 | Judgment of A8 and A10 | The judgment has no capability place and no separate check of placement | The judgment checks the id grammar, derives the place of a Case from its `tests` list and validates it separately |
