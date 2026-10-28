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

The mission is met only when I1 to I6 all hold. Reaching some of them is a checkpoint, not completion ([Change](change.md#stopping-conditions)).

## Boundaries

- Guard carries no branching policy. KAAL's branching checks are ordinary KAAL checks that Guard runs, like any consumer's checks.
- Guard does not replace GitHub's required reviews, required checks or auto-merge. It supplies required checks to them.
- Guard contains an Agent, Skill, Extension or sub-Capability only where a distinct responsibility justifies one. None is needed now.
- Testing owns what evidence means. The repository owns its test content.
