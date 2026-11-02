# Review distribution: Intent

This is a PLAN Change for `review`. It ships no code. It decides how kaal-review is delivered: to npmjs (primary target) and to main (secondary target), and what its tests may depend on. Kai decides the open questions below by reviewing this PR.

## State

- `kaal-review` 0.0.1 lives on `kaal/review` only: the Review Skill Node, three Definitions (HOW ARE WE DOING?, ROWING, TOGETHER WE CAN GO FAR), one Agent Skill and one test file. It is not on main. `npm view kaal-review` returns E404.
- `kaal/review` is behind main and needs a SYNC (Kai's explicit authorization) before any promotion.
- The package `files` are `payload` and `skills` only. `devDependencies` are `kaal-core`, `kaal-engineer-skill`, `kaal-graph`, `kaal-hosting` and `kaal-testing`. Every one of them is imported by `test/review.test.mjs` (admission into a fresh Engine, Skill conformance, claim reading, packed file list). None are in the published package, so they do not block a publish. They only decide when the installed-package verification can run against registry versions.

## Finding

The Agent Skill (`skills/kaal-review/SKILL.md`) opens by deferring to the Nodes `Review` and `HOW ARE WE DOING?` "in a KAAL Engine". Its review rules (read the work and its evidence, report each finding with what was checked, say what was not checked, leave the human what to observe, a review grants no authority, never weaken a check to pass review) do not depend on KAAL. A repository without an Engine therefore gets a Skill that points at Nodes it cannot read.

## Decision for Kai: does kaal-review get an npm package?

The rule is that a capability gets a package only if a non-KAAL repository can benefit from it for non-KAAL work.

- **A. Package, skill-first (recommended).** The review rules benefit any repository where Agents review each other's work. Make `SKILL.md` self-contained: the rules stand on their own, and the Engine Nodes are an optional deeper reference. The package keeps its exact current file set. Publish follows Hosting and Core, first publication being the Owner 2FA publish of the verified Release artifact.
- **B. No package.** Review stays with the KAAL Engine and main only. Nothing to publish. The Skill's wording stays as it is.

## Dependency trim

No trim of `devDependencies`: each is genuinely exercised. The test is the evidence for the Skill contract and must not be weakened. What changes under A is only that the verification of the installed package waits for `kaal-hosting`, `kaal-core` (publish order) and, if kept as registry dependencies, `kaal-graph`, `kaal-testing` and `kaal-engineer-skill`. If Kai prefers not to wait on those, the alternative is to verify the packed tarball in the Engineering lane, as other packages do, and treat registry-version verification as a later gate. This needs Kai's call and the owning threads' agreement (Engineering for the lane, Hosting and Core for publish order).

## Sequence once decided

1. Kai reviews and decides A or B (this PR).
2. With explicit authorization: SYNC main into `kaal/review`.
3. A DO Change turns the planned tests GREEN (self-contained SKILL.md under A, with a test that it carries no unresolved reference to a Node).
4. With explicit authorization: promotion `kaal/review` to main, then publish under A.
