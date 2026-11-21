# Multi-Loop Testing and Sensitivity: Requirements

Each Requirement names, in brackets, the Intent it serves. All answer `testing/I44`.

## Functional

- **testing/F156** [testing/I44]: **Composable multi-loop model.** `skills/kaal-testing/SKILL.md` replaces the section `## The three loops` with `## Testing loops`, teaching testing as composable loops with clear boundaries rather than a fixed set of three. It covers an upward chain (`src -> architecture -> requirements -> intent`, extensible with further loops on top), evidence from a layer serving multiple concerns without merging them, explicit tracing from inner work to the claims it serves, and keeping each loop's runnable evidence separate so no loop substitutes for another. Whether the Skill effectively teaches this is judged by the Skill trial (`testing/C72`), never by text-matching regexes.
- **testing/F157** [testing/I44]: **Behavioural RED and Targeted Mutation Verification.** `## Testing loops` teaches two sensitivity checkpoints at loop boundaries:
  - **Behavioural RED:** before implementing, run the loop's tests against an inert stub (or unfixed target) with valid shape returning neutral values; the run must fail on a behavioural assertion, whereas a missing module, syntax error, or setup failure is *blocked* (UNKNOWN), never RED evidence.
  - **Targeted Mutation Verification:** after turning GREEN, challenge the tests with targeted, contract-breaking mutations mapped to stated invariants and boundaries; a mutant is **killed** only by an assertion failure, outcomes are classified as `killed`, `survived`, `invalid`, or `unresolved`, each mutant traces back to its owning claim or requirement, and a surviving non-equivalent mutant is reported as a `potential defect` finding via [references/findings.md](../../skills/kaal-testing/references/findings.md) with its owning claim—leaving Defect state, placement, and routing to Review, Defect, and Architecture. Whether the Skill effectively teaches this is judged by the Skill trial (`testing/C72`).

## Skill Trial Acceptance Criteria (`testing/C72`)

Whether `## Testing loops` achieves `testing/I44` is established by a **judged Skill trial** in `testing/C72`, not by deterministic wording assertions. The trial must show an agent given the updated Skill:

1. identifying the claims needing evidence and tracing them to their owning concerns;
2. choosing and composing the appropriate loops (including evidence serving multiple concerns without merging them);
3. distinguishing behavioural RED (assertion failure against an inert or unfixed subject) from blocked execution; and
4. using targeted mutations to expose inadequately tested contracts and reporting surviving mutants as calibrated findings with their owning claims.

Record the trial protocol, author's key, raw agent transcripts (with prompt hashes), and judged observations citing verbatim excerpts found in the transcripts so the judgment is independently reviewable.

## Nonfunctional

- **testing/N35** [testing/I44]: **Consumer-agnostic, minimal Skill surface, and ownership boundary.** The Skill remains consumer-agnostic and introduces no KAAL runtime dependencies, no new exports, no `scripts/` directory, and no extra `references/` files (`skills/kaal-testing/` holds only `SKILL.md` and `references/findings.md`). The new Skill guidance names no hardcoded KAAL repository paths (such as `.kaal/`, `engineering/`, or `packages/`), and makes Testing own no Defect lifecycle or routing. `kaal-engineer-skill`'s `checkSkill("kaal-testing", ...)` passes with zero violations and zero warnings.
