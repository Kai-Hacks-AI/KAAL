# Gaps (A to B)

Where the present state differs from a target requirement. Each gap names its target and its closing condition: the Case that judges it closed, or, where the gap awaits an Owner decision or a documented limit, that decision (a Case may follow it). A gap is an observation, not a gate (Owner and CPO decide whether it becomes a Case, a decision or a documented limit).

- **release-management/G1.** version Package: no check that the version is greater than the latest published.

  Target: F3.

  Difference: the readiness check refuses a non-semver version and a version already on the registry, but not a lower one.

  Done when: Case T1 is green.

- **release-management/G2.** version Package: no tag marks the released commit.

  Target: F3.

  Difference: a release creates no tag and verifies none.

  Done when: Case T2 is green.

- **release-management/G3.** version Package: no check that the version was set by a recorded Change.

  Target: F3.

  Difference: nothing ties the version in `package.json` to a Change record.

  Done when: Case T3 is green.

- **release-management/G4.** version Package: no changelog or bump tooling; versions are hand-edited.

  Target: F3.

  Difference: the target says a version is named once and traceable to its Change; how the bump is made is open for the Owner.

  Done when: the Owner decides (a Case, a decision or a documented limit).

- **release-management/G5.** approve Publishing: the approval is a GitHub environment gate and the release record does not say who approved.

  Target: F1.

  Difference: the record binds run, commit and digest but does not name the approving run.

  Done when: Case T4 is green.

- **release-management/G6.** approve Publishing: the environment and trusted-publisher settings are outside the repository and unverified.

  Target: F1.

  Difference: the `npm` environment's reviewer and the npmjs trusted-publisher binding are not readable from the repository.

  Done when: the Owner records them as verified, with the evidence.

- **release-management/G7.** approve Publishing: a first publication of a package is manual (F34) and outside the workflow.

  Target: F1.

  Difference: the engine gives the Owner the steps of a first publication; the workflow publishes only a package npm already knows.

  Done when: the Owner decides whether a first publication stays manual.

- **release-management/G8.** approve Publishing: the trusted publisher lapses without a workflow publish (observed 10 Nov) and nothing in the repository reminds of it.

  Target: F1.

  Difference: no reminder or check exists for the lapse.

  Done when: the Owner decides (a Case, a decision or a documented limit).

- **release-management/G9.** verify Package Promotion: nothing records which promotion put the commit on `main` (promotion PR, ledger entry), so promoted `main` state holds by the dispatch restriction only.

  Target: F2.

  Difference: the release record does not name the promotion.

  Done when: Case T5 is green.

- **release-management/G10.** verify Package Promotion: acceptance runs once after publication, with no later re-check.

  Target: F2.

  Difference: the published bytes are compared once, at acceptance.

  Done when: the Owner decides whether a later re-check is wanted.

- **release-management/G11.** verify Package Promotion: for a package published by hand, provenance is "none" by design.

  Target: F2.

  Difference: a hand publication carries no provenance to check.

  Done when: the Owner confirms this as a documented limit.

- **release-management/G12.** verify Package Promotion: the installed verification cannot judge a package whose peer dependencies are optional.

  Target: F2.

  Difference: the installed verification installs only the tarball and its dependencies. Change declares Graph as an optional peer, so the verification of Change would report `cannot verify`. Found by the Change thread (the Defect record #1333).

  Done when: the Owner decides whether F2 states that the installed verification installs a package's optional peers, and a Case judges it.
