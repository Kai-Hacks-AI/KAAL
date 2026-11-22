# C21 change

## PLAN

1. Add the gap G98, the Intent I15, the Requirement F34 and the Architecture A20, with the draft in `interface.md`, and the Cases T1108 to T1113 as plain `T<n>.test.mjs`.
2. Define testing and judgment before any execution: the Cases, and the judgment definitions J1 to J5 in `judgments.md`, each pointing at the elements it examines; and plan the sensitivity demonstration of the CHECK in `check.md`.
2a. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State what verifies each element and the route to `main` (`verification.md`, `promotion.md`).
4. The PLAN adds no script, control, instructions file or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO, in BASS order:

1. Agent: none in this Change. `AGENTS.md` is not added and `files` stays `['skills']`; controls/T591 is unchanged. A consumer-facing instructions file is generated under engineering's layout (development `AGENTS.md` not shipped, `dist/AGENTS.md` shipped) when the package adopts it.
2. Skill: `references/modes.md` and one pointer line in `SKILL.md`, made room for by shortening existing words (it is at 599 of 600).
3. Script: `scripts/judge-mode.mjs`, and `find-controls.mjs` accepting `ratchet` and requiring `exit` of a control with a ratchet.
4. The agent trial of `verification.md`, kept separate from the sensitivity demonstration,, run with and without the Skill and the instructions file, its result recorded as it is.

## CHECK

1. Execute the Cases and the appraisals of `judgments.md`, each judgment with an explicit disposition (satisfied, not satisfied, unresolved) by an appraiser other than the author of the DO.
2. Run the four weakenings of `check.md` one at a time on a throwaway copy and record, for each, the claim, the loaded weakening, the Case that witnesses it and the assertion that failed. No standing framework, no committed mutation tool.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- Rollout of any adopting ratchet, and the authorization to switch a mode, remain the adopter's work; this Change adds no switch.
- Who may switch a station from one mode to the next, and what evidence earns each switch, is not decided here: this Change gives the vocabulary and the arithmetic of a ratchet. How KAAL decides is its own Change.
- Whether `exit` must say "plain preventive" or may say something else is not checked: a script cannot tell, and the Skill says what an exit is for. Only its presence is a rule.
- controls/C19 also changes how `find-controls.mjs` checks a station, and C18 and C20 touch `evidence.mjs`. The DO of C21 touches `find-controls.mjs` where C19 does: whichever lands second adapts.
- The Cases are plain `.test.mjs` from the PLAN and are never renamed. They are RED through their own assertions until the DO: `npm test` in the package shows them RED, and no lane runs it, because the package is not a workspace. If it becomes one, the lane must treat a Case of an unmerged PLAN as its own matter (engineering/C30 meets the same).

## Revised after the CPO's review of the DO

The CPO required: the control taxonomy stays directive, preventive, detective, corrective, and a ratchet is a temporary, special preventive mode; teaching narrowed to the ratchet lifecycle (what it is, how it ends) with no repository, CI, ruleset or station assumptions in the reusable Skill; `advisory` removed from this Change; and no development instructions shipped. So the DO adds no `advisory` and no `AGENTS.md`; Case T1111 is withdrawn, T1108 and T1110 changed to three modes (T1110 now asserts `advisory` is refused like any mode outside the three). These are changes to ratified target documents and Cases, recorded here.
