# Testability Assessment: Testing

The planned Cases live in `packages/kaal-testing/test/plan/testability/`, named `T<n>.red.mjs`. Each exports `id`, `tests`, `title` and `run()`, and reads the repository only. They are immutable to DO. `testing/C60` renames them `.test.mjs` when GREEN and adds them to Testing's `npm test`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T156: the Skill assesses a claim by deterministic test, then judgment, then pushback to a named owner | testing/F129 | the section exists, is placed before the loops, says a test is proof and a review is judgement, names the three outcomes in order, points at what can only be judged without naming any other Skill, and names the four owners |
| testing/T157: the Skill forbids an invented oracle and an autonomous rewrite, and keeps judgment apart from a passing test | testing/F130 | the section states each of the three rules |
| testing/T158: the trial records of the installed section are raw, hashed and well-formed | testing/F131 | provenance, prompt hashes, installed section present only in the Skill arm, answer shape by approach, at least two runs per arm |
| testing/T159: every disagreement is listed with its positions and none is settled by editing the key | testing/F132 | the comparison equals the one recomputed from the records, the key hash matches or a revision is recorded, limits are stated |
| testing/T160: the Change stays inside its boundary | testing/N27 | exports, Nodes, skills and workflows are unchanged, and nothing refers to or depends on `kaal-review` |

T158 and T159 check the form and the integrity of the evidence. Whether the Skill helps is the trial's finding, read by a reviewer. No Case requires an answer to match the key, and none requires the Skill arm to beat the baseline.

## RED evidence

Run `node packages/kaal-testing/test/plan/testability/run-red.mjs`. At `testing/C59` on main all five are RED: the section is absent (T156, T157), the DO trial records are absent (T158, T159), and T160 is RED because the Skill has no new section yet. See `evidence.md`.
