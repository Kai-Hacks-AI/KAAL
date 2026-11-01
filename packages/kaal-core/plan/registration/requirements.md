# Capability Registration and One-Way Traceability: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N14** [core/I17]: Assembly is deterministic and pure.
  - The same registrations give the same result, in any order.
  - Assembly reads nothing from the host and writes nothing.
  - It changes neither the Kernel nor any existing id.
- **core/N15** [core/I16]: A relationship is stored once, with the instance it goes out from. There is no field for an incoming trace, and the reverse of a trace is always computed.
- **core/N16** [core/I18]: Registration is optional:
  - `kaal verify` on an Engine with no registrations gives today's result.
  - No module outside the registration machinery imports it.

## Functional: claims and identity

- **core/F47** [core/I15, core/I16]: A registration is an explicit statement by one holder, a Capability or a consuming repository, of:
  - the holder;
  - the scope it claims, such as `testing`;
  - the kinds it defines, if it owns any, each with its outgoing rule and, where its owner decides one, its cycle declaration (`core/F51`);
  - the instances it holds, each with its identity, its kind, and its outgoing traces (`core/F52`).

  A holder produces its registration however it likes. Core reads only the registration, never the holder's other files.
- **core/F48** [core/I15]: Identity.
  - **What Core requires.** Within its scope, an instance's identity is non-empty text, unique in that scope. Its **assembly identity** is the pair of its scope and that identity. A trace names its target by assembly identity, or by identity alone for a target in the source's own scope.
  - **What Core never requires.** Core reads scopes, identities and kind names as opaque text. It prescribes no grammar, derives nothing from an identity's spelling, and never takes an instance's kind from it. An instance's kind is what its registration states.
  - **Who defines the rest.** What an identity of a kind looks like is defined by the kind's owner and judged locally (`core/I17`). The content is the holder's, wherever it lives.
  - **No rewriting.** Core never rewrites an identity, and never moves an instance to its kind owner's scope.
- **core/F49** [core/I15]: One scope, one holder.
  - When two registrations claim the same scope, that is a collision finding naming the scope and both holders. No instance in a collided scope resolves until one claim is withdrawn.
  - One identity stated twice in one scope is a finding naming both statements.
- **core/F50** [core/I15, core/I16]: A kind is its owner's, qualified by its owner's scope (revised by `core/C30`).
  - **Defining.** A registration defines kinds by name in the scope it claims. Two registrations in different scopes that use one name define two kinds, and neither is a collision.
  - **Referring.** A kind is referred to, by an instance's `kind` or by a rule, as a name, meaning the kind of that name in the referring registration's own scope, or as a `{ scope, kind }` pair. This is the same form a trace uses for its target.
  - **One definition.** Because one scope has one holder (`core/F49`), a kind has one definition. A kind in a collided scope does not resolve.
  - **Unknown.** A kind reference that resolves to no definition is unknown, and an instance of that kind is a finding. The finding lists the candidates (`core/F67`).

## Functional: rules and instances

- **core/F51** [core/I16]: A kind's outgoing rule is its owner's alone.
  - **Who registers it.** A rule is registered only by the kind's owner, with the kind's definition. The owner defines the trace concept for its kind, and each instance's holder owns the assertions it makes under that rule. A target never defines what may trace to it, and a cross-capability target does not make the semantics jointly owned.
  - **Its forms.** A rule is either a list of kind references (`core/F50`) its instances may trace to, which may be empty, or `any`, which permits a trace to an instance of any registered kind. Testing, for example, may register its kind open rather than enumerate other Capabilities' kinds.
  - **Hierarchies.** A rule may name its own kind. That is how a Capability organizes its content as a tree: a child states its parent, and a parent's children are derived (`core/F54`). Core requires no tree, and whether a tree must stay acyclic is the owner's own constraint (revised by `core/C32`).
  - **Validated as registered.** A listed kind that no registration defines is a finding naming the rule's owner and that kind.
  - **Cycles (revised by `core/C32`).** Core has no acyclicity requirement and holds no cycle declaration. A kind's owner may require acyclicity under its own semantics and acceptance policy, and is accountable for its evidence. Graph's optional cycle detection can supply that evidence (`core/F80`).
  - **No rule is built in.** Core holds no trace matrix of its own, adds no rule and no reverse rule, and treats no kind name specially. What is permitted is exactly what the registered rules permit.
