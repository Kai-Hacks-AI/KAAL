# kaal-testing: Requirements

These are the functional (`testing/F<n>`) and nonfunctional (`testing/N<n>`) requirements of kaal-testing. Each names, in brackets, the [Intent](intent.md) it serves, and is defined here once. An identifier of another capability in parentheses names the contract it aligns with.

## RED Evidence and Feature-Accepted Regressions

- **testing/N1** [testing/I3]: Classification and evaluation are pure and deterministic. They read nothing from the host, write nothing, and do not read the clock. Given the same observed runs, FAR outcome and policy, they give the same result.

- **testing/N2** [testing/I1]: A Test Case's identity is the capability-qualified `<capability>/T<n>` at the start of its leaf test title, such as `guard/T50`. It is never the test's position or its full title, so a reworded title keeps its identity.

- **testing/N4** [testing/I2, testing/I3]: One interpreter of runner events, and one notion of an observed run.
  - **Events.** Testing reads a `node:test` run only through its own reporter (testing/A5). No second reading of runner events exists.
  - **Observed runs.** A run counts as evidence only when it is an observed run that Testing produced in this process, under `testing/F8`'s provenance rule. A copied run, or one read back from JSON, is a claim, and counts as no run.

- **testing/F1** [testing/I1]: `observe({ files, cwd })` runs the given test files under Testing's reporter. It returns an observed run, which records:
  - each file it was given, in one of three states:
    - **observed absent**, when no such file exists under `cwd`;
    - **complete**, with the SHA-256 of its bytes as run, when there is positive evidence that the file ran to the end: the runner reported the file's own summary, and no suite in it and not the file itself failed for a reason other than its subtests failing;
    - **incomplete**, with its SHA-256, in every other case, such as a file that failed to load, a suite whose declaration threw, a runner that stopped, or a file that reported no summary;
  - each test the runner executed, as `testing/F7` defines it: the file, the full suite path, and the outcome `pass`, `fail`, `skip` or `todo`.

  `accept` is the same observation, extended with packing, installation and provenance (`testing/F7`, `testing/F9`).

- **testing/F2** [testing/I1, testing/N2]: `outcomes(run)` reads an observed run by identity.
  - **Test Cases.** Each leaf test whose title starts with an identity is a Test Case. Suites are not Test Cases.
  - **GREEN and RED.** A test that passed is GREEN. Anything else is RED: one that failed, one that was skipped, or one marked `todo`. A skipped or `todo` test keeps its marker in the report, and is never GREEN.
  - **Unidentified.** A leaf test without an identity, such as a Code test, is not a Test Case. When it does not pass, it is an Unidentified RED, reported under its title and file.
  - **Duplicates.** An identity that occurs twice in one run is a finding.
  - **Not observed.** A value that is not an observed run gives no outcomes and one finding.

- **testing/F3** [testing/I2]: `classify({ head, base, far })` compares two observed runs of the same suites: the candidate (`head`) and the baseline its caller supplies (`base`). Testing does not select or authorize the baseline. Whichever one it is given defines every class below. It classes every Test Case and every Unidentified RED in `head`. Each Test Case of `head`:
  - **GREEN** when it passed. It is reported as new GREEN when it is new by the rule below.
  - **Regression RED** when it is RED and the base observed it GREEN.
  - **Persisting RED** when it is RED and the base observed it RED.
  - **Feature RED** when it is RED and new. A Test Case is new only when the base observably lacked it. Either its file was observed absent on the base, or that same file was observed complete on the base (`testing/F1`) and the identity did not occur. The absence of a failure is never evidence of completion. Feature is observational newness against the supplied baseline, not an authorization judgment.
  - **Unknown baseline** when it is RED and the base gives no evidence either way. That covers a base that is not an observed run, a file the base was not given, and a base file observed incomplete. Unknown evidence is never read as absent or new (`testing/I2`).

  In addition, each Test Case the base observed GREEN that does not occur in `head` is a **Missing RED**: behavior the baseline established that is no longer tested.

  The candidate's own evidence must be whole. Each file `head` was given that is not observed complete is a finding, named by its file. That covers a file that failed to load, a suite whose declaration threw while every reported test passed, and a file the candidate lacks. A failure the runner saw is never lost because no failing Test Case carried it.

- **testing/F4** [testing/I1, testing/I3]: `far` is optional. When it is absent, nothing is accepted, and classification, report and evaluation are otherwise unchanged. When it is given, it is the structured outcome of a Change's FAR decision, as Change hands it on: a list of decided entries. Each entry names:
  - `change`: the Change that decided it, as a capability-qualified Change id, such as sample/C2;
  - `tests`: the Test Case identities whose regression the Owner accepted, at least one.

  Testing checks only the shape it consumes. A malformed entry is a finding and accepts nothing. Who may decide, the decision's record, its authority and its scope belong to Change. Which decisions a gate hands in belongs to Engineering.

- **testing/F5** [testing/I1, testing/I3]: An accepted entry applies only to a Regression RED or a Missing RED with a listed identity.
  - **What it changes.** It marks that RED as accepted, under the deciding Change. It stays RED.
  - **What it never covers.** It never applies to a Feature, Persisting, Unidentified or Unknown-baseline RED, nor to any other identity.
  - **Stale entries.** A listed identity that is not a Regression or Missing RED in the run is reported as stale, so that Change can retire it.

- **testing/F6** [testing/I1]: `report(classification)` lists every RED with its identity, class and file. Each accepted RED also carries its deciding Change. The report then lists the stale entries and the findings. Counts give REDs by class, then accepted REDs, then GREEN and new GREEN. An accepted RED is counted as RED, and is never counted or shown as GREEN.

- **testing/F10** [testing/I3]: `evaluate(classification, policy)` returns `{ pass, blocking }`.
  - **The policy.** `policy.block` lists the classes a gate refuses: `regression`, `missing`, `feature`, `persisting`, `unknown` and `unidentified`.
  - **Blocking.** `blocking` is the sorted set of identities, and of titles of Unidentified REDs, in a blocked class, less the accepted Regression and Missing REDs.
  - **Always blocking.** Every finding blocks, whatever the policy: a duplicate identity, a run that is not observed, a candidate file not observed complete, and a malformed FAR entry.
  - **Pass.** `pass` is true exactly when `blocking` is empty.
  - **Single subtraction.** Acceptance subtracts single identities, so accepting one regression never unblocks another.
  - **Malformed policy.** A policy naming no known class, or naming an unknown one, is a finding, so evaluation fails closed.

