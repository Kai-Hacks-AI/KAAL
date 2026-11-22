# C21 verification

Every element states what verifies it. A script is verified by Test Cases that were RED in the PLAN and GREEN in the DO. Words are not verified by Cases: a Case on the wording of a reference breaks when someone improves the sentence and proves nothing about the agent. They are verified by what an agent does.

| Step | Element | What verifies it |
| --- | --- | --- |
| Bare | the concept, as agreed in conversation and written in `C21.md` and `I15.md` | the CPO's review of this PLAN |
| Agent | `AGENTS.md` | Case T1111 (structure: it exists, `files` ships it, it names the Skill path and that path exists, it names no other package), and the agent trial |
| Skill | `references/modes.md` and the pointer in `SKILL.md` | the Cases that already guard the Skill (it names no other package, its word limit), and the agent trial |
| Script | `scripts/judge-mode.mjs` | Cases T1108 and T1109 |
| Script | `find-controls.mjs` accepting the modes | Case T1110 |

## The agent trial (DO)

A throwaway repository with no KAAL object and a few checks of different shapes: one that only reports, one that warns, one that blocks, one that blocks only what is new against a recorded list. A fresh agent has only `AGENTS.md` and the Skill, and is asked what each check does with its answer, to claim what each stops, and to add a new check and say how it will run. It is judged on: whether it says the mode of each check and does not claim that a reporting or warning check prevents; whether it says a ratchet stops only what is new; whether it asks for an exit when it is given a ratchet. Run with the instructions file and the Skill, with the Skill alone, and with neither, three runs each, and the result recorded as it is, including a run that fails.
