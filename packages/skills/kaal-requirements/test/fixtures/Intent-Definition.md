---
name: Intent
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Intent

An Intent states what someone wants to achieve, and why, completely enough to be understood from its own text. A Node typed by this Definition is one captured Intent.

An Intent is not a requirement, a Change, a decision to act or a conversation. Capturing one authorizes nothing.

An Intent that a capability states as one of its elements is identified as `<capability>/I<n>`: the capability's short name, then `I` and a positive integer that the capability assigns and never reuses. That is the Node's name. The Node belongs to the capability whose Intent it is, and it has no Edges: what serves an Intent points at it, never the reverse.
