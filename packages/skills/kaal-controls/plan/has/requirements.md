# A Control has its Intent: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N4** [controls/I3]: The Edge adds no package dependency to Controls' payload, no registry and no check that Controls executes. It is a Definition that Core admits like `Realized by`. The ids of `Realized by`, `VARISC`, `HAPTIC` and `CATCH ME IF YOU CAN` stay unchanged. `Control`'s id stays unchanged unless the Owner takes decision 2 B, which amends `controls/N1` for `Control` alone (see [Architecture](architecture.md#backward-compatibility-observed)).

## Functional

- **controls/F10** [controls/I3]: The Edge Definition is a Node typed by Core's `KAAL Definition` in Controls' payload, named as the Owner decides (decision 1). An Edge typed by it goes from a `Control` to the Intent the Control has. Which Nodes may be that target is decision 3.
- **controls/F11** [controls/I3] **Meaning.** Stated from the Control's side, in Controls' own terms:
  - A Control has one Intent, through one Edge with one target. A concern with two Intents is two Controls. Whether a Control may also have none is decision 2.
  - The Intent endures with the Control. The Edge says why the Control exists, never that the Intent is met, and a Control is not finished because its Intent is stated.
  - `Has` is not `Realized by`. `Has` points to why the Control exists, and `Realized by` to where it is realized. Neither Edge is evidence that the control is in place, operates or is effective.
  - `Has` is not a Change delivering an Intent. Nothing about a Change's lifecycle applies to a Control through this Edge.
- **controls/F12** [controls/I3] **Boundary.** Controls owns only the outgoing Edge.
  - The target keeps its own kind's meaning. Naming the target's kind belongs to the relationship. Saying what an Intent is does not, so the Definition never restates it, whichever target option the Owner takes.
  - Incoming views, such as the Controls that have a given Intent, are derived by Graph's generic mechanics. Controls defines no reverse Edge.
  - Requirements answering the Intent, and Architecture answering the Requirements, are those capabilities' outgoing traces, not Controls'.
- **controls/F13** [controls/I3]: Controls' Agent Skill, under "Document a specific control", says to point to the Control's Intent with one Edge of this type, as the Owner decides it. The README's file list and its "Documenting a specific control" section each gain one line.
