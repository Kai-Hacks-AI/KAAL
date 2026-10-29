# A Control has its Intent: Architecture

Each element names, in brackets, the Requirements it answers.

- **controls/A5** [controls/F10–controls/F12, controls/N4]: `controls/C7` adds `payload/Has.md`, a `KAAL Definition` named `Has`, beside `Realized-by.md` and written in its pattern. It states controls/F10–controls/F12 and names Intent's `Intent` Definition only as an optional complement. `Control.md` is not edited, so no existing id changes.
- **controls/A6** [controls/F13]: `skills/kaal-controls/SKILL.md` and `README.md` gain the lines controls/F13 names.

## Options considered

| Decision | Option | What changes | Cost |
| --- | --- | --- | --- |
| Name | **A. `Has`** (recommended) | The Owner's word, as in `Control —has→ Intent`. Edge types resolve by name and id, so the short name collides with nothing. | None. |
| | B. `Has intent` | The name says its target. | It departs from the Owner's wording. |
| Is the Edge required? | **A. At most one, additive** (recommended) | `Has` states the cardinality. `Control` is not edited, and a Control without the Edge stays valid, with no Intent recorded. | A Control can still be documented without its Intent. Engineering's DO checks its own instances for one. |
| | B. Exactly one, in `Control` | `Control` is revised to the Owner's model and requires its Intent. | `Control`'s id changes, before Engineering first consumes it. |
| Target | **A. Any Node that states the Intent** (recommended) | `Intent`-typed Nodes are named as the natural target where the Intent capability is present. | Graph does not check the target's type, so neither option is enforced by Graph. |
| | B. Only `Intent`-typed Nodes | The Definition requires Intent's Definition. | Controls depends on Intent's semantics, and Intent's Definition is not on `main` yet. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `controls/C6` PLAN, this Change | Controls | none |
| `controls/C7` DO: controls/A5, controls/A6 | Controls | `controls/C6` |
| engineering/C3 DO | Engineering | `controls/C7` on `main` (its PLAN, #585, says so) |

`controls/C7` lands on `kaal/controls` before Controls' promotion and travels with it. Whether Engineering's intent.md files are typed by `Intent` depends on Intent's Definition reaching `main`, which is Intent's sequence, not Controls'.

## Contracts reused

- **Core**: `KAAL Definition` and admission.
- **Graph**: the Edge form, resolution and derived incoming views.
- **Controls**: `Control`, `Realized by`, and the limits of assurance in `Controls`.

Intent, Change, Requirements and Architecture are not dependencies. Nothing new is added to any capability.
