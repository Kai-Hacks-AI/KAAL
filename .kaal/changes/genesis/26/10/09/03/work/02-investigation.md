# Investigation — what each capability already owns

Read from `kaal/genesis` at dfe6d56, from the open branches of #42, #75 and #77, and from the merged Change records of #72 and #73. Nothing here is sealed or established. Where I say "says", it is a sentence I read; where I say "does not say", I looked for it.

## kaal-review (Node `Review`, SKILL, `references/rowing.md` in kaal-changing)

- **Owns** the round: its form, naming one result and its exact identity, `findings` or `converged`, and "whether review has converged" (`Review.md`). A later round "says whether each earlier finding stands" (`kaal-review/SKILL.md:29`). So a finding's *standing* is already a Review judgment, made in the next round.
- **Does not own** what is done with findings: "Review does not decide when a review is owed, which actor reviews, how a seat is assigned, what is done with findings, or what follows convergence" (`Review.md`, final paragraph). Disposition is therefore outside Review by its own sealed text.
- **Changing KAAL** already supplies the Worker's side: "If the Worker disagrees with a finding, it says why in `work/`; the next round, not the Worker, decides whether the finding stands" (`rowing.md:81`). Challenge is allowed and recorded; validity is the Reviewer's.
- **ROWING** already carries the scope rule: "Not Generalized keeps the review with the Change that was intended… Broader consequences it finds are observations and future Changes, not part of this one" (`ROWING.md`), and a finding is "stated against the Intent, a Requirement, the Architecture or the evidence" (`rowing.md:48`). The idea that a valid finding may be future Work is there. Where such an observation *goes* is not: `rowing.md:84` says "a finding that exists only in a retro is not a finding" and gives no other home.
- **Tension to name.** `kaal-changing/SKILL.md` (Rules) says "A finding is work to resolve; a broader consequence is for the retro or a future change", and step 3 says "the Worker resolves them in `work/`". Read literally, every finding is resolved in this Change, which is what the briefing says must not be automatic. The Node text (`ROWING`) is fine; the Agent Skill wording over-reaches. It is unsealed wording.
- **HOW / ARE** (#77, draft) are Definitions in kaal-review that say who examines (a human taking part; an agent not steered by the maker). They add no authority and no disposition, which is consistent.

## kaal-sealing (Node `Sealing`)

- **Owns** establishing and verifying an artifact's identity "according to the identity defined for that artifact"; "it is not the decision of when something must be sealed" (`Sealing.md`). `artifact-id.mjs [--named] [--domain d] <path>` gives an identity for any file or directory with no seal, which I used in the trial (`04-evidence.md`).
- **Consequence.** *Identity is free; a seal is a commitment.* Citing "architecture.md, 52b0f6f3…" needs no seal; only *enforcing* that bytes never change needs one. Today the only enforced boundaries are a Node's bare seal and a Change's seal (`preserve-seals`, `preserve-sealed-changes`, #23/#24), and a closed Change takes no additions.

## Requests and Incidents (Nodes `KAAL Incident`, `KAAL Request`)

- **Own** an account *addressed to KAAL* by a client: Incident has exactly two parts, Happened and Expected; "a carrier… is not the client's own incident… the client remains responsible for telling what it keeps for itself from what it addresses to KAAL" (`KAAL-Incident.md`). SKILL: "it is not for the client's own incidents or defects".
- **Do not own** a defect against the product of the Work being done. A confirmed Defect of a client's own architecture is the client's, not KAAL's Incident. An Incident fits only when the thing that failed is KAAL (including KAAL developing KAAL).
- **Cannot hold** what a confirmed Defect must retain: no affected-identity, no contract identity, no executable evidence, no validity judgment, and "it adds no metadata". Shown in the trial, step 8. Not a fit to stretch; the Nodes are sealed and should not be.

## Work selection (#42, design only, draft)

- **Owns** future Work: a *candidate* ("what, why, optionally what it comes after"), identified by bytes, referred to by `{name, id}`, ranked by a human in an order, taken when an open Change cites it. "Anyone may write a candidate. That is observation and description, not authority."
- **So "later" has a home by design:** a deferred Defect becomes a candidate that cites the Defect and the architecture identity it was found against, and ranking and taking stay human and Change-bound. It is **not built**; the order, the reading and the candidate form are a later realization.
- Review is not Work selection: Review reports on a result; selection decides what to do next. The two meet only through a citation.

## Process agency (#73 merged, #75 draft)

- **#73** (merged, 09/01): a Process is a specialized Skill that composes others by `{name, id}`; lenses include "Testing and Defects informing upstream" (feedback: does this show the upstream is wrong or incomplete?). Feedback lenses exist as statements; no Defect form.
- **#75** (draft), examined at `0c2d05b` (Kai's Reviewer: `901dd45b`; it moves, so this is a dated reading): `Agreement` loop, state derived from a log, HOW conditions `grant, seat, evidence, contradiction, unrevised, oscillation, ceiling, provenance` and, since its §6a, `disputed`. §6a gives the Worker answer events `accept` / `challenge` / `defer` with a quoted ground, a pinned reference to the round answered, a `defer` carrier, reconsideration of unchanged bytes and a `finding` line per finding in every brief. This answers the gap I first recorded here (a valid, undelivered finding had no exit but HOW). What I find remaining, and no more: no HOW condition for a valid finding that blocks an obligation the Work was handed; and the `defer` carrier is described as "typically a `kaal-request`/`kaal-incident` carrier, otherwise the project's own backlog", which does not fit a product Defect (§2 above). Both in `03-architecture.md` §6.

## BRAIN and Learning (#72, merged, architecture only)

- **Owns** durable understanding: a Learning is understanding "established from experience, reusable beyond the occasion, naming the situation it applies to; not the experience itself; … referring to its evidence by identity". Evidence is sealed artifacts.
- **So** what a Defect *taught* (id-by-count breaks under removal) is a Learning citing the Defect as evidence. The Defect itself is not a Learning. Nothing is implemented; CEIL (Cue, Evidence, Insight, Learning; Kai, 2026-10-09) is input for the realization, not for this Change.

## What this adds up to

Each of the five pieces of the briefing has a home that already exists or is already designed: *finding* and *standing* → Review; *challenge* → the Worker's answer in `work/` (Changing KAAL); *scope/authority* → the fixed Intent, the grant and the Owner (Changing KAAL, Process); *preservation* → the Work and Change seals; *future Work* → candidates (#42); *understanding* → BRAIN (#72); *escalation* → HOW (#75/#77). What does not have a home is narrow, and is listed as gaps in `03-architecture.md`.
