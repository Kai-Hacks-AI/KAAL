# Multi-Loop Testing and Sensitivity: Requirements

Each Requirement names, in brackets, the Intent it serves. All answer `testing/I44`.

## Functional

- **testing/F156** [testing/I44]: **Composable testing dimensions (`Concern/Claim` × `Evidence method/boundary`).** `skills/kaal-testing/SKILL.md` updates its frontmatter `description` (removing the stale "three loops" phrasing) and replaces `## The three loops` with `## Testing loops`. The section teaches two composable dimensions rather than a fixed triad or a monolithic chain:
  - **Concern / Claim:** what expectation is evaluated and who owns it (`src -> architecture -> requirements -> intent`, extensible with additional concerns on top).
  - **Evidence method / boundary:** what observation or judgment supports a claim, explicitly preserving **Architecture conformance** (`permitted` / `prohibited` / `undecidable` + validation judgment), **Capability acceptance** (delivered package installed fresh, public interface only, supported hosts, promised failures), **Implementation** (test-first internal behaviour), and **Judgment** (when an outcome cannot be settled by a deterministic oracle).
  - **Reuse without conflation:** one observation may support multiple claims via separate, explicitly qualified inferences without duplicating executions; separate meaning and accountability never require redundant runs, while each claim keeps its own qualification and never substitutes for another.
  Whether the Skill effectively teaches this is judged by the Skill trial (`testing/C72`), never by text-matching regexes.
- **testing/F157** [testing/I44]: **Behavioural RED and Targeted Mutation Verification.** `## Testing loops` teaches two sensitivity checkpoints at loop boundaries:
  - **Behavioural RED:** before implementing, run the loop's tests against an inert stub (or unfixed target) with valid shape returning neutral values while preserving unrelated valid exports/behaviours when testing a focused claim; the run must fail on a behavioural assertion, whereas a missing module, syntax error, or setup failure is *blocked* (UNKNOWN), never RED evidence.
  - **Targeted Mutation Verification:** after turning GREEN, challenge the tests with targeted, contract-breaking mutations tied to authoritative claims and concrete witness inputs; a kill requires that the intended behavioural assertion detects the introduced violation (never just an unrelated error or a broad stub masked by an unrelated check), outcomes are classified as `killed`, `survived`, `invalid`, or `unresolved`, and a surviving mutant is bounded evidence that the suite did not reject that change — reported as a `potential defect` finding via [references/findings.md](../../skills/kaal-testing/references/findings.md) with its owning claim, leaving Defect creation, placement, correction, and closure to Review, Defect, and Architecture.
  Whether the Skill effectively teaches this is judged by the Skill trial (`testing/C72`).

## Skill Trial Acceptance Criteria (`testing/C72`)

Whether `## Testing loops` achieves `testing/I44` is established by a **judged Skill trial** in `testing/C72`, not by deterministic wording assertions or vocabulary recall. Give fresh agents (with and without the updated Skill) a concrete bounded task containing five deliberately distinct evidence needs:

1. one behaviour with an unambiguous expected result;
2. one architectural boundary;
3. one setup failure that must **not** be called behavioural RED;
4. one plausible test gap exposed by targeted mutation; and
5. one underspecified or judgment-only claim.

The trial evaluates whether the agent actually identifies the claims needing evidence and traces them to their owners, chooses and composes appropriate concerns and evidence methods (including reusing one observation across multiple concerns with qualified inferences without overclaiming), distinguishes behavioural RED from blocked execution, challenges an inadequate claim, and uses targeted mutations with witness inputs to expose inadequately tested contracts. Record the trial protocol, author's key, raw agent transcripts (with prompt hashes), and an independently reviewed assessment citing verbatim excerpts found in the transcripts.

## Nonfunctional

- **testing/N35** [testing/I44]: **Consumer-agnostic, minimal Skill surface, and ownership boundary.** The Skill remains consumer-agnostic and introduces no KAAL runtime dependencies, no new exports, no `scripts/` directory, and no extra `references/` files (`skills/kaal-testing/` holds only `SKILL.md` and `references/findings.md`). The new Skill guidance names no hardcoded KAAL repository paths (such as `.kaal/`, `engineering/`, or `packages/`), and makes Testing own no Defect lifecycle, placement, correction, or closure. `kaal-engineer-skill`'s `checkSkill("kaal-testing", ...)` passes with zero violations and zero warnings.
