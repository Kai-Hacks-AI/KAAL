# Features Accept Regression: Intent

This is `change/C2`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

Testing's PLAN `testing/C4` (#385), revised per the Owner's review 5658056782, splits the governance of failing tests among three owners. Testing observes and classifies, Engineering gates and Guard executes, and Change owns FAR (Features Accept Regression). Change's share is FAR's meaning, the proposal, the negotiation, the decision authority, the decided outcome and its record, and the governance of the acceptance boundary. Testing consumes only the decided outcome, `far: [{ change, tests }]` (`testing/F4`), and an accepted regression stays RED (`testing/F5`). This PLAN is Change's side of that interface.

- **change/I5.** FAR is a negotiation inside one governed Change, never a standing waiver. It starts only when a Feature genuinely conflicts with protection already established, after the agent has sought a solution that satisfies both.
- **change/I6.** A FAR proposal is self-contained. It names the Change and the Intent it realizes, and each established Test Case it would leave RED with the commitment that Test Case protects. It also says why the weakening is needed and which alternatives were considered.
- **change/I7.** The decision is the deciding authority's. It may accept, reject or narrow the proposal, or require a redesign. Nothing is accepted by silence, and an accepted regression stays RED. Acceptance never edits a Test Case. A change of behavior that needs a PLAN amendment is a Change of its own, authorized on its own.
- **change/I8.** The decided outcome is recorded once, with the Change, and handed on in exactly the shape Testing consumes. Change decides, and does not gate. Which decisions a gate hands in is Engineering's.
