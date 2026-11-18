# C71 change

## Purpose

Owner direction (18 Nov 2026): the tracing chain and the split of concerns exist to give an anchor for semantic reasoning, both in creating a Change and in understanding it afterwards. The chain runs Intent, Requirement, Architecture, Control, Case, and then the code or ruleset the Case runs. The Owner named the chain INFORMED: Implementation Navigates Forward: Observed Results Mirror Earlier Decisions. `drafts/INFORMED.md` defines it as other mnemonics are defined (as HOW TO WORK is: an expansion, one line for each word, and that it is a mnemonic, not a procedure). The global model states this as its purpose and carries the chain as a table; each view states the same purpose and says which part of the chain its template carries.

## From, to, because

- **From:** the objects of a Change (Intent, Requirement, Architecture, Defect, Case, Change, Control, Gap, Stage, PR) are defined in separate documents, sometimes with different words (the Owner says "delivers" and "answers", the files say `implements`, `serves` and `addresses`), and a PR template gives a reviewer no way to find any of them.
- **To:** one authoritative Markdown metamodel with one Mermaid diagram, a short view for each of the seven PR templates, and each template naming its view. Every object and relationship is defined once, with a status: normative, observed or proposed. Differences between the model and the repository are recorded, not corrected.
- **Because:** the chain gives reasoning one fixed anchor, so a CPO, human or agent, can then open a PR and trace what it affects, which Intent it delivers, what supports that Intent, what each Case tests, which Defect it addresses and what evidence there is, from the PR to the model, without reconstructing the architecture.

## What the PLAN proposes

1. **Inventory** of the objects and relationships found in the repository: `inventory.md`.
2. **Global model**: `drafts/metamodel.md`, one Mermaid diagram, the Objects, Relationships, Vocabularies, Views, Reviewer questions and Mismatches. It starts from the Owner's five confirmed relationships and adds what the repository shows, marked observed or proposed.
3. **Views**: `drafts/views/<TYPE>.md` for default, plan, do, act, promotion, hotfix and sync. Each has the same five sections, one small diagram of edges that exist in the global model, and defines nothing. There is no view for WIRE because `main` has no WIRE template (mismatch M7).
4. **References**: the destination is `engineering/release-management/metamodel/metamodel.md` and `engineering/release-management/metamodel/views/<TYPE>.md`. Each template names its view by that path; the global model indexes the views and each view links back. The name of a view is the template's file name, so an agent finds it from the TYPE alone.
5. **Cases** T910 to T919, all RED on `main`; they turn GREEN with the DO and, for T916, with the `.github` Change that follows it.
6. **No new tooling and no second source of truth.** The Cases read files. The model lives in Markdown. Nothing generates the views from the model.

## Landing order (each its own PR)

1. **PLAN** (this PR) into collector `kaal/engineering/metamodel`, CPO exact-head approval.
2. **DO** into the same collector: the files of `drafts/` become `engineering/release-management/metamodel/`; T910 to T915, T917, T918, T919 GREEN. No `.github` file changes.
3. **ACT**: the 4L retrospective.
4. **PROMOTION** of the collector to `main`.
5. **`.github` alone** on its own collector: each template gains the reference to its view; T916 GREEN. It travels alone (Change Isolation, as release/C25 did for the cue).
6. **PROMOTION** of that Change.

## Cases (all RED on `main`; evidence.md has the run against the drafts)

T910 the global model states its purpose and the trace chain in order, and is one file with one Mermaid diagram whose nodes are all defined objects. T911 the Owner-confirmed relationships are drawn as normative. T912 each object and relationship has one definition and a status, arrow styles agree with statuses, the repository's identifiers and keys are kept. T913 each template has a view with the five sections, a purpose and the part of the chain it carries. T914 the views link to the model and the model indexes the views, both resolving. T915 a view defines nothing and draws only edges of the model. T916 each template names its view. T917 a reviewer answers Q1 to Q6 on release/C65's PLAN, DO, ACT and PROMOTION by following the model. T918 the nine mismatches are recorded, each with a path that exists and a fact that still holds. T919 every path the model cites exists.

## Not in this Change

No change to a PR template, hook, workflow, ruleset or the envelope judge; no renaming of the repository's keys; no new object type beyond what the repository shows, apart from the one proposed relationship `gates`; no generated documentation; no judgement of whether a Change's Intent achieved its Outcome.

## Open questions for the Owner

1. **Where does the model belong?** Until a capability is chosen the PLAN puts it in release management (`engineering/release-management/metamodel/`), because the templates and the envelope are there. The model is about Change, so kaal-change could own it; it is also engineering-wide. Recommendation: keep it in release management for the DO and decide the capability afterwards; the paths in the templates change if it moves.
2. **Words or keys.** The Owner's words (delivers, answers) differ from the keys in the files (`implements`, `serves`, `addresses`). Recommendation: keep the keys, show both in the model, and treat a rename as its own Change.
3. **A reference a reviewer can see.** A template's leading comment is not part of an authored PR body, so a reference there reaches the author and an agent but not a reviewer reading the PR. The one visible line allowed before the first chapter is the envelope cue (release/C24). Recommendation: the DO uses the template comment and the TYPE-to-file rule; extending the visible cue to link the model is a separate Change that touches the envelope judge.
4. **Gap and Defect.** Release management closes Gaps (`closes: [release/G<n>]`); the Owner's model addresses Defects. The model keeps both, as different objects. Confirm, or say that a Gap is a Defect.
5. **Intents answered by Controls.** release/I35 has no Requirement or Architecture; Controls have it. Recommendation: accept Control has Intent as a second normative path beside Requirement answers Intent, as kaal-controls' chain already says.
6. **Architecture addresses Defect.** No Architecture file does this today (mismatch M3). Confirm the repository key stays `addresses`, with a Defect id as the target.
7. **Controls in the chain.** The chain places a Control between Architecture and Case. The repository links a Control to an Intent only (`has`); no file links an Architecture to a Control, or a Control to the Source it judges (mismatch M9). The model draws what exists. Recommendation: keep it so, and decide in a later Change whether a Control declares the Architecture it places or the Source it judges.
8. **Where INFORMED lives.** The PLAN installs it beside the model (`engineering/release-management/metamodel/INFORMED.md`), as HOW TO WORK sits in release management. If a capability is chosen for the model, the mnemonic moves with it. Confirm the wording: the Owner offered two ("Observed Results" and "Ongoing Review"), and the PLAN uses "Observed Results".
9. **Controls and Stages.** Control has Intent and Change walks Stage are drawn as observed. Control gates Stage is proposed (`strategy.md` says each stage has one gate). Confirm or drop `gates`.
