# Controls as a Capability: Architecture

Each element names, in brackets, the Requirements it answers.

- **controls/A1** [controls/F1, controls/N1]: `controls/C2` changes the type of `payload/Controls.md` from `KAAL Skill` to `KAAL Capability` in place, as Learning's retype did, so the package layout does not change. `ownership.kaal.json`, the README and the package's tests follow the new id and kind. The acceptance scenario registers the installed payload with `kaal register capability`. Both Core trees support the `capability` kind: the one on `kaal/controls` and the one on main. So `controls/C2` does not wait for a synchronization.
- **controls/A2** [controls/F2, controls/F3, controls/N2]: The text changes are limited to these three files:
  - **`payload/Controls.md`**, the calibration paragraph. "a detective control that reports nothing has not shown that nothing is there" and "What has not been verified is stated as unverified" are restated as uses of Testing's clean result and Unknown, and the paragraph says that Testing owns them.
  - **`skills/kaal-controls/SKILL.md`**, "Calibrate every claim". The bullets "Nothing found is not nothing there" and "Unverified is said" become one bullet that points to Testing's findings and clean result. The three control-specific bullets stay. The "Name the roles on an activity" section stays until VARISC moves.
  - **`README.md`**, the kind and the registration line.

  `Control.md`, `Realized-by.md`, `VARISC.md` and `HAPTIC.md` are not touched.

## Options considered for placement

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Retype in place** (recommended) | Only the `type` in `payload/Controls.md`, and the files that follow its id. Learning's retype (#554) is the precedent. | `payload/` keeps holding a Capability Node, which Process, Change and Product moved to `capability/`. |
| B. Move to `capability/` | `Controls.md` and its four Definitions move to `capability/`, as in Process, Change and Product. `files`, `readContribution` paths and the acceptance file list change. | A larger diff that changes layout but not identity. The Owner ruled that a package's layout is distribution, not identity. |
| C. Add a Capability Node and keep the Skill Node | A new `capability/Controls.md` beside `payload/Controls.md`, as Testing has. | Two Nodes named Controls. Nothing yet needs a Skill Node separate from the Agent Skill. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| #575: tests identify Nodes through Graph | Controls | none |
| `controls/C1` PLAN, this Change | Controls | none |
| `controls/C2` DO: controls/F1–controls/F3 by controls/A1, controls/A2 | Controls | `controls/C1`, #575 |
| SYNC main → kaal/controls | Controls | `controls/C2` and the promotion slot |
| PROMOTION kaal/controls → main | Controls | the SYNC, in the same pair |
| VARISC in Process: the roles, the assignment of an actor to an activity, role versus structural ownership | Process | Process and Controls both on main |
| `controls/C3`: VARISC reduced to its constraints (segregation of duties, evidence of sign-off and verification, the independence a preventive control needs). It cites Process. | Controls | the Process Change on main, synchronized into kaal/controls |
| Engineering's gate Control Nodes, `Realized by` Guard and Branching | Engineering | Controls on main |

Nothing in this graph copies VARISC into Process before Process owns it, and no part of VARISC is deleted from Controls before Process holds it. Engineering plans and implements its gate controls in its own Changes: Controls supplies only the `Control` and `Realized by` Definitions they are typed by.

## Contracts reused

- **Core**: `KAAL Capability`, `register` and `catalog` for admission and discovery, and `readContribution` for the payload.
- **Graph**: `identify` and the Edge form, for `Realized by` (as #575 already uses them).
- **Testing**: `readClaim` for ownership attribution, `install` for acceptance, and the meaning of findings, verification, validation and a clean result for text.
- **Engineer Skill**: `checkSkill` for the Agent Skill.

Nothing new is added to any of them.
