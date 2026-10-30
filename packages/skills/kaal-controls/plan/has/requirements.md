# A Control has its Intents: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **controls/N4** [controls/I5]: Controls takes no package or runtime dependency on Intent. Its promotion does not depend on Intent's. A consumer without Intent installed can document and check Controls.
- **controls/N6** [controls/I5]: Controls' conformance stands alone. It takes no runtime dependency on Core, Graph or Testing.
  - Where Core is present, an adapter takes its input from a Core Engine. That is the preferred path.
  - Where Core is absent, the same assessment takes the minimal input of controls/F17 directly.
  - Controls does not admit Nodes, or repeat Core's admission. On the Core-absent path, the result states that its Nodes were supplied, not admitted.
- **controls/N5** [controls/I3, controls/I5]: Each Control a check examines has one of three outcomes, and none stands in for another.
  - **Conforming**: every rule of Controls is decided and holds.
  - **Nonconforming**: a rule is decided and broken. The reason is named: no Intent, a malformed Edge, a wrong target, or an Edge other than `Has`.
  - **Unresolved**: a rule cannot be decided, and the reason is named. Either an optional complement is absent, or the Control cannot be assessed: its input is unreadable or incomplete, it is attributed to no owner, or two owners claim it.

  These are Controls' rule outcomes. They are reported in Testing's result semantics, not beside them:
  - A nonconforming Control is a verified failure on that named Control.
  - An unresolved Control is unknown.
  - A conforming Control is a passing case within its coverage, and claims nothing about effectiveness or about the chain's later links.
  - Each owner's run is failed when any of its Controls is nonconforming. It is unknown when none is nonconforming but any is unresolved, or when fewer of its Controls were assessed than its context holds. It is verified only when every one of its Controls is conforming.
  - A report covering several owners keeps each owner's result separate. One owner's result never changes another's. Any summary across owners is verified only when every owner's run is verified.
  - Each result has its own exit status and summary, so an unresolved Control is never read as GREEN.

## Functional

- **controls/F10** [controls/I3]: `Has` is a Node typed by Core's `KAAL Definition` in Controls' payload. An Edge typed by `Has` goes from a `Control` to an Intent the Control has. It is read in context as *Control Has Intent*: its source and its target give it its meaning.
- **controls/F11** [controls/I3] **Cardinality.** This is a source-side rule, and Controls owns it.
  - A Control has one or more Intents, as the targets of its `Has` Edge. This is decided on #619 together with the name `Has`.
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
- **controls/F14** [controls/I3, controls/I5, controls/I6]: Controls delivers its conformance cases for controls/F11–controls/F13 as a reusable suite, which an owner runs against its own Controls through one documented entry point.
  - It reports each Control's outcome and reason (controls/N5), attributed to its owner, and each owner's run result in Testing's terms.
  - It fails closed.
  - It decides only Controls' own source-side rules. It does not walk or judge the chain's later links, and it never presents a deployed mechanism as evidence that a Control is effective.
- **controls/F16** [controls/I6] **Distributed ownership.** The suite discovers Controls within their owning context and reports outcomes attributed to that owner.
  - It never centralizes, copies or rewrites another owner's Controls, Intents or evidence.
  - It infers no owner. A Control found in no named context is reported as unresolved and unattributed, never left out silently.
  - A Control claimed by two owners is unresolved, with both owners named, and is never merged into either owner's result.
- **controls/F17** [controls/I5, controls/I6] **Minimal input.** Without Core, the suite takes one context per owner. Each context holds:
  - the owner's name;
  - the Nodes found in it. Each Node is its name, its id, its type as a name and id, and its Edges, each as a type and a list of targets by name and id;
  - the ids of every other Node a target may resolve to.

  This is plain data. It is the shape Graph's Edge form already gives, and nothing more. Producing ids and admitting Nodes are the supplier's concern. With Core present, an adapter builds each owner's context from the Engine, scoped to the context the caller names. It reads only what Core has admitted.
- **controls/F15** [controls/I3, controls/I4]: `Control` and `Controls` are revised to this model. Controls' Agent Skill, under "Document a specific control", says:
  - write each Intent the Control has as a target of one `Has` Edge;
  - never point a Control at a mechanism;
  - show realization through the chain, and run Controls' check.

  The README follows.
