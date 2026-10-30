# Guard: Intent (why)

This is Guard's product contract: what the `@kaihacksai/kaal-guard` package promises, in five parts. [Intent](intent.md) says why; [Requirements](requirements.md) says what; [Architecture](architecture.md) says where each function lives; [Testing](testing.md) says how each promise is checked and where; [Limitations](limitations.md) says what Guard does not establish and which defects reached a published version. How to use Guard is in the package's README and in its Skill, `skills/kaal-guard/SKILL.md`.

Every identifier is written as `guard/<type><number>`: Intent (I), Requirements, Functional (F) and Nonfunctional (N), Architecture (A) and Test Cases (T). Numbers are stable and are never reused. A gap in the numbering is an identifier that belongs to how Guard is engineered, not to the product.

## Purpose

Guard connects a repository's own tests and checks to local Git hooks and to remote GitHub CI enforcement, so that a check means the same thing before a push and before a merge. It is not a general verification or policy framework.

## Intended outcomes

Requirements trace back to these identifiers.

- **guard/I1 The repository owns its checks.** Guard runs what the repository names. It adds no tests and judges no evidence. Guard's configuration tells Guard what to guard. The repository owns its checks and their implementations, and Guard owns the configuration contract and its deterministic validation.
- **guard/I2 One meaning per check.** For equivalent facts and execution conditions, a check gives the same verdict locally and in CI. Locally it is early feedback; CI is the authority.
- **guard/I3 Narrow adapters.** Git's hook and GitHub's workflow jobs pass facts to Guard and act on its verdict. Neither contains a rule.
- **guard/I5 Embed.** The self-contained `kaal-guard` package has no dependency on any other KAAL element. Packed, it installs into, operates in and removes cleanly from an unrelated repository, and its own tests pass there. An existing consumer moves from one published version to the next, and back, safely: package code arrives through its dependency and lockfile, managed hook and CI assets through `upgrade`, and what the consumer owns or has changed stays as it is. This holds from `0.0.2` on. Moving from `0.0.1` to `0.0.2` is a deliberate breaking change within SemVer `0.0.x`, with no migration, no dual format and no rollback across it. A `0.0.1` consumer sets `0.0.2` up fresh, as the release notes describe. From `0.0.2` it requires Node 24 or later.
- **guard/I7 Guided resolution.** When a check fails or cannot judge, the hook and CI point the agent or person resolving it to Guard's own `kaal-guard` Skill. Guard's own lifecycle installs the Skill at its canonical location and the reminder names it, so it is reachable without Core. When Core manages the installation, Core adds the provider-aware deployments and pointers. The Skill explains how to read and reproduce the verdict. The verdict itself is still the exit status, and nothing that is printed decides it.
- **guard/I8 Consumer verification.** A consumer verifies that the Guard package they installed works as intended, with one documented command, in any repository, with no KAAL checkout and nothing installed beyond Guard. The package delivers its own outer acceptance cases and runs them against the installed copy. The run is isolated, leaves the consumer's content as it was, names the installed version and bytes it exercised, and ends in one of three results: verified, failed or cannot verify. It verifies the package only. Whether this repository integrated Guard correctly stays with `kaal-guard verify`. Guard realizes Testing's consumer-verification semantics in its own code, and depends on no Testing package.
- **guard/I9 A complete product.** The installed package is a complete, intelligible product. It carries its Intent, Requirements, Architecture, Operations, Testing and known Limitations, and the Test Cases for everything it ships and promises, in each loop it owns, outer and inner. All of this is authoritative in the package, and it is usable with no KAAL checkout. What the consumer configures, integrates or implements is the consumer's to test. The package supports that with instructions and tools, and neither loop substitutes for the other.

## Boundaries

- Guard carries no branching policy. A repository's branching checks are ordinary checks that Guard runs, like any other.
- Guard does not replace GitHub's required reviews, required checks or auto-merge. It supplies required checks to them.
- Guard has one Agent Skill, `kaal-guard`, because guiding a verdict's resolution (guard/I7) is a distinct responsibility. It ships with the package and is installed by it.
- The repository owns its test content and what its evidence means. Guard reports verdicts.
