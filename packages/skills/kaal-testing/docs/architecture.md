# kaal-testing: Architecture

These are kaal-testing's architectural decisions, each identified as `testing/A<n>` and naming, in brackets, the [Requirements](requirements.md) it realizes.

## RED Evidence and Feature-Accepted Regressions

- **testing/A7** [testing/F1, testing/N4]: `@kaihacksai/kaal-testing/observe` exports `observe({ files, cwd })`. The runner start, the reporter and the reading of its lines live in one module that both `observe` and `accept` use.
  - **How it runs.** The runner runs through Hosting, as `accept`'s does. The reporter is `testing/A5`'s.
  - **The run object.** The returned run is remembered through `lib/observed.mjs`, as `accept`'s is. The snapshot adds each given file's state: `absent`, `complete` or `incomplete`, with its SHA-256 where it exists. Nothing else in Testing reads runner output.
  - **Completion evidence.** Testing's reporter also passes on, as lines of their own, each file's `test:summary` and each failed suite with its failure type. A file is `complete` only with its own summary and no suite or file failure other than `subtestsFailed`. The per-test lines `testing/F7` defines are unchanged.
  - **Not a second interpreter.** C8's `accept` keeps its contract and its tests, testing/T9–testing/T13, unchanged.

- **testing/A1** [testing/F2–testing/F6, testing/F10, testing/N1, testing/N2]: `@kaihacksai/kaal-testing/red` exports `outcomes`, `classify`, `report` and `evaluate`.
  - **Imports.** It imports only Testing's own `lib/observed.mjs`, to recall a run's snapshot, and no host module.
  - **Results.**
    - `outcomes(run)` returns `outcome(id)`, `marker(id)`, `file(id)`, `identities()`, `unidentified()` and `findings()`.
    - `classify` returns `reds` (`{ test, class, file, marker?, accepted? }`), `stale`, `findings` and `counts`.
    - `report` returns text.
    - `evaluate` returns `{ pass, blocking }`.
  - **What Testing does not do.** Testing chooses no lane and no baseline, reads no Change record, reads neither GitHub nor the repository, and names no gate. Whoever runs a gate observes `head` and the baseline it chose, as `base`, then hands in any FAR outcome and the policy.

- **testing/A2** [testing/F4, testing/F5]: **FAR belongs to Change, and Testing holds only its interface.** Testing keeps no acceptance store, because acceptance is a Change decision, not Testing configuration.
  - **What Testing consumes.** Testing consumes only an optional decided outcome, in the shape of `testing/F4`. An accepted entry marks a listed Regression or Missing RED as accepted, and that RED stays RED. Testing never decides whether an entry was validly granted.
  - **What is Change's.** FAR's meaning, the proposal, the negotiation, the authorization, the decided outcome and its record, and the governance of the acceptance boundary are Change's, planned in the Change capability's own Change.
  - **What acceptance does not do.** Acceptance never edits a Test Case.

- **testing/A3** [testing/F3]: **Feature REDs are derived from observed evidence, not declared.** A new Feature Test Case normally starts RED, and one already GREEN is legitimate.
  - **What makes a Test Case new.** It is new only when the base observably lacked it: its file was observed absent, or the file was observed complete without it.
  - **Unknown baseline.** A Test Case the base gives no evidence on is Unknown baseline, never new. Completion needs positive evidence, so a base file whose suite declaration threw stays unknown even when no failing test was reported. This keeps the rule of testing/F7 that unknown evidence is not absent.
  - **Missing RED.** A Test Case the baseline observed GREEN that disappears is a Missing RED, so a silently removed test cannot pass as an unchanged one.

- **testing/A4** [testing/F10]: **The gates are Engineering's, and Guard executes them.**
  - **What Engineering's Change decides.**
    - which suites each lane requires;
    - which baseline each execution context and each loop supplies (for a Change into a `kaal/*` collector, for example, `main`), and how it observes it and `head` with `observe` in one process;
    - which FAR decisions a gate hands in, those of the Changes the candidate carries;
    - the policy of each gate.
  - **The policies Testing expects.** These are informative, and Engineering decides them.
    - `development` (a Change into a `kaal/*` collector) blocks `regression`, `missing`, `unknown` and `unidentified`.
    - `promotion` (a collector into `main`) also blocks `feature`.
  - **Guard** runs that check and reports its exit status. It keeps no policy of its own.

