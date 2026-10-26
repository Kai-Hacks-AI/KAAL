# RED Evidence and Feature-Accepted Regressions: Intent

This is `testing/C4`, a PLAN Change. It ships no code. `testing/C5` turns its tests GREEN.

The Owner's review of #381 (review 5643166494) found that `node:test` `todo` and `skip` markers hide RED evidence. It routed the governance of failing tests to PLAN.

The Owner's review of this PLAN (review 5658056782 on #385) set the frame:

- **Established behavior.** Existing Test Cases protect established behavior on `main`.
- **New Feature Test Cases.** A new Feature Test Case normally starts RED on a `kaal/*` collector and turns GREEN through implementation. A new Test Case that is already GREEN is legitimate too.
- **Testing's part.** Testing observes outcomes and identifies regressions against established behavior. It uses the evidence semantics of `testing/C8`, so unknown evidence is never read as absent or new.
- **When a Feature breaks an existing Test Case.** The agent first seeks a solution that satisfies both the Feature and the existing protection. Only a genuine conflict leads to FAR (Features Accept Regression): a list of regressions proposed to the Owner for negotiation. The Owner may accept, reject or narrow it, or require a redesign.
- **What acceptance never does.** An accepted regression stays RED, and is never reported as GREEN. An accepted change in behavior may need a separately authorized PLAN amendment. Established tests are never rewritten silently.

Three owners share the subject:

- **Testing** owns observed evidence, classification and deterministic evaluation. That is this Change.
- **Change** owns FAR: the proposal, the negotiation and the decision authority.
- **Engineering** owns the development and promotion gates, and Guard executes their checks.

The Intents:

- **testing/I1**: A RED is evidence and is never hidden. Every failing Test Case is reported under its own identity and class, and nothing presents a failure as GREEN. This includes a skipped or `todo` test, an accepted regression, and an established Test Case that disappeared.
- **testing/I2**: A regression is judged against established behavior, from observed evidence only. A Test Case is a regression only when the base observed it GREEN. It is new only when the base observably did not have it. Evidence that is unknown stays unknown, and never counts as absent, new or GREEN.
- **testing/I3**: Testing evaluates but neither decides nor gates. Testing holds no acceptance:
  - It consumes the structured outcome of a Change's FAR decision, and it never stores, grants or extends one.
  - It evaluates deterministically against the policy a gate supplies, and it names no gate of its own.
  - The authority to accept is the Change's. The gates are Engineering's, and Guard executes them.