## Contract Evidence from Observed Runs

- **testing/N3** [testing/I4]: Testing's judgment depends on nothing it judges:
  - **Runtime dependencies:** kaal-testing's runtime dependencies stay `c8` and `@kaihacksai/kaal-hosting`.
  - **Imports:** nothing it delivers imports `@kaihacksai/kaal-core`, `@kaihacksai/kaal-graph` or any other capability's package.
  - **Inputs:** a mapping, a tree's bytes and a run are data.

  Testing may consume Core's types and admission in its own tests. That dependency runs from Testing to Core, never back (`core/N11`).

- **testing/F7** [testing/I5]: `accept` observes each test its runner executes. Its result lists one entry for each test. An entry carries:
  - the scenario file, as a `/`-separated path relative to `cwd`;
  - the SHA-256 of that file's bytes as run;
  - the test's full suite path;
  - its outcome: `pass`, `fail`, `skip` or `todo`.

  Testing reads the outcomes from the runner it started, never from a file a scenario or anyone else writes. The result also carries the manifest it ran with.

- **testing/F8** [testing/I5]: `classify(mapping, files, run)` takes an optional third argument: a run that `accept` returned in this process. With it:
  - **Observed:** an offered acceptance test is `observed` when the run executed that exact file, with the pinned bytes and the full suite path, and it passed.
  - **Verified failure:** an offered test is a `verified failure`, naming the test, when it ran so and failed.
  - **Unknown:** anything else stays `unknown`, with its reason.
  - **Statement:** a statement is `observed` when every offered test is, and a `verified failure` when any is. Otherwise it stays `unknown`. Its inference is reported as before ("proposed, not reviewed" or a declared review), never as verified.
  - **Run provenance:** only a run that `accept` produced in this process counts. A copy of it, or one read back from JSON, is a claim and counts as no run. Classification uses what `accept` observed, as it observed it, so changing the run's fields afterwards changes no classification. Observed evidence does not outlive that process: no other process, job or machine can use it. Conformance evidence, which `accept` does not run, stays unknown, as does every statement classified without a run. Nothing here is a percentage, a ratio or a gate.

- **testing/F9** [testing/I4, testing/I5]: Evidence is independent only when it comes from the package as delivered. An offered acceptance test counts only when both of these hold:
  - its scenario installed, through `install()`, a tarball the run's manifest packed;
  - the run found no verified failure in its provenance: foreign bytes, a package the run did not pack, a host holding a package from elsewhere, a shared host or an unreadable host record.

  Otherwise its outcome stays unknown, even when it passed. A scenario that installed nothing exercised no package.

## Consumer Verification

- **testing/N5** [testing/I6]: The consumer verification semantics are realization-neutral.
  - The Node's consumer verification section names no product, package manager, version control system or hosting service.
  - It adds no mechanism to kaal-testing: no export serves consumer verification, and its runtime dependencies are unchanged. testing/A8's export inventory declares, for every export, the contract it serves, and none serves consumer verification. An export added for another contract adds its own row.
  - npm is the first realization, and it is recorded in the Architecture (testing/A9), never in the Definition.

- **testing/F11** [testing/I6]: Delivery.
  > A product may deliver, with its distribution, the cases by which a consumer verifies the product as installed. They are the product's own acceptance or conformance cases, kept apart from tests that serve only its engineering, and the product declares which cases they are.

- **testing/F12** [testing/I6]: One entry point that fails closed.
  > The product documents one entry point for them. It locates the installed product by resolution, not by a source path, and needs no source checkout. It fails closed: a run in which no case failed but fewer cases executed than the product declares is unknown, never verified.

- **testing/F13** [testing/I6]: Three results, each distinguishable.
  > Each run gives exactly one result. It is failed when any case failed. It is unknown when no case failed but a declared case was skipped, not run or unable to run. It is verified only when every declared case ran and passed. Each result has its own exit status and its own summary, so no result is read from silence.

- **testing/F14** [testing/I6]: The subject is named.
  > The evidence names what was exercised: the product's name, its version, where it is installed, and the identity of its bytes where the installation records one. What the installation does not record stays unknown.

- **testing/F15** [testing/I6]: Isolation and a repeatable procedure.
  > A run works outside the consumer's content and leaves that content as it found it, and it shows that it did. Its procedure is repeatable: the same entry point can be run again against the same installation. Each run reports faithfully the outcome it observed, with its evidence and the conditions it ran under. The same installation does not promise the same outcome, since time, network, environment or a case's own nondeterminism may differ between runs, so each result stands for its own run only.

- **testing/F16** [testing/I7]: Two scopes.
  > Product conformance and consumer integration are separate scopes. Conformance shows that the installed product behaves as its contract states, in surroundings the run builds for itself. Integration shows that the product is installed and configured correctly in one consumer. Each has its own verdict, and neither stands in for the other.

- **testing/F17** [testing/I7]: Whose observation it is.
  > A consumer's result is the consumer's own observation of its run. It is not evidence Testing observed, and it changes no classification of a product's contracts.

## PLAN Boundary Integrity

- **testing/N6** [testing/I9]: `interpret` is pure and realization-neutral.
  - **Inputs.** It takes a declaration and a verdict as data.
  - **No other imports.** It reads no host, runs no command, and imports neither Sealing nor any Git library.
  - **Dependencies.** kaal-testing's runtime dependencies stay `c8` and `@kaihacksai/kaal-hosting`.

- **testing/F18** [testing/I8]: **A Boundary Declaration** is written by one concern owner (Intent, Requirements or Architecture, at any nesting) for one PLAN Change. It holds:
  - the concern and its owner;
  - `paths`: the repository-relative paths of its planned tests and of every fixture, expectation, snapshot, configuration file, helper and declared dependency that gives them meaning. A path ending in `/` covers everything beneath it.

  The closure is declared, never derived. A declaration that does not read, or whose path leaves the repository, is a verified failure naming it.

