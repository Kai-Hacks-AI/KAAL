# Testing Model: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **testing/N7** [testing/I10]: Subjects are opaque. A Case's **tests →** subjects are nonempty strings, and Testing validates, enumerates and restricts no subject kind. The view of which Cases test a subject is derived from the Cases' outgoing traces. The model accepts no declared incoming trace. The trace does not define its subject's semantics: no result, status or finding speaks of a subject, and a Case's result is the Case's, never its subject's.
- **testing/N8** [testing/I11]: The model is pure and deterministic. Given the same model, Run and options, it gives the same result. It reads nothing from a host, writes nothing, reads no clock, keeps nothing between calls and changes no input.

## Functional

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
- **testing/F29** [testing/I11]: Evaluation takes no baseline. Any evaluation option other than `allowances` is a finding. Comparing a previous run with this one is `testing/C4`'s observation, and changes no result.
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
  - Testing keeps no Run and fixes no retention. Whether, where, how many and how long Runs are kept is the consumer's decision: it may keep none, one or many. Data's lifecycle mechanisms may serve it, and an evaluation option for it is a finding (testing/F29) (amended by `testing/C27`).
  - A retired Case stays declared, so that Runs which executed it still resolve, and keeps its trace as provenance. It is no longer executable: a Suite naming it, or a Run holding an outcome for it, is a finding, and it tests nothing now.
- **testing/F40** [testing/I11] (`testing/C27`): Current evidenced quality. Given the Runs a consumer retained, in its order with the oldest first, the current evidence for a Plan, Suite or Case is its latest applicable Run. A Run is applicable when it is a Run of that element and it, and every Run it encompasses, records the versions the model now declares for each definition and for its effective Test Data. Testing reads no clock: a timestamp a Run carries is not compared, and "latest" is the consumer's order.
- **testing/F41** [testing/I11] (`testing/C27`): No fallback. The current quality is the latest applicable Run's: its evaluation for a Plan, with the caller's allowances, and otherwise its result for the element, which is `unknown` when it has a finding. An incomplete, unknown or invalid latest applicable Run makes the current quality `unknown`, and an older Run never stands in for it. A Run that does not read cannot be shown inapplicable, so it is the latest and the quality is `unknown`. With no applicable Run, the quality is `unknown`. Each Run that is not applicable is disclosed with every difference from the model as it now stands, by element, definition version and Test Data version, so that a comparison of Runs shows its scope.
- **testing/F42** [testing/I10] (`testing/C27`): Retained Runs are the consumer's. Testing accepts zero, one or many as given, changes none and keeps none between calls. Showing quality over time takes enough retained comparable Runs, and which ones the consumer keeps is the consumer's.
