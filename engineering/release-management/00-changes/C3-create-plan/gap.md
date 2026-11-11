# C3 gap

One row per target artefact. Each gap is a Gap with a global id that a Change-oriented Case can test. The Change that closes it carries a `closes` link. The baseline is `main`.

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G10 | I2 create Plan | `main` holds no Intent for producing a PLAN | I2 and the interface it asks for are absent |
| release/G11 | F2 plan-structure | `main` states no structure of a PLAN | F2 is absent |
| release/G12 | F3 plan-interface | `main` holds no PLAN interface | F3 and a template that names the origin and points to the Change are absent |
| release/G13 | A14 create Plan and A15 github | `main` has no control that produces a PLAN | A14 and its deployment target A15 are absent |