- **testing/F19** [testing/I8]: **A verdict** is what a realization reports for one declaration. It is realization-neutral and states:
  - its realization, `git` or `seal`;
  - its anchor, `plan-commit`, `owner-review` or `collector-record`, with its reference;
  - the bytes it compared, `stored` or `working-tree`;
  - whether it compared file mode;
  - the declared paths it found added, removed, renamed, changed in content or changed in mode;
  - the paths it found outside the declaration that the boundary depends on.

  A verdict is a report, not evidence of its own trust. It is read with an **attestation** from the trust authority that produced and verified it, `{ by, anchor }`: the authority it names, and the anchor reference it vouches for.

- **testing/F20** [testing/I8, testing/I9]: **An anchor the candidate can write is no anchor.**
  - A verdict with no attestation, an attestation naming no authority, or one bound to another anchor is unknown, never unchanged and never failed: "no trust authority attests this verdict". Its changes are reported as unknown. Testing does not authenticate the attestation: its authority is accountable for it.
  - A verdict whose anchor is the PR head, or is missing, is unknown, never unchanged and never failed: "the baseline is not trusted".
  - A verdict over working-tree bytes is unknown for content, because a checkout can change bytes, as line endings do.

- **testing/F21** [testing/I8]: **Changes are verified failures.** Each declared path that was added, removed, renamed or changed is a verified failure, naming the concern, its owner, the path and the change. This includes a file a sync re-adds beneath a declared directory. A mode change is one when the verdict compared mode. When the verdict did not compare mode, mode is unknown.

- **testing/F22** [testing/I8]: **What stays unknown.** These are reported as unknown, whatever else holds:
  - each path the verdict found outside the declaration;
  - execution reproducibility: runtime, lockfile bytes, environment, flags, time and network;
  - behavioural validity: clean RED, correctness and Outcome.

- **testing/F23** [testing/I8]: **The result.** `interpret` returns one class:
  - `verified failure` when any finding is one;
  - `unknown` when the verdict is not attested, when the anchor or the bytes are untrusted, or when the verdict does not read for the declared paths: a change entry that does not read, an unrecognized change to a declared path, or outside paths that are not a list;
  - otherwise `unchanged within the declaration`.

  It always lists the findings and the unknowns. It never returns "met", "passed" or "valid".

## Testing Model

- **testing/N7** [testing/I10]: Subjects are opaque. A Case's **tests →** subjects are nonempty strings, and Testing validates, enumerates and restricts no subject kind. The view of which Cases test a subject is derived from the Cases' outgoing traces. The model accepts no declared incoming trace. The trace does not define its subject's semantics: no result, status or finding speaks of a subject, and a Case's result is the Case's, never its subject's.

- **testing/N8** [testing/I11]: The model is pure and deterministic. Given the same model, Run and options, it gives the same result. It reads nothing from a host, writes nothing, reads no clock, keeps nothing between calls and changes no input.

- **testing/F24** [testing/I10]: Identities belong to their holder. Every Strategy, Plan, Suite, Case and Test Data item has an identity, a nonempty string its holder assigns, unique across the model so that references resolve. Testing prescribes no format, prefix or numbering. A missing, empty or duplicate identity is a finding.
  - KAAL's own Cases follow testing/N2, `<capability>/T<n>`. That is KAAL's internal convention, enforced by KAAL's own Engineering checks, and the generic model neither requires nor checks it.

- **testing/F25** [testing/I10]: Relationships, each outgoing, owned by the containing definition and stated once there. The other direction is derived.
  - A Strategy names 1..n Plans, and a Plan may serve 0..n Strategies.
  - A Plan names 1..n Suites, and a Suite may serve 0..n Plans.
  - A Suite names 0..n Cases, and a Case may be in 0..n Suites. A Case is defined once. A Suite naming no Case is declared, and its result is `unknown`.
  - Only the levels a product uses are declared: Cases alone, or Suites of Cases, are a model.
  - A reference to an undeclared element is a finding, as is any key the kind does not define.

- **testing/F26** [testing/I11]: In a Run, a Case's result is `passed` or `failed` as observed. A Case that did not run, or ran as skipped or `todo`, is `unknown`. Within a Plan Run, a Case the Plan declares inapplicable, with a reason, before the run is `inapplicable`, but only when it was not observed passing or failing: a declaration never hides an observed outcome.

- **testing/F27** [testing/I11]: In a Run, a Suite or a Plan is `failed` if any of its Cases failed; otherwise `unknown` if any is unknown; otherwise `inapplicable` if all are; otherwise `passed`. A Suite or Plan with no Cases is `unknown`.

- **testing/F28** [testing/I11]: Plan evaluation. The caller may supply `allowances: [{ case, cite }]`, where `cite` is opaque to Testing.
  - An allowed failed Case stays `failed` in the results. The evaluation counts it as allowed, and lists the allowance.
  - An allowance on a Case that passed or is inapplicable is stale: it is listed and has no effect.
  - `unknown` is never allowed.
  - An allowance outside the Plan or malformed, a model finding, or an undeclared Plan is a finding, and the evaluation is `unknown`.

- **testing/F29** [testing/I11]: Evaluation takes no baseline. Any evaluation option other than `allowances` is a finding. Comparing a previous run with this one is an observation (testing/F2, testing/F3), and changes no result.

- **testing/F30** [testing/I11]: Runs.
  - A Run is of one Plan, one Suite or one Case. Each runs independently, 0..n times, and a definition that never ran is complete. A Strategy does not run.
  - A Plan Run may encompass Runs of the Plan's Suites, and a Suite Run Runs of the Suite's Cases. An encompassed Run's Case Results are the encompassing Run's too.
  - A Run is distinct from its definitions and holds its own Case Results. A Case in several Suites keeps a result per Suite in the Run, and its result in the Run aggregates them as testing/F27 does.
  - A Run's identity is its holder's, unique within the Runs it encompasses. An outcome for a Case outside the Run's element, an outcome the runner does not give, an encompassed Run of an element its parent does not contain, or a key a Run does not define is a finding.

