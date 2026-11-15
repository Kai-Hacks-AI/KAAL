# Delivery admission (Engineering)

Engineering's common **IN** mechanism for `main`: one required context, **Delivery Admission**. It does not define what a good delivery is. A registered source **stock** owns its delivery semantics and establishes its own **OUT** qualification; Delivery Admission routes a head to its stock, consumes that stock's evidence bound to the exact head, and applies the destination's IN requirements. Missing, stale or unaccepted registration or evidence fails closed.

PLAN stage: nothing here is built or installed. Change: `00-changes/C16-delivery-admission/` (engineering/C16, Cases T450 to T459).
