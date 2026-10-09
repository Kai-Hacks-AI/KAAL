# Second amendment received: Concern-to-PR Relationships

Kept apart from `01-intent.md` and `03-amendment.md`, both unchanged. The Owner's text as received, verbatim.

The Development Overview groups work by architectural concern, not by individual pull request.

* One concern may relate to multiple PRs.
* A PR may contribute to multiple architectural concerns.
* PRs may be open, merged, closed without merging, or at different implementation stages.
* A concern remains visible even when no PR is currently in flight, where relevant to the overview.
* Historical PRs may provide established architectural evidence alongside active implementation PRs.

Each concern should display its relevant PRs with their individual numbers, states and navigation actions.
Do not derive the maturity of an architectural concern from the state of any single PR.
Avoid introducing a rigid one-to-one concern/PR mapping or requiring a new registry merely to support the overview.
Acceptance criterion: A fresh Agent can identify an architectural concern, discover all relevant development activity, and distinguish established decisions from ongoing realization without Owner guidance.