- **testing/F31** [testing/I11]: Provenance. A Run's provenance identifies its element and every definition it executed, with the version it executed where the definition has one, and records its effective Test Data.
  - A Case Result counts for the definition the Run identifies, and only for it. An outcome for a Case the provenance does not identify is `unknown`, with a finding. A Run of another version of a Case shows nothing about the declared one: that Case is `unknown` in it.
  - The effective Test Data is the Run's, as recorded. Testing reads and compares none of its content. Effective Test Data that the model does not declare is a finding.

- **testing/F32** [testing/I10]: Test Data. A Plan, a Suite or a Case may define Test Data, and the defining context owns it. Another Plan, Suite or Case may reuse it by reference, and reuse never moves ownership. Its content is opaque to Testing and may be external, named by a locator Testing never reads. Reusing undeclared Test Data, content both given and external, or Test Data on a Strategy is a finding. Who owns and who reuses each item is derived.

- **testing/F33** [testing/I10, testing/I11]: Retention and retirement.
  - Testing keeps no Run and fixes no retention. Whether, where, how many and how long Runs are kept is the consumer's decision: it may keep none, one or many. Data's lifecycle mechanisms may serve it, and an evaluation option for it is a finding (testing/F29).
  - A retired Case stays declared, so that Runs which executed it still resolve, and keeps its trace as provenance. It is no longer executable: a Suite naming it, or a Run holding an outcome for it, is a finding, and it tests nothing now.

- **testing/F40** [testing/I11]: Current evidenced quality. Given the Runs a consumer retained, in its order with the oldest first, the current evidence for a Plan, Suite or Case is its latest applicable Run. A Run is applicable when it is a Run of that element and it, and every Run it encompasses, records the versions the model now declares for each definition and for its effective Test Data. Testing reads no clock: a timestamp a Run carries is not compared, and "latest" is the consumer's order.

- **testing/F41** [testing/I11]: No fallback. The current quality is the latest applicable Run's: its evaluation for a Plan, with the caller's allowances, and otherwise its result for the element, which is `unknown` when it has a finding. An incomplete, unknown or invalid latest applicable Run makes the current quality `unknown`, and an older Run never stands in for it. A Run that does not read cannot be shown inapplicable, so it is the latest and the quality is `unknown`. With no applicable Run, the quality is `unknown`. Each Run that is not applicable is disclosed with every difference from the model as it now stands, by element, definition version and Test Data version, so that a comparison of Runs shows its scope.

- **testing/F42** [testing/I10]: Retained Runs are the consumer's. Testing accepts zero, one or many as given, changes none and keeps none between calls. Showing quality over time takes enough retained comparable Runs, and which ones the consumer keeps is the consumer's.

## Consumer Verifier Conformance

- **testing/F43** [testing/I14]: **The scenarios.** The contract names each scenario: its identity, the one change a publisher's harness makes to a fresh consumer holding the packed candidate, and the result every conforming verifier then shows. There are at least these scenarios:
  - **verified:** a clean run; a declared case the manifest declares not applicable, with a platform scope that excludes the platform and a reason, as testing/F47 requires; a declared case that requires an optional complement the consumer has not installed, with a reason; a declared case that applies only without an optional complement the consumer has installed, with a reason (testing/F47);
  - **failed:** a declared case that fails; the consumer's content changed during the run;
  - **unknown:** no case at all, with a manifest that declares none; the manifest absent; the manifest malformed; a declared case the package does not deliver; an installed file changed, removed or added; a declared case skipped; a declared case marked todo; a declared case whose inapplicability is unsupported, because the manifest gives no platform scope that excludes the platform, or no reason; a required runtime dependency absent from the consumer; a delivered, declared case the package's runner silently leaves out on the platform; a declared case the runner replaces there with a stand-in under another identity (testing/F48).

  This is hosting/F26's minimum set. A caller cannot change the scenarios.

- **testing/F44** [testing/I14]: **Observing a run.** A run is observed from its exit status and its summary line. The summary line is the one line starting with the verifier's declared prefix, and it holds a JSON object. Its result is read through the verifier's own declared word for each of verified, failed and unknown, three distinct words. Each verifier keeps its own words, and none is translated by label alone. No summary line, two summary lines, a summary that is not a JSON object, or a result word the verifier did not declare is no observation, with a finding. Lines after the summary line, such as a package manager's own output, are ignored. The summary holds `result`, the diagnosis of testing/F49 when not verified (`cause`, `evidence` or `uncertainty`, and `next`), `package { name, version, location }`, `platform`, `node`, `digest`, and `cases`, one `{ name, outcome }` per case. A case that is `not applicable` also shows its `applicability { platforms, reason }`. An outcome is `pass`, `fail`, `skipped`, `todo`, `not applicable` or `not run`, the words hosting/F21 proposes.

- **testing/F45** [testing/I14]: **Judging an observation.** An observation conforms to a scenario only when every observable agrees with the scenario and with the facts the harness established itself: the package it installed, by name, version and real location; the platform and Node version it ran on; the digest it recomputed over the installed files; the declared cases; and the case the scenario targets.
  - The result is the scenario's, and the exit status is the result's: 0 for verified, 1 for failed and 2 for unknown (testing/A9).
  - A run that is not verified names a cause and a diagnosis that agrees with testing/F49. A verified run names neither.
  - The package, platform, Node version and digest are the harness's. In the two manifest scenarios, the digest is not compared, since a verifier may stop before computing it.
  - Where the scenario says so, every declared case is reported exactly once. The targeted case has the scenario's outcome, and every other case passed. Every reported case is a declared one. Where no case is declared, none is reported. Every reported case has a name and an outcome from testing/F44.

  Each disagreement is named, and a matching result word with any disagreement does not conform. A run with no observation never conforms.

- **testing/F46** [testing/I14]: **Claims the contract refuses.** A verifier that claims any result other than the scenario's never conforms in that scenario. In particular:
  - verified on no cases, an absent or malformed manifest, a changed, removed or added installed file, or a skipped, todo or missing case;
  - verified on a skipped, todo or unsupported case reported as not applicable (testing/F47);
  - verified on a declared case silently omitted, or replaced by a stand-in (testing/F48);
  - unknown or failed on a clean run or on a declared inapplicable case;
  - unknown or verified on a failing case or a changed consumer.