## Contract Evidence from Observed Runs

- **testing/A5** [testing/F7, testing/F8]: `accept` runs the scenarios with a test reporter of Testing's own, a module in `lib/` that uses `node:test`'s reporter interface. The reporter turns each `test:pass` and `test:fail` event (and `skip` and `todo`) into one line in the run directory, with the event's file, nesting and name. From those lines `accept` rebuilds each test's full suite path, which is the path the mappings already use. It hashes each scenario file when the run starts.
  - **The run object.** `acceptance.mjs` keeps a module-private `WeakMap` from each run object it returned to a private snapshot of what it observed: the per-test outcomes, the records, the findings and the manifest. Only `@kaihacksai/kaal-testing/contracts` reads the map, through a function it does not export. `classify` reads only the snapshot and never the fields of the object it is given. So a run counts only when it is the very object `accept` produced in this process, and changing that object's fields afterwards changes nothing. A copy or a deserialized run is just data that names a result, the same kind of claim the README already refuses.
  - **Hosting.** Commands, reads and paths stay Hosting's.
  - **Limitation: observed evidence is not durable.** It exists only in the process that ran `accept`. Another process, a later CI job, a stored artifact or another machine cannot reuse it. To classify again, run again. Durable or cross-process evidence would need a provenance mechanism of its own (Options B and C below). That is left to a later Change, if the Owner asks for one.

