# Service Management Model: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **service/N1** [service/I1, service/I2, service/I3]: The model is generic and self-standing.
  - No text Service delivers names a customer organization or a tool realization.
  - Core's four CASE kinds and Graph's mechanics are unchanged. Every new relationship is an Edge typed by a Service Definition, carried by its source Node.

## Functional

- **service/F1** [service/I1]: **Service Owner.**
  - A Service declares its owner as the property `owner` in its own frontmatter: a role label, a single-line string, not an Edge and not a CASE kind.
  - The label is not resolved. It carries no role identity, no Node names it, and a label that matches nothing is not a finding. Two Services with the same label are not thereby claimed to have the same owner.
  - The `Service` Definition states that the owner and the providing Capability are independent, and that neither is inferred from the other.
  - A Service without `owner` is admitted. Whether one is required is S2's report-only checks, not this Change.
  - The `Service` Definition says the label is declared, not resolved, so no reader takes it for a resolvable role.
- **service/F2** [service/I2]: **`composes`.**
  - An Edge typed by the new `composes` Definition goes from a Service to each Service it rests on, and is carried by the composed Service.
  - The supporting Service does not list what it supports. Graph derives that.
  - There is no internal or external type.
- **service/F3** [service/I3]: **`Agreement`.**
  - The new `Agreement` Definition types Agreement Nodes.
  - An Agreement declares in its frontmatter:
    - `kind`: `SLA`, `OLA` or `UC`;
    - `parties`: the roles or Nodes that are party to it, by name.
  - The Definition states:
    - the kind is declared from the parties and the nature of the agreement, and never derived from an internal or external flag;
    - an OLA is an internal supporting agreement;
    - a UC is a contract with an external supplier.
- **service/F4** [service/I3]: **`covers` and `underpins`.**
  - An Agreement carries a `covers` Edge to the Service it is about.
  - An OLA or a UC carries an `underpins` Edge to the SLA it supports.
  - Neither target lists its Agreements. Graph derives them.
