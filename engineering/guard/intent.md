# Guard: Intent (why)

## Purpose

Guard connects a repository's own tests and checks to local Git hooks and to remote GitHub CI enforcement, so that a check means the same thing before a push and before a merge. It is not a general verification or policy framework.

## Intended outcomes

Requirements trace back to these identifiers.

- **I1 The repository owns its checks.** Guard runs what the repository names. It adds no tests and judges no evidence.
- **I2 One meaning per check.** For equivalent facts and execution conditions, a check gives the same verdict locally and in CI. Locally it is early feedback; CI is the authority.
- **I3 Narrow adapters.** Git's hook and GitHub's workflow jobs pass facts to Guard and act on its verdict. Neither contains a rule.
- **I4 Engineer.** KAAL's own checks run through Guard, locally and in KAAL's existing CI, with no loss of check identity, OS matrix or coverage.
- **I5 Embed.** The self-contained `kaal-guard` package has no dependency on any other KAAL element. Packed, it installs into, operates in and removes cleanly from an unrelated repository, and its own tests pass there. An existing consumer moves from one published version to the next, and back, safely: package code arrives through its dependency and lockfile, managed hook and CI assets through `upgrade`, and what the consumer owns or has changed stays as it is.
- **I6 External.** KAAL Engineering delivers Guard naked into a target as an actual Change: working hooks, working CI and local docs, adding neither the package nor any KAAL element.
- **I7 Guided resolution.** When a check fails or cannot judge, the hook and CI point the agent or person resolving it to Guard's own `kaal-guard` Skill, deployed where the agent can reach it, as Core's Agent Realization decides from the one source. The Skill explains how to read and reproduce the verdict. The verdict itself is still the exit status, and nothing that is printed decides it. This holds for Embed and External alike.

The mission is met only when I1 to I6 all hold. I7 is the separately scoped `0.0.2` improvement ([Change](change.md#agent-guidance)). Reaching some of them is a checkpoint, not completion ([Change](change.md#stopping-conditions)).

## Boundaries

- Guard carries no branching policy. KAAL's branching checks are ordinary KAAL checks that Guard runs, like any consumer's checks.
- Guard does not replace GitHub's required reviews, required checks or auto-merge. It supplies required checks to them.
- Guard contains an Agent, Skill, Extension or sub-Capability only where a distinct responsibility justifies one. Guiding a verdict's resolution (I7) justifies one Agent Skill, `kaal-guard`. It is an Agent Skill shipped with Guard and delivered by it. It is not a CASE registration, which stays with #331 and #258.
- Testing owns what evidence means. The repository owns its test content.
