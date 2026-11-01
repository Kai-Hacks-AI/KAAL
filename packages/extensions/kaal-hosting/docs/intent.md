# Hosting: Intent (why)

This is Hosting's product contract: what the `@kaihacksai/kaal-hosting` package promises, in five parts. [Intent](intent.md) says why; [Requirements](requirements.md) says what; [Architecture](architecture.md) says where each function lives; [Testing](testing.md) says how each promise is checked and where; [Limitations](limitations.md) says what Hosting does not establish. How to use Hosting is in the package's README.

Every identifier is written as `hosting/<type><number>`: Intent (I), Requirements, Functional (F) and Nonfunctional (N), Architecture (A) and Test Cases (T). Numbers are stable and are never reused. A gap in the numbering is an identifier that belongs to how Hosting is engineered or published, not to the product.

## Purpose

Hosting is the host-facing KAAL Extension: it enables KAAL to operate within its host environment. It provides the filesystem operations KAAL needs and the running of installed commands, with the same guarantees on Linux, Windows and macOS. Anything above Hosting states the operation it needs; how the host realizes it is Hosting's concern. Hosting knows paths, bytes and commands only; what the files mean is KAAL Core's concern.

Hosting is also KAAL's one operating-system boundary. It is the only capability whose code, and whose tests, may differ between hosts, and it gives every other capability the means to find out where it reaches past that boundary.

## Intended outcomes

Requirements trace back to these identifiers.

### Operating on the host

- **hosting/I12.** KAAL reads, publishes and populates directories, inspects paths and runs installed commands through Hosting alone, with one meaning on every supported host. A name that some host cannot hold faithfully is refused on all of them, so what one host writes stays portable to the others, and nothing Hosting reads or writes lies outside the directory it was given.

### Guarded file reconciliation

Hosting's `update` only publishes a new directory, and `initialize` only fills an empty one. Neither can replace or remove an individual file in a directory that already holds other people's work, such as a repository. `reconcile` can.

- **hosting/I1.** KAAL can bring individual files in a directory to a planned state, writing, replacing and removing them, and never overwrites or removes a file that, when the reconciliation checks it, is not what the plan expected. A change made after that check by a writer that does not use Hosting is outside this guarantee.
- **hosting/I2.** A reconciliation applies all of its changes, or, when Hosting observes a failure while applying, none of them, and it reports the outcome of every one. This is rollback on observed failure. It is neither atomic across a crash nor isolated from readers or from writers that do not use Hosting (see [Limitations](limitations.md)). When the host also refuses the rollback, Hosting says so, distinctly from a rollback that succeeded, and never loses a file it displaced: it keeps every original it could not put back where the caller can recover it.
- **hosting/I3.** Whoever plans a reconciliation states only paths, bytes and intent. How the host realizes it, executable modes included, is Hosting's concern, so nothing above Hosting knows the OS.
- **hosting/I4.** A caller can make a reconciliation depend on files it relies on but does not change, such as files it read to verify a plan. The reconciliation then applies only if those files are still as the caller read them, and it never touches them.

### A product its consumer can verify

- **hosting/I5.** A consumer installs Hosting from the registry as `@kaihacksai/kaal-hosting` and uses it through that name alone, with the same interface and guarantees as today. Nothing in KAAL still reaches Hosting by its old name.

- **hosting/I6.** A consumer verifies that the Hosting they installed keeps its guarantees on their host, with one documented command, with no KAAL checkout and nothing installed beyond Hosting and its runtime dependencies. The run exercises the installed copy, leaves the consumer as it was, names what it exercised, and ends in one of three results: verified, failed or cannot verify.
- **hosting/I7.** The installed package is a complete, intelligible product. It carries its Intent, Requirements, Architecture, Testing and Limitations, and the Test Cases for what it promises, in each loop it owns. They are authoritative in the package and usable without this repository.
- **hosting/I9.** Hosting exposes exactly the package interfaces its Architecture declares and supports, no more and no fewer, and each one it exposes ships and loads. The test that guards this takes the permitted interface from the Architecture, never from the candidate's own `package.json`, so an undeclared entry cannot authorize itself, and an approved extension needs no edit to the test.

### The operating-system boundary for every other capability

- **hosting/I8.** Every capability other than Hosting can find out, with traceable evidence, where its production or test code couples to a particular platform instead of going through Hosting. That covers a branch on the operating system, a test registered, skipped or weakened by platform, and a direct host-specific API that Hosting should mediate. Production code that asks the host which platform it is, or uses a host-specific API, fails a Test Case. A platform decision in test code is put to a reviewer, who decides whether it is legitimate fixture setup or prohibited weakening. Legitimate setup is reported apart from assertion dilution, a test registered or an assertion made by platform stays visible even when acknowledged, and each capability corrects its own code.
- **hosting/I10.** No capability other than Hosting names an operating system, in its code, its tests or its applicability. Where a case genuinely needs something only some hosts have, it names a host fact that Hosting defines. Hosting establishes on each host, by trying, whether that fact holds, gives the fixture, and states the evidence per host in a guide a reviewer can check. Hosting's audit finds every applicability scoped by platform outside the boundary, every host exception that names an unknown fact or lacks a reason, evidence or a registered case, and every case a platform decision selects or weakens. It puts every host exception to Review. So a case is either the same on every host or visibly not applicable for a reason Hosting established, never silently omitted or weakened.

## Boundaries

- Hosting knows paths, bytes and commands. What a file means, and which files a plan writes, keeps or prunes, are its caller's (KAAL Core's).
- Hosting depends on no other KAAL package. Other capabilities depend on it; a capability inspected by its conformance suite never does.
- Hosting defines what its conformance suite finds, tests and asks. Review decides each judgment, Testing decides how a result is counted, and each capability corrects its own code.

## Agent-facing use

- **hosting/I14.** A consumer, human or agent, can discover and use the installed Hosting product to read, initialize, update and reconcile files, execute installed commands, and interpret verification and boundary findings without a KAAL checkout. The agent-facing Skill guides use of the same public contracts as the Bare API. It neither reimplements host operations nor grants authority to change the consumer's files.
