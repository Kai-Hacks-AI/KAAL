---
name: Owner View
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Owner View

The Owner View is how Product presents Product Direction so the Product Owner can decide with the evidence in front of them. It is a reading, not a store: Product prepares it and the Product Owner decides.

The Owner View is kept per product. The KAAL repository is a product, and each independently managed npm package is a product in its own right, each with its own product PDCA; npm publication is one step in a package's cycle, not all of it. An increment belongs to one product, and its Intent, Requirements and readiness are read in that product's context.

For each wanted increment the Owner View shows:

- **Intent**: the Intent the increment serves.
- **Requirements**: the Requirements that define its success.
- **Place**: its priority and its position in the roadmap.
- **Decisions**: the decisions open and the choices recorded as the Product Owner made them.
- **Readiness**: the verification status and the evidence supporting readiness.

Product does not own what it presents. Test Case traces across the loops (Intent, Requirements, Architecture and Defects) are Testing's, and trace and reach semantics are Graph's. Intent and Requirements remain Intent's and Requirements'. Product reads and interprets them for the Product Owner's decision; it adds no second traceability model, no verifier and no consumer content, and it does not re-run or re-judge verification.

## Work states

Activity is modelled per Change (per pull request), and a capability's availability is derived from its Changes. It is not a single state of the capability, because a collector has several Changes in flight at once and some are worked while others wait.

Each Change, or planned Change, is in one of these states:

1. **Working**: being worked on as a pull request.
2. **Waiting**: waiting for review (CTO, CPO, Owner or another reviewer).
3. **Blocked**: blocked by other capabilities or by a gate.
4. **Planned**: in the capability's product plan, not yet started.

From these the Owner View derives the capability's availability for the next piece of work:

- **Actionable**: at least one Change is Working, or a Planned Change can be started now. Waiting Changes do not make the capability unavailable.
- **Waiting only**: every Change in flight is Waiting and no Planned Change can be started now.
- **Blocked**: the plan holds planned work and every possible Change in it is Blocked. One blocked pull request does not make the capability blocked.
- **No work planned**: the plan holds no Change to do. This is not Blocked and is shown separately.

Working and Waiting can hold at the same time for different Changes of the same capability.

Deciding across products, such as their investment, value, lifecycle and comparative priority, is portfolio-level and is not Product's: Product Portfolio Management (products) and Project Portfolio Management (projects) are separate concerns whose ownership is not decided here, and Product defines neither. Product's plans are inputs to them.

The Product Owner decides. Product prepares each decision, and Engineering retains delivery responsibility.
