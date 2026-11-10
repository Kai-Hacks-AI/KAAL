# FAR, Features Accepted Regression: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A5** [change/F7–change/F11, change/N3, change/N4]: `kaal-change/far` exports `proposal`, `decide`, `exceptions` and `compose`. It imports no module. It reads Plans as `{ plan, cases }`, and Testing's evaluations as data.
- **change/A6** [change/F7, change/F8, change/F50, change/F51]: **Where FAR lives.** *Revised.* A Change's FAR record is transition documentation, kept as `far.json` in that Change's record. It references the Plans and never copies them. Where the record lives is the repository's choice (#280).
  - **Established by the PLAN.** The record, with its Case digests and its Accepts, is established by the PLAN Change and read from the commit where that PLAN landed. A DO Change carries a copy and is judged against the landing, never on its own word.
  - **Not self-authenticating.** The candidate's `by` and `evidence` are claims. The gate establishes the landing independently, and `authorize` verifies the decision against the designation it is given.
  - **Why this order.** Revisions cannot key an Accept that a PLAN authorizes, because the PLAN lands before the revisions it will be judged at exist. Identity and digest exist at the PLAN and are checked at the DO.
- **change/A7** [change/F9, change/F50, change/F52]: **Authority.** *Revised.* Who may decide is the embedding repository's designation. In KAAL, it is the Owner.
  - **What a decision states.** It states its authority, its evidence, its reason and its end condition.
  - **How it lands.** It lands only through a PLAN Change's own integration, which Review's approval and Engineering's Branching govern. Review defines what counts as authorization evidence.
  - **Given as data.** The designation reaches `authorize` as an argument and is never read from the record or the candidate (change/N3).
  - **Open (G13).** Whether the decision is read from the entry or from the approving review of the landing is not chosen here. Either fits this element: only the data given to `authorize` differs.
- **change/A8** [change/F10, change/F11, change/F51, change/F53, change/F54]: **The integration gate is Engineering's.** *Revised.* It does ten things:
  - names the integration, with the Change, the boundary and the source and target revisions as evidence;
  - finds the PLAN's landing commit: an ancestor of the candidate, on the collector for a collector pull request, and on the collector for the promotion that carries it;
  - reads the record and the Case definitions and digests of the Features Plan at that commit (definition), and the candidate's copies at its own head, only to compare them;
  - selects the complete Regression Plan at the integration's protected baseline (change/I6), never at the PLAN's landing, and gives the exceptions only for Cases of it that the Accept names with an equal digest;
  - observes the baseline and the head in one process (`testing/N4`);
  - always calls `integrity` on the candidate's planned Cases and its record, with or without an Accept, and feeds its findings to `compose` (change/F51);
  - when the record holds no Accept, skips `authorize`, `lifecycle` and the exceptions, and composes from the two Plans alone (change/N4), still validating both evaluations and the integrity findings; otherwise
  - obtains the state each Accept's end condition is judged by (change/F52), and calls `authorize` and `lifecycle`, with the designation and that state as data;
  - calls `exceptions` with their findings, so an unauthorized, altered or expired Accept gives no exception;
  - has Testing execute the Features Plan's planned Cases, exactly as the landing defines them, against the candidate's head with no exceptions and no baseline (execution), never a plan the DO supplied;
  - has Testing evaluate the Regression Plan at the head against the baseline with the exceptions;
  - calls `compose` with those findings and with the independently resolved revisions (the PLAN's landing and the protected baseline) against which each evaluation's `at` is checked (change/F11), so an expired or unjudgeable Accept cannot give a passing outcome, and applies its policy;
  - treats any finding, and anything unreadable, as no exception and no pass (change/F54).
- **change/A24** [change/F50, change/F51, change/F52, change/F53, change/F54, change/N3, change/N4]: **Pure judgments.** `kaal-change/far` also exports `authorize`, `integrity` and `lifecycle`. Like the rest, they import no module, take data and return data, change nothing they are given, and give the same result for the same input.
  - **`authorize(record, designation, landing)`** gives the authorization findings (change/F50, change/F54) and the PLAN, commit and authority a cite names. `landing` is the commit the gate resolved and verified; the record holds no commit, since a commit cannot contain its own hash.
  - **`integrity(established, carried)`** gives one finding per removed, skipped, marked or edited Case, per altered Accept and per Accept the PLAN did not establish (change/F51). It judges a Case by identity and digest.
  - **`lifecycle(record, state)`** gives the outstanding count, each end condition's judgement, and the findings for an expired or unjudgeable one (change/F52, change/F54). `state` is the data a condition is judged by, and is given.
  - **Boundary.** Reading git, finding the landing and digesting files are Engineering's. Change judges what it is given.

## Ownership

| Who | Owns |
| --- | --- |
| Change | FAR: selecting the Plans for an integration, Accept's negotiation, decision and record, the authorization, integrity and lifecycle judgements, the exceptions, and the composed verdict |
| The incoming Change's capability | its Features Test Plan and its Cases, with their outgoing traces |
| The target's capability | its Regression Test Plan and its Cases, with their outgoing traces |
| Testing | generic Test Plan evaluation, results and evidence, with no FAR type |
| Engineering | the integration and its revision evidence, finding the PLAN's landing commit, reading and digesting at it, the observed runs, the gates and their policy |
| Review | authorization evidence, and the approving review of a landing, if G13 is decided that way |
| Guard | executing the configured gate, without interpreting FAR |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `change/C2` PLAN, this Change | Change | `testing/C4` (#385), as revised to be FAR-free, and Testing's Test Plan PLAN |
| DO: `kaal-change/far`, with change/T9–change/T16 and change/T60–change/T66 GREEN | Change | `change/C2` |
| `engineering/C…`: the integration gate, including Engineering's `far-authorization-plan` (#1340) | Engineering | Testing's plan evaluation, and the DO Change |
| `review/C…`: authorization evidence for Accept | Review | `change/C2` |
