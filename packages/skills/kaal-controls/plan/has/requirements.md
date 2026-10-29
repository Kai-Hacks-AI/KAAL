# A Control has its Intent: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N4** [controls/I3]: The Edge adds no package dependency, no registry and no check that Controls executes. It is a Definition that Core admits like `Realized by`. The ids of `Control`, `Realized by`, `VARISC`, `HAPTIC` and `CATCH ME IF YOU CAN` stay unchanged (`controls/N1`), so a capability that already documents a Control keeps it valid.

## Functional

- **controls/F10** [controls/I3]: `Has` is a Node typed by Core's `KAAL Definition` in Controls' payload. An Edge typed by `Has` goes from a `Control` to the Intent it has: a Node that states what the concern is for and why, completely enough to be read on its own.
- **controls/F11** [controls/I3] **Meaning.** Stated from the Control's side, in Controls' own terms:
  - A Control has one Intent. It carries at most one Edge typed by `Has`, with one target. A concern with two Intents is two Controls.
  - The Intent endures with the Control. The Edge says why the Control exists, never that the Intent is met, and a Control is not finished because its Intent is stated.
  - `Has` is not `Realized by`. `Has` points to why the Control exists, and `Realized by` to where it is realized. Neither Edge is evidence that the control is in place, operates or is effective.
  - `Has` is not a Change delivering an Intent. Nothing about a Change's lifecycle applies to a Control through this Edge.
- **controls/F12** [controls/I3] **Boundary.** Controls owns only the outgoing Edge.
  - The target keeps its own kind's meaning. Where the Intent capability is present, the natural target is a Node typed by its `Intent` Definition. The Definition may name it that way, as an optional complement, without assuming it is present and without restating what an Intent is.
  - Incoming views, such as the Controls that have a given Intent, are derived by Graph's generic mechanics. Controls defines no reverse Edge.
  - Requirements answering the Intent, and Architecture answering the Requirements, are those capabilities' outgoing traces, not Controls'.
- **controls/F13** [controls/I3]: Controls' Agent Skill, under "Document a specific control", says to point to the Control's Intent with one `Has` Edge, and to say so when no Intent is recorded. The README's file list and its "Documenting a specific control" section each gain one line.
