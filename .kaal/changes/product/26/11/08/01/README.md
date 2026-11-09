# Product PLAN: Product Skill v0, from the release program (provisional number 26/11/08/01)

Markdown only. PLAN only: no Node, Definition, Skill, claim, package, workflow, policy or implementation is created or changed, and nothing here is started. The Portfolio contract is accepted at PLAN level (Portfolio PLAN, 26/11/08/01 on `kaal/portfolio`, as amended by #1259); this PLAN does not depend on it.

## 1. Intent

The CPO coordinates KAAL's release program by hand. Product has the concepts for the product-level part of that work (Product Direction, PLAN, Owner View, Decision Preparation) but only as Definitions, so an Agent cannot be directed to do any of it. Kai: Product should support the Owner and CPO viewpoint as well as Engineering supports delivery. Product prepares; the Product Owner decides.

Product Skill v0 is the first rung above Definitions on the BASS ladder (Bare, Agent instructions, Skill, Script): a Skill an Agent follows to prepare product work from evidence that already exists, with no new machinery. Skill, not Script, because every step is reading and judging, and nothing has yet been shown to need code.

Owner direction (Kai, 8 Nov): Product Skill v0 leads. Portfolio's implementation may proceed concurrently as its own Change; neither waits for the other, and each works on its own.

## 2. Scope: one product, not the portfolio

Per the Owner-approved Roadmap/Portfolio split (#1258, #1259), Product keeps **one product's** direction, acceptance and readiness. **Roadmap** owns the generic Sequence, Milestone and depends-on planning semantics. **Portfolio** owns cross-subject membership, priority, contention and blockers, and identifies shared dependencies by reference to Roadmap. Where a step needs a cross-subject reading, v0 says only that it belongs to Roadmap or Portfolio, as stated, and does not perform it. Product Skill v0 works alone, and if Roadmap or Portfolio text is available a reader may use it as optional enrichment.

## 3. Procedures v0 would teach

Each is traced to a workflow the release program exercises now (the CPO does it manually).

| # | Procedure | Observed workflow it serves | Evidence it reads (owned elsewhere) |
|---|---|---|---|
| P1 | **Prepare a product decision** in the Decision Preparation shape: Question, Options with what each means, Evidence, Recommendation, Decider (marking Owner-only decisions), and the recorded choice as made. One decision at a time, A/B where the decision allows. | Owner decisions asked one at a time | The Intent and Requirements concerned; the Owner View |
| P2 | **Read one product's readiness** as the Owner View: Intent served, Requirements, place, open and recorded decisions, and verification status with its evidence. States readiness only. Whether a product is promoted or published is read from Engineering's evidence and stated as a separate fact, with its own decider. | Readiness vs promotion vs publication, per product | Testing and Graph reports; Engineering's ledger and release evidence; Change |
| P3 | **Apply the product-fit lens** on a PLAN, DO or promotion PR: right product, fit to release, serves the stated Intent, no duplicated capability, reads clearly, Test Cases cover what the product means. Findings are product findings only. | CPO review support without duplicating Engineering's technical review | The PR, its Change record, Testing evidence; CPO Advisor lens from Roles |

Rules v0 states for all three: use evidence, never re-run or re-judge verification; never decide for the Decider; never present a recommendation as a decision; a Recorded choice neither grants nor implies a governed action (promotion, publication, a new capability); unknown is reported as unknown, never as passed; Test Case identity is Testing's (RED is a role, one T-number identity), and the Skill only cites it.

## 4. Requirements

| # | Requirement | Accepted when |
|---|---|---|
| R1 | Each procedure is traced to an observed release-program workflow. | A procedure with no named workflow is removed. |
| R2 | The Skill adds no verifier, trace model, store or approval mechanism and owns none of the evidence it reads. | Each cited fact names its owner; no step re-runs verification. |
| R3 | The Skill stays inside one product; sequencing and depends-on semantics are named as Roadmap's, and cross-subject membership, priority, contention and blockers as Portfolio's. | No procedure produces a sequence, a depends-on reading, or a cross-subject priority, contention or blocker reading. |
| R4 | The Skill never decides or implies a decision. | The Decider is never Product; every Option set ends at the Decider's choice. |
| R5 | The Skill stands alone and declares its effects: advice only, no writes to any repository. | A cold Agent given only the Skill and the evidence can follow it; no installation, registration or Engine is needed. |
| R6 | The Skill is a valid KAAL Skill and Agent Skill. | The Engineer Skill's check passes on it, and Core admits its Skill Node. |
| R7 | The Skill is useful on the real program. | A pilot on the current release program produces a decision preparation, a readiness reading for one package and a product-fit review the CPO judges correct or corrects; corrections feed the next version. |

## 5. Not in this PLAN

Implementation (the Skill Node, `SKILL.md`, references, tests); a script or checker; persistence of Product Direction objects; PLAN items 3 (Product to Engineering seam) and 4 (Process template); sequencing and depends-on semantics (Roadmap) and cross-subject membership, priority, contention and blockers (Portfolio); handover formats between CTO and CPO (Roles and Review); an npm package, SYNC, promotion or publication. Product stays internal-only.

## 6. DO outline (needs its own authorization after this PLAN is approved)

1. RED first: tests that state the contracts of R2 to R6 (Skill form, admission, declared effects, key statements as written).
2. The Skill Node and the Agent Skill with references to Decision Preparation, Owner View and the CPO lens, written by the Engineer Skill and checked by its checker.
3. Pilot (R7) recorded in the DO's Change record, with the CPO's corrections.

Layout and SYNC: the collector is behind main and uses the older `packages/skills/` tier. The DO decides placement under the layout in effect then, and any SYNC or layout move is its own step under the standing SYNC rule, not part of this PLAN.

## 7. Decisions for the CPO

1. Confirm P1 to P3 as the v0 scope (and that Roadmap's and Portfolio's responsibilities stay out).
2. Confirm a Skill rather than a Script for v0.
3. Confirm the pilot on the live release program as the acceptance of v0.

## 8. Verified by

Markdown only; required checks on this PR.

## 9. Validated by

CPO review of product meaning and scope; Owner review where a decision above touches an Owner-reserved matter. This PLAN authorizes no DO, SYNC, promotion, publication or package.
