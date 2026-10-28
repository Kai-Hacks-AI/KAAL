# Features Accept Regression: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **change/N3** [change/I8]: Checking and deciding are pure and deterministic.
  - They read nothing from the host and write nothing.
  - They do not read the clock.
  - They never change their input.
  - The same proposals and decisions give the same result.
- **change/N4** [change/I5]: FAR is optional. With no decided proposals, the outcome is empty, which Testing reads as nothing accepted.

## Functional

- **change/F7** [change/I5, change/I6]: A FAR proposal holds these members:
  - `change`: the proposing Change's identity, `<namespace>/C<n>`;
  - `intent`: a reference to the Intent the Change realizes;
  - `tests`: at least one entry, each with three members:
    - `test`: an identity `<namespace>/T<n>`;
    - `class`: `regression` or `missing`, the only classes `testing/F5` lets an acceptance cover;
    - `protects`: the commitment the Test Case protects.
  - `reason`: why the conflict cannot be resolved for both sides;
  - `alternatives`: at least one alternative considered.

  A member that is missing, empty or malformed is a finding naming it, and so is a Test Case listed twice. A proposal with any finding can be decided on, but it yields no outcome.
- **change/F8** [change/I7]: A decision on a proposal holds these members:
  - `decision`: `accept`, `reject`, `narrow` or `redesign`;
  - `by`: the deciding authority the repository designates;
  - `evidence`: a reference to where the decision was made, such as a review.

  Only `narrow` lists `tests`, a nonempty strict subset of the proposed Test Cases. Anything else is a finding, and the decision yields no outcome.
- **change/F9** [change/I7, change/I8]: What a well-formed decision on a well-formed proposal yields:
  - `accept` yields one outcome entry with every proposed Test Case;
  - `narrow` yields one outcome entry with its subset;
  - `reject` and `redesign` yield none.

  An outcome entry is exactly `{ change, tests }`: the proposing Change, and identities sorted. It never names a Test Case the proposal did not name, and it carries no class, reason or authority.
- **change/F10** [change/I8]: Decided proposals are assembled into the `far` list a gate hands to Testing:
  - one entry per accepted or narrowed proposal, sorted by Change;
  - two decisions for one Change are a finding, and neither is handed on;
  - every finding of change/F7 and change/F8 is reported with its Change.
