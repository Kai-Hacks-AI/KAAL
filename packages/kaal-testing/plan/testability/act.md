# Testability Assessment: ACT (testing/C59, testing/C60)

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It does not close the Change's open points, and it claims no collector qualification, promotion or publication.

## Liked

The reviews that moved the concept, not the code. Kai's "test is proof, review is judgement", then the CPO's verification and validation model, each made the section smaller and clearer: Verify, Challenge, Point at judgement. Being told to challenge the model before encoding it produced `boundary.md`, and that surfaced the thing I would have missed: my own Cases matched sentences of the Skill, which is exactly the brittleness the Skill tells an agent to reject. Writing the key before every run, with its doubts, and keeping the disagreements, meant I never had to explain a result away.

## Learned

A label is not behaviour. In four pilot and trial rounds the approach labels barely separated the arms, and E1 flipped with wording and run. What did differ was a field I had not planned, `rejectsCase`: both Skill runs rejected the T3-style Case and both baseline runs judged it and left it. A trial is only as good as what its answer format can express. A key is an author's judgment: all runs disagreed with mine on E4, and that is evidence about the key as much as about the agents. Deterministic Cases on prose can only check structure, and that is the right limit.

## Lacked

An independent seat. I wrote the section, the prompts, the key and the comparison, and the observers were fresh subagents of one model family. More than two runs per arm, a second model family, and a baseline with no definitions at all. A way to make a Case enforce the answer format after the PLAN had fixed the Cases, since the DO may not change them.

## Longed For

An independent review of the E4 key and of this comparison, ideally by the Architecture owner, who owns T3. A Testing Change that makes `rejectsCase` an enforced field for a claim that is a proposed Case, as the CPO suggested. A trial against a real Case being designed, not four claims chosen to contrast. A cleaner way to recover a branch name after a collector name collides with an existing branch: `kaal/testing` blocked `kaal/testing/<concern>` and the old branch could not be deleted from a cloud session.

## Open

Not closed. Architecture's T3/S4 disagreement stands and its key is untouched. The Skill's effect on agent quality is not shown: two runs per arm, one model family, one visible difference. Collector qualification, promotion and publication are separate decisions.
