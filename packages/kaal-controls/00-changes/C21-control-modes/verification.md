# C21 verification

Every element states what verifies it. A script is verified by Test Cases that were RED in the PLAN and GREEN in the DO, the same plain `.test.mjs` files in both. Words are not verified by Cases: a Case on the wording of a reference breaks when someone improves the sentence and proves nothing about the agent. They are verified by what an agent does.

| Step | Element | What verifies it |
| --- | --- | --- |
| Bare | the concept, as agreed in conversation and written in `C21.md` and `I15.md` | the CPO's review of this PLAN |
| Agent | none in this Change | no instructions file is added |
| Skill | `references/modes.md` and the pointer in `SKILL.md` | the Cases that already guard the Skill (it names no other package, its word limit), and the agent trial |
| Script | `scripts/judge-mode.mjs` | Cases T1108, T1109, T1112 and T1113, and the sensitivity record of the CHECK (`check.md`) |
| Ratchet contract | protected property, advancement rule, responsibility placement, exit, uncertainty | judgments J1 to J5 (`judgments.md`), each with an explicit disposition in CHECK |
| Script | `find-controls.mjs` accepting the modes | Case T1110 |

## Testing and judgment: definition, execution, result

The Cases and the judgment definitions exist in this PLAN, before anything runs. They are executed in CHECK, where a run record and a judgment record are produced; a definition is not a result. Each one points at the elements it examines (`F34`, `A20`, `interface.md`). The Skill states what an adopter inherits from this and what it supplies (`interface.md`).

## The agent trial (DO)

A throwaway repository with no KAAL object and a few checks, one of which blocks only what is new against a recorded list. A fresh agent has only the Skill and is asked what each check does, what it stops, how a ratchet ends, and to say what it would claim; it is judged on: does it say a ratchet stops only what is new, does it keep the type of the control distinct from its mode, does it ask for the exit and say the baseline is removed at empty. Run with the Skill and without it, three runs each, the result recorded as it is, including a run that fails. Kept separate from the sensitivity demonstration.
