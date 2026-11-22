# C13 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Kai's constraint, that the Skill must work in a fresh consumer that knows nothing about KAAL and may have no repository, could be turned into a Case. T1365 fails if the section names KAAL's delivery terms or assumes a repository, so the constraint stayed true through the wording instead of being a promise. The CPO's earlier ruling on C11, that each capability owns its own Good, also shaped this Change: I kept the questions generic and put nothing about KAAL's rollout practice in the Skill.

## Learned

Case ids are repo-wide, and the other ids are scoped. My first id scan covered only `packages/kaal-change` and picked T1129 to T1134, which Release already held. Release's confirmation caught it and the rescan of every branch gave T1361 onward. CI also found two acceptance Cases that hard-coded "10 verified Cases"; the new Cases made it 16, and the count would have broken again with every Case. They now assert that every Case the installed package declares verifies. Both were found by CI, not by reading, because the packed-install acceptance cannot run in my container. Cases belong beside the element they observe: the PLAN kept them in the Change folder as RED Cases, and the DO moved them into the Skill's own embedded Cases so the folder keeps none.

## Lacked

One command that shows the next free id of each kind across every branch, instead of a scan I wrote myself. A way to run the packed acceptance Cases in my container. A place that says which words belong to the Skill and which to KAAL's own practice, so that "available, integrated, active" could be checked against it instead of by my judgement.

## Longed For

Evidence that the questions help in practice. The CPO approved the PLAN with the note that it does not establish measurement of actual adoption, and nothing here measures it. A real Change planned with the section, and a reader who says whether it changed a decision, would show whether one line is enough for a small Change as the guide says.
