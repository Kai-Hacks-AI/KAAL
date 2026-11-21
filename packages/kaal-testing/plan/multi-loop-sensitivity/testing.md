# Multi-Loop Testing and Sensitivity: Testing

Verification of this Change splits cleanly across three distinct kinds of evidence: **deterministic Cases** (heading, frontmatter metadata, and Skill boundaries), a **judged Skill trial** (whether the Skill improves agent testing behaviour), and a **bounded one-off sensitivity trial** (`testing/C73` Change evidence driving ordinary durable contract Cases).

## Deterministic Cases (`testing/T381`–`testing/T383`)

The planned Cases live in `packages/kaal-testing/test/plan/multi-loop-sensitivity/`, named `T<n>.red.mjs` with shared helpers in `lib.mjs` and runner `run-red.mjs`. Each Case exports `id`, `tests`, `title`, and `run()`. They stay outside `packages/kaal-testing/package.json` `scripts.test` until `testing/C72` turns them GREEN.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| `testing/T381` | `testing/F156` | Heading & discovery metadata: `SKILL.md` frontmatter `description` no longer says `"three loops"`, `## Testing loops` exists, `## The three loops` is removed, and `## Testing loops` stands right after `## Assessing a test against its claim` and before `## Running acceptance` |
| `testing/T382` | `testing/N35` | Skill surface & conformance: `skills/kaal-testing/` holds only `SKILL.md` and `references/` (with only `findings.md`, no `scripts/`), and `kaal-engineer-skill`'s `checkSkill("kaal-testing", ...)` passes with `{ standard: [], kaal: [], warnings: [] }` |
| `testing/T383` | `testing/N35` | Consumer-agnostic boundary: `## Testing loops` is present and names no hardcoded KAAL repository paths (`.kaal/`, `engineering/`, `packages/`) |

`T381`–`T383` check only structure, metadata alignment, and boundaries — never prose wording (`testing/N28`), never byte-level SHA-256 locks on `capability/` or `payload/`, and never duplicate export/dependency checks already held by `T369`.

### Package Execution Integration (`testing/C72`)

Because `packages/kaal-testing/package.json` `scripts.test` lists test files explicitly rather than globbing, `testing/C72` must:

1. rename `T381.red.mjs`–`T383.red.mjs` to `T381.test.mjs`–`T383.test.mjs`;
2. add the aggregate runner `packages/kaal-testing/test/plan/multi-loop-sensitivity.test.mjs` (matching `testability.test.mjs` and `expected-failures.test.mjs`);
3. append `test/plan/multi-loop-sensitivity.test.mjs` to `packages/kaal-testing/package.json` `scripts.test`; and
4. confirm in the `npm test` run output that `T381.test.mjs`, `T382.test.mjs`, and `T383.test.mjs` actually executed and passed.

## Judged Skill Trial (`testing/C72`)

Whether `## Testing loops` teaches composable dimensions, behavioural RED, and targeted mutation verification is a judgment, never a regex over Skill text. In `testing/C72`, run fresh agents (baseline vs. updated Skill) on a bounded 5-item task containing:

1. one behaviour with an unambiguous expected result;
2. one architectural boundary;
3. one setup failure that must not be called behavioural RED;
4. one plausible test gap exposed by targeted mutation; and
5. one underspecified or judgment-only claim.

Judge whether the agent identifies authoritative claims, composes concerns and evidence methods (including reusing one observation across multiple claims with qualified inferences), keeps behavioural RED apart from blocked runs, challenges an inadequate claim, and exposes unpinned contracts via witness-backed mutations. Record the protocol, author's key, raw transcripts (with prompt hashes), and independently reviewed observations citing verbatim transcript excerpts.

## One-Off Sensitivity Trial (`testing/C73`, Change Task)

The 15-mutant baseline run on `packages/kaal-testing/lib/contracts.mjs` (`evidence.md`) is bounded Change evidence, not a standing Case or a production defect claim. In `testing/C73`, apply an attributable sensitivity protocol (verify module hook interception, preserve unrelated valid exports/behaviours per challenged claim, attribute each kill to the detecting test/assertion, separate unrelated errors) and classify every candidate with:

| Field | Purpose |
| --- | --- |
| Authoritative claim | Why this distinction must hold (or whether it is an uncontracted implementation choice) |
| Mutation | Exact violation introduced |
| Witness | Concrete input distinguishing correct and mutated behaviour |
| Observation | Which specific test detects it, or that none does |
| Judgment | Required invariant, equivalent change, proposed new contract, unrequested code to remove (source answers the test cases, nothing else), out of scope, or unresolved |

Turn only justified contract invariants into ordinary durable `.test.mjs` Cases beside `test/contracts.test.mjs`, leaving `npm test` free of an embedded mutation harness.

## RED evidence

Run `node packages/kaal-testing/test/plan/multi-loop-sensitivity/run-red.mjs`. See `evidence.md`.
