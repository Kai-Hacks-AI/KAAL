# C3 gap

One row per target artefact. Each gap is a Gap with a global id that a Change-oriented Case can test. The Change that closes it carries a `closes` link. The baseline is `main`.

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| release/G10 | I2 create Plan | `main` holds no Intent for producing a PLAN, and no PLAN template | I2 and the interface it asks for are absent |
| release/G11 | F2 plan-structure | The structure of a PLAN is stated only as rules of the judgment | F2 is absent, and the judgment's requirement still owns the structure |
| release/G12 | F3 plan-interface | `main` holds no PLAN interface | F3 and a template with its five sections are absent |
| release/G13 | A14 create Plan and A15 github | `main` has no control that produces a PLAN | A14, its deployment target A15 and the features and components under it are absent |
| release/G14 | A3 pr-templates and A4 plan-template | The template elements sit under the GitHub target of verify Plan | A3 and A4 do not sit under A15 |
| release/G15 | F1 plan-pr | F1 states the structure of a PLAN and the judgment of it | F1 does not cite F2, and still states the structure rules |
