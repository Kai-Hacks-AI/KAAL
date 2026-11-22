# C21 change

## PLAN

1. Add the gap G98, the Intent I15, the Requirement F34 and the Architecture A20, with the draft in `interface.md`, and the Cases T1108 to T1111 as plain `T<n>.test.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State what verifies each element and the route to `main` (`verification.md`, `promotion.md`).
4. The PLAN adds no script, control, instructions file or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO, in BASS order:

1. Agent: `AGENTS.md` at the package root, and `AGENTS.md` added to `files` in `package.json`. One ratified assertion changes on purpose: controls/T591 asserts that `files` is exactly `['skills']`, and the DO makes it `['skills', 'AGENTS.md']`. The CPO is asked to see that here.
2. Skill: `references/modes.md` and one pointer line in `SKILL.md`, made room for by shortening existing words (it is at 599 of 600).
3. Script: `scripts/judge-mode.mjs`, and `find-controls.mjs` accepting `advisory` and `ratchet` and requiring `exit` of a control with a ratchet.
4. The agent trial of `verification.md`, run with and without the Skill and the instructions file, its result recorded as it is.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- Who may switch a station from one mode to the next, and what evidence earns each switch, is not decided here: this Change gives the vocabulary and the arithmetic of a ratchet. How KAAL decides is its own Change.
- Whether `exit` must say "plain preventive" or may say something else is not checked: a script cannot tell, and the Skill says what an exit is for. Only its presence is a rule.
- Where `AGENTS.md` lives follows hosting's example, at the package root. The package is not yet in the layout engineering/C30 defines; when it moves, the file moves with the layout and the Case follows the path.
- controls/C19 also changes how `find-controls.mjs` checks a station, and C18 and C20 touch `evidence.mjs`. The DO of C21 touches `find-controls.mjs` where C19 does: whichever lands second adapts.
- The Cases are plain `.test.mjs` from the PLAN and are never renamed. They are RED through their own assertions until the DO: `npm test` in the package shows them RED, and no lane runs it, because the package is not a workspace. If it becomes one, the lane must treat a Case of an unmerged PLAN as its own matter (engineering/C30 meets the same).