- **testing/A6** [testing/N3, testing/F9]: The split with Core and Engineering is the one `core/A17` draws:
  - **Core:** what LOVE asks.
  - **Testing:** what independent evidence is, and its classification.
  - **Engineering:** when a run happens, which packages it packs, and what a result gates.

  Testing's classification never decides whether a package meets LOVE, and nothing in Testing names LOVE. Core's evaluation of a package reads Testing's classification of that package's own mapping. Packing, the manifest and the choice of `cwd` (the repository root, so scenario paths match the mapping's repository paths) stay the caller's.

## Consumer Verification

- **testing/A8** [testing/N5, testing/F11–testing/F17]: Testing ships text only.
  - **The Node.** `payload/Testing.md` gains `## Consumer verification`, holding the statements of testing/F11 to testing/F17 verbatim.
  - **The Skill.** `skills/kaal-testing/SKILL.md` gains `## Making a product verifiable by its consumers`. It tells an Agent how to apply the section, and points to the Node for what it means.
  - **The README.** It summarizes the section.
  - **No mechanism.** kaal-testing gains no export, no module and no dependency. A product realizes the contract in its own code and cites these ids, so it depends on no Testing package. A reusable mechanism, such as an entry point delivered by Testing, is a later Change once kaal-testing is published.
  - **The export inventory.** Every kaal-testing export is declared below with the contract it serves. An export added later adds its row, and only a row may say an export serves consumer verification. None does: a row that did would be a new mechanism, which needs its own PLAN.

    | Export | Serves | Consumer verification |
    | --- | --- | --- |
    | `./acceptance` | capability acceptance: the producer runs its scenarios against its own packed bytes before release | no |
    | `./boundary` | PLAN boundary integrity: interpreting a realization's verdict on one concern owner's declaration | no |
    | `./attribution` | CASE-owned file attribution | no |
    | `./contracts` | contract evidence of a capability's mapping | no |
    | `./coverage` | execution and evidence of a capability's own tests | no |
    | `./inventory` | non-blank text lines of the listed files | no |
    | `./model` | the Testing model: Strategies, Plans, Suites, Cases, Test Data and Runs, their results and Plan evaluation | no |
    | `./package.json` | the package manifest | no |
    | `./report` | the reconciled package and ownership report | no |
    | `./verifiers` | the shared observable result contract for consumer verifiers: its scenarios, `observe` and `judge` | no |

- **testing/A9** [testing/F12, testing/F13]: **npm, the first realization.** Testing records it here without making it the definition.
  - **The entry point.** `npm explore <package> -- npm test` runs the installed package's own `test` script. The product's script runs one small entry file of its own.
  - **Exit statuses.** The recommended statuses are 0 for verified, 1 for failed and 2 for unknown. The summary is one machine-readable line.
  - **Why the runner alone is not enough.** These are the facts that make an entry file necessary, observed on Node v24.22.1 from an unrelated consumer:
    - `node --test` given a glob under `node_modules` finds 0 tests and exits 0;
    - given a relative path there, it reports "Could not find" and exits 1, the same as a failure;
    - a skipped case still exits 0;
    - under `npm explore`, both the working directory and `INIT_CWD` are the package's own directory.
  - **The byte identity.** npm records it in `node_modules/.package-lock.json` as `integrity`. Under another package manager it stays unknown.

## PLAN Boundary Integrity

- **testing/A10** [testing/N6, testing/F18–testing/F23]: **`@kaihacksai/kaal-testing/boundary`.** It exports two things:
  - `problems(declaration)`, which says why a declaration does not read;
  - `interpret(declaration, verdict, attestation)`, which returns `{ class, findings, unknowns }`.

  It is pure, imports no host module, and adds no dependency. The `Testing` Node states the invariant, the two realizations and the three kinds of claim after the immutability of planned tests, and the Skill tells an Agent how to declare a boundary.

- **testing/A11** [testing/F19, testing/F20]: **The two realizations.** The verdict is the seam between them. Neither realization is Testing's.

## Testing Model

- **testing/A12** [testing/N7, testing/N8, testing/F24–testing/F33]: `@kaihacksai/kaal-testing/model` is one module, `lib/model.mjs`, exporting:
  - `check(model)`, the findings;
  - `tested(model)`, the derived view from subject to the live Cases that test it;
  - `data(model)`, the derived view from each Test Data item to its owner and the contexts that reuse it;
  - `results(model, run)`, each Case's, Suite's and Plan's result in that one Run, its effective Test Data and its findings;
  - `evaluate(model, run, { allowances })`, the evaluation of a Plan Run.
  - `current(model, runs, of, { allowances })`, the current evidenced quality of a Plan, Suite or Case from a consumer's retained Runs, oldest first: `{ of, run, result, findings, runs: [{ run, applicable, differences }] }`, where `run` is the latest applicable Run's identity, or null.

  A model declares `strategies`, `plans`, `suites` and `cases`. A Plan, Suite or Case may carry a `version` and `data: [{ id, version?, content? | external? }]`, and reuse others' Test Data by `uses: [id]`. A Case may be `retired: true`.

  A Run is `{ id, of, provenance: { <definition>: <version or null> }, outcomes: { <case>: passed | failed | skipped | todo }, data: { <test data>: <version or null> }, runs: [<encompassed Run>] }`. An encompassed Run inherits its parent's provenance. `outcomes` are as `outcomes` (testing/F2) gives them. `results` and `evaluate` say what that one Run shows about the definitions, and neither keeps it.

  The module imports nothing, not even Testing's own modules, and names no other Capability's kind and no FAR role.

- **testing/A13** [testing/F25]: **A model is given, never discovered.** Strategies, Plans, Suites and Cases are product-owned data that the caller hands in. Testing keeps no registry, reads no path and names no file in which a product keeps them. Runs are handed in the same way, one at a time: Testing stores none, so retention is wholly the holding context's.

- **testing/A14** [testing/N8]: **A standalone package, later.** Because the model needs no host and no other Capability, it can ship in a dependency-free package that consumers use to declare and evaluate their own Plans. This is the direction of the research thread's option 2. Packaging and publication are a separate Change, not this one, and Hosting-based `accept` and coverage stay KAAL-internal.

## Consumer Verifier Conformance

- **testing/A18** [testing/F43–testing/F50, testing/N9]: `@kaihacksai/kaal-testing/verifiers` is one module, `lib/verifiers.mjs`, importing nothing, that exports:
  - `SCENARIOS`, the frozen list of `{ id, change, result, cases, target? }`. `cases` is `pass` where every declared case is reported, `none` where none is declared, and `any` where the scenario constrains no case. `target` is the outcome of the case the scenario targets.
  - `observe({ exit, stdout }, { prefix, words })`, which gives `{ observation, findings }`. `observation` is null when the run shows none.
  - `judge(scenario, observed, facts)`, which gives `{ scenario, conforms, differences }`. `facts` is `{ package: { name, version, location }, platform, node, digest, cases, target, applicability }`, as the harness established them. `applicability` maps a case's name to the `{ platforms?, requires?, absent?, reason }` the harness read from the installed manifest and checked itself. It is empty where no case is declared not applicable. `dependencies` names the package's required runtime dependencies. `complements` maps each optional complement the harness checked to `present` or `absent` in the consumer.

  It adds a row to testing/A8's export inventory, with consumer verification "no". It serves the publisher and Engineering, who check a verifier. No consumer's verification uses it, and no product depends on it.

## Applicability by Host Fact

- **testing/A22** [testing/F68–testing/F71, testing/N14]: `lib/verifiers.mjs` (testing/A18) changes in two places only:
  - `established(facts, name)` gains the fourth way, reading `facts.hostFacts`;
  - the comparison of a shown applicability with the established one also compares `host`, as a set, and `evidence`.

  The `not-applicable` scenario's `change` text names a host fact as well as a platform scope. `facts` gains `hostFacts`, optional: where the harness established none, no case is not applicable by host fact. testing/A18's facts are otherwise unchanged.

## Cross-Platform Inventory Parity

- **testing/A20** [testing/F56–testing/F58, testing/F67, testing/N11]: `@kaihacksai/kaal-testing/verifiers` (testing/A18) gains `parity(runs, { supported, osBoundary, challenged })`, still importing nothing. It gives `{ result, cases, findings }`:
  - `runs` is one `{ observed, facts }` per platform. `observed` is what `observe` gave. `facts` is testing/A18's, as the harness established it on that platform.
  - `cases` holds one `{ name, outcomes }` per declared case. `outcomes` maps each platform to the case's outcome there.
  - `osBoundary` defaults to `false`: the package is not the operating-system boundary unless the harness established that it is (testing/F67).
  - `challenged` defaults to none.

  `SCENARIOS`, `observe` and `judge` are unchanged, so testing/T54–testing/T62 stand as planned. The export inventory row for `./verifiers` (testing/A8) covers the addition.

## BRITTLE

- **testing/A23** [testing/F72–testing/F75, testing/N15]: BRITTLE ships in Testing's two existing documents and one new reference, and in no code:
  - `payload/Testing.md`, the `Testing` Node, states what BRITTLE means in one section, `## BRITTLE`: the term, false RED and false GREEN, and that a lesson improves the next Case through the same traces and versions. The Node's meaning is authoritative.
  - `skills/kaal-testing/SKILL.md` gains a section, `## Designing a case: BRITTLE`, beside TEST A FINDING. It gives testing/F73's four checks as steps and points to the reference.
  - `skills/kaal-testing/references/brittle.md` gives the lesson record of testing/F74, how a correction is versioned and traced, false GREEN as a Defect, and the ownership of testing/F75. It names no other capability's identifiers and cites no Change or pull request.

## Test Locations by Purpose and Owner

- **testing/A24** [testing/F76, testing/F77, testing/N16]: In `lib/acceptance.mjs`:
  - `SCENARIOS` is `test/engineer`;
  - a private `LEGACY`, `test/acceptance`, is read beside it until the migration completes;
  - `discover` reads both directories per workspace and sorts all of them by path.

  `test/embed/` is never named in the module. Nothing reads `package.json`.

## Testing 0.0.1 Release Readiness

- **testing/A21** [testing/F59–testing/F66, testing/N12, testing/N13]: **The packed package.** The tarball holds exactly:
  - `package.json`, `README.md`, `LICENSE`;
  - `capability/`, `lib/`, `payload/`, `skills/`;
  - `docs/`;
  - `test/embed/`, `test/verify.mjs` and `test/verify.json`.

  Nothing else ships: no PLAN document, no planned test, no publisher test, and neither `evidence.kaal.json` nor `ownership.kaal.json`. `test/verify.mjs` runs the delivered cases with Node's test runner against the installed copy. It reads the manifest, compares hashes, compares the consumer before and after, and prints the summary line.