- **testing/F47** [testing/I14]: **Applicability is established, never asserted.** A case is not applicable only where the harness itself established, from the installed manifest, an explicit applicability for it, `{ platforms?, requires?, absent?, reason }`, with a nonempty reason, that excludes this run in one of three ways:
  - **platform:** `platforms` is a nonempty list of the platforms where the case applies, and it excludes the platform the run was on;
  - **optional complement needed:** `requires` is a nonempty list of the optional complements the case needs. The harness established at least one of them absent from the consumer.
  - **optional complement excluded:** `absent` is a nonempty list of the optional complements whose absence the case asserts, such as Change's cases for Graph being absent. The harness established at least one of them present in the consumer.

  No complement named in `requires` or `absent` is a required dependency of the package.

  A missing **required** dependency is not inapplicability. It is a broken installation, so the run is unknown and no case becomes not applicable through it. This follows the Owner's composition rule: a capability stands alone, and an optional complement is used through its own contract. A verifier that reports a case as not applicable conforms only when it shows that same applicability and reason. Otherwise the report is a disagreement, whatever result the verifier claims. So an ordinary skip, a todo, or a verifier's own unsupported claim of inapplicability never becomes verified. A not applicable case stays visible as `not applicable` and is never counted or reported as passed. Applicability here is the package's declared platform and complement scope. Whether a consumer's Change needs that case is Change's question, not package verification's.

- **testing/F48** [testing/I14]: **Neither evasion verifies.** `not applicable` is an accountability outcome, not a platform escape hatch, and the contract guards against both ways a platform can evade a declared case.
  - **Silent omission.** A declared case is left out on an inconvenient platform. Every declared case stays visible in the summary on every platform. A case the runner left out without an established inapplicability is `not run`, and the run is unknown.
  - **Conditional weakening.** A case runs weaker or no meaningful assertions on one platform while reporting GREEN. The declared cases, by identity, are the same on every supported platform: the harness establishes them from the one installed manifest. Only an established applicability (testing/F47) exempts a case on a platform. A stand-in reported under another identity, beside or in place of a declared case, never conforms, and the declared case stays `not run`.
  - **What is observable.** A case that keeps its identity but branches on the platform to weaker assertions is not observable in a verifier's run. Detecting it, by execution or static enforcement, is Engineering's, not this contract's.
  - **The default.** Equivalent case identity and intended assertion strength across supported platforms are the default. A platform-specific fixture is acceptable where the case's identity, its verified requirement and its assertion strength are unchanged. Weakening the verified requirement is not. Hosting is the domain-specific exception, through its own declared applicability.

- **testing/F49** [testing/I14]: **A diagnosis that claims no more than it knows.** A run that is not verified reports:
  - its observation, as `cause`;
  - what established the cause, as `evidence`, a nonempty list of statements, or its `uncertainty`, a statement, where the cause is not established, or both;
  - a next step, `next { kind, step }`, of one of three kinds:
    - **precise**, such as fixing a prerequisite and retrying, only on an established cause, with no uncertainty;
    - **diagnostic**, such as inspecting the evidence;
    - **exploratory**, whose step is `analyze`, where no justified remedy is known.

  A precise fix claimed under uncertainty is a fabrication and does not conform. A verified run reports no diagnosis.

  Testing owns this general contract and judges only the kind of step and whether the diagnosis justifies it. The step's wording and each capability's remediation belong to the owner of the Test Case, the package's verifier. The contract never requires automated recovery: a next step is guidance, and a verifier that acts on it reports the run it then observes.

- **testing/F50** [testing/I14]: **Failed or unknown is decided by what was established.** A run is **failed** only when a violation by the package as shipped is established: a declared case ran on the intact installation and failed, or the consumer's content changed during the verifier's run, which breaks the intact-consumer promise of testing/F15 that the run itself makes. A run is **unknown** when what was established is that the subject or its evidence is not the package as shipped, or is incomplete. That covers an installed file changed, removed or added; the manifest absent or malformed; a required dependency missing; and a case missing, skipped, todo, omitted, substituted or unsupportedly inapplicable. A tampered installation establishes that the bytes under test are not the shipped bytes. It establishes nothing about how the shipped package behaves, so it is unknown, never failed. Its cause can be established, so a precise next step, such as reinstalling, may conform (testing/F49). This is Testing's decision for every consumer verifier, whatever its own words.

- **testing/N9** [testing/I14]: The contract is pure. `observe` and `judge` read nothing from a host, run nothing, keep nothing and change no input. Each package's verifier depends on no Testing package, and the contract adds no runtime dependency to any product.

## Applicability by Host Fact

- **testing/F68** [testing/I18]: **A fourth way: a host fact not holding.** testing/F47's applicability becomes `{ platforms?, requires?, absent?, host?, evidence?, reason }`. A case is also not applicable where:
  - **host fact not holding:** `host` is a nonempty list of the host facts the case needs, `evidence` is an `https` link, and the harness established at least one of them not holding on this run.

  The harness establishes host facts through Hosting's `facts()` (hosting/F37) and hands them to `judge` as `facts.hostFacts`, `{ [fact]: { holds, reason, evidence } }`. A fact counts as not holding only where its entry is the harness's own, an own property, and `holds` is exactly `false`. A fact the harness did not establish, an entry whose `holds` is not a boolean, or a fact that holds excludes nothing.

  A declaration with `host` and without an `https` `evidence`, or without a reason, establishes nothing. `evidence` belongs to a `host` declaration: elsewhere it is compared, never required.

- **testing/F69** [testing/I18]: **The same applicability, shown in full.** A verifier that reports a case `not applicable` shows `applicability { platforms?, requires?, absent?, host?, evidence?, reason }`. It conforms only where each of these is the same as what the harness established: the same members, compared as sets for lists, and the same reason and evidence. This extends testing/F44's summary and testing/F47's comparison.

- **testing/F70** [testing/I18]: **Where the fact holds, the case runs.** A case declared by `host` whose facts the harness established holding on this run is an ordinary declared case. In the `clean` scenario it must be reported `pass`. Reporting it `not applicable`, `skipped`, `todo` or `not run` there never conforms. So a verifier cannot use a host declaration to leave a case out everywhere.

