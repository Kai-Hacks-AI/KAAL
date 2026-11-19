# C101 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C101 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

The evidence found the cause before a line was written. The delivery rule had reached `main` and every Change Isolation run into `main` still ended with `cannot check`, because the wrapper scripts run the checker as a lone copy and the reader was not beside it. Two Test Cases, one on the real wrapper against a scratch origin and one on the lone copy, were RED on `main` for exactly that line and GREEN with the fix, so the repair stayed at three small edits.

## Learned

A rule that is registered as a control must say what a missing input means. Here it says `cannot check`, which is a result of unknown, never a pass. The PLAN also taught me to read a log for what it shows and not for what I expected: the run that targeted a wire branch printed no line at all because that branch's own checker predates the rule, and I first counted it as having reached the reader. The CPO's review taught the vocabulary: a script checks and verifies and gives a result (pass, fail or unknown); an agent or a person judges and validates and gives a judgement. A review wording finding like that is non-deterministic, so it is argued and fixed in the PR, and it gets no Test Case and no Defect.

## Lacked

A real record. CTL23 claims `designed` and its minimum asks for one Change Isolation run into `main` whose log shows a checked line; that run cannot exist before this reaches `main`. The checker's older messages and its `CannotJudge` error class still use "judge"; they predate this Change and are wider than it.

## Longed For

The first real record, taken from the first Change Isolation run into `main` after the promotion and linked from the ACT of whatever Change files it. A small Change of its own for the older wording in the checker and the wrapper scripts, once the owner agrees the vocabulary. Making the rule preventive is a separate control and waits for CTL23 to be Tested and the Owner to decide.

## Closed

F78 and A69 and CTL23 are registered and equal to their drafts; T1181 to T1186 are green in the collector. `check.test.mjs` passes 26 of 26. The engineering suite fails the same 16 Cases as `main` and no other. The Codex review of the DO found nothing; the CPO's wording finding was fixed in the same PR.

## Sentence

Plans Lay Anchors, Nothing Drifts; Owners Check, Humans Evaluate, Concrete Knowledge Arrives, Closing Together.
