# kaal-testing: Intent

This is why kaal-testing exists and what it promises. Each Intent is identified as `testing/I<n>` and is defined here once. The [Requirements](requirements.md) refine it, the [Architecture](architecture.md) realizes it, and the [Testing](testing.md) document says how it is verified.

Testing defines how a capability's tests are designed and executed, and how their evidence is measured and reported. It defines evidence semantics only. Gates are Engineering's, acceptance decisions are Change's, and operating-system-specific behaviour is Hosting's alone.

## RED Evidence and Feature-Accepted Regressions

- **testing/I1**: A RED is evidence and is never hidden. Every failing Test Case is reported under its own identity and class, and nothing presents a failure as GREEN. This includes a skipped or `todo` test, an accepted regression, and an established Test Case that disappeared.

- **testing/I2**: A regression is judged against the observed baseline the caller supplies, from observed evidence only. Testing neither selects nor authorizes that baseline. A Test Case is a regression only when the baseline observed it GREEN. It is new only when the baseline observably did not have it. Evidence that is unknown stays unknown, and never counts as absent, new or GREEN.

- **testing/I3**: Testing evaluates but neither decides nor gates. Testing holds no acceptance:
  - When a Change hands in the outcome of its FAR decision, Testing consumes it. Without one, nothing is accepted. Testing never stores, grants or extends one.
  - It evaluates deterministically against the policy a gate supplies, and it names no gate of its own.
  - The authority to accept is the Change's. The gates are Engineering's, and Guard executes them.

## Contract Evidence from Observed Runs

- **testing/I4.** Testing alone defines what counts as independent evidence that a package's consumer-visible contract holds, and how that evidence is classified:
  - **Same semantics for every package.** Every capability's package, Core's included, is judged in the same way.
  - **No ownership of the judged.** Testing owns none of the cases it judges, and its judgment imports no package it judges.
  - **Consumers.** Core's LOVE names this meaning, and Engineering decides when it runs and what it gates.

- **testing/I5.** A contract statement rests on evidence only when Testing observed it: the capability's own tests ran against the package as delivered, in a run whose provenance Testing established. A record, a claim, a copied result, or a pass anywhere else stays unknown. What is observed is that tests passed. That they bear on the statement remains an inference, reported as the judgment it is.

## Consumer Verification

- **testing/I6.** A consumer can verify an installed product without the product's source, its engineering workspace or any KAAL framework. The run's result is explicit: verified, failed, or unknown, which means it could not verify. Each of these is distinguishable from the others without reading the cases, and none is inferred from silence.

- **testing/I7.** Verifying the product and verifying its integration into one consumer are different claims. Each has its own verdict. A consumer's result is the consumer's own observation, and it is never evidence Testing observed.

## PLAN Boundary Integrity

- **testing/I8.** Whichever realization a PLAN uses, Testing reads its result the same way:
  - a change to the declared boundary is a verified failure naming its owner and path;
  - an untouched boundary is "unchanged within the declaration", never "met";
  - whatever the realization did not compare stays unknown.

- **testing/I9.** Testing interprets and never produces the result. It imports neither Git nor Sealing. It keeps no registry and names no gate.
  - Testing interprets a verdict that a trust authority attests. It never authenticates one, and a verdict's own labels never make it trusted. Whether the candidate could rewrite the anchor, and whether the comparison was made, stays the authority's: Engineering's, and Sealing's for a Seal.

## Testing Model

- **testing/I10**: Testing owns only Testing's kinds. It defines Strategy, Plan, Suite and Case, their identities and their relationships, and nothing of any other Capability. A product declares only the levels it uses, and owns its instances. A Case's **tests →** trace points out to a subject whose kind and meaning belong to that subject's Capability. Who tests a subject is derived from these outgoing traces, never declared by the subject.

- **testing/I11**: Each Case, Suite and Plan has an explicit result in each Run, and nothing is read from silence. A Run says what it executed, and its results stand for that Run only. A Plan's acceptance follows an explicit policy that its caller supplies, never one inferred from a baseline. A Case the policy allows stays failed. Comparing runs is history and observation, and it changes no result.

## Consumer Verifier Conformance

- **testing/I14**: Every consumer verifier is held to the same observable behaviour, whoever implements it. Testing states that behaviour as conformance cases: the change a publisher's harness makes in a fresh consumer, and what any conforming verifier must then show. A verifier conforms only when everything it shows agrees with what the harness itself established: its exit status, its result, its cause, each case's outcome, and the installed package's evidence. A matching result word alone never conforms. Testing judges observations and runs nothing: packing, installing, changing the consumer and running the verifier are the harness's, in Engineering's Change.

## Applicability by Host Fact

- **testing/I18**: A case that needs a host fact is not applicable exactly where the harness established that fact not holding, through Hosting, with a reason and evidence. It stays visible, it is never counted as passed, and where the fact holds it runs with its assertions intact. Testing owns only how such a declaration is verified and counted. Hosting owns the facts, and Review owns whether each exception is genuine.

## Cross-Platform Inventory Parity

- **testing/I16**: One candidate's runs, one on each platform it supports, are read together:
  - The same declared cases stand on every platform, by identity.
  - Each case is visible in every platform's evidence, with its outcome there.
  - A case is exempt on a platform only by that platform's established applicability, and an exempt case is never counted as passed.
  - A case exempt on every platform is exercised nowhere, so it never verifies.
  - A case is exempted by a platform scope only in the operating-system boundary, Hosting. In any other package, a platform scope is an architectural violation, not an exemption.
  - Where a challenge leaves an unresolved finding on a case, the evidence for that case is unknown, never GREEN. The challenge is Hosting's cross-capability suite and review, or Engineering's enforcement.
  - Testing judges the runs it is given and runs nothing.

## BRITTLE

- **testing/I19**: A Test Case is Right when its verdict follows its target and nothing else. Testing names the two ways a case goes wrong, false RED and false GREEN, gives the design checks that prevent them, and makes each lesson improve the next Case through the same traces and versions Testing already has.

## Test Locations by Purpose and Owner

- **testing/I20**: A test's location says its purpose and its owner, mechanically. A capability's own shipped cases are its own and are never lane scenarios. Engineering's scenarios are Engineering's lane. KAAL sets no convention for another repository's tests. No location is a Testing kind, and no case's role is read from what a package happens to pack.

## Testing 0.0.1 Release Readiness

- **testing/I17**: kaal-testing 0.0.1 is a KAAL Package to Packaging's contract and to Guard's bar. It is published under its scoped name with exact registry dependencies. An installed copy carries its own product contract and its delivered cases. Its own verifier verifies that copy, in Testing's words, conforming to the contract Testing sets for every other verifier. Testing holds itself to its own semantics first.
