# C1 do

What the DO delivered, and what was observed.

## Delivered

- The Skill `skills/kaal-architecture/SKILL.md` (A2): the two concerns, the test, mixed and ambiguous statements, how a constraint stays with the concern it constrains, and the plateau as its scope.
- The package shell: `package.json` (private, not in `workspaces`), `LICENSE`, `README.md`, and the runner `test/cases.test.mjs`.
- The Cases renamed from `T<n>.red.mjs` to `T<n>.test.mjs`, with T3 and T5 amended after the CPO review (below). Seven of eight are green, T3 is red (`npm test` in the package). They were red on the collector (`evidence.md`).
- The trial in `trial/`: `skill.*` and `baseline.*` (run 3, current), `run1/` and `run2/` kept as recorded, each a prompt, the raw output unedited and a record with its hash.

## Observed

- Run 1: a fresh subagent given only the Skill and the ten statements. Nine answers equalled the key. S10 ("Lectures are recorded and posted to the course page on the day they are given") was answered Solution, the key said Delivery. The statement is open to both readings, so this is a finding about the key, not the Skill. It is kept in `trial/run1/` with the baseline of that run.
- The key was then changed in the open: S10 now names its means ("Each lecture room has a ceiling camera that feeds a recorder ..."). Both trials were run again with fresh subagents. This is a correction made after seeing an answer, and a reader should weigh it as such.
- Run 2, with the Skill: all ten answers equal the key. Without the Skill (baseline): nine equal the key, and S4 ("The kitchen serves only the dishes that travel well in the delivery van") was answered as mixed where the key says disguised. The Skill produced the disguised reading, and the baseline did not.
- 
## Revision after the CPO review of this DO

- The categorical rule "a means that limits what the solution offers is a Solution statement" was unsound and is removed, with the finding "disguised". A constraint belongs to the concern it constrains, even when it affects the other; if the limit is independently accepted as a Solution requirement it is stated as its own Solution statement; where context or authority is missing the Skill asks. Findings are now none, mixed or ambiguous.
- The key for S4 ("The kitchen serves only the dishes that travel well in the delivery van") changed from solution/disguised to delivery/ambiguous: the statement does not say whether the limit is an accepted Solution requirement. T3, T5, F3, A1, the proposal and the #1404 application were amended to match. Runs 1 and 2 are preserved unchanged, including the S10 correction and its disagreement.
- Run 3 (fresh subagents, new prompts): with the Skill, nine answers equal the key; S4 was answered delivery/none where the key says delivery/ambiguous. Without the Skill, the same S4 was answered mixed (solution and delivery), and the other nine equal the key. So the Skill got the owner of S4 right but did not ask, and T3 is RED on S4 ("the agent found none, the key says ambiguous").
- Not tuned: the key and the Skill were not changed after seeing run 3. Whether the Skill's ask-guidance should be stronger, or the key is too demanding, is for the CPO to say.

## Limits

- One run each. The author wrote the Skill, the key and the prompt and recorded the replies. The observer is a fresh subagent session, not a person or a separate team. The agent was told to use no tool, and that was not enforced. A stronger trial would be run by someone else.

## Not done

- No `ownership.kaal.json`: this slice has no Node. The Cases are not listed in Engineering's CI, and the package is outside `workspaces`.
- Nothing is deployed, published or promoted.

## Next-move trial (architecture/F4, Case T9)

The Owner decided T3/S4 on #1534: ask for the next move so that asking is observable, keep the original evidence, allow `ambiguous` where supported. The original T3 and run 3 are unchanged. T3 is still RED on S4 against run 3, which asked only for parts and finding.

Run 4 (`trial/next/`), fresh subagents, the prompt now asks for parts, finding and next move (keep, split, ask), recorded unedited:

- With the Skill, nine of ten equal the key in parts, finding and next move. S4 was answered delivery, finding none, next move ask. The key says delivery, ambiguous, ask.
- Without the Skill, all ten equal the key in finding and next move, including S4 as solution and delivery, ambiguous, ask.
- So asking is now observable, and the Skill-only agent chose to ask for S4 and S5. It did not call S4 ambiguous. T9 is RED on S4's finding.

Not tuned: neither the key nor the Skill was changed after seeing run 4. The justification for `ambiguous` on S4 is the one the key states: the statement does not say whether the limit is an accepted Solution requirement. The Skill-only agent got to the same next move through "none". Whether T9 should judge the finding or only the next move, and whether `none` with ask is a defensible reading of S4, is the CPO's decision. The baseline agreeing with the key on all ten here, and the Skill adding no measurable difference on this set, is also a finding and is not hidden.
