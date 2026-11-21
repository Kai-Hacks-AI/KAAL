# Multi-Loop Testing and Sensitivity: Testing

Verification of this Change splits cleanly across three distinct kinds of evidence: **deterministic Cases** (heading placement and Skill boundaries), a **judged Skill trial** (whether the Skill improves agent testing behaviour), and a **bounded one-off sensitivity trial** (`testing/C73` Change evidence driving durable regression tests).

## Deterministic Cases (`testing/T381`–`testing/T383`)

The planned Cases live in `packages/kaal-testing/test/plan/multi-loop-sensitivity/`, named `T<n>.red.mjs` with shared helpers in `lib.mjs` and runner `run-red.mjs`. Each Case exports `id`, `tests`, `title`, and `run()`. They stay outside `packages/kaal-testing/package.json` `scripts.test` until `testing/C72` turns them GREEN.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| `testing/T381` | `testing/F156` | Heading placement only: `## Testing loops` exists in `skills/kaal-testing/SKILL.md`, `## The three loops` is removed, and `## Testing loops` stands right after `## Assessing a test against its claim` and before `## Running acceptance` (frontmatter `description` adequacy is judged by review and the Skill trial, never regexed) |
| `testing/T382` | `testing/N35` | Skill surface & conformance: `skills/kaal-testing/` holds only `SKILL.md` and `references/` (with only `findings.md`, no `scripts/`), and `kaal-engineer-skill`'s `checkSkill("kaal-testing", ...)` passes with `{ standard: [], kaal: [], warnings: [] }` |
| `testing/T383` | `testing/N35` | Consumer-agnostic boundary: `## Testing loops` is present and names no hardcoded KAAL repository paths (`.kaal/`, `engineering/`, `packages/`) |

`T381`–`T383` check only structure and boundaries — never prose wording (`testing/N28`), never byte-level SHA-256 locks on `capability/` or `payload/`, and never duplicate export/dependency checks already held by `T369`.

### Package Execution Integration (`testing/C72`)

Because `packages/kaal-testing/package.json` `scripts.test` lists test files explicitly rather than globbing, `testing/C72` must:

1. rename `T381.red.mjs`–`T383.red.mjs` to `T381.test.mjs`–`T383.test.mjs`;
2. add the aggregate runner `packages/kaal-testing/test/plan/multi-loop-sensitivity.test.mjs` (matching `testability.test.mjs` and `expected-failures.test.mjs`);
3. append `test/plan/multi-loop-sensitivity.test.mjs` to `packages/kaal-testing/package.json` `scripts.test`; and
4. confirm in the `npm test` run output that `T381.test.mjs`, `T382.test.mjs`, and `T383.test.mjs` actually executed and passed.

## Judged Skill Trial Protocol (`testing/C72`)

Whether `## Testing loops` teaches composable dimensions, behavioural RED, and targeted mutation verification is a judgment, never a regex over Skill text or vocabulary recall:

- **Subject:** An independent bounded codebase/module — **not** `lib/contracts.mjs` — so the `testing/C73` pilot cannot leak into the trial.
- **Unbiased task:** Present a bounded task embedding five distinct evidence needs (one unambiguous behaviour, one architectural boundary, one setup failure that must not be called behavioural RED, one plausible test gap exposed by mutation, and one underspecified or judgment-only claim) **without naming or hinting at those five needs in the prompt**.
- **Frozen key:** Author and commit the assessment key **before** writing the updated `SKILL.md` wording.
- **Arms & runs:** `n = 2` fresh agent runs per arm — control arm (`main` `SKILL.md`) vs. updated arm (`testing/C72` `SKILL.md`) — with identical task, environment, permissions, and starting artifacts.
- **Verified Skill loading:** Explicitly place/deliver the arm's `SKILL.md` in the agent's skill location (or verbatim prompt block with recorded SHA-256 prompt hash) and verify from the transcript that the agent loaded and read it.
- **Separate judging session:** Run an independent judging session over the retained raw transcripts and prompt hashes, verifying every cited quote appears verbatim in its transcript. Judge claim identification/ownership tracing, composition of concerns and evidence methods (including qualified observation reuse without conflation), behavioural RED vs. blocked execution, challenging inadequate claims, and witness-backed mutation findings as a reasoned judgment, never a mechanical 5-of-5 score.

## One-Off Sensitivity Trial (`testing/C73`, Change Task)

The 15-mutant baseline run on `packages/kaal-testing/lib/contracts.mjs` (`evidence.md`) is bounded Change evidence, not a standing Case or a production defect claim. In `testing/C73`:

1. Run an attributable one-off protocol (confirm hook interception, preserve unrelated valid exports/behaviours per challenged claim, attribute kills to specific tests/assertions, separate unrelated errors).
2. Retain the **exact `from`/`to` mutant definitions (or patches) and subject commit SHA** in `testing/C73`'s Change record so every challenge is inspectable and reproducible.
3. Classify every candidate with the 5-column table and consumer check before deciding action:

| Field | Purpose |
| --- | --- |
| Authoritative claim | Why this distinction must hold (or whether contractual basis/necessity is unresolved) |
| Mutation | Exact `from`/`to` violation introduced against the named subject commit |
| Witness | Concrete input distinguishing correct and mutated behaviour |
| Observation | Which specific test detects it, or that none does |
| Judgment | `required invariant` (add test), `equivalent change`, `unknown` (authority/necessity unresolved), `architectural concern` (misplaced responsibility), `proposed clarification`, or `out of scope` — checking repo consumers for `./contracts` (and noting zero repo consumers does not prove zero external consumers) before proposing removal; never delete behaviour solely because no existing Case requires it, and use Testing's existing four finding kinds only |

4. **Execution integration for durable contract Cases:** Add justified contract assertions directly into the already-executed `packages/kaal-testing/test/contracts.test.mjs` (or add a named `.test.mjs` file to `packages/kaal-testing/package.json` `scripts.test` and verify execution in `npm test`), keeping `npm test` free of an embedded mutation harness.

## RED evidence

Run `node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs`. See `evidence.md`.
