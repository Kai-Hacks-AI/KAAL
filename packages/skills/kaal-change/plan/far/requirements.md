# FAR, Features Accepted Regression: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **change/N3** [change/I8]: Every function is pure and deterministic.
  - It reads nothing from the host and writes nothing.
  - It does not read the clock.
  - It never changes its input.
- **change/N4** [change/I7]: A record without an Accept yields no exceptions, and its FAR composes from the two Plans alone.

## Functional

- **change/F7** [change/I5, change/I6]: A FAR record names its integration and the two Plans.
  - **`integration`** is `{ source: { change, revision }, target: { name, baseline } }`.
    - `change` is the incoming Change's identity, `<namespace>/C<n>`.
    - The revisions and the target name are Engineering's evidence. Change only compares them.
  - **`features`** is `{ plan, at }`. `at` must equal the source's revision.
  - **`regression`** is `{ plan, at }`. `at` must equal the target's baseline.
  - **`accept`** is optional, and holds `{ proposal, decision }`.

  A Plan reference is a Plan identity in its owner's namespace. A missing or malformed member, or an `at` that is not the revision its Plan must be read at, is a finding.
- **change/F8** [change/I6, change/I7]: An Accept proposal holds these members:
  - `intent`: the Intent the incoming Change realizes;
  - `entries`: at least one, each `{ case, justifiedBy, protects }`;
  - `reason`;
  - at least one of `alternatives`.

  Checked against the two Plans' Cases, each of these is a finding naming it, judged by identity:
  - a `case` that is not in the Regression Plan;
  - a `case` that is in the Features Plan;
  - a `justifiedBy` that is empty, or names a Case that is not in the Features Plan;
  - a `case` listed twice;
  - a missing or empty member.
- **change/F9** [change/I7]: A decision is `accept`, `reject`, `narrow` or `redesign`, with `by` and `evidence`. Only `narrow` lists `cases`, a nonempty strict subset of the proposed Cases. Anything else is a finding.
- **change/F10** [change/I7]: Exceptions for one integration.
  - **What is produced.** Given a record and the integration Engineering gates, `exceptions` gives the Regression Plan's `[{ case, cite }]`:
    - every proposed Case, when accepted;
    - the subset, when narrowed;
    - none, when rejected, redesigned or carrying a finding.
  - **The cite.** It names the Change and its integration.
  - **No transfer.** When the gated integration differs from the record's in any member, it gives no exceptions and a finding: the source's Change or revision, the target, or the baseline.
  - **Features.** Exceptions are never produced for the Features Plan.
- **change/F11** [change/I5, change/I6, change/I8]: `compose` takes the gate's two evaluations, each `{ plan, at, exceptions, result }`, where `result` is Testing's plan evaluation. It returns `{ features, regression, accepted, findings }`, and gives these as findings:
  - an evaluation of another Plan, or of a Plan read at another revision, than the record names;
  - a Features evaluation given any exception;
  - Regression exceptions that differ from F10's.

  `accepted` lists the Cases Testing reports excepted, still RED.
