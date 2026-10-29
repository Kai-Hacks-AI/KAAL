# Testing Model: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **testing/N7** [testing/I10]: Subjects are opaque. A Case's **tests →** subjects are nonempty strings, and Testing validates, enumerates and restricts no subject kind. The view of which Cases test a subject is derived from the Cases' outgoing traces. The model accepts no declared incoming trace.
- **testing/N8** [testing/I11]: The model is pure and deterministic. Given the same model, observed outcomes and options, it gives the same result. It reads nothing from a host, writes nothing, reads no clock and changes no input.

## Functional

- **testing/F24** [testing/I10]: Identities belong to their holder. Every Strategy, Plan, Suite and Case has an identity, a nonempty string its holder assigns, unique across the model so that references resolve. Testing prescribes no format, prefix or numbering. A missing, empty or duplicate identity is a finding.
  - KAAL's own Cases follow testing/N2, `<capability>/T<n>`. That is KAAL's internal convention, enforced by KAAL's own Engineering checks, and the generic model neither requires nor checks it.
- **testing/F25** [testing/I10]: Relationships, each outgoing and stated once.
  - A Strategy names its Plans, a Plan its Suites and a Suite its Cases.
  - A Case is defined once and may be in several Suites.
  - Only the levels a product uses are declared: Cases alone, or Suites of Cases, are a model.
  - A reference to an undeclared element is a finding, as is any key the kind does not define.
- **testing/F26** [testing/I11]: A Case's result is `passed` or `failed` as observed. A Case that did not run, or ran as skipped or `todo`, is `unknown`. Within a Plan, a Case the Plan declares inapplicable, with a reason, before the run is `inapplicable`, but only when it did not run: a declaration never hides an observed outcome.
- **testing/F27** [testing/I11]: A Suite or a Plan is `failed` if any of its Cases failed; otherwise `unknown` if any is unknown; otherwise `inapplicable` if all are; otherwise `passed`. A Suite or Plan with no Cases is `unknown`.
- **testing/F28** [testing/I11]: Plan evaluation. The caller may supply `allowances: [{ case, cite }]`, where `cite` is opaque to Testing.
  - An allowed failed Case stays `failed` in the results. The evaluation counts it as allowed, and lists the allowance.
  - An allowance on a Case that passed or is inapplicable is stale: it is listed and has no effect.
  - `unknown` is never allowed.
  - An allowance outside the Plan or malformed, a model finding, or an undeclared Plan is a finding, and the evaluation is `unknown`.
- **testing/F29** [testing/I11]: Evaluation takes no baseline. Any evaluation option other than `allowances` is a finding. Comparing a previous run with this one is `testing/C4`'s observation, and changes no result.
