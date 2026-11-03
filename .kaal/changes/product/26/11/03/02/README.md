# Product DO: the Decision Preparation Definition (provisional number 26/11/03/02)

Implements item 2 of the Product PLAN (#860, 26/11/02/01): the shape in which one product decision is put to the Product Owner and recorded. It builds on the Owner View (26/11/03/01, #937).

## Change

- RED first: the tests for the Definition were committed failing (10 failures), then the Definition made them pass.
- `capability/Decision-Preparation.md`: a KAAL Definition. A preparation has a Question, Options (either at least two, each with what choosing it would mean, or accept and reject for a single proposal, with no manufactured alternatives), Evidence (referred to from the Owner View, never copied or re-judged), an optional Recommendation (advice only), a Decider (never Product; some decisions are the Owner's alone), a Recorded choice (as the Decider made it) and a Hand-over (to Change, and Project where warranted; Product does not deliver; selecting or prioritizing an increment is not itself the authorization of a governed action such as engineering work, promotion, publication or a new package or capability). A preparation is Prepared, Decided or Withdrawn. Technical decisions are Engineering's.
- `Product.md` lists the new Definition among those Product provides. README, the ownership claim's Capability Node id (it follows the Node's content) and tests follow.

## Not changed

No package metadata, `files`, script, workflow or policy changes; Product stays internal-only. Items 3 (Product to Engineering seam) and 4 (Process template) of #860 are not started. Persistence of preparations is not decided here.

## Verified by

`npm test -w kaal-product`: 38 of 38 pass after 10 RED failures (Form, type, admission, package contents, the Definition's key statements as written). Validated by CPO and Owner review of whether the Definition says the right thing, and by the Codex review triaged on the PR.
