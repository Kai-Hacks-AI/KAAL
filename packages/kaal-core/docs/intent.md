# kaal-core: Intent

This document says why kaal-core exists and what it must achieve. [Requirements](requirements.md) says what it must do, [Architecture](architecture.md) says how it is built, and [Limitations](limitations.md) says what 0.0.1 does not do.

## What kaal-core is

KAAL is a way to manage a repository with Markdown files that both people and agents read. Some of those files are Nodes: a Node is a UTF-8 Markdown file that begins with YAML frontmatter in a fixed Form, and its identity is the SHA-256 of its exact bytes. A Node names its type by reference to another Node, by name and id.

kaal-core is the smallest working KAAL. It carries:

- the Kernel, `KAAL-KERNEL.md`, which brings the first Nodes into being;
- the foundational Nodes: `Node`, `KAAL Definition`, `KAAL Capability`, `KAAL Agent`, `KAAL Skill` and `KAAL Extension`, and the Definitions `CASE`, `LOVE`, `Installation Contract` and `Agent Realization`;
- the code that bootstraps an Engine (a directory of Nodes, `./.kaal/` by default), admits Nodes by identity and type, registers contributions, validates frontmatter, checks installation contracts, realizes Skills for agents, and assembles registrations.

CASE names four parallel kinds: Capabilities, Agents, Skills and Extensions. Core owns the machinery around them. It owns no discipline's meaning: what a Requirement, a Test Case or an Architecture element means belongs to the capability that defines it.

## Identifiers

Every statement in these documents carries a stable identifier. `core/I…` is an Intent, `core/F…` a functional Requirement, `core/N…` a nonfunctional Requirement and `core/A…` an Architecture element. The delivered tests name the identifiers they check, so a reader can follow a statement from this document to a test. Identifiers in other namespaces, such as `testing/…` or `hosting/…`, belong to other KAAL capabilities.

## The Intents

### Deterministic frontmatter

- **core/I1.** Whatever an artifact's frontmatter decides (an execution, a dependency, a verdict) can be read from the frontmatter alone, deterministically. No machine decision depends on the Markdown body.
- **core/I2.** An artifact whose frontmatter breaks its rules is identified before anything acts on it, and the reason is named.
- **core/I19.** Nested frontmatter is as deterministic and as closed as flat frontmatter. Every part of a structured value is declared, a broken part is named by where it is, and there is no free-text value kind.

### Installation and agents

- **core/I3.** Every Capability states what an installation of it is in one installer-neutral contract, in one format Core owns. Whichever installer realizes the contract, the Capability's own or Core, the other can upgrade and remove the result.
- **core/I4.** An agent of every provider a repository declares reaches each installed Skill. Each Skill has one canonical source, and any copy a provider needs is generated from it.
- **core/I5.** Installation never takes what is not its own. A file someone changed is kept and reported, only what an installer wrote is pruned, and instruction files such as `AGENTS.md` and `CLAUDE.md` stay their authors'.
- **core/I14.** Core defines no Skill format. It deploys every file of a Skill with the bytes the Capability ships.
- **core/I20.** Core's conformance cases for the Installation Contract are defined once and run against any contract instance. A case never holds silently, and using the cases changes nothing in Core's runtime.

### Typed artifacts

- **core/I6.** An Engine tells a typed artifact from a Node by a positive signal in the frontmatter, never by where the file is. Nothing that begins with frontmatter is skipped silently.
- **core/I7.** Every typed artifact's Type is in exactly one state: registered, unregistered, unknown or invalid. A missing registration is a remediable finding, not proof that the content is wrong.
- **core/I8.** Registration and Type integrity can be checked afterwards, without changing the artifacts.

### Core as a package

- **core/I9.** Core provides the management capabilities that make a repository KAAL-managed: the recursive structure of Capabilities, their composition, installation contracts, realization and lifecycle. It owns none of the domain semantics of Intent, Requirements, Architecture, Code, Testing or Operating.
- **core/I10.** A package steps up from internal capability to reusable or published package only when it meets LOVE: Lifecycle, Ownership, Verification and Encapsulation. Meeting LOVE is a maturity judgment and never authorizes a release.
- **core/I11.** Ownership never runs in a circle. Core depends on no discipline, and a discipline that judges Core owns none of Core's cases.
- **core/I12.** An Engine Core installs can be installed, upgraded and removed, and anyone can read which version of Core installed it.
- **core/I13.** Core is installed by an Installation Contract of its own, like any other Capability, with no special lifecycle.
- **core/I24.** kaal-core installs and works without KAAL's Graph package. Its Node support is Graph's contract delivered inside kaal-core. Graph's traversal and analysis stay with Graph, and Core reports honestly when they are absent.

### Registration and traceability

- **core/I15.** A holder claims its scope explicitly, and one scope has one holder. A competing claim is detected and never resolved silently.
- **core/I16.** Trace rules and trace instances are distinct, explicit and one-way. A rule is registered only by its kind's owner, a trace is stated only by the instance it goes out from, reverse views are derived, and a trace that is not stated is never inferred.
- **core/I17.** Local and global validation complement each other. Each Capability judges its own kinds and content. Core judges only the assembled graph: who holds what, whether references resolve, and whether each trace is permitted.
- **core/I18.** Registration is additive and opt-in. An Engine with no registrations behaves as it would without the feature.
- **core/I21.** A term that several owners define is discoverable and never resolved silently. Assembly reports it as unaligned and merges nothing.

### Release

- **core/I22.** kaal-core 0.0.1 releases Core with registration, and a consumer receives documents that explain the package and tests that verify the installed copy.
- **core/I23.** A release is accepted from the packed artifact in a clean installation, where a consumer observes it, not from the source repository.

## What kaal-core does not decide

- What a kind, a Type or a shared term means. Each belongs to its owner.
- What `verified` means. That is KAAL's Testing capability's definition, which kaal-core applies to its own package (see [Testing](testing.md)).
- Whether a package is published. That is the Owner's decision, never a consequence of a test result.
