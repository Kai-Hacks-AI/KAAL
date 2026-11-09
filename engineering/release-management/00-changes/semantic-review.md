# Semantic preservation review of the documentation Change

Answers the CPO's request on #1329 (head 4638726): which edits are relocation, which are clarification, and which are normative, and where a normative edit is routed. T19 does not prove equivalence; it forces every reworded statement to be classified and every name, id and number it drops or adds to be declared (`id-moves.json`, checked by T19). Equivalence itself is judged here and by the CPO.

## Classes

- **Relocation:** the statement means the same and lives in a different file or form. 28 ids.
- **Clarification:** the statement means the same, with a sentence added or a present-state clause removed, so that it stands on its own. Each is listed below with what it rests on. 11 ids.
- **Normative:** the statement says something different about the target. 2 ids, both routed below.

## Normative changes and their approval

- **F6** loses the sentence that "Require workflows to pass" is an optional extra layer, and says instead that `.github travels alone` is a process guard that does not authenticate the workflow that judges a candidate. The removed sentence contradicted the trust-root requirement of the same documents ("Trust root: required", CPO 9 Nov). The edit follows that CPO decision and the CPO's first review of #1329; if the Owner wants the older "optional" reading back, that is a separate decision.
- **T6** named the station folders `pipeline/`, `npmjs/`, `main/`, `collectors/` as components, which #1323 abolished. It now names the six components of `05-src`. Requested by the CPO's first review of #1329.

## Clarifications for the CPO to confirm

- **F1, F2, F3** gain one sentence each (the record names the approving run; the record names the promotion; the released commit is tagged). Each states what a Case already targets (T4 on F1, T5 on F2, T2 on F3), and the gaps G5, G9 and G2 were defined against exactly that. Nothing is added to the Cases, and the gap lines moved to `gaps.md`.
- **F10 to F16** were named in the station bullets only ("names only"). Each now has a definition built from that bullet and the architecture allocation; no behavior is added.
- **F5, F7, F8, F9** lose the parenthetical naming present code and checks (`current-state.md` has it); F5 says the audit runs on a schedule, which the architecture's control table already says.
- **G4, G6, G7, G8, G10, G11** gain a "Done when" line. These closing conditions are new editorial wording ("the Owner decides", "the Owner records"), because no Case closes these gaps. They are Change entries, not target statements.

## F18, T9 and the interim

F18's Interim paragraph is now the first entry of `interim-states.md` with the same content: the temporary version reads the same `far.json` record shape, parses it with a real parser, says "interim, replaced by kaal-change/far" in its output, and is replaced when the DO lands. The FAR rule in F18 (Regression, Features, Accepts, what each run communicates) is unchanged. T9's Checks column is word for word; only the qualifier in its Targets column left, and the interim ends when T9 is judged against the replacement. T9 stays a standing Case on F18.

## Trust root

The Trust root requirement and the gate specification are unchanged. The two "Candidate trust roots" are now one statement of the trust root (the ruleset "Require workflows to pass", pinned to `refs/heads/main`); the conditional fallback ("otherwise the old `pull_request_target` checks stay, and if neither is demonstrated the migration stops at add-new") is the second entry of `interim-states.md`, and the unverified availability of the rule is in `current-state.md`. The sentence "`ref: main` does not authenticate the workflow that calls it" is kept in the target, and now also in the description of the controls' guarantee.

## What the Cases do and do not guard

T15 and T21 forbid vocabulary of A and A to B (and, since 4638726, the present artifacts named in `current-state.md`) in the target. They do not prove that a target contract was kept. That is the job of T19 (ids, decisions, declared token changes) and of this review. A target contract that sits in prose outside an id or a captured decision is protected only by the CPO's review; the lists above name every edit of that kind that was made.