- **testing/F71** [testing/I18]: **Verification, not legitimacy.** `judge` decides whether a verifier reported honestly what the harness established. Whether a declaration is permitted is not `judge`'s:
  - which facts exist, and the rules for declaring them, are Hosting's (hosting/F37, hosting/F39);
  - a platform scope outside the operating-system boundary is a violation that Hosting's audit (hosting/F40) and parity (testing/F67) report. `judge` keeps testing/F47's platform way unchanged, so the planned tests of the verifier contract stand;
  - whether a host exception is genuine is Review's judgment on Hosting's review request (hosting/F40).

  The `not-applicable` scenario covers a host fact as well as a platform scope. No scenario is added, so testing/F43's set and testing/T54 are unchanged.

- **testing/N14** [testing/I18]: `@kaihacksai/kaal-testing/verifiers` still reads no host, runs nothing and imports nothing (testing/N9). Host facts reach it only as data the harness established through Hosting. Testing never tries a FIFO, a socket or any other host capability itself.

## Cross-Platform Inventory Parity

- **testing/F56** [testing/I16]: **One candidate, every supported platform, the same cases.** Parity reads one `{ observed, facts }` per run, as testing/F44 observed it and as the harness established it, together with the platforms the package declares it supports (packaging/F12). It holds only when all of these are true:
  - there is exactly one run on each supported platform, and none on another platform;
  - every run is of one candidate: the same package name, version and digest;
  - every run's harness established the same declared cases;
  - at least one case is declared.

  Anything else is a finding, and the runs together are unknown. The same is true of runs that are not a list, no supported platforms, or a supported platform named twice.

- **testing/F57** [testing/I16]: **Every declared case is visible on every platform.**
  - On each platform, each declared case is reported exactly once. A case left out, reported twice or replaced by a stand-in under another identity is a finding, and the case is `not run` there. A reported case that is not declared is a finding.
  - A case is `not applicable` on a platform only where it shows the applicability that the harness established there (testing/F47). Otherwise the claim is a finding, and the case is `not run` there.
  - `not applicable` stays `not applicable` and is never counted as `pass`.
  - A case that is `not applicable` on every supported platform is exercised on none. That is a finding that names it.

  Parity gives each case's outcome on each platform.

- **testing/F58** [testing/I16]: **What the runs establish together.**
  - The runs are **failed** when any platform's run is failed (testing/F50), whatever else is found.
  - Otherwise they are **verified** only when every platform's run is verified, nothing is found, and every case passed or is established not applicable on each platform.
  - Otherwise they are **unknown**. This includes a platform with no observation, a violation of testing/F67, and a case with an unresolved challenge finding. The challenge findings come from Hosting's cross-capability suite and review, or from Engineering's enforcement, and are given as `challenged`, a list of case names.

  A challenge finding never verifies, and it never turns a failure into anything else.

- **testing/F67** [testing/I16]: **Only the operating-system boundary scopes a case by platform.**
  - Hosting is the only KAAL capability in which operating-system-specific behaviour is acceptable, in its solution and in its tests. Every other capability stays OS-agnostic.
  - A case exempted on a platform by a platform scope (testing/F47 `platforms`) is an exemption only where the harness established that the package is the operating-system boundary, given as `osBoundary: true`.
  - In any other package, a platform scope is an **architectural violation**, never an exemption. It is a finding that names the case and the platform scope. The case is `not run` on each platform where it claimed the exemption, and the runs are unknown.
  - Whether a package is the boundary is established, never assumed. A value other than `true` or `false` is a finding.
  - An applicability by optional complement (`requires`, `absent`) stays open to every package. It depends on what the consumer installed, not on the operating system.
  - Testing authorizes no operating-system exception. Which capability is the boundary is Hosting's architectural rule. Testing only refuses to count a platform scope outside it as evidence.

- **testing/N11** [testing/I16]: Parity is pure, as testing/N9 states for the contract: `parity` reads nothing from a host, runs nothing, keeps nothing and changes no input. How each platform is run is Engineering's. Detecting operating-system-specific implementation, assertions, test selection and applicability outside Hosting is Hosting's suite and review guidance, run by Engineering.

## BRITTLE

- **testing/F72** [testing/I19]: **The term.** BRITTLE, Be Right Improving Testing Targets Learned Experience, is Testing's term and concern. A Test Case is brittle when its verdict follows something other than its target:
  - a **false RED** rejects a change the target permits, such as an extension its Architecture authorizes;
  - a **false GREEN** accepts a real violation of the target.

  Either is a defect of the Test Case, not of its subject. A false RED blocks legitimate work. A false GREEN hides a violation, which is the worse failure, because no run reveals it.

- **testing/F73** [testing/I19]: **Designing a Case that challenges its target.**
  - **The target's authority.** Take each expectation from the target the Case traces to, and from the authority that states it, outside the candidate. Never take it from a snapshot of the candidate's own current shape.
  - **What the target fixes.** Assert exactly what the target fixes. Use equality where the target states exactness, and containment or a property where it states a minimum, a closed set with an extension point, or a rule.
  - **Closed vocabularies.** Read a closed vocabulary strictly, such as a status, a kind or a result word. An unknown or misspelled value is a finding, never a default and never optional.
  - **Discrimination.** Pair the Case's positive with a discriminating negative for each way the target can be violated, and with a positive for each extension the target authorizes. A negative that the unchanged candidate would also fail discriminates nothing.

- **testing/F74** [testing/I19]: **Learning from a lesson.** An observed false RED or false GREEN is a lesson. The Change that corrects it records it with:
  - the Case;
  - its kind, false RED or false GREEN;
  - the target the Case traces to;
  - the incidental detail it froze, or the violation it missed;
  - the correction.

  The correction is a new version of the Case, or a new Case, that traces to the same target (testing/F24, testing/F25). So no Run of the brittle version stands for it any longer (testing/F40). A false GREEN that let a real violation through is also a Defect: a durable prohibited behaviour, traced by a Case that tests it. A later GREEN evidences the correction and never erases the Defect. Each lesson informs the next PLAN's Test Case design ("Inform Next Generation").

