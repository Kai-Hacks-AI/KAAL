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

A Service may declare its owner as the property `owner` in its own frontmatter: a role label, a single line of text. The owner is the organizational role accountable for the Service's lifecycle and value. It is independent of the Capability that `provides` the Service, and neither is inferred from the other.

The label is declared, not resolved. It carries no role identity, no Node is named by it, and a label that matches nothing is not a finding. Two Services with the same label are not thereby claimed to have the same owner. A Service without `owner` is admitted.
