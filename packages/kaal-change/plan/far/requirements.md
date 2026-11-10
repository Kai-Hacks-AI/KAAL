# FAR, Features Accepted Regression: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **change/N3** [change/I8]: Every function is pure and deterministic.
  - It reads nothing from the host and writes nothing.
  - It does not read the clock.
  - It never changes its input.
- **change/N4** [change/I7]: A record without an Accept yields no exceptions, and its FAR composes from the two Plans alone.

## Functional

- **change/F7** [change/I5, change/I6, change/I24]: A FAR record names its integration and the two Plans. *Revised: it is keyed to the Change and to Case identities and digests, not to revisions.*
  - **`integration`** is `{ change, boundary }`.
    - `change` is the incoming Change's identity, `<namespace>/C<n>`.
    - `boundary` is `{ from, into }`, the one boundary the record serves, such as a Change's branch into a collector, or the collector into `main`. Engineering names it. Change only compares it.
  - **`features`** is `{ plan, cases }`: the Features Plan and the identity and content digest of each of its Cases, as the PLAN established them.
  - **`regression`** is `{ plan, cases }`: the Regression Plan and the identity and content digest of each Case the Accept names. The Accept authorizes those Cases only. The complete Regression Plan that the gate evaluates is still the target's, selected at the integration's protected baseline (change/I6), so a Case the target gained after the PLAN landed is evaluated with no exception.
  - **`authorization`** (required when the record holds an Accept, absent otherwise) is `{ plan, by, evidence }`: the PLAN Change that established the record, the designated authority that decided it, and the evidence of that decision (change/F50). It holds no commit: a commit cannot contain its own hash, so the landing commit is resolved by the gate and given as data (change/F50).
  - **`accept`** is optional, and holds `{ proposal, decision }`.

  **Definition is not execution.** The PLAN establishes the Cases: their identities, their content and their digests, read from the trusted landing commit. The DO never defines them. At integration, those same immutable planned Cases are executed against the candidate's head, with the Features Plan unexcepted. A Plan or Case the DO supplies in their place is not read, and a difference from the landing is a finding (change/F51). If a Features Case is meant to be authored only in the DO, this record cannot carry it, and that needs a different explicit contract, not a silent exception.

  A Plan reference is a Plan identity in its owner's namespace. A missing or malformed member is a finding. Source and target revisions are no longer members: they stay Engineering's evidence of where it read the Plans, and a revision alone neither authorizes nor voids an Accept.
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
- **change/F10** [change/I7, change/I24]: Exceptions for one integration. *Revised: bound to the Change and the boundary, and to each excepted Case's digest.*
  - **What is produced.** Given a record and the integration Engineering gates, `exceptions` gives the Regression Plan's `[{ case, cite }]`:
    - every proposed Case, when accepted;
    - the subset, when narrowed;
    - none, when rejected, redesigned, unauthorized (change/F50) or carrying a finding.
  - **The cite.** It names the Change, the boundary and the PLAN that authorized it.
  - **No transfer.** When the gated integration differs from the record's in the Change or the boundary, it gives no exceptions and a finding. A different source revision or target baseline alone gives none of these. A Case whose content digest differs from the record's is a finding, and its Accept does not apply.
  - **Features.** Exceptions are never produced for the Features Plan.