- **testing/F75** [testing/I19]: **Who owns what.**
  - Testing owns the term, the design checks and the shape of a lesson. That is verification.
  - Review owns the judgment of whether a change is a legitimate extension, and whether a Case is brittle where no check decides it. That is validation. Review may consume BRITTLE in its own guidance.
  - Each capability owns its Cases, corrects them, and records its own lessons where its PLAN lives.

- **testing/N15** [testing/I19]: BRITTLE adds no runtime code, no model kind and no registry. Testing keeps no registry of tests, findings or lessons. A lesson lives in the owning capability's PLAN, and its correction lives in that capability's model and tests.

## Test Locations by Purpose and Owner

- **testing/F76** [testing/I20]: **The locations.**
  - **`test/embed/`** holds a capability's own cases. They ship with its package, and its own `npm test` runs them against the installed copy. `discover` never reads them.
  - **`test/engineer/`** holds Engineering's lane scenarios for that workspace's package. Each one `install()`s the run's packed tarballs. `discover(workspaces)` gives every `*.test.mjs` directly in it.
  - **No other location.** There is no `test/external/` convention, and `discover` reads no other location except testing/F77's.

  The location alone decides. Neither `package.json` `files` nor any other declaration changes what `discover` gives.

- **testing/F77** [testing/I20]: **A bounded migration.** Until the migration completes, `discover` also reads `test/acceptance/` as the lane's, beside `test/engineer/`. So no lane scenario is lost before its owner moves it. The migration completes once no workspace keeps `test/acceptance/`, and then `discover` stops reading it.

- **testing/F78** [testing/I20]: The README's acceptance section states the locations:
  - `test/embed/` holds a capability's own cases, run by its own `npm test`;
  - `test/engineer/` holds Engineering's lane scenarios, which `install()`;
  - there is no `test/external/`;
  - locations are not Testing kinds.

- **testing/N16** [testing/I20]: `discover`'s signature and result shape are unchanged: `[{ workspace, path }]`, sorted by path. It still reads through Hosting only and writes nothing. No Testing kind, model field or trace is added.

## Testing 0.0.1 Release Readiness

- **testing/F59** [testing/I17] (packaging/F7): **Identity.**
  - The package is named `@kaihacksai/kaal-testing`, at version `0.0.1`, with `publishConfig.access` set to `public`. Its `repository` names `packages/skills/kaal-testing`.
  - Its runtime dependencies are exact registry versions: `c8` `12.0.0` and `@kaihacksai/kaal-hosting` `0.0.1`. Every development dependency is an exact version too, and none is a workspace, file or Git dependency.
  - Its `exports` are unchanged.
  - No reference to it by its old name remains. Each module specifier, dependency entry, workspace selector and `package-lock.json` entry becomes the new name in the same Change, as hosting/F16 states for Hosting. There is no alias.
  - **Why Hosting is a runtime dependency.** Installed behaviour needs it, not the publisher's tooling. Three shipped exports execute commands and read or write the host, and Testing may not know the operating system, so they do that only through Hosting:
    - `@kaihacksai/kaal-testing/acceptance` installs packed tarballs into fresh hosts, runs the scenarios and keeps the ledger (`execute`, `initialize`, `kind`, `read`, `readFile`, `update`);
    - `@kaihacksai/kaal-testing/coverage` runs a workspace's tests under `c8` and reads the summary (`execute`, `kind`, `readFile`), which is also why `c8` is a runtime dependency;
    - `@kaihacksai/kaal-testing/contracts` imports `@kaihacksai/kaal-testing/acceptance`.

    Every other export, `@kaihacksai/kaal-testing/model` and `@kaihacksai/kaal-testing/verifiers` among them, imports nothing. A consumer that imports only those still installs Hosting, because npm has no per-export dependency.
  - **So Hosting's 0.0.1 publication is a prerequisite of Testing's.**

- **testing/F60** [testing/I17] (packaging/F8): **Shipped documents.**
  - The package ships `docs/intent.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/testing.md`, `docs/limitations.md` and `docs/operations.md`.
  - They consolidate the PLAN documents, and they are authoritative. They define, once, each Testing identifier a shipped case's `tests` names.
  - None cites a PLAN document's path, a Change, an Engineering path or a pull request as its authority. Each links only files that ship.
  - `docs/operations.md` covers installation, use, verification and removal, and lists the shipped files under `## Shipped files`.
  - The README keeps the overview and links each document.

- **testing/F61** [testing/I17] (packaging/F9, packaging/N9): **Delivered cases.**
  - The package ships its consumer Test Cases as plain `node:test` JavaScript that needs only Node 24: the outer acceptance loops and the inner Code loop, all in `test/embed/`. That is a location, not a kind: each case's loop is its trace in the model.
  - They reach the package only by its name, so they exercise the installed copy. They read no repository checkout, and they write only to the operating system's temporary directory.
  - Each case decides its Requirement from behaviour or bytes, never from a file's presence.
  - Cases that verify the publisher's process stay the publisher's, as the planned tests and the Engineering tests do. They are allocated in `docs/testing.md` (testing/F66).

