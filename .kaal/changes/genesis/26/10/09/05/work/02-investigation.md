# Investigation: what Review already means, and what HOW and ARE would add

Sources read in full: Review (`packages/kaal-review/kaal/Review.md`, sealed `7c3d4d8e…46d5f`), its Agent Skill and `review.mjs`, ROWING and `references/rowing.md` (seats, authority, the turn), Core's `Skill` and `Agent` Nodes (BASS), `.kaal/AGENTS.md`, the Agent Skill discovery path, #73 (Process = specialized Skill), #75 as it stands (read only), and the historical Ideas at their merge commits: `ideas/how-are-we-doing/idea.md` (KAAL-genesis #65, `cfc110c6`) and `ideas/we-can-go-far/idea.md` (KAAL-genesis #72, `c7ac6bc3`). The KAAL-genesis branches are deleted; the Ideas were read at those SHAs.

## What the historical Ideas actually say

**HOW ARE WE DOING?** is one loop, not four capabilities: a producer makes candidate work, independently tasked agents challenge it, the observations that matter become durable in the owner of their meaning, and later work starts differently. Its own words matter more than the acronym.

- *HOW* is "not generic human in the loop" and not an attempt to remove the human. The human steers where judgment or authority is valuable, "without performing or verifying every operation". The Idea defines no observability and no approval point.
- *ARE* rests on one observation: the actor that produced the work was not the only one judging it, and independently tasked review found what the producer had not. It claims only that independently tasked review has been useful. It explicitly does **not** claim that a different model means independent judgment, or that more reviewers is better.
- *WE* and *DOING* are about experience: "Experience here is not conversation history, and not a new kind of record." An observation earns durability when its meaning matters beyond the work at hand, and it becomes durable "by moving to the owner of that meaning". The Idea therefore "implies no Observation, Experience or Goal record".
- The Idea also separates **Human from Owner** ("the Human stands outside these positions ... and is not the Owner") and **identity from position from Skill**. Identities (two GitHub accounts, Codex, Copilot) were "carriers, not the meaning".
- It records what it deliberately does not decide: formal positions, whether reviewing becomes a Skill, quorum, whether different models are required, how independence is measured, which decisions need the Human.

**TOGETHER WE CAN GO FAR** is a different loop: KAAL's forward testing loop (Feature, Acceptance, Regression) joined to a backward loop of worked evidence, learning and refactoring. Its expansions are *WE* = Worked Evidence, *CAN* = Changes Adaption Now, *GO* = Getting Optimized, *FAR* = Features Accepted Regression, and its own text calls CAN "grammatically awkward" and the wording "deliberately not final". *TOGETHER* (The Owner Gets Enhanced Through Holistic Experience Reviews) was added by #72 "as remembered": the PR states "no earlier trace of TOGETHER exists in the lineage or its git history, so the expansion rests on the Owner's recollection". The Idea itself says what TOGETHER does and does not carry: it names "the Owner as the one enhanced, through reviewing experience", and "does not define the Owner, Experience or Review, and does not say what a holistic review would be, who performs it or when".

Two collisions worth knowing: both mnemonics use **WE** with different meanings (With Experience; Worked Evidence), and the Idea that carries Review-shaped meaning (HOW, ARE) is the one whose WE and DOING point at learning, not at Review.

## What Review already covers

| Meaning in the Ideas | Already in current KAAL | Where |
|---|---|---|
| An actor examines a result, reports findings or convergence on an exact identity | yes | Review (Node), `review.mjs` |
| Review is a capability, not a role; identity, position and Skill are distinct | yes | Review: "a capability and not a role"; rowing.md: "Process determines the turn. Authority assigns the seat. Provider capability executes the work." |
| The examiner is independent of the maker and the claim is inspectable, not proof | yes | Review: authority and independence statement; rowing.md: "a separate context is not a separate seat"; 07/07 ruling: a helper the maker starts is part of the maker |
| Review holds no approval or execution authority | yes | Review: scope "is that alone"; no verdicts, scores or approvals |
| Environment independence (no accounts, products, channels) | yes, for Review | Review and `review.mjs` know nothing of Git, hosts or processes |
| A round is transient; durable knowledge is another capability's | partly | Review is "not a retrospective, which is learning after the activity and is another capability"; Retro and the `kaal-learning`/BRAIN design (#72, merged, architecture only) own durable experience |

## What is genuinely missing

Review says nothing about **who takes part in the review**. It names one reviewer and one result. Two distinct, already-practised patterns have no name in KAAL's own knowledge:

