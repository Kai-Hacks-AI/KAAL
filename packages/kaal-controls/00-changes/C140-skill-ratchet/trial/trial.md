# Trial: does an agent that has this Skill learn and apply a ratchet?

Portable. Give the three prompts to any agent that loads Skills, with and without the Skill. Nothing below names a tool, an agent or a setup.

## Setup

- Arms: `skill` (the Skill is installed where the agent loads Skills) and `blank` (the same agent and settings, without it).
- Agents: Claude, Codex, Antigravity. At least three runs of the prompt set per arm per agent, each in a fresh session.
- Give each prompt as the only message, in a repository that has nothing to do with the Skill. Do not mention the Skill or any file.
- Keep the whole answer and a record of whether the agent opened the Skill's `SKILL.md` (`opened`).

## Prompts

**P1.** Explain what a ratchet is in the context of software engineering governance. Explain its purpose, behaviour and limitations. Provide a practical example.

**P2.** A repository has 14 existing lint violations that nobody can fix this month. Set it up so that a new violation fails the build, the existing ones do not, and progress cannot slip back. Say what you would store, what happens when someone fixes one, when someone adds one, when the stored list is missing, and how the arrangement ends.

**P3.** A team can choose between three arrangements: a weekly report of violations, a build that fails on any violation, and a build that allows today's violations but no new one. For each, say what happens when someone adds a violation and when someone fixes one, and which fits a system that starts with 14 violations.

## Rubric

Judge each answer on its own words, 0 to 3 per criterion: 0 absent or wrong, 1 surface, 2 competent, 3 rigorous. Reward the idea, never a term of the Skill.

| Id | Criterion | Applies to |
| --- | --- | --- |
| R1 | The agent opened `SKILL.md` (yes or no, from the record, not scored). | every run, `skill` arm |
| R2 | Contrast: the answer separates a report, a plain gate and a ratchet by what each does on an added and on a fixed violation. | P1, P3 |
| R3 | Example: a concrete example with named findings, a new one failing, an old one passing and a fix shrinking the allowance. | P1, P2 |
| R4 | Baseline, history and end: the accepted baseline comes from the base and not from the change, it only shrinks, progress is recorded, and it ends at zero with the record kept. | P1, P2 |
| R5 | Fail-closed unknown: a missing or unreadable baseline is not a pass, and a baseline that grew fails. | P1, P2 |
| R6 | Clarity: the answer is understandable to someone outside the setup, with no unexplained token, file path, flag or local link. | every run |

## Judging

- A session other than the subject judges, with the rubric and the answers only. Where the three agents can judge each other's answers, use that.
- The judge is told the criteria and nothing about the arms. It will probably still tell them apart; the record says so.

## Record

The trial content above (prompts, rubric, pass bar) is controls'. How a run is recorded is Research's: one **rehearsal record per agent**, in the form the kaal-research Skill teaches (its harness, its technique and version, its protocol, design, evidence, runs, claims and limits), under `02-learnings/rehearsals/` of this package. The records of the second and third agent say that they challenge the first and whether they replicate it, as the Research Skill describes. Antigravity's automated parallel runs are a technique Research owns; the record names the technique and version that Research's Skill gives it.

Each record holds both arms (`blank` and `skill`) and carries the scores as its evidence of role `scores`: a file `scores.json`, which is rubric content and so controls', one entry per run:

```json
{ "runs": [ { "arm": "skill", "prompt": "P1", "opened": true, "scores": { "R2": 2, "R3": 3, "R4": 2, "R5": 3, "R6": 3 } } ] }
```

A `scores` object holds only the criteria that apply to its prompt. The record's claims stay at the scope its design supports: with blinding likely to fail, a claim of effect is not made, and the `Limits` section says so.

## Pass

For each agent's record, the `skill` arm passes when every run opened `SKILL.md`, its mean on R2, R3, R4 and R5 is at least 2, its mean on R6 is 3, and on no criterion is its mean below the `blank` arm's mean. The Skill passes the trial when all three agents pass. The Owner decides whether that is enough; the Owner has said that working on all three is sufficient, although the research was limited.
