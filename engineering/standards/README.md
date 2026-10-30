# Standards across KAAL: Engineering's part

> PLAN (engineering/C5): nothing below exists yet. This PLAN is revised to the Owner's alignment on #610 (comment 6504619909). A standard is a KAAL Node owned by the Capability whose standard it is. Graph discovers and relates them. Engineering keeps no register and restates no other Capability's standard. It owns its own Engineering standards, derives a cross-Capability view, and orchestrates conformance checks. The first draft's central register is withdrawn. Revised again to the Owner's review on #610 (review 5715338615): `Standard` and `Applies to` carry domain semantics and are not assigned to Core, and each scope term is referenced at its own owner. Extended to package-release readiness at the Owner's request (#610, comments 6529592861 and 6529734792); see "Release readiness".

## The Node model

- **A Standard is a Node,** typed by a `Standard` Definition. Its text states the standard. Its owner is the Capability in whose tree it lives, as the ownership claims already attribute paths. Core's standards live in Core, Testing's in Testing, Guard's in Guard, and Engineering's in `engineering/`.
- **Ownership and applicability are distinct.** A Standard declares where it applies through Edges typed by `Applies to`. Each Edge points at the Node it applies to:
  - a Capability Node, for one Capability;
  - a Definition such as `KAAL Capability`, for every Node typed by it, which is how cross-Capability scope is stated;
  - the Node that defines a scope, at that scope's own owner (see "Scope terms").

  Applying to a Capability gives its owner no say over the standard, and gives the standard's owner no ownership of that Capability.
- **Scope terms.** The first draft named three contexts: repository-native, `.kaal` integration and package. None is invented here, and none is assigned to one owner for convenience. Each is referenced at the owner whose charter already covers it, and its meaning is not restated:

  | Scope | Owner, by charter | The Node an `Applies to` Edge points at |
  | --- | --- | --- |
  | `.kaal` integration | Core: "installation contracts", the management that makes a repository KAAL-managed (`Core.md`) | Core's `Installation Contract` Definition, on `main` |
  | package | Packaging: "how KAAL's deliverables become packages and what those packages are" (`Packaging.md`, #614) | Packaging's Capability Node; a `Package` Definition only if Packaging plans one |
  | repository-native | No Capability defines it today. Engineering engineers this repository, so it is the candidate | Returned to the Owner below; until decided, a Standard applying to it is reported unresolved |
- **Verification belongs to the Standard's owner.** A Standard names the Test Cases that verify conformance to it, by title. The owner writes them as reusable parametrized cases, as Core does for Installation Contracts (engineering/C4, #607). A claim no test can decide is validated by human–agent judgment, recorded, or left visibly unresolved, in Testing's terms. It is never shown as passing.

## What Engineering does

- **engineering/F4. Discovery, without a list.** Engineering finds every Standard through Graph: every Node typed by `Standard`, and its `Applies to` Edges. Incoming relationships, such as which Standards apply to a given Capability, are views derived by Graph and never stored. A new Standard is found with no edit to Engineering.
- **engineering/F5. A derived view.** `npm run standards` writes a report. For each Standard it gives its name, id, owner, what it applies to, its verifying Test Cases, and the state of each: verified, validated or unresolved. It copies no Standard's text. It is generated output and never checked in, so it cannot become a second source of truth.
- **engineering/F6. Orchestrated conformance.** For each Standard, Engineering runs the owner's parametrized cases over each subject the Standard applies to, as engineering/C4 does for Installation Contracts. Engineering adds no assertion of its own to another owner's standard.
- **engineering/N1. No consumer is bound.** Standards bind what KAAL engineers in this repository. Installing a KAAL package binds no consumer to them, and no check runs against a consumer repository. A Package states for itself what it guarantees its consumers.
- **engineering/N4. No unnecessary dependency.** Engineering imports Graph's lookup, which its tests already use, and each owner's published conformance cases. No Standard owner depends on Engineering, and no shipped package depends on the view.

## Release readiness: two contracts, one candidate

The Owner asked for a discoverable, testable minimum package-release baseline, with C5 as Engineering's coordination point. Every KAAL package answers to **two independently authoritative contracts**, and both are tested against the **same exact packed-and-installed candidate**:

1. **The generic KAAL Package contract, Packaging's.** Its Intent, Requirements, Architecture and reusable conformance cases apply to every KAAL package. It references Testing's semantics (the installed run, results, evidence) and Hosting's (host compatibility) and does not redefine them. **It does not exist yet.** Packaging plans it in its own Change, packaging/C4. Engineering states none of it.
2. **Each package's specific contract, its delivering capability's.** Examples are Guard's shipped `docs/`, Hosting's release plan (#629), Core's (#622) and Graph's (#627).

`engineering/research/release-baseline.md` traces the Owner's twenty candidates to their owners and existing IDs. It finds that 18 of them are generic, but today each product states them for itself. It also finds seven conflicts and nine gaps, returned under "Returned to owners" below. Engineering adopts none of them as its own requirement.

**What Engineering does:**

- **engineering/F17. Discover both contracts.** For each workspace package, Engineering finds its generic contract's cases (Packaging's, once they ship) and its specific contract's cases (the package's own Embedded Tests and its declared cases). It finds them through Graph and each package's declared entrypoints, with no list kept in Engineering. A package with neither contract discoverable is reported unresolved, naming it.
- **engineering/F18. Run both on one candidate.** Engineering packs the package once, records the tarball's identity with Packaging's `measure` (SHA-256), installs that tarball into a clean host outside this repository, as engineering/C7 does, and runs both suites against that installation. Each result names the artifact identity it ran against.
- **engineering/F19. Report two results and a combined state.** The report gives the generic result, the specific result and a combined readiness state. Each states its verified, validated and unresolved claims separately, in Testing's terms. The combined state is ready only when both results verify on the same identity and every applicable Requirement has a case or a recorded validation. Anything else is not ready, and the report names the cause. Release acceptance is the Owner's recorded authorization. No report stands for it, and neither does CI GREEN.
- **engineering/N10. No false GREEN.** These things never yield a ready state: a document or test file that only exists; a publisher-source test that passed; a missing, skipped or inapplicable case without its owner's declared applicability; or a result whose artifact identity differs from the other's.

