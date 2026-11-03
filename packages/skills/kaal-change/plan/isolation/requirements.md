# Change isolation: Requirements

## Functional

- **change/F38 [change/I19]. Proposed alteration and selected scope.** Accept
  nonempty, unique `alters` owner identities and `scope` capability namespaces,
  using C9's forms. Refuse a malformed statement whole. Keep proposal data
  separate from target-owned evidence; a proposal cannot authorize its own
  exclusions.
- **change/F39 [change/I19]. Trace-based assessment.** Starting from altered
  elements, consume owner-defined relationships through Graph to establish
  potential impact. Include functional and nonfunctional requirements and
  relevant Defects/regression targets; their identities and relationship
  meanings remain with their owners. Selected scope is an explicit boundary,
  not automatically every reachable element. Name affected elements outside it.
- **change/F40 [change/I19]. Both boundary directions.** Inventory every declared
  incoming and outgoing interface crossing the selected scope, naming its
  inside/outside endpoints, owner, contract/version and supporting trace.
  Cover process, service, data, persistence, event and other interface kinds
  through owner declarations; do not infer boundaries from directory or network
  syntax. An interface of unknown direction, owner or contract is a finding.
- **change/F41 [change/I20]. Isolation obligations.** For incoming boundaries,
  name the required test driver/scenario obligations. For outgoing boundaries,
  name required controlled collaborator/double obligations. Testing owns the
  choice and semantics of mocks, stubs and fakes. Real subject behaviour inside
  scope must execute; replacing it with a passing double satisfies nothing.
- **change/F42 [change/I20]. Multi-loop and Defect obligations.** Reference
  architecture-conformance, capability-acceptance and implementation-loop
  obligations separately. Include regression evidence for relevant Defects and
  RED-before-GREEN/refactoring evidence. Boundary contract and real integration
  verification remain separate obligations; a unit double's success never
  discharges them. Change lists obligations, not a new test framework.
- **change/F43 [change/I19, change/I21]. Missing evidence.** Missing/unresolved
  elements, ownership, traces, interface inventory or conversion evidence give
  named unknowns. Empty traversal is not proof of no impact. An undeclared
  affected dependent cannot be dismissed because the proposal omitted it.
  Owner-supplied inventory/source completeness must be checked at the adapter
  boundary; a `complete: true` or `authoritative: true` flag alone is insufficient.
- **change/F44 [change/I19, change/I20]. Explained result.** Return the assessed
  scope, potential impact, crossing interfaces, required evidence and findings
  deterministically. Distinguish a violation, unknown evidence and isolation
  established within the supplied model. State the exact model/proposal
  identities and authority coverage. Analysis never claims tests executed,
  delivery succeeded, repository completeness or CI assurance by itself.
- **change/F45 [change/I21]. Usable focused delivery.** Expose the isolation API
  through the scoped Change package; ship its own contract, limitations and
  runnable consumer verification. Prove a clean packed consumer can assess both
  a complete controlled model and a broken one through public exports only.

## Nonfunctional

- **change/N9 [change/I19]. Meaning remains distributed.** Change owns isolation;
  it adds no relationship meaning owned by Intent, Requirements, Defect owners,
  Architecture, Testing or Packaging. Graph remains the traversal engine.
- **change/N10 [change/I19, change/I21]. Pure product core.** The same immutable
  facts in any order yield the same assessment. No Git, filesystem, process,
  clock, network, CI job/OS, branch name or publication operation is part of the
  semantic core. Missing optional adapters are reported, not substituted.
- **change/N11 [change/I20, change/I21]. Evidence limits.** Doubles and fixtures
  can prove behaviour against their contracts. They cannot manufacture trusted
  owner evidence or prove real integration. A future repository adapter must
  independently obtain target-side facts and validate completeness/provenance
  before Engineering can use this product to omit checks.
