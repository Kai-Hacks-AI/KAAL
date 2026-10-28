# Features Accept Regression: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A5** [change/F7–change/F10, change/N3, change/N4]: `kaal-change/far` exports three pure functions and imports no module:
  - `proposal(value)` returns `{ findings }`.
  - `decide(proposal, decision)` returns `{ outcome, findings }`. `outcome` is an entry or `null`.
  - `outcomes(decided)` returns `{ far, findings }`. It takes a list of `{ proposal, decision }`.

  `kaal-change` does not import `kaal-testing`. It produces the shape that `testing/F4` checks, and Testing checks it again on its side.
- **change/A6** [change/F7, change/F8]: **Where FAR lives.** A Change's FAR proposal and its decision are transition documentation, so they belong to that Change's record, in one file, `far.json`, holding `{ proposal, decision }`.
  - **Placement.** Where the record lives is the repository's choice (#280).
  - **What the record holds.** The record documents the negotiation. It does not copy the Test Cases, which stay Testing's and stay unchanged.
- **change/A7** [change/F8]: **Authority.** Who may decide is the embedding repository's designation. In KAAL, it is the Owner.
  - **What a decision states.** It states its authority and its evidence.
  - **How it lands.** It lands only through the Change's own integration, which the repository's controls govern: Review's approval and Engineering's Branching. Change does not verify a reviewer. That is Review's.
- **change/A8** [change/F10]: **Hand-off.** Engineering's gate (`engineering/C…`) chooses which Changes a candidate carries. It reads their `far.json` through Hosting, calls `outcomes`, and passes `far` to `testing/C5`'s `classify`. Change names no gate and reads no run.

## Open decisions

| Decision | Recommended | Alternative |
| --- | --- | --- |
| How many FAR decisions one Change may hold | One. A further negotiation is a later Change with its own record. | Several rounds in one record. That would relax the record's immutability once accepted. |
| How FAR is represented | `far.json` in the Change's record. It is machine-readable, needs no Git, and touches no Definition. | A typed Node with Edges to the Change, once `change/C1` (#530) lands. This would add a Node type for what is transition history. |

## Ownership

| Who | Owns |
| --- | --- |
| Change | FAR's meaning, the proposal and decision shapes, `kaal-change/far`, and the record of each decision |
| Testing | observed evidence and classification, and checking the `far` shape it consumes (`testing/F4`, `testing/F5`) |
| Engineering | the gates: which Changes' decisions are handed in, and each gate's policy |
| Review | validating and approving the Change that carries a decision |
| Guard | executing the gate's check |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `change/C2` PLAN, this Change | Change | `testing/C4` (#385), for the outcome shape |
| DO: `kaal-change/far`, with change/T9–change/T14 GREEN | Change | `change/C2` |
| `engineering/C…`: the gates hand in `far` | Engineering | `testing/C5`, the DO Change |
