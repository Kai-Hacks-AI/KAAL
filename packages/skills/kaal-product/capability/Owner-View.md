---
name: Owner View
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Owner View

The Owner View is how Product presents Product Direction so the Product Owner can decide with the evidence in front of them. It is a reading, not a store: Product prepares it and the Product Owner decides.

For each wanted increment the Owner View shows:

- **Intent**: the Intent the increment serves.
- **Requirements**: the Requirements that define its success.
- **Place**: its priority and its position in the roadmap.
- **Decisions**: the decisions open and the choices recorded as the Product Owner made them.
- **Readiness**: the verification status and the evidence supporting readiness.

Product does not own what it presents. Test Case traces across the loops (Intent, Requirements, Architecture and Defects) are Testing's, and trace and reach semantics are Graph's. Intent and Requirements remain Intent's and Requirements'. Product reads and interprets them for the Product Owner's decision; it adds no second traceability model, no verifier and no consumer content, and it does not re-run or re-judge verification.

## Work states

The Owner View also shows what each capability is doing. At any time a capability is exactly one of:

1. **Working** on a pull request.
2. **Waiting** for review (CTO, CPO, Owner or another reviewer).
3. **Blocked** by other capabilities.

A capability has more than one change in flight in its product plan, so it is blocked only when every possible change in that plan is blocked. A single blocked pull request does not make the capability blocked: the capability works on the next change it can start.

The Product Owner decides. Product prepares each decision, and Engineering retains delivery responsibility.
