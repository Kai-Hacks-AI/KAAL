# C1 do

What the DO delivered, and what was observed.

## Delivered

- The Skill `skills/kaal-architecture/SKILL.md` (A2): 52 lines, the two concerns, the test, mixed, disguised and ambiguous statements, and the plateau as its scope.
- The package shell: `package.json` (private, not in `workspaces`), `LICENSE`, `README.md`, and the runner `test/cases.test.mjs`.
- The Cases renamed from `T<n>.red.mjs` to `T<n>.test.mjs`, unchanged. All eight are green (`npm test` in the package). They were red on the collector (`evidence.md`).
- The trial in `trial/`: `skill.*` and `baseline.*`, each a prompt, the raw output unedited and a record with its hash.

## Observed

- Run 1: a fresh subagent given only the Skill and the ten statements. Nine answers equalled the key. S10 ("Lectures are recorded and posted to the course page on the day they are given") was answered Solution, the key said Delivery. The statement is open to both readings, so this is a finding about the key, not the Skill. It is kept in `trial/run1/` with the baseline of that run.
- The key was then changed in the open: S10 now names its means ("Each lecture room has a ceiling camera that feeds a recorder ..."). Both trials were run again with fresh subagents. This is a correction made after seeing an answer, and a reader should weigh it as such.
- Run 2, with the Skill: all ten answers equal the key. Without the Skill (baseline): nine equal the key, and S4 ("The kitchen serves only the dishes that travel well in the delivery van") was answered as mixed where the key says disguised. The Skill produced the disguised reading, and the baseline did not.
- Limits: one run each. The author wrote the Skill, the key and the prompt and recorded the replies. The observer is a fresh subagent session, not a person or a separate team. The agent was told to use no tool, and that was not enforced. A stronger trial would be run by someone else.

## Not done

- No `ownership.kaal.json`: this slice has no Node. The Cases are not listed in Engineering's CI, and the package is outside `workspaces`.
- Nothing is deployed, published or promoted.
