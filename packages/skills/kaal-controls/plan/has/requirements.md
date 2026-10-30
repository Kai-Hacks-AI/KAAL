# A Control has its Intents: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N4** [controls/I5]: Controls takes no package or runtime dependency on Intent. Its promotion does not depend on Intent's. A consumer without Intent installed can document and check Controls.
- **controls/N5** [controls/I3, controls/I5]: A check of a Control has three distinct outcomes, and no outcome stands in for another.
  - **Conforming**: every rule is decided and holds.
  - **Nonconforming**: a rule is decided and broken, for example a malformed Edge or a wrong target.
  - **Unresolved**: a rule cannot be decided because an optional complement is absent.

  Unresolved is never reported as conforming, so a check with any unresolved part is not GREEN.

## Functional

- **controls/F10** [controls/I3]: `Has` is a Node typed by Core's `KAAL Definition` in Controls' payload. An Edge typed by `Has` goes from a `Control` to an Intent the Control has. It is read in context as *Control Has Intent*: its source and its target give it its meaning.
- **controls/F11** [controls/I3] **Cardinality.** This is a source-side rule, and Controls owns it.
  - A Control has one or more Intents, as the targets of its `Has` Edge.
  - A Control with no Intent is nonconforming, because it is incomplete.
  - Several Intents are valid. They are one Control, and they do not make it several Controls.
- **controls/F12** [controls/I3, controls/I5] **Target.** Each target is checked as follows.
  - **Malformed.** Where the Edge is not in Graph's well-formed Edge form, the Control is nonconforming, whether or not Intent is present.
  - **Intent present.** Each target resolves to an admitted Node typed by Intent's authoritative `Intent` Definition, or the Control is nonconforming: a wrong or unresolvable target.
  - **Intent absent.** A well-formed target whose type cannot be verified is unresolved, and is reported as an absent optional complement, distinct from malformed.
  - **Boundary.** Controls names the target's kind and never states what an Intent is. Incoming views, such as the Controls that have an Intent, are derived by Graph's mechanics. Controls defines no reverse Edge.
- **controls/F13** [controls/I4] **No shortcut.** A Control's only outgoing Edge type is `Has`. Any other outgoing Edge from a Control, including one to a realizing mechanism, is nonconforming.
  - `Realized by` is retired from Controls' payload.
  - Controls states that a Control's realization is evidenced only through the trace chain in controls/I4, and that a deployed mechanism is not evidence of an effective Control merely because it exists.
  - Every link after the first is its source owner's. Controls neither defines nor restates them. Test Cases trace to Defects in the direction Testing and Guard agreed (#583), and observations belong to Test Runs. Both are named here only as the chain's later links.
- **controls/F14** [controls/I3, controls/I5]: Controls provides an executable check of controls/F11–controls/F13 for a given Engine. It reports the outcomes of controls/N5 for each Control, with the reason for each nonconforming or unresolved finding. It decides only Controls' own source-side rules. It does not walk or judge the later links of the chain.
- **controls/F15** [controls/I3, controls/I4]: `Control` and `Controls` are revised to this model. Controls' Agent Skill, under "Document a specific control", says:
  - write each Intent the Control has as a target of one `Has` Edge;
  - never point a Control at a mechanism;
  - show realization through the chain, and run Controls' check.

  The README follows.
