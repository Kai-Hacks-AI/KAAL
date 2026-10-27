# Capability Registration and One-Way Traceability: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N14** [core/I17]: Assembly is deterministic and pure.
  - The same registrations give the same result, in any order.
  - Assembly reads nothing from the host and writes nothing.
  - It changes neither the Kernel nor any existing id.
- **core/N15** [core/I16]: A relationship is stored once, in the registration of the artifact it goes out from. There is no field for an incoming trace, and the reverse of a trace is always computed.
- **core/N16** [core/I18]: Registration is optional:
  - `kaal verify` on an Engine with no registrations gives today's result.
  - No module outside the registration machinery imports it.

## Functional: claims

- **core/F47** [core/I15, core/I16]: A registration is a Capability's explicit statement of:
  - the Capability that makes it;
  - the namespace it claims, such as `testing`;
  - the artifact kinds it defines, each with its trace rule and, where its owner decides one, its cycle declaration (`core/F51`);
  - the artifacts it owns, each with its outgoing traces (`core/F52`).

  A Capability produces its registration however it likes. Core reads only the registration, never the Capability's other files.
- **core/F48** [core/I15]: An artifact identity is `<namespace>/<kind><n>`, such as `testing/F2`:
  - Its **owner** is the Capability that claims the namespace.
  - Its **kind** is defined by whichever Capability registered that kind. The kind owner and the namespace owner may differ, and are usually different.
  - Core never rewrites an identity or moves an artifact to the kind owner's namespace.
- **core/F49** [core/I15]: One namespace, one claim:
  - When two registrations claim the same namespace, that is a collision finding naming both.
  - No artifact in a collided namespace resolves until one claim is withdrawn.
  - An artifact listed by a registration that does not claim its namespace is a finding.
- **core/F50** [core/I15, core/I16]: One kind, one definition:
  - When two registrations define the same kind, that is a collision finding naming both.
  - A kind no registration defines is unknown, and an artifact of that kind is a finding.

## Functional: rules and instances

- **core/F51** [core/I16]: A kind's rule lists the kinds its artifacts may trace to.
  - **Who registers it.** A rule is registered only by the kind's owner. The owner defines the trace concept for its kind, and the source artifact's Capability owns each assertion made under that rule. A cross-capability target does not make the semantics jointly owned.
  - **Cycles.** The kind's owner may declare its rule `acyclic`: no artifact of that kind may lie on a cycle of trace instances. Without a declaration, cycles through the kind are permitted. Core adds no default and no universal prohibition.
  - **The Owner-corrected rules.** These are the rules the kind owners are expected to register:
    - I → C
    - F → I and N → I
    - A → F, N, D (D is a negative Requirement, so Architecture may answer it)
    - T → I, F, N, A
    - Code → T
    - D → T
  - **C has no outgoing rule.** A C artifact may trace to nothing.
  - **No rule is implied.** Core adds no rule of its own and no reverse rule.
- **core/F52** [core/I16, core/I17]: Each trace instance goes out from its source artifact to a target identity. It is permitted only when three things hold:
  - its target resolves to an artifact in a claimed namespace;
  - the target's kind is in the source kind's rule;
  - the source and target are different artifacts.

  Otherwise it is a finding naming the source, the target and the reason: unresolved, unclaimed namespace, unknown kind, or not permitted by the rule. The rule applies whichever namespaces the two artifacts are in.
- **core/F53** [core/I17]: The assembled graph is validated as a whole.
  - **Following traces.** From any artifact, Core follows its traces recursively, such as Code → T → A → F → I → C.
  - **Cycles are observed.** Every cycle of trace instances is reported as a structural observation naming its artifacts.
  - **Cycles are judged by their owners' declarations.** A cycle is a finding only when an artifact on it is of a kind whose owner declared its rule `acyclic` (`core/F51`). The finding names that kind and its owner. Core never decides on its own that a cycle is invalid.
  - **Safety is not semantics.** Following traces and detecting cycles are deterministic and terminate on every graph, cyclic or not, whatever is permitted. Reaching yields each artifact once, and Core never enumerates paths.
  - **Rules may cycle.** Kinds may form a cycle in the rules, as A → D → T → A does.
- **core/F54** [core/I16]: Reverse views are derived:
  - `incoming(id)` lists the traces that end at an artifact, computed from the outgoing ones.
  - A registration that states an incoming trace is refused with a finding.
- **core/F55** [core/I16]: Nothing implicit is made up:
  - An artifact that states no trace is reported as **untraced**. That is a report, not a failure, and Core never infers a trace for it.
  - A rule permits a trace and never requires one.

## Functional: reporting

- **core/F56** [core/I17, core/I18]: The result reports four things: the claims, every finding, the observed cycles, and the untraced artifacts.
  - Each finding says that it is Core's global verdict.
  - A Capability's local verdict on its own artifacts is never reported as Core's, and Core's verdict never says that an artifact's content is right.
  - `kaal verify` lists the result beside the Nodes and artifacts. It fails on a collision and on a finding of `core/F52`–`core/F54`. It never fails because an artifact is untraced, nor because of a cycle no owner declared prohibited.
