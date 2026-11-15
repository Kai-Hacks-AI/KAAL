# Case Ownership: DO (testing/C62)

`testing/C62` is the DO of `testing/C61` (#1693, approved at 9006bdc, merged into the collector as e1da4f7). The CPO's boundary stands: the owning concern judges whether its Cases are adequate, Testing validates declared identities, links and record consistency only, and unresolved Cases stay unresolved pending owner judgment.

## What it delivers

- The Cases testing/T360 to T362, renamed from `.red.mjs` to `.test.mjs` with no change to their content, run from `test/plan/case-ownership.test.mjs` and added to Testing's `npm test`.
- The survey in `survey/`: `survey.json` (the scope `packages/kaal-testing` and `packages/kaal-review`, 17 Case files), `judgments.json` (18 owner judgments) and `investigations.json` (2 investigations). `review-judgement.txt` is the Review owner's reply, kept verbatim and as text so that no document in the scope defines a node twice.

Nothing else of the delivered package changes. No export, Node, Skill, workflow or dependency is added, and no Case file of any capability was edited.

## Results

`node packages/kaal-testing/test/plan/case-ownership/run-red.mjs`: T360, T361 and T362 GREEN. They were RED before the survey records existed.

The survey sorted 15 Case files as owned and 2 as unresolved.

| Concern | Nodes judged | Recorded by | Verdicts |
| --- | --- | --- | --- |
| Review | 7 | the Review thread, from its own reading of its Cases at `kaal/review/applications` 83f459b | 7 inadequate, each for a stated gap |
| Testing | 11 | the Testing thread, which also wrote the Cases | 4 adequate, 7 unknown |

The Review owner judges all seven of its Cases inadequate, because each checks the shape of a review record and none checks the quality, independence or truth of the review. That is the Review owner's judgment and it is not proof. Testing does not repeat or contest it, and has not changed any Review Case.

The two unresolved Cases, Review's T28 and T29, declare `review/G1` and `review/G2`. The Review owner's investigation: the gaps are defined in a table and a `closes` list of the Change file `review/C1`, not in node files, so an existing node should own them. Whether gaps get node files of their own is a question for the CPO. Testing assigned no owner and changed nothing.

## What it does not claim

The Testing judgments are by their author, with no independent seat, and say so. The helper's idea of where a node is defined (an id line, a heading, a bold list opener) covers what the two scopes use. Another capability's convention may need another form, and that is a later Change. No Case is rejected, no owner was assigned automatically, and no promotion, activation, merge of a later delivery or publication is claimed.
