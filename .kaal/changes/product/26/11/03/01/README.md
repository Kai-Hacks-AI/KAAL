# Product DO: the Owner View Definition (provisional number 26/11/03/01)

Implements item 1 of the Product PLAN (#860, 26/11/02/01): a defined Owner-facing reading of Product Direction.

## Change

- `capability/Owner-View.md`: a KAAL Definition. For each wanted increment it shows Intent, Requirements, place (priority and roadmap), decisions, and readiness (verification status and evidence). Evidence is reused from Testing's multi-loop Test Case traces and Graph's trace semantics; Product adds no second model, verifier or consumer content.
- Work states (Owner work rule, Kai, 3 Nov): a capability is Working on a PR, Waiting for review, or Blocked; Blocked only when every possible change in its product plan is blocked.
- `Product.md` lists the new Definition among those it provides. README and tests updated.

## Products and portfolios (CPO handover, 3 Nov)

The Owner View is kept per product: the repository and each npm package are products with their own PDCA, and publication is one step of a package's cycle. Portfolio-level decisions across products (Product Portfolio Management) or projects (Project Portfolio Management) are separate concerns; this Change defines neither and decides no ownership. Product's plans are inputs to them.

## Status of scope

The Owner viewpoint and internal-only distribution are working directions (CPO handover, 3 Nov), not final approval of the detailed product scope or future distribution strategy. This Change defines only item 1 of the approved survey and candidate work (#860); items 2 to 4 are not started.

## Not changed

No package metadata, `files`, scripts, workflow or policy changes. Product stays internal-only (no npm publish). Persistence of Owner View objects is not decided here.

## Verified by

`npm test -w kaal-product` (Form, type, admission, package contents, the Definition's key statements as written). Validated by CPO and Owner review of whether the Definition says the right thing.
