# Consumer Verification: Requirements

Each Requirement names, in brackets, the Intents it serves. Each functional Requirement is one statement that `testing/C10` writes verbatim into the `Testing` Node (`payload/Testing.md`), under the heading `## Consumer verification`.

## Nonfunctional

- **testing/N5** [testing/I6]: The consumer verification semantics are realization-neutral.
  - The Node's consumer verification section names no product, package manager, version control system or hosting service.
  - It adds no mechanism to kaal-testing: its exports and runtime dependencies are unchanged.
  - npm is the first realization, and it is recorded in this PLAN's Architecture, never in the Definition.

## Functional

- **testing/F11** [testing/I6]: Delivery.
  > A product may deliver, with its distribution, the cases by which a consumer verifies the product as installed. They are the product's own acceptance or conformance cases, kept apart from tests that serve only its engineering, and the product declares which cases they are.
- **testing/F12** [testing/I6]: One entry point that fails closed.
  > The product documents one entry point for them. It locates the installed product by resolution, not by a source path, and needs no source checkout. It fails closed: a run that executes fewer cases than the product declares is unknown, never verified.
- **testing/F13** [testing/I6]: Three results, each distinguishable.
  > Each run gives exactly one result. It is failed when any case failed. It is unknown when no case failed but a declared case was skipped, not run or unable to run. It is verified only when every declared case ran and passed. Each result has its own exit status and its own summary, so no result is read from silence.
- **testing/F14** [testing/I6]: The subject is named.
  > The evidence names what was exercised: the product's name, its version, where it is installed, and the identity of its bytes where the installation records one. What the installation does not record stays unknown.
- **testing/F15** [testing/I6]: Isolation and repeatability.
  > A run works outside the consumer's content and leaves that content as it found it, and it shows that it did. Repeating a run against the same installation gives the same result.
- **testing/F16** [testing/I7]: Two scopes.
  > Product conformance and consumer integration are separate scopes. Conformance shows that the installed product behaves as its contract states, in surroundings the run builds for itself. Integration shows that the product is installed and configured correctly in one consumer. Each has its own verdict, and neither stands in for the other.
- **testing/F17** [testing/I7]: Whose observation it is.
  > A consumer's result is the consumer's own observation of its run. It is not evidence Testing observed, and it changes no classification of a product's contracts.