- **change/F11** [change/I5, change/I6, change/I8]: `compose` takes the gate's two evaluations, each `{ plan, definedAt, at, exceptions, result }`, where `result` is Testing's plan evaluation. **Two revisions, never confused.** `definedAt` is the revision the Cases' definitions were read from, and `at` is the revision they were executed against. `compose` is given the gate's independently resolved revisions and finds an evaluation whose `definedAt` is not the one supplied for its Plan (the PLAN's landing for Features, the protected baseline for Regression), and one whose `at` is not the candidate's head. It returns `{ features, regression, accepted, findings }`, and gives these as findings:
  - an evaluation of another Plan, or of a Plan read at another revision, than the one the gate supplies for it: `compose` takes, beside the evaluations, the revisions the gate independently resolved (the PLAN's landing for the Features Plan's definition, the protected baseline for the Regression Plan), since the record no longer names revisions (change/F7);
  - a Features evaluation given any exception;
  - Regression exceptions that differ from F10's.

  `accepted` lists the Cases Testing reports excepted, still RED.
- **change/F50** [change/I24]: **Authorization by an accepted PLAN.** A record that holds an Accept carries `authorization`, and `exceptions` produces nothing without it. **No Accept, no authorization.** A record without an Accept needs no authorization and no lifecycle, and composes from the two Plans alone (change/N4); the gate still validates the two evaluations.
  - **The PLAN.** `plan` is the PLAN Change that established the record. The gate resolves the commit where that PLAN landed, as an ancestor of the candidate, and gives it as data (`landing`); the record never states it. A record is read from that commit, never from the candidate alone: the candidate's copy is compared with it, and a difference is a finding (change/F51).
  - **The authority.** `by` must be the repository's designated authority and `evidence` must be the decision's landing. The designation is data given to the function and is never read from the record or the candidate. In KAAL it is the Owner. `by` and `evidence` as the candidate carries them are claims, never self-authenticating: the landing is established independently by the gate (not by the candidate), and the decision is verified against the designated authority before it counts. Where the designation is read from is open (G13, below).
  - **The evidence names both.** A result of `exceptions` cites the exact PLAN, the landing commit the gate resolved and the authority. An authorization that names none of them is a finding.
  - **Two moments, two judgments.** *Pre-landing*, a PLAN Change is approved: `approve(plan, designation, decision)` verifies, against the designation given as data, a decision the gate obtained independently for that exact PLAN head. It needs no landing, since none exists yet. *Post-landing*, a DO relies on what that PLAN established: `authorize` (above) needs the verified landing. Neither accepts the candidate's own `by` and `evidence` as the decision: a candidate that names itself the authority, or carries a decision for another head, is not approved. Approval is pre-landing evidence only and authorizes nothing to a DO until the PLAN has landed.
- **change/F51** [change/I25]: **A DO cannot change its PLAN.** `integrity` takes the Cases and the Accepts as the PLAN established them (identities and digests, from the landing commit) and as the candidate carries them.
  - A Case the PLAN established that the candidate removes, skips, marks todo or edits is a finding naming it.
  - A change to an Accept entry, its decision or its authorization, or an Accept the PLAN did not establish, is a finding.
  - A candidate that is itself a PLAN Change decided by the designated authority is judged by change/F50, not as a DO.
- **change/F52** [change/I7, change/I24]: **Lifecycle.** Every Accept has a `reason`, an authority and an `endsWhen`, a condition a Case can judge. `exceptions` is empty and a finding is given when the end condition has passed. The outstanding count and each end condition are given in the result, so a gate can report them. The count may not exceed the count the PLAN authorized; that is a ratchet against unauthorized growth and does not require a fall in every DO.
- **change/F53** [change/I7, change/I25]: **One boundary, closed.** An Accept serves one Change into one boundary and is consumed with that integration. The same weakening at the next boundary, such as a collector's promotion into `main`, needs its own entry, authorized by a PLAN, with its own cite. Nothing is inherited. That a PLAN appears in a branch's history, or authorized an Accept for a collector integration, authorizes nothing at `main`: a promotion is authorized by an entry that names the promotion boundary.
- **change/F54** [change/I25]: **Unknown fails closed.** When the record cannot be read, an entry cannot be traced to its PLAN, the authority cannot be verified, or the end condition cannot be judged, `exceptions` gives none and a finding that names which, and `compose` gives no passing outcome. Unknown and expired authorization is never a pass.

### Open for the Owner

- **G13. Where the designated authority's decision is read from.** Either from the entry (`by` and `evidence`, compared with the repository's designation), which the gate can check; or from the approving review of the PLAN's landing, which depends on a Review capability that is not built (change/A7). This PLAN requires only that the designation is given as data. It does not choose.
