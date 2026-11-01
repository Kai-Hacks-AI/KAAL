# Core 0.0.1 initialization and consumer completion: Intent

Proposed `core/C40` PLAN. It changes no runtime, payload, package identity, installed Engine, CI routing or release state. Its tests describe the proposed acceptance boundary; RED cases are not enabled as normal CI suites before their DO.

## Outcome

- **core/I26** A fresh consumer and its agent can discover Core's own procedure, inspect what is available, and deliberately initialize, register and verify through Core's public interface, without a KAAL checkout or undocumented Engineering command.
- **core/I27** Initializing a KAAL Engine explicitly declares its mandatory infrastructure. Core admits each owner's own contribution; a runtime dependency, a directory or an agent's use is never evidence of registration or admission.
- **core/I28** Core's release evidence is independently usable by Testing, Packaging and Hosting, and names the exact candidate and host. Product acceptance, promotion and publication remain separate decisions.

## Existing product boundary retained

Core 0.0.1 includes the Kernel and foundational Nodes, identity and admission, deterministic structured frontmatter, CASE contribution registration, scoped registration admission, Installation Contracts and conformance, Agent Realization, lifecycle and the documented API/CLI. These were promoted through #734 at `b228dfa9216c1ec55594235e43a92201fd8f88c1`.

Node Form and identity remain Graph's contract, delivered by Core with provenance. Graph is a build dependency. Graph analysis remains unavailable in this release: `cycles`, `incoming` and `reach` are `null`, never an empty or successful analysis. Registration remains opt-in for arbitrary Engines; the explicit `init` operation has a stricter initialization postcondition. Generic `bootstrap`, `evaluate`, `catalog` and `verify` do not acquire or activate other capabilities.

Core owns no Branching, Change, Testing, Engineering or domain semantics. Typed relationship kinds, recorded term alignment, Graph-present composition, Standards, a persistent catalogue/index, automatic skill invocation, a new installer and general external lifecycle management are outside this delivery.

## Authority and unresolved dependencies

This PLAN follows the Owner's Core initialization/BASS direction on #622, comment 6507553551, and the distinctions on #600, comment 6505121887. It proposes the missing fail-vs-diagnostic policy explicitly: a requested new `init` fails before writing when a mandatory declaration cannot be admitted; inspecting an arbitrary uninitialized or incomplete Engine remains diagnostic under its existing contracts.

Hosting is presently an Extension. Core must preserve that kind rather than relabel it a Capability. Foundation's independently published SHA-256 package is not itself a Foundation contribution declaration. The acquisition of Foundation's owner-authored declaration remains a genuine dependency to align with Foundation before initialization DO.

The Owner reviews these semantics before DO. This PLAN is not approval to merge #786, lift its ordering hold, synchronize or promote a collector, publish to npm, or activate anything in a consumer.
