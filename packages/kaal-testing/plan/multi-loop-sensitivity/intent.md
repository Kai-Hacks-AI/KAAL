# Multi-Loop Testing and Sensitivity: Intent

This is `testing/C69`, a PLAN Change. It ships no package code and changes no Skill. `testing/C70` (DO, not yet authorized) updates the `kaal-testing` Skill. `testing/C71` (DO, not yet authorized) pilots the landed Skill on `packages/kaal-testing/lib/contracts.mjs` and `test/contracts.test.mjs`. Provisional ids: renumbered if another Change lands on `main` first and takes any of them.

**What is missing.** Two gaps sit side by side in how `kaal-testing` guides outer-to-inner TDD:

1. **A fixed list of three loops instead of composable loops.** `skills/kaal-testing/SKILL.md` treats testing as a fixed triad (`Architecture conformance`, `Capability acceptance`, `Implementation`). In practice, testing forms a composable multi-loop graph: inner work serves outer loops upward (`src -> architecture -> requirements -> intent`, with further loops composable on top), and a layer such as `architecture` can serve multiple loops at once (for example `requirements` and a lateral `defect` loop), while keeping each loop's evidence strictly separate.
2. **No explicit sensitivity checkpoints at loop boundaries.** KAAL already uses inert-stub RED and targeted mutation checks in isolated places (`kaal-core/src/conformance.ts`, `test/engineer/duplicates-mutations.mjs`), yet the Skill does not teach the general, consumer-agnostic discipline for outer-to-inner TDD: proving an outer test fails on a behavioural assertion against an inert stub before implementation (rather than failing blocked on a missing module), and challenging GREEN code with targeted contract-breaking mutations to surface unpinned invariants as `potential defect` findings.

- **testing/I43**: Testing teaches a composable multi-loop model (`src -> architecture -> requirements -> intent`, extensible upward and with multiple/lateral targets such as `defect`) paired with Behavioural RED and Targeted Mutation Verification at loop boundaries, keeping the Skill consumer-agnostic, minimal (`SKILL.md` + existing `references/findings.md` only), and strictly BASS-ordered (Skill first; any reusable Script deferred to a later Change only if the pilot proves it is earned).

Principle: follow BASS (`Bare < Agent < Skill < Script`). Teach the method cleanly in the Skill first, test the landed Skill on one bounded subject (`lib/contracts.mjs`), and defer any `engineering/` or `.kaal/` wiring or reusable script extraction to a separate follow-up Change.

**Out of scope.** No new exports, no `skills/kaal-testing/scripts/`, no extra `references/` files, no edits to `capability/Testing.md` or `payload/Testing.md`, no changes to `engineering/`, `.kaal/`, or `.github/`, and no fixes for pre-existing Windows/sandbox baseline issues on `main`.
