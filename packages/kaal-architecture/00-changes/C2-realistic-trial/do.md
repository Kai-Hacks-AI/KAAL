# C2 do

What the DO delivered, and what was observed. There is no answer key and nothing here scores a classification.

## Delivered

- The trial in `trial/`: for the Skill arm and the baseline arm, a prompt, the raw output unedited and a record with the hashes of the prompt and of the five frozen requests.
- The requests are those of the landed PLAN (#1591), unchanged. Both arms got the same boundary text, stated positively, and the same six lists: solution, delivery, architecture, mixed, unresolved, change. The Skill arm also got the Skill as shipped.
- Cases T10 and T11 renamed from `.red.mjs` to `.test.mjs`. They verify the evidence only.

## Observed

- One run per arm, fresh subagents, run on 14 Nov. Each read its prompt file with one Read call; the file bytes are those hashed. The agents were told to use nothing else, and that was not enforced.
- Both arms put the transition instructions of R1, R3 and R5 into `change`. Both put the statements about the architecture description of R2 and R4 into `architecture`. The two arms differ in how they sort the other statements, and in what they list as unresolved. The raw outputs are in `trial/`.
- Independence is limited: the author wrote the Skill and the prompt and froze the requests, and the observers are fresh subagent sessions, not a person or a separate team.

## Left to the independent Review

- Whether the Skill adds value over the baseline, and whether any classification in either arm is right or useful.
- Whether the Skill stays out of planning and executing a move between states, and whether its Scope section, partly a negative list, serves the boundary Kai described.
- Whether one run per arm is enough to say anything.

Nothing was changed after seeing the outputs: not the requests, the prompts or the Skill.