- **testing/F62** [testing/I17] (packaging/F14, packaging/A11): **One test entry, two places.**
  - In the source workspace, `npm test` runs every suite the package declares as a `test:<name>` script: at least `test:publisher` (the publisher's suite, with the workspace builds it needs) and `test:consumer` (the installed verification). It never invokes itself.
  - In an installation, `npm test` runs `test:consumer` only.
  - Which place applies is detected explicitly, never inferred from a missing file, as foundation/F9 states. When the place cannot be told, the result is unknown.
  - Asked with `--list` (`npm test -- --list`), the entry runs nothing. It prints one line `kaal-testing-suite <script>` for each suite it would run in the detected place, and it runs exactly those suites otherwise.
  - No `pretest` step runs.

- **testing/F63** [testing/I17] (packaging/F10): **One result, by the shared contract.**
  - The installed verification, `test/verify.mjs`, ends in exactly one of Testing's results: `verified`, `failed` or `unknown` (testing/F13). The exit statuses are 0, 1 and 2 (testing/A9).
  - It prints one summary line starting `kaal-testing-verification `, holding the JSON summary of testing/F44.
  - It decides failed and unknown as testing/F50 states, and diagnoses as testing/F49 states.
  - It conforms to every scenario of testing/F43 and testing/F50 in Engineering's harness.

- **testing/F64** [testing/I17] (packaging/F11): **Shipped manifest.** `test/verify.json` holds:
  - `hashes`: the SHA-256 of every other shipped file;
  - `cases`: the delivered cases, by name;
  - `model`: the delivered cases as Testing's own model (testing/F66);
  - `applicability`: testing/F47's form, per case. It is empty, because no delivered case is scoped by platform (testing/F65) and Testing 0.0.1 has no optional complement;
  - `platforms`: testing/F65's list.

  The run's `digest` is the SHA-256 of one line `<path>\0<sha256>\n` per installed file other than the manifest and the copy's own `node_modules`, in path order, as hosting/F22 states. Consistency with the manifest is not provenance (testing/F14).

- **testing/F65** [testing/I17] (packaging/F12): **Platforms and runtime, by Hosting's boundary.**
  - The package declares portability: it supports Linux, macOS and Windows on Node 24 or later. `engines` and the manifest's `platforms` state this.
  - Testing authorizes no OS-specific exemption. No delivered case is scoped by platform. Applicability could name only optional complements (`requires`, `absent`), and Testing 0.0.1 has none, so no delivered case is inapplicable anywhere. Every delivered case runs, with the same identity and assertions, on every supported platform.
  - No shipped file branches on the operating system. Every command, read and write the shipped library makes goes through Hosting.
  - Hosting owns OS-specific behaviour, in solutions and in tests. Its cross-capability boundary suite and review guides (`@kaihacksai/kaal-hosting/boundary`) challenge this package's implementation, test selection, assertions and applicability. Their result on the candidate is release evidence, and Testing does not restate their rule.

- **testing/F66** [testing/I17] (packaging/F13): **Traceability, derived.**
  - Each delivered case is a Case in Testing's own model (testing/F25), and its `tests` names the Testing identifiers it verifies. The manifest's `model` is that model, and `check` (testing/F24, testing/F25) finds nothing in it.
  - Every target a delivered case names is an identifier defined in `docs/`.
  - Whether an identifier is evidenced is derived, never declared: `tested(model)` gives the Cases that test it, and its evidence is their latest relevant Run (testing/F40). There is no coverage map beside the model and no allocated or unverified state.
  - The verifier's own conformance to testing/F43 and testing/F50, cross-platform parity and the publisher's planned tests are Cases of the publisher's Engineering Test Plan. They are not delivered and not in the shipped model.

- **testing/N12** [testing/I17] (packaging/N7, packaging/N8):
  - The verification leaves the whole consumer intact, its installed packages included, as testing/F15 states. It writes only in a scratch space it removes.
  - `test/verify.mjs` imports only Node's built-ins, never the package's own `lib/`, so a broken library cannot mask itself. The same holds for hosting/N4.

- **testing/N13** [testing/I17] (packaging/N9): No delivered case reads this repository, its PLAN documents or another package's sources.

## Run Timing

## Functional

- **testing/F79** [testing/I21]: **Durations are given, never measured.** A run's timing is `{ cases: [{ name, ms }] }`: each case's name and its duration in milliseconds, as the harness recorded it (for example from Node's test runner). Testing reads no clock. The profile is `unknown`, with a finding for each problem and no challenge, when:
  - there is no run, or its cases are not a list;
  - a case has no name, or is named twice;
  - a duration is not a finite number of 0 or more;
  - the run has fewer cases than the minimum, 5 by default;
  - the run spent no time at all;
  - an option is unknown or out of range.

  Otherwise the profile is `challenged`, with each challenge, or `unchallenged`. The run given is not changed.
- **testing/F80** [testing/I21]: **Concentration.** Sort the cases slowest first. The slowest share is the slowest `1 − share` of the cases, rounded down to whole cases, and at least one case. The run is challenged when that slowest share took more than `budget` of the run's total time. The defaults are `share` 0.8 and `budget` 0.8: 80% of the cases must take more than 20% of the time, and equivalently the slowest 20% may take at most 80%. Exactly the budget is within it. The challenge names the cases in that share, the share of the cases they are (`caseShare`), and the share of the time they took (`timeShare`). The caller may give its own `share` and `budget`.
- **testing/F81** [testing/I21]: **Outliers.** A case is an outlier when it took more than `outlier` times the run's median case and more than `floor` milliseconds. The defaults are 10 and 1000. Exactly the multiple is within it. Each outlier challenge names the case, its `ms` and the `median`. A run whose cases are all slow alike has no outlier: it is judged against its own distribution. The caller may give its own `outlier` and `floor`.
- **testing/F82** [testing/I21]: **Platform skew.** Given one run per platform for one candidate, `{ platform, cases }` each, a case is skewed on a platform when it took more than `factor` times the median of its durations on the other platforms, and more than `floor` milliseconds. The default `factor` is 4, and exactly the factor is within it. Each skew challenge names the case, the platform, its `ms` and the other platforms' median (`others`). The skew is `unknown`, with a finding for each problem, when:
  - the runs are not a list;
  - a run names no platform, or a platform is given twice;
  - fewer than two platforms are given;
  - any platform's durations do not read under testing/F79, named with that platform;
  - the platforms' runs do not hold the same cases, naming each case and the platform it did not run on.
- **testing/F83** [testing/I21]: **A challenge is evidence, never a result.** A profile or skew is `challenged`, `unchallenged` or `unknown`, never `failed`, `verified` or `passed`. Timing does not change any run's result, a verifier's summary or parity. Each challenge states in words what it found (`statement`) and the next step it asks for (`next`), and names its `owner`:
  - `case owner` for concentration, outliers and platform skew. For concentration the owning suite and its Case owners investigate the distribution; for an outlier or skew the named Case owner investigates first.

  Timing alone does not establish a cause. A skew is a platform difference, not proof of an operating-system defect. The Case owner consults Hosting when investigation demonstrates a host-specific cause; confirmed operating-system-boundary defects belong to Hosting (testing/F67). Testing never assigns such a defect from durations alone.

## Nonfunctional

- **testing/N17** [testing/I21]: Profiling is pure and deterministic. It reads no clock and no host, runs nothing, keeps nothing and imports nothing. The same durations give the same result, the same challenges in the same order and the same findings, whatever order the cases or the platforms' runs were given in.
