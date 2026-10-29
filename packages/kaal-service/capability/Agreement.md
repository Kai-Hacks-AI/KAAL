---
name: Agreement
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Agreement

An Agreement is an explicit commitment about a Service between the parties to it. Each Agreement is a Node typed by this Definition, and its identity is that Node's.

An Agreement declares in its frontmatter:

- `kind`: `SLA`, `OLA` or `UC`;
- `parties`: the roles or Nodes that are party to it, by name.

The kind is declared from the parties and the nature of the agreement. It is never derived, and no internal or external flag decides it.

- An **SLA** is agreed with those who use the Service.
- An **OLA** is an internal supporting agreement.
- A **UC** is a contract with an external supplier.

An Agreement names the Service it is about with `covers`. An OLA or a UC names the SLA it supports with `underpins`. Whether a declared kind is right for its parties is judged by people, not checked here.
