# C25 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C25 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

Control first, before any migration, gave the ratchet a clean concept: one Case for a correct setup (GREEN) and several for bad setups (RED), each bad setup with one fault so the Case names what it catches. Running the check over the real `packages/` showed the first honest baseline: every capability folder fails today. The reviews changed the Change for the better four times: where the control sits (`engineering/02-controls`), that `packages/` is special because of the workspace, that it holds only packages plus `AGENTS.md` and `README.md`, and that the ratchet's baseline names each package and its findings and is never a count.

## Learned

A check that only looks for faults passes a folder that has none of the layout, so it needs a rule for the empty case; running it on a folder that was never migrated showed that. A check must say UNKNOWN, never PASS, when it cannot judge. A mutant of the check, with one rule dropped, turns exactly the Case that names that rule RED. A draft control and its final copy must not both exist in a tree, because the id is then declared twice. A requirement and its Case can drift apart in a second place: N20 and T1227 carried the same "no script" claim as N19 and T1177, and the review caught the Done when.

## Lacked

A run of the check over every capability as a stored baseline: the observed result is in `evidence.md` and is not part of the control's minimum evidence. A way to run the package's Cases where the dependencies are not linked: T1178 and T1228 still need the Hosting package. The place of `AGENTS.md` in `engineering/` and `.kaal/` after delivery is for WIRE to say.

## Longed For

The ratchet itself, as separate small Changes: the baseline of findings per package and the rule that a resolved finding does not return. Then the `engineering/` and `.kaal/` ratchets, the Exchange folder `engineering/03-exchanges/`, and the control that derives one source per Skill from the release tag.

## Closed

The Gap of this Change, G115, is closed by Cases T1230 to T1238 and the check in the Skill. All 10 Cases of this Change are GREEN, and the package's other Cases are as before. No package was moved, nothing was wired and nothing was published. The control is detective and gates nothing.

## Sentence

Control First, Then Each Package Shows Its Own Findings, Never Only A Count.