- **core/F52** [core/I16, core/I17]: Each trace instance goes out from its source instance to a target assembly identity. It is permitted only when two things hold:
  - its target resolves to an instance in a claimed, uncollided scope;
  - the target's kind is permitted by the source kind's rule.

  A trace to itself is not refused here. It is a cycle of one, which Core never judges (`core/F53`).

  Otherwise it is a finding naming the source, the target and the reason: unresolved, unclaimed scope, unknown kind, or not permitted by the rule. The rule applies whichever scopes the two instances are in.
- **core/F53** [core/I17]: The assembled graph is analysed as a whole when Graph is present (revised by `core/C32`, `core/F80`).
  - **Following traces.** From any instance, Graph's `reach` follows its traces recursively.
  - **Cycles are observed.** Every cycle of trace instances, a self-trace included, is reported as a structural observation naming its instances.
  - **Cycles are never Core's finding.** Core judges no cycle and claims no consumer's cycle constraint as verified. Without Graph, the observations are unavailable, and nothing is refused for that.
  - **Safety is not semantics.** Following traces and detecting cycles are deterministic and terminate on every graph, cyclic or not, whatever is permitted. Reaching yields each instance once, and Core never enumerates paths.
  - **Rules may cycle.** Kinds may form a cycle in their rules.
- **core/F54** [core/I16]: Reverse views are derived:
  - `incoming(id)` lists the traces that end at an instance, computed from the outgoing ones.
  - A registration that states an incoming trace is refused with a finding.
- **core/F55** [core/I16]: Nothing implicit is made up:
  - An instance that states no trace is reported as **untraced**. That is a report, not a failure, and Core never infers a trace for it.
  - A rule permits a trace and never requires one.

## Functional: shared terms

- **core/F66** [core/I21]: A term that kinds in two or more scopes bear is reported as a shared term:
  - **What it names.** The term, and each scoped kind bearing it with its owner and the definition its owner registers, if any. It also names the relationships among those kinds that their rules state by name. Core infers no relationship, and an open rule (`any`) states none.
  - **Unaligned.** The report says the term is unaligned. Core never reports it as aligned, as resolved or as GREEN.
  - **Nothing merged.** Each kind stays distinct and is judged by its own owner's rule, even when two owners register the same definition and the same rule.
  - **No finding.** A shared term is a report, like a cycle or an untraced instance. It is not a finding, and `kaal verify` lists it and never fails on it.
  - **Alignment comes later.** How the owners' alignment is recorded, and which of three outcomes it takes, is not part of this Change. The outcomes are one authoritative meaning that the others consume, meanings kept distinct, or meanings related explicitly. Until a later Change records alignments, every shared term is reported unaligned.
- **core/F67** [core/I21, core/F50]: Resolution is never silent:
  - A bare kind name resolves only in the referring registration's own scope.
  - Where it does not resolve there, the unknown kind finding (`core/F50`) lists every other scope that defines a kind of that name, with its owner. This applies to an instance's `kind` and to a rule alike.
  - Core chooses none of them, even when there is only one.
  - A `{ scope, kind }` reference resolves to the kind it names.

## Functional: reporting

- **core/F56** [core/I17, core/I18, core/I21]: The result reports five things: the claims, every finding, the observed cycles (unavailable without Graph, since `core/C32`), the untraced instances and, since `core/C30`, the shared terms.
  - Each finding says that it is Core's global verdict.
  - A Capability's local verdict, on its kinds' meaning or its identities' form, is never reported as Core's, and Core's verdict never says that an instance's content is right.
  - `kaal verify` lists the result beside the Nodes and artifacts. It fails on a collision and on a finding of `core/F50`–`core/F52` or `core/F54`. It never fails because an instance is untraced, nor because of a cycle, nor because Graph is absent, nor because of a shared term (revised by `core/C32`).
