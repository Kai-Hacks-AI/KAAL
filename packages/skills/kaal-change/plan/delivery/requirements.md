# Change Nodes, Succession and Delivery: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **change/N1** [change/I4]: Assessment is deterministic and pure.
  - The same Nodes and the same evidence give the same result, in any order.
  - It reads nothing from the host and writes nothing.
  - Nodes that are not Changes are ignored, and no Change Nodes give an empty result with no findings.
- **change/N2** [change/I2, change/I9]: Each outgoing relationship is stated once, in the Node of the Change it goes out from. There is no field for a successor, and every incoming view is computed.
- **change/N5** [change/I4]: Presence, registration, admission and use are distinct (Owner alignment 6505123872).
  - **Only what is given.** `assess` reads only the Nodes its caller gives it. A Change Node present in the repository or on disk but not given is absent, and finding it is the caller's choice, never implicit registration.
  - **No claim beyond Change's own.** No member, finding or exchange entry states or implies that a Change, a relationship or a result is registered, admitted or KAAL-verified. `delivered` is Change's verdict relative to the evidence given, never a KAAL verification.
  - **Registration is explicit and later.** Registering the kind `Change` and the Succeeds and Delivers types is a later Change of Change's own (Architecture, Ownership). It points at the Change Nodes' outgoing Edges and duplicates none of them. Any Core index, and its materialization and freshness, is Core's separate PLAN.

## Functional: the Change Node

- **change/F1** [change/I1]: A Change Node is an ordinary Node typed by the Change Definition. Its `name` is the Change's identity.
- **change/F2** [change/I1]: An identity is `<namespace>/C<n>`, where `n` is a positive integer with no leading zero, such as `guard/C23`.
  - A Change Node with any other name is a finding naming it.
  - Two Change Nodes with one identity are a finding naming the identity, and neither is walked.
  - Who owns a namespace is not Change's to decide. That is Capability registration (`core/C24`, #518).
- **change/F3** [change/I3]: A Change Node that states `priority`, `rank`, `order`, `state` or `delivered` in its frontmatter is a finding naming the Change and the key.

## Functional: succession

- **change/F4** [change/I2]: A Change's predecessors are its Edges of the Succeeds relationship, a KAAL Definition that `kaal-change` provides. Each target must be a Change Node. Otherwise it is a finding naming the source, the target and the reason:
  - **unresolved:** no Node with that id is present;
  - **stale:** the identity names a present Change of another id, because the target changed after it was pinned;
  - **not a Change:** the target is a Node of another type.
- **change/F5** [change/I2]: The views are derived from the stated Edges:
  - `has(identity)` is true only for a Change that is walked: well-formed and unique;
  - `succeeds(identity)` lists the Changes it succeeds, its predecessors;
  - `successors(identity)` lists the Changes that succeed it;
  - with `{ transitive: true }`, each follows the Edges all the way.

  Each lists identities, sorted, and includes only resolved Edges.
- **change/F6** [change/I3]: The result carries no priority and no order of work beyond the Edges. Which deliverable Change goes first is Product's.
- **change/F12** [change/I2]: A cycle among resolved Succeeds Edges is a finding naming each of its Changes, sorted, and so is a Change that succeeds itself.
  - The views still terminate. Each lists a Change at most once, and never the Change it starts from.
  - Content addressing makes such a cycle unresolvable for Nodes read from their bytes (change/A4). The finding covers Nodes whose ids are asserted rather than derived.

## Functional: delivers

- **change/F14** [change/I9]: The Intents a Change delivers are its Edges of the Delivers relationship, a KAAL Definition that `kaal-change` provides.
  - `delivers(identity)` lists their target names, sorted, for resolved Edges.
  - A target that is not present is an unresolved finding, and a target named by a present Node of another id is a stale finding, as in change/F4.
  - What an Intent is, and whether a target is a well-formed one, is the Intent capability's to judge. Change checks only presence and the pin.

## Functional: delivery

