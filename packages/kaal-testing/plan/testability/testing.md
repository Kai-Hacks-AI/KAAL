# Testability Assessment: Testing

The planned Cases live in `packages/kaal-testing/test/plan/testability/`, named `T<n>.red.mjs`. Each exports `id`, `tests`, `title` and `run()`, and reads the repository only. They are immutable to DO. `testing/C60` renames them `.test.mjs` when GREEN and adds them to Testing's `npm test`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T156: the Skill has one assessment section, with the outcomes Verify, Challenge and Point at judgement in order, the four owners, and no other Skill named | testing/F129, testing/N28 | structure: the section exists, is placed before the loops, has the labelled outcomes in order, names the owners and no other Skill, and stays small |
| testing/T157: the section carries two labelled rules after the outcomes: reject a brittle Case, and never invent an oracle | testing/F130, testing/F133, testing/N28 | that each rule is present, labelled and not empty |
| testing/T158: the trial records of the installed section are raw, hashed and well-formed | testing/F131 | provenance, prompt hashes, installed section present only in the Skill arm, answer shape by approach, at least two runs per arm |
| testing/T159: every disagreement is listed with its positions and none is settled by editing the key | testing/F132 | the comparison equals the one recomputed from the records, the key hash matches or a revision is recorded, limits are stated |
| testing/T160: the Change stays inside its boundary | testing/N27 | the Skill has exactly one new section, and exports, Nodes, skills, workflows and dependencies are unchanged |

T156 and T157 check structure and boundary, never a sentence of the Skill: a Case that matched wording would verify incidental text, which the Skill itself tells agents to reject (testing/N28). Whether the Skill changes what an agent does is judged by the trial.

T158 and T159 check the form and the integrity of the evidence. Whether the Skill helps is the trial's finding, read by a reviewer. No Case requires an answer to match the key, and none requires the Skill arm to beat the baseline.

## RED evidence

Run `node packages/kaal-testing/test/plan/testability/run-red.mjs`. At `testing/C59` on main all five are RED: the section is absent (T156, T157), the DO trial records are absent (T158, T159), and T160 is RED because the Skill has no new section yet. See `evidence.md`.
