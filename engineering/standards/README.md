# Standards across KAAL: Engineering's part

> PLAN (engineering/C5): nothing below exists yet. This PLAN is revised to the Owner's alignment on #610 (comment 6504619909). A standard is a KAAL Node owned by the Capability whose standard it is. Graph discovers and relates them. Engineering keeps no register and restates no other Capability's standard. It owns its own Engineering standards, derives a cross-Capability view, and orchestrates conformance checks. The first draft's central register is withdrawn.

## The Node model

- **A Standard is a Node,** typed by a `Standard` Definition. Its text states the standard. Its owner is the Capability in whose tree it lives, as the ownership claims already attribute paths. Core's standards live in Core, Testing's in Testing, Guard's in Guard, and Engineering's in `engineering/`.
- **Ownership and applicability are distinct.** A Standard declares where it applies through Edges typed by `Applies to`. Each Edge points at the Node it applies to:
  - a Capability Node, for one Capability;
  - a Definition such as `KAAL Capability`, for every Node typed by it, which is how cross-Capability scope is stated;
  - one of the scope Definitions below.

  Applying to a Capability gives its owner no say over the standard, and gives the standard's owner no ownership of that Capability.
- **Scope Definitions.** These name the contexts the first draft listed: repository-native, `.kaal` integration and package. They are Definitions, so a Standard can apply to one through an Edge. Who owns each one is part of the Owner decision below.
- **Verification belongs to the Standard's owner.** A Standard names the Test Cases that verify conformance to it, by title. The owner writes them as reusable parametrized cases, as Core does for Installation Contracts (engineering/C4, #607). A claim no test can decide is validated by human–agent judgment, recorded, or left visibly unresolved, in Testing's terms. It is never shown as passing.

## What Engineering does

- **engineering/F4. Discovery, without a list.** Engineering finds every Standard through Graph: every Node typed by `Standard`, and its `Applies to` Edges. Incoming relationships, such as which Standards apply to a given Capability, are views derived by Graph and never stored. A new Standard is found with no edit to Engineering.
- **engineering/F5. A derived view.** `npm run standards` writes a report. For each Standard it gives its name, id, owner, what it applies to, its verifying Test Cases, and the state of each: verified, validated or unresolved. It copies no Standard's text. It is generated output and never checked in, so it cannot become a second source of truth.
- **engineering/F6. Orchestrated conformance.** For each Standard, Engineering runs the owner's parametrized cases over each subject the Standard applies to, as engineering/C4 does for Installation Contracts. Engineering adds no assertion of its own to another owner's standard.
- **engineering/N1. No consumer is bound.** Standards bind what KAAL engineers in this repository. Installing a KAAL package binds no consumer to them, and no check runs against a consumer repository. A Package states for itself what it guarantees its consumers.
- **engineering/N4. No unnecessary dependency.** Engineering imports Graph's lookup, which its tests already use, and each owner's published conformance cases. No Standard owner depends on Engineering, and no shipped package depends on the view.

## Engineering's own Standards

These live in `engineering/` and apply as stated:

- **Shipped tests stand alone.** A KAAL package's installed `npm test` needs neither its publisher tests nor this repository. It `Applies to` every shipped package, and it is the Owner's convention on #625. It is verified by the Consumer lane (engineering/C6) and by engineering/T4 below.
- **Representation is not Engineering's to restate.** The Owner's rule (#609 and #610) is that collaborative documents, human–agent or human–agent–script, are Markdown with validated YAML frontmatter, while purely machine-oriented contracts, exchanges and state may be JSON. A script consuming frontmatter does not make a document machine-only, and no classification is inferred from prose alone. The mechanics are Core's Deterministic Frontmatter (`N1`–`N3`, `F8`), and each Capability owns the validation of its own Types. So the Standard is Core's. Engineering cites it in the view, and the first draft's representation requirement is withdrawn. Until Core declares it as a Standard Node, the view lists it as unresolved, naming Core. #609 holds the evidence, including the classification of ownership claims as machine-oriented.

## Test Cases

These go in `engineering/standards/standards.test.mjs` and join `npm run test:engineering`. Each runs on fixtures in a scratch copy of the repository, and is first observed RED against a deliberately wrong implementation. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Deliberately wrong implementation that makes it RED |
| --- | --- | --- |
| engineering/T1 | A Standard added in a fixture Capability is found and appears in the view with no edit to Engineering. Removing it removes it | One that reads a fixed list |
| engineering/T2 | Every `Applies to` resolves through Graph. One that does not is reported unresolved, naming the Standard and its owner, never as passing | One that skips unresolved Edges |
| engineering/T3 | The view is derived. Regenerating it gives identical bytes, it holds no sentence of any Standard's text, and nothing under `engineering/` is a Standard owned by another Capability. A misplaced one is reported as an ownership conflict for the Owner, and Engineering moves nothing | One that copies each Standard's text into the view |
| engineering/T4 | A fixture package whose shipped test reads `engineering/` fails "Shipped tests stand alone" | One that runs the fixture's tests from the repository |
| engineering/T10 | Undiscoverable obligations. A fixture Standard reachable from no `Applies to` Edge, and a fixture collaborative Markdown artifact whose `type` resolves to no Definition, are each reported unresolved, naming the artifact and its owner | One that only lists what resolves |
| engineering/T11 | Misrepresented obligations. Engineering runs the owners' cases over every tracked `.json` file. A file whose format no owner declares machine-only, and a JSON artifact carrying a human decision record such as a `review` sign-off, each fail, naming the file and the owner who decides | One that accepts any `.json` file |

T10 and T11 orchestrate checks whose rules are other owners'. Core owns the frontmatter cases, and each JSON format's owner declares in its Type or Standard that the format is machine-only. Engineering adds no rule of its own to either. Their numbers skip T5–T9, which engineering/C6 (#625) plans.

## Dependencies

| Concept | Owner | Kind | Needed for C5? |
| --- | --- | --- | --- |
| `Standard`, `Applies to`, the scope Definitions | Owner decision below | Technical: Standard Nodes are typed by `Standard`. Also an order prerequisite | **Yes** |
| Node lookup, Edges, derived incoming views | Graph | Technical, already used by Engineering's tests | Yes, on `main` |
| Verification, validation, unknown | Testing | Semantic reference | Yes, as a reference only |
| Ownership claims | Testing (the format, moving to Markdown per #609) and each Capability | Semantic reference: the owner of a path | Yes, as a reference only. The view follows the format when it moves |
| Parametrized conformance cases | Each Standard's owner | Technical, per Standard, once the owner ships them | No, for C5. A Standard without cases is shown unresolved |
| Representation Standard | Core | Semantic reference | No. It is shown unresolved until Core declares it |

## Owner decision

**Who owns `Standard`, `Applies to` and the scope Definitions?** They are KAAL-wide kinds that every Capability uses, so the owner should be one that every Capability may already reference.

- **A: Core,** alongside `KAAL Definition` and `KAAL Capability`. Every Capability already references Core. **Selected by the Owner** (#610, review 5712653273), in Core's own bounded Change. An `Applies to` Edge declares applicability only. It is neither authorization nor evidence that anything ran, and a missing case or missing evidence stays unresolved.
- **B: Engineering.** Every other Capability's Standards would then be typed by an Engineering Definition, and Engineering would be at the centre of a concept the Owner distributes.

Under either option, Engineering owns the `.kaal` integration and repository-native scope Definitions only if the Owner says so.

Approving this PLAN authorizes the engineering/C5 DO only, after the `Standard` Definition is on `main` and synchronized into `kaal/engineering` under its owner's own Change. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
