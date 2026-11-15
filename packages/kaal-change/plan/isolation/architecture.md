# Change isolation: Architecture

- **change/A18 [change/F38–change/F44, change/N9–change/N11].** A separate public
  `@kaihacksai/kaal-change/isolation` entrypoint provides a pure assessment
  (`isolate`). It consumes a plain proposed Change plus owner-backed views of
  elements, ownership, interfaces and traces. Exact transport shapes are the
  bounded DO's design; the obligations and ownership boundaries above are not.
  Existing delivery `assess` and its satisfaction semantics are not a prerequisite.
- **change/A19 [change/F39, change/F40, change/F43].** Use Graph's public
  traversal on a model assembled by the relationship owners/adapters. Distinguish
  impact exploration from selection and interface-boundary inspection. Cycles
  terminate, new dependents are discovered without a Change-owned capability
  allowlist, and an incomplete owner view stays unknown. The adapter's public
  completeness contract must say what inventory it covers and how omissions
  are detected; internal graph consistency alone cannot establish it.
- **change/A20 [change/F41, change/F42, change/N9].** An obligation view links
  each boundary/target to the evidence required in Testing's loops. It names
  contracts and evidence references, not mocking libraries or generated tests.
  The executable demonstrator drives an incoming interface, substitutes an
  outgoing collaborator and executes the real subject. A separate scenario
  deliberately makes a double disagree with the real provider and must expose
  the failed compatibility obligation.
- **change/A21 [change/F45, change/N10, change/N11].** Deliver only the minimum
  Change foundation, isolation code, docs and own consumer cases. Reuse Core's
  existing type references and Foundation for any new SHA-256. Consume Hosting
  for host mechanics and Testing for acceptance; no unpromoted owner package is
  silently made mandatory. State which adapters are real and which are fixtures.

## Independent contracts

The assessment has two independent aspects:
1. What can be established within the supplied pinned model.
2. Whether the evidence source is authoritative and complete for the claimed
   consumer/repository scope.

A complete controlled model supports the first. It does not automatically
establish the second for KAAL's repository. Keep those qualifications in the
public result, not merely in release notes. Testing evidence is a third concern
and must reference actual runs; generating obligations cannot make them passed.

## Later integration

Engineering can translate accepted isolation/testing obligations to its governed
check/OS policy and then use #764/#760. The full-matrix stable CI gates can proceed
independently. This bridge makes no workflow/ruleset change and does not remove
C11's current Core/.github admission defaults.
