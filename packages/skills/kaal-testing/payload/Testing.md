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

Some tests are established in PLAN, before any code is written. Intent, Requirements and Architecture each own the tests PLAN establishes for them, and their content; Testing owns what those tests mean as evidence. A PLAN-established test is immutable to DO and CHECK, whatever the motivation: neither changes it, nor the fixtures, expectations, configuration and helpers that give it its meaning. Implementation tests may evolve with the design, as long as they never weaken the planned boundary.

Before coding, a planned test stands clean RED: it fails for the intended missing behaviour, and for no other reason. A failure caused by a missing import, a missing fixture or a typo is not clean RED and shows nothing; neither does an assertion failure alone, unless it is the assertion of the intended behaviour. GREEN is bounded test evidence: the planned tests pass, within their coverage. It is not proof that the intended outcome is achieved. A defect found in a planned test is a planning defect: DO and CHECK do not correct it. It belongs to ACT, and possibly to a new PLAN.

A PLAN establishes its acceptance boundary before DO, and the boundary holds however it is realized: as a separate PLAN Change compared through version history, or as a PLAN sealed by a trusted Seal. Each concern owner declares its boundary: its planned tests and every fixture, expectation, configuration file, helper and dependency that gives them meaning. The closure is declared, never derived. A realization reports a verdict on the declaration, and Testing reads every verdict the same way. Testing reads a verdict only as its trust authority attests it, bound to the verdict's anchor, and never authenticates one: a verdict's own labels never make it trusted, and without that attestation it is unknown. A declared path that was added, removed, renamed or changed is a verified failure naming the concern, its owner, the path and the change. A baseline the candidate can write, or bytes a checkout can change, give unknown, never unchanged. What the verdict did not compare, such as file mode, stays unknown, as does what the boundary depends on outside the declaration. A change entry that does not read, or an unrecognized change to a declared path, leaves the boundary unknown. An untouched boundary is unchanged within the declaration, never met.

Byte integrity, execution reproducibility and behavioural validity are three claims, and none stands in for another. Unchanged bytes do not show that a run is reproducible, that a RED is the intended one, or that the outcome is achieved.

Verification is deterministic and reproducible: the same check on the same subject gives the same result. Validation is reasoned judgment by an Agent or a person. Neither is presented as the other, and what neither has decided stays open.

An invariant is tested exhaustively where it is owned, and its integration selectively where it is consumed. A consumer demonstrates that it uses the owner's contract correctly; it does not repeat the owner's cases.

A finding is one of four kinds, and the kinds are never merged:

- **Verified failure**: a deterministic check failed on a named subject.
- **Potential defect**: something may be wrong, and awaits validation.
- **Architectural concern**: a doubt about an architectural boundary or a duplicated responsibility. It is suspected until validation decides it, and says which it is.
- **Unknown**: what lies outside the coverage of the checks performed and the judgments made.

Every finding names its subject, where it is, and the evidence it rests on. Passing tests show that the cases they exercise pass, within their coverage. A clean result is never a claim of complete correctness.

Testing keeps no registry of tests or findings. Its execution runs a capability's own cases as that capability defines them, and adds none.

## Consumer verification

A product may deliver, with its distribution, the cases by which a consumer verifies the product as installed. They are the product's own acceptance or conformance cases, kept apart from tests that serve only its engineering, and the product declares which cases they are.

The product documents one entry point for them. It locates the installed product by resolution, not by a source path, and needs no source checkout. It fails closed: a run in which no case failed but fewer cases executed than the product declares is unknown, never verified.

Each run gives exactly one result. It is failed when any case failed. It is unknown when no case failed but a declared case was skipped, not run or unable to run. It is verified only when every declared case ran and passed. Each result has its own exit status and its own summary, so no result is read from silence.

The evidence names what was exercised: the product's name, its version, where it is installed, and the identity of its bytes where the installation records one. What the installation does not record stays unknown.

A run works outside the consumer's content and leaves that content as it found it, and it shows that it did. Its procedure is repeatable: the same entry point can be run again against the same installation. Each run reports faithfully the outcome it observed, with its evidence and the conditions it ran under. The same installation does not promise the same outcome, since time, network, environment or a case's own nondeterminism may differ between runs, so each result stands for its own run only.

Product conformance and consumer integration are separate scopes. Conformance shows that the installed product behaves as its contract states, in surroundings the run builds for itself. Integration shows that the product is installed and configured correctly in one consumer. Each has its own verdict, and neither stands in for the other.

A consumer's result is the consumer's own observation of its run. It is not evidence Testing observed, and it changes no classification of a product's contracts.