- **change/F15** [change/I10]: A Change states its required Tests in its frontmatter as `requires`, a list of Test Case identities as their holder assigns them (`testing/F24`; in KAAL, `<capability>/T<n>`, `testing/N2`).
  - **The scope is explicit.** A Case not listed is not required, and is neither counted nor excused.
  - **Distinct from what a Case tests.** `requires` is the Change's own outgoing statement of its delivery boundary. A Case's `tests →` trace is Testing's and the Case's (`testing/N7`), and Change neither derives `requires` from it nor states it again.
  - **No zero-test delivery.** Given evidence, a Change that states no `requires`, or an empty list, is a finding (`no-tests`) and is never satisfied.
  - **Malformed entries.** An entry that is not a nonempty string, or that repeats, is a finding naming the Change and the entry, and the Change is not satisfied.
- **change/F16** [change/I10]: `assess(nodes, { evidence })` takes Testing's Case Results as plain data: a list of `{ case, result }`, where `case` is a Case identity and `result` is Testing's own word for it (`testing/F26`).
  - **Passed is Testing's.** A required Case is met only when the evidence holds it, and every entry for it reads `passed` exactly. That is the Owner's GREEN.
  - **Everything else is unmet.** A required Case absent from the evidence is unmet as `absent`, which is Change's own word for "no result was given". Any other result, such as `failed`, `unknown` or `inapplicable`, is unmet under Testing's word, passed through unchanged. Change never maps one result onto another.
  - **Satisfied** is true only when every required Case is met.
  - **Without evidence** no Change has a delivery result. Its absence never reads as not delivered, and never as delivered.
- **change/F17** [change/I2, change/I10]: Given evidence, a walked Change is **delivered** when it is satisfied and every Change it succeeds is delivered.
  - A satisfied Change with a predecessor that is not delivered is not delivered, and lists that predecessor as `awaiting`.
  - A Succeeds Edge that is unresolved, stale or not to a Change holds its Change from delivery, and is listed as `awaiting` under the pinned name.
  - No Change on a cycle is delivered.
  - A Case such as "is on main" is a required Case like any other. Change has no rule of its own about main, merge or promotion.
- **change/F13** [change/I2, change/I4, change/I9, change/I10]: `exchange()` gives the data form of the result, plain JSON with no functions, for another capability to consume.
  - **The form.** It is `{ changes, findings }`.
    - `changes` holds one entry per walked Change, sorted by identity: `{ identity, id, succeeds, delivers, requires }`.
      - `id` is its content id.
      - `succeeds` lists the identities of its resolved direct predecessors, sorted.
      - `delivers` lists the names of its resolved Intents, sorted.
      - `requires` lists its required Case identities, sorted.
    - Given evidence, each entry also carries `satisfied`, `delivered`, `unmet` and `awaiting`.
      - `unmet` lists `{ case, result }` for each required Case that is not met, sorted by case.
      - `awaiting` lists the identities that hold it from delivery, sorted.
    - `findings` holds one entry per finding, `{ kind, change, ... }`. Its `kind` is one of `malformed`, `duplicate`, `unresolved`, `stale`, `not-a-change`, `cycle`, `held-key`, `no-tests` or `malformed-test`. They are sorted by kind, then change, then their JSON.
  - **Absences.** A Change that is not walked, because it is malformed or its identity is duplicated, is absent from `changes`, and its finding names it in `change` and says why. A Change that was never given is simply absent, with no finding. No stale, unresolved or cycle case becomes a predecessor or an Intent.
  - **Provenance.** `id` is the content id of the exact Node bytes the entry was read from. A consumer cites it as the source of any relation it derives from that entry.
  - **Direct relationships.** `succeeds` holds direct predecessors only. A transitive closure computed by a consumer is the consumer's own derivation, attributed to Change's direct statements and never presented as stated by Change.
  - **Findings.** A finding's `change` is the identity it concerns, and its other members are Change's own to define. A consumer passes them through and never reinterprets them.
  - **Determinism.** Identical Nodes and evidence, in any order, give byte-identical JSON.
