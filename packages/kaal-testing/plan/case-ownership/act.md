# Case Ownership: ACT (testing/C61, testing/C62)

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It does not close the Change's open points, and it claims no collector qualification, promotion or publication.

## Liked

The CPO's first review, which turned my framing around. I had started from "Testing rejects a Case that has no owner", which put Testing in the position of judging other concerns' Cases. The correction (nodes own Cases positively, owners judge adequacy, Testing validates only declared links, identities and consistency, an unowned Case is "unresolved" and never rejected) made the Change smaller and kept the boundary clean. Getting the Review owner's own judgment, kept verbatim in `review-judgement.txt`, was better evidence than anything Testing could have said about Review's Cases. A deterministic helper that counts and lists, and leaves every judgment to a person, kept the Script and the Skill apart.

## Learned

Where a definition lives is part of the data. My survey helper counted a node twice when the Review judgment sat in a markdown file with a bold list opener, so the record became plain text. Ids are a shared resource that I treated as mine: the CPO cited "F29 and T290 to T291" for what I had written as F134 to F137 and T360 to T362, and the numbering of a collector that is not on main yet shifts under a reader. A branch is also a shared resource: while publishing the next PLAN I pushed a commit onto this Change's DO branch, which was the live head of #1714, and had to revert it. A new PR's first Branching run fails before auto-merge is registered, and a re-run of the old run repeats the old verdict; only a run caused by a new event is new.

## Lacked

An independent seat for Testing's own judgments. The 11 Testing nodes were judged by the thread that wrote the Cases: 4 adequate, 7 unknown. The Controls owner, whose Cases the PLAN's baseline survey had shown with unresolved gaps, was not asked, because the DO scope moved to Review. Installed dependencies in the sandbox: part of Testing's suite cannot run there, so I could not show that the whole `npm test` is green locally and relied on CI.

## Longed For

A decision on whether gaps get node files of their own, which is what leaves Review's T28 and T29 unresolved. An id allocator, so a block does not need renumbering when another line lands first. A head branch per PR that is not my shared working branch, so a later PLAN cannot touch an open DO. A way to ask an owning thread for its judgment without a relay in between.

## Open

Not closed. Two Cases are unresolved (Review's T28 and T29), and their investigation stands without an invented owner. Seven Testing judgments are "unknown". Review's seven "inadequate" verdicts are the Review owner's to act on, and Testing has changed none of its Cases. No promotion, activation, merge of a later delivery or publication is claimed.