| Test | Checks | Deliberately wrong implementation that makes it RED |
| --- | --- | --- |
| engineering/T29 (a) | A fixture whose generic suite is missing, and one whose generic suite fails, each with a passing specific suite, are not ready, naming the generic contract | One that reports the specific result alone |
| engineering/T30 (b) | The converse: a missing or failing specific suite, with a passing generic suite, is not ready, naming the package's contract | One that reports the generic result alone |
| engineering/T31 (c) | A declared Requirement or Architecture claim with no applicable case or validation is reported unresolved, and the package is not ready | One that counts only cases that exist |
| engineering/T32 (d) | A fixture case that reads the checkout, not the installed candidate, is detected and fails, as engineering/C7's T13 does | One that runs the suites from the workspace |
| engineering/T33 (e) | Two results on different artifact identities are refused as one candidate, naming both identities | One that compares only package name and version |
| engineering/T34 | A fixture with its documents present but its suites absent, and one with source tests passing but its installed run failing, are not ready | One that checks that files exist |
| engineering/T35 | A runtime dependency that does not install from the registry, and a case marked inapplicable on a platform the package declares, are reported, never GREEN | One that skips dependency installation, or treats inapplicable as passed |
| engineering/T36 | CI GREEN on a commit, without a readiness report on its candidate, is never shown as ready | One that reads the CI state |

**Scope.** This is an Engineering PLAN increment of C5. Its DO is its own bounded Change. It waits for the following, and it does not broaden C5's first DO:

- Packaging's packaging/C4, for the generic contract's cases. Until that ships, every package's generic result is unresolved, never GREEN.
- engineering/C7's packed-artifact harness, which it reuses.
- The Standards decision above. Readiness is reported whether or not Standards exists.

It changes no ruleset, gates nothing yet, and publishes nothing.

### Returned to owners

These come from `engineering/research/release-baseline.md`, with file and line there. Engineering decides none of them.

- **To Packaging (packaging/C4):**
  - the entrypoint convention, which settles what a source `npm test` runs: core/F75 against engineering/C6, hosting/F20 and graph/F6;
  - where Operations documentation lives: core/F69 and graph/F5 against guard/F37 and hosting/F18;
  - package identity, and the duty to declare platforms and runtime, which Core's and Change's plans omit.
- **To Testing:**
  - whether a tampered installed file is failed (graph/F6) or unknown (hosting/F21, guard/F33, testing/F43);
  - coverage and allocation semantics, which no testing/ ID defines;
  - whether applicability may depend on an optional complement (change/F23 against testing/F47);
  - the candidate N5, which conflicts with testing/F15. It can cover only a repeatable procedure and faithful reporting, unless Testing amends F15.
