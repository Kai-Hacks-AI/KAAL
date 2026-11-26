# Setup of the trial "exchange by description"

Question: can an agent find, by description alone, the Skill that runs checks, when the Skill that asks for it (Defect) does not name it?

Headless Claude sessions (sonnet-5-5), one sandbox project. The sandbox has a 3-Defect register: D1 has a failing Test Case, D2 a passing one, D3 none. Skills deployed in the sandbox: the Defect Skill (with a `references/exchanges.md` that states a seek and a fallback, and a pointer at the decision step), and, in the second and third groups, the Testing Skill (it offers "runs checks that point at an element"). A distractor Skill (lint: "style and static-analysis rules over source text, does not run behavioural checks") was deployed in the groups that had Testing.

Groups, three sessions each: Defect only; Both (Defect and Testing, their normal names); Both with neutral names (the two Skills renamed assay and vet). Prompt, the same for all: see prompt.txt.

Known limits written down at the time:
- Session memory leaked KAAL rules ("unexpected GREEN fails until the entry leaves the register") into some answers.
- The distractor Skill was opened in 0 of 9 runs, so boundary precision is not proven, only not contradicted.
- Testing was a stub runner, not the real one (Node 24 and the Hosting install were not available).
- Which runs opened which Skill was read from the tool traces, which were not kept as files; only the outcomes below were written down.
- Scoring was done by the person who ran the trial; nobody else saw the sessions.
