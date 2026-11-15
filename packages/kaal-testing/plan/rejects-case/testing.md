# Reject-a-Case Enforcement: Testing

The planned Cases live in `packages/kaal-testing/test/plan/rejects-case/`, named `T<n>.red.mjs`. Each exports `id`, `tests`, `title` and `run()`, and reads the repository only. They are immutable to DO. `testing/C62` renames them `.test.mjs` when GREEN and adds `test/plan/rejects-case.test.mjs` to Testing's `npm test`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T360: the trial key marks its Case claims, and every answer carries `rejectsCase` exactly where the key says it is a Case | testing/F134, testing/F135 | the key has at least two Case claims and two others, one real Case whose source file exists outside this Change; every answer is a boolean on a Case claim and null on any other |
| testing/T361: the records are raw, hashed and well-formed, and the Skill arm was given the section as installed | testing/F135 | provenance, prompt hashes, the section only in the Skill arm, at least two runs per arm, one answer per claim in order |
| testing/T362: every difference on `rejectsCase` is listed with its positions, and none is settled by editing the key | testing/F136 | the comparison equals the one recomputed from the records, the key hash matches, doubts and limits are stated |

No Case requires `rejectsCase` to match the key, or the Skill arm to differ from the baseline. Whether the Skill makes an agent reject the right Case is the trial's finding, read by a reviewer.

## RED evidence

Run `node packages/kaal-testing/test/plan/rejects-case/run-red.mjs`. At `testing/C61` on main all three are RED, because the trial records are absent. See `evidence.md`.
