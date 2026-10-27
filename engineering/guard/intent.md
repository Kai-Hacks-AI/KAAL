# Guard: Intent (why)

## Purpose

Guard connects a repository's own tests and checks to local Git hooks and to remote GitHub CI enforcement, so that a check means the same thing before a push and before a merge. It is not a general verification or policy framework.

## Intended outcomes

Requirements trace back to these identifiers.

- **guard/I1 The repository owns its checks.** Guard runs what the repository names. It adds no tests and judges no evidence. Guard's configuration tells Guard what to guard. The repository owns its checks and their implementations, and Guard owns the configuration contract and its deterministic validation.
- **guard/I2 One meaning per check.** For equivalent facts and execution conditions, a check gives the same verdict locally and in CI. Locally it is early feedback; CI is the authority.
- **guard/I3 Narrow adapters.** Git's hook and GitHub's workflow jobs pass facts to Guard and act on its verdict. Neither contains a rule.
- **guard/I4 Engineer.** KAAL's own checks run through Guard, locally and in KAAL's existing CI, with no loss of check identity, OS matrix or coverage.
- **guard/I5 Embed.** The self-contained `kaal-guard` package has no dependency on any other KAAL element. Packed, it installs into, operates in and removes cleanly from an unrelated repository, and its own tests pass there. An existing consumer moves from one published version to the next, and back, safely: package code arrives through its dependency and lockfile, managed hook and CI assets through `upgrade`, and what the consumer owns or has changed stays as it is. This holds from `0.0.2` on. Moving from `0.0.1` to `0.0.2` is a deliberate breaking change within SemVer `0.0.x`, with no migration, no dual format and no rollback across it. A `0.0.1` consumer sets `0.0.2` up fresh, as the release notes describe. From `0.0.2` it requires Node 24 or later.
- **guard/I6 External.** KAAL Engineering delivers Guard naked into a target as an actual Change: working hooks, working CI and local docs, adding neither the package nor any KAAL element.
- **guard/I7 Guided resolution.** When a check fails or cannot judge, the hook and CI point the agent or person resolving it to Guard's own `kaal-guard` Skill. Guard's own lifecycle installs the Skill at its canonical location and the reminder names it, so it is reachable without Core. When Core manages the installation, Core adds the provider-aware deployments and pointers. The Skill explains how to read and reproduce the verdict. The verdict itself is still the exit status, and nothing that is printed decides it. This holds for Embed and External alike.
- **guard/I8 Consumer verification.** A consumer verifies that the Guard package they installed works as intended, with one documented command, in any repository, with no KAAL checkout and nothing installed beyond Guard. The package delivers its own outer acceptance cases and runs them against the installed copy. The run is isolated, leaves the consumer's content as it was, names the installed version and bytes it exercised, and ends in one of three results: verified, failed or cannot verify. It verifies the package only. Whether this repository integrated Guard correctly stays with `kaal-guard verify`. Guard realizes Testing's consumer-verification semantics (testing/C9) in its own code, and depends on no Testing package.

The mission is met only when guard/I1 to guard/I6 all hold. guard/I7 is the separately scoped `0.0.2` improvement ([Change](change.md#agent-guidance)). guard/I8 is the separately scoped `0.0.4` increment ([Change](change.md#consumer-verification-004)). Reaching some of them is a checkpoint, not completion ([Change](change.md#stopping-conditions)).

## Boundaries

- Guard carries no branching policy. KAAL's branching checks are ordinary KAAL checks that Guard runs, like any consumer's checks.
- Guard does not replace GitHub's required reviews, required checks or auto-merge. It supplies required checks to them.
- Guard contains an Agent, Skill, Extension or sub-Capability only where a distinct responsibility justifies one. Guiding a verdict's resolution (guard/I7) justifies one Agent Skill, `kaal-guard`. It is an Agent Skill shipped with Guard and delivered by it. It is not a CASE registration, which stays with #331 and #258.
- Testing owns what evidence means. The repository owns its test content.
