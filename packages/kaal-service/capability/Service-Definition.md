---
name: Service
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Service

A Service is an offering: something a responsibility makes available for others to use. Each Service is a Node typed by this Definition, and its identity is that Node's.

Exactly one Capability is accountable for a Service: the one that `provides` it. Being accountable does not mean delivering every part: a Service may be composed of other Services, and its parts may be delivered elsewhere.

A Service does not list its consumers. Who consumes it is what the Nodes that `consumes` it declare.