- **To Core:** core/F70 decides verified on counts, without a declared inventory, against testing/F12–F13.
- **To the Owner:** which evidence counts toward a release: Guard's registry-only rule (guard/N9), or the packed candidate before publication (core/F72, hosting/A9), or both.

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
| `Standard`, `Applies to` | A bounded **Standards** capability, proposed below, not yet authorized | Technical: Standard Nodes are typed by `Standard`. The DO cannot start until they exist | **Yes** |
| Scope Nodes | Core, Packaging, and an owner to be decided (see "Scope terms") | Semantic reference: an `Applies to` target | No. A Standard whose scope does not resolve is reported unresolved |
| Node lookup, Edges, derived incoming views | Graph | Technical, already used by Engineering's tests | Yes, on `main` |
| Verification, validation, unknown | Testing | Semantic reference | Yes, as a reference only |
| Ownership claims | Testing (the format, moving to Markdown per #609) and each Capability | Semantic reference: the owner of a path | Yes, as a reference only. The view follows the format when it moves |
| Parametrized conformance cases | Each Standard's owner | Technical, per Standard, once the owner ships them | No, for C5. A Standard without cases is shown unresolved |
| Representation Standard | Core | Semantic reference | No. It is shown unresolved until Core declares it |
| Generic KAAL Package contract and its cases | Packaging (packaging/C4, to be planned) | Technical, for engineering/F17–F19 only | No, for C5's first DO. Until it ships, each generic result is unresolved |
| Each package's specific contract | Its delivering capability (Guard, Hosting #629, Core #622, Graph #627, …) | Technical, through its declared entrypoints | Yes, for engineering/F17–F19 |
| Packed-artifact harness | Engineering (engineering/C7, #641) | Technical | Yes, for engineering/F18 |
| Artifact identity | Packaging (`measure`, packaging/F4) | Technical | Yes, for engineering/F18 |

## Who owns `Standard`: returned to the Owner

**No existing capability has this charter.** Checked on `main` and on every `kaal/*` collector's Capability Nodes:

- Core manages what makes a repository KAAL-managed and "owns none of the domain semantics" of the disciplines (`Core.md`).
- Controls is "for understanding controls"; it "keeps no registry or catalogue" and "maps to no compliance framework" (`Controls.md`).
- Architecture holds architectural decisions and their grounds; its principles, such as `URBAN`, are its own decisions, not a charter for every Capability's standards (`Architecture.md`).
- Testing owns verification and evidence, not what a standard is.
- Change's "Standard Change" is a Change class, an unrelated sense of the word.
- Graph owns Node and Edge mechanics only.

**Proposal: a bounded Standards capability,** in its own package and PLAN, with its own Definitions and tests. It is not created by this PLAN, and nothing moves into Core, Controls or Engineering.

- **Its scope, and only that.** What a Standard is, what `Applies to` means, and what conformance obligation a Standard creates: an owner's Test Cases decide it, or recorded judgment validates it, or it stays visibly unresolved.
- **The minimal interoperable contract.** Two Definitions, `Standard` and `Applies to`, and the rule that a Standard names its conformance cases by title. `Applies to` declares applicability only: it is neither authorization nor evidence that anything ran. Any Capability can conform by data alone, with no runtime import.
- **What it does not own.** No register or catalogue: Standard instances and their content stay with their owners. No scope term: each stays at its owner. No checking of anyone's conformance: each owner ships its cases, and Engineering orchestrates them here.
- **Optional complements, each through its own contract.** Graph, for discovery and derived incoming views. Testing, for verified, validated and unknown; without it, every obligation reads unresolved. Controls, where a Standard is also documented as a control. Engineering, which orchestrates in this repository. Standards works without any of them.

**What this changes elsewhere.** Core's #656 (core/C34) plans `Standard`, `Applies to` and the scope Definitions in Core, following the earlier selection. Under this proposal it would be withdrawn or narrowed, and that is Core's Change to make once the Owner decides; this PLAN changes nothing in Core.

**For the Owner to authorize:**
1. Creating the Standards capability, with the scope above. Recommended. The alternative is to keep `Standard` in Core after all, which the review advises against.
2. The owner of the repository-native scope: Engineering, recommended, or another.

Approving this PLAN authorizes the engineering/C5 DO only, after `Standard` and `Applies to` are available in `kaal/engineering` under their owner's own Change. It does not create the Standards capability: that needs the Owner's authorization above and its own PLAN. It authorizes no synchronization, promotion or publication, and no Change in another Capability's tree.