1. A review in which a **human takes part while it happens**: sees the result and the examination, directs it, and is not merely handed an outcome. Today a fresh Agent asked for such a review has nothing to read; the only trace of "HOW" in KAAL is #75's use of it as an escalation ("a human is required"), which uses the term without a definition to point at.
2. A review in which **an agent independent of the maker reviews it without a human in the ordinary course**. Independence is spread over rowing.md (a Changing KAAL reference), the 07/07 and 07/08 rulings and Review's statement requirement; "autonomous" review as a thing a Process can ask for has no definition a Process could cite by `{name, id}`.

Neither is an addition to what a round is. The form, the identity and convergence are unchanged. What is missing is two **meanings** (what is being asked for) and the **conduct** (what an Agent does when asked), and the conduct is not stated anywhere an Agent asked for "HOW Review" would look.

## Does each need an independently discoverable definition?

Three reasons say yes, and one says why not by editing Review:

- **A Process must be able to cite them.** #73's direction is that a Process is a Skill composing others by `{name, id}`. #75 composes Review and says it "requires HOW"; without a Node named HOW there is nothing for Agreement, or a later Process, to refer to, and nothing stops two Processes defining HOW differently ("They do not redefine HOW or ARE").
- **KAAL's meaning is read from Nodes, not from Agent Skills.** Agent Skills are the agent-facing form of a capability and are unsealed; what a capability means to KAAL lives in Nodes found by following references from Core. A fresh Agent reading only `.kaal/` must be able to learn what HOW is.
- **Environment independence is enforced by test on Nodes** (Review's delivery test forbids Git, host and process words in its meaning). The same discipline applies if HOW and ARE are Nodes.
- **Review itself cannot be amended.** Changed bytes are another Node, the installer has no supersession rule (it cannot replace a registered Skill Node), and #75 composes Review by its exact ID. Putting the meanings into `Review.md` would break the composition #75 depends on and would be a new Review, not an addition to it. So HOW and ARE are born *after* Review and refer to it, which is the direction the born-before rule allows.

## Where WE, DOING and TOGETHER fall

- **WE (With Experience) and DOING (Durable Observations Inform Next Goals)** are not Review. They describe what happens after a review: which observations earn durability, and how they change what later work sets out to do. KAAL has an owner for that: Retro (the retrospective form), BRAIN and the `kaal-learning` design (#72, Change 08/04: architecture only; Learning Nodes with a situation, evidence and understanding; established through Changes). The Idea itself says the same: no Observation store; durability "by moving to the owner of that meaning". The only Review-side commitment needed is a negative one: a round is transient evidence, and Review keeps no store of observations. That sentence now sits in Review's Way of Working. Establishing the *practice* of retaining experience is `kaal-learning`'s realization, and CEIL (Cue, Evidence, Insight, Learning; Kai, 2026-10-09) is input to that Change, not this one.
- **TOGETHER WE CAN GO FAR** adds no distinct Review meaning. Its testable core, the forward/backward loop of Features, Acceptance and Regression, belongs to a testing architecture that current KAAL does not have; its WE (Worked Evidence), CAN and GO describe evidence, change and refactoring, none of which are Review. TOGETHER is "the Owner gets enhanced through reviewing experience taken holistically": a review whose result is accumulated experience (retrospectives, learnings) rather than one Work. Review already admits that ("a result is whatever is put to review ... any viewpoint or any capability of KAAL"), and the experience it would examine is Retro's and Learning's. It is a **principle** (collaborative review plus accumulated experience improves the one who owns the intent), which HOW (the human takes part), ARE (agents challenge each other) and the learning capability (experience is retained where it belongs) jointly realize. Its provenance is the weakest of the four (restored from recollection), and it names the Owner, which current KAAL defines as the one who holds the Intent, a role these Nodes deliberately do not name. Recommendation: do not birth it. Keep this record as its provenance and let it be revisited when `kaal-learning` is realized and a "holistic" review has a concrete result to examine.

## Discovery by a fresh Agent without expanding its instructions

The initial instructions stay what they are: host `AGENTS.md` points at `.kaal/AGENTS.md`, which points at Core. Two paths already exist and need no change:

1. **Agent Skills path (progressive disclosure).** An installed `kaal-review` Skill has a `description` that a host loads at start. Adding the words HOW and ARE to that description (not the body) is what lets "HOW Review of PR75 please" trigger the Skill. The body, loaded only then, points at the Nodes and carries the conduct.
2. **Core path.** HOW and ARE are KAAL Definitions delivered with Review. They are found by type alone (Definitions are), by name, and each refers to `Review` by name and ID. Nothing is added to Core or to `AGENTS.md`.

Limit: `kaal-review` is optional and is **not installed** by default (it is selected by the exact ID of its Node). In a KAAL where it is not installed, a fresh Agent finds neither Review nor HOW. That is Review's declared property, and installing optional Skills is its own question (raised in #76), not something HOW and ARE should hide.
