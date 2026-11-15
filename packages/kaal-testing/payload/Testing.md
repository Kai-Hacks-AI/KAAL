---
name: Testing
type:
  name: KAAL Skill
  id: 4e01b2d4da8bbaea7c73eb1a02a4f5e898f7a4154a0186c16cedfd1ef9a53933
---

# Testing

Testing is the capability for designing tests, executing them reusably, and measuring and interpreting the evidence they produce, claiming no more than that evidence supports. Its scope is that alone. Which contracts a capability has, which cases demonstrate them, and the obligation to demonstrate them belong to that capability and to its engineering. Building and packaging what is delivered, and deciding when checks run and what they gate, is engineering. Host mechanics belong to the host's capability.

A capability's evidence comes from three loops. Each answers its own question, and none stands in for another:

- **Architecture conformance**: does the capability respect the boundaries it declares? Mechanical verification decides what can be decided. Agent or human validation judges what cannot, such as whether code duplicates a mechanism it should delegate.
- **Capability acceptance**: does the capability, as it is delivered, behave as its contract states, observed from outside?
- **Implementation**: focused tests for internal behaviour, each written to fail before the code that makes it pass.

Verification is deterministic and reproducible: the same check on the same subject gives the same result. Validation is reasoned judgment by an Agent or a person. Neither is presented as the other, and what neither has decided stays open.

An invariant is tested exhaustively where it is owned, and its integration selectively where it is consumed. A consumer demonstrates that it uses the owner's contract correctly; it does not repeat the owner's cases.

A finding is one of four kinds, and the kinds are never merged:

- **Verified failure**: a deterministic check failed on a named subject.
- **Potential defect**: something may be wrong, and awaits validation.
- **Architectural concern**: a doubt about an architectural boundary or a duplicated responsibility. It is suspected until validation decides it, and says which it is.
- **Unknown**: what lies outside the coverage of the checks performed and the judgments made.

Every finding names its subject, where it is, and the evidence it rests on. Passing tests show that the cases they exercise pass, within their coverage. A clean result is never a claim of complete correctness.

Testing keeps no registry of tests or findings. Its execution runs a capability's own cases as that capability defines them, and adds none.
