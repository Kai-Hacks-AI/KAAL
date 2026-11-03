# FAR, Features Accept Regression: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A5** [change/F7–change/F11, change/N3, change/N4]: `kaal-change/far` exports `proposal`, `decide`, `exceptions` and `compose`. It imports no module. It reads Plans as `{ plan, cases }`, and Testing's evaluations and Guard's reports as data.
- **change/A6** [change/F7, change/F8]: **Where FAR lives.** A Change's FAR record is transition documentation, kept as `far.json` in that Change's record. It references the Plans and never copies them. Where the record lives is the repository's choice (#280).
- **change/A7** [change/F9]: **Authority.** Who may decide is the embedding repository's designation. In KAAL, it is the Owner.
  - **What a decision states.** It states its authority and its evidence.
  - **How it lands.** It lands only through the Change's own integration, which Review's approval and Engineering's Branching govern. Review defines what counts as authorization evidence.
- **change/A8** [change/F10, change/F11]: **The integration gate is Change's, wired up in Guard's setup.** Change defines the check and what it needs. Guard's setup configures it, and Guard executes and reports it without interpreting FAR. It does six things:
  - takes the integration, with immutable revision evidence from Engineering for the source, the target and its baseline;
  - reads the Features Plan at the source's revision, and the Regression Plan at the baseline;
  - observes the baseline and the head in one process (`testing/N4`);
  - calls `exceptions` for that integration;
  - has Testing evaluate the Features Plan at the head with no exceptions and no baseline, and the Regression Plan at the head against the baseline with the exceptions;
  - calls `compose`, and applies its policy.

## Ownership

| Who | Owns |
| --- | --- |
| Change | FAR: the Features Test Plan, the Regression Test Plan and the Accept List as FAR concepts, selecting them for an integration, the Accept List's negotiation, decision and record, the exceptions, the gate, and the composed verdict |
| Testing | Test Plan and Case semantics, generic evaluation, results and evidence, with no FAR type |
| Engineering | the integration and its immutable revision evidence, and the observed runs |
| Review | authorization evidence |
| Guard | executing the check configured in its setup and reporting its observations, without interpreting FAR or deciding acceptability (its reporting outputs are open question 1 in the Intent) |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `change/C2` PLAN, this Change | Change | `testing/C4` (#385), as revised to be FAR-free, and Testing's Test Plan PLAN |
| DO: `kaal-change/far`, with change/T9–change/T16 GREEN | Change | `change/C2` |
| `guard/C…`: the FAR check in Guard's setup | Guard | the DO Change, and open question 1 |
| `engineering/C…`: revision evidence for an integration | Engineering | the DO Change |
| `review/C…`: authorization evidence for the Accept List | Review | `change/C2` |
