# Consumer Verification: Intent

This is `testing/C9`, a PLAN Change. It ships no code and no Definition text. `testing/C10` turns its planned tests GREEN by writing the planned text into the `Testing` Node, the Agent Skill and the README.

The Owner's direction "Consumer-verifiable npm packages: Guard 0.0.4 + KAAL Testing" (2026-10-27) asks two things:
- a consumer with an arbitrary repository installs a KAAL product and runs the product's own test setup, to verify that the installed product works as intended;
- KAAL Testing establishes the reusable contract that supports this, and is not a new testing framework.

Each product owns its Test Cases, expected behaviour and acceptance criteria. Testing owns the reusable semantics. The Owner chose npm as the first realization, not the definition, and Testing depends on no product, package manager, version control system or hosting service.

Testing already holds what this needs, for the producer's side:
- the four finding kinds;
- an outcome kept apart from a runner's exit status;
- a skipped or unrun test as unknown, never a pass;
- a clean result bounded by its coverage;
- packed bytes only.

This Change states the same semantics for the consumer's side.

- **testing/I6.** A consumer can verify an installed product without the product's source, its engineering workspace or any KAAL framework. The run's result is explicit: verified, failed, or unknown, which means it could not verify. Each of these is distinguishable from the others without reading the cases, and none is inferred from silence.
- **testing/I7.** Verifying the product and verifying its integration into one consumer are different claims. Each has its own verdict. A consumer's result is the consumer's own observation, and it is never evidence Testing observed.
