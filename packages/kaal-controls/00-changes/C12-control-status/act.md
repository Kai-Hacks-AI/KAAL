# C12 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C12 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

The review shaped the design for the better. Keeping discovery apart from validation turned a refusal into an inventory that never loses a control. Splitting Product from Engineering left one rule in the Skill and one Case in Engineering that runs it. A throwaway implementation outside the repository showed that every Case could pass before the DO was written, and each Case failed on its own assertion first.

## Learned

The first design refused an incomplete control whole, and that created a deadlock: the finder on `main` refused the new field, and the new finder refused the old controls, so no order of pull requests was green. Listing every control and marking it invalid removed the deadlock, and no mass update of other controls became a prerequisite. A rule that the Skill must work alone found two hidden ties, a pointer to another Skill and a Case that required it, and the word cap of 599 left no room to add text without cutting. A status is a claim, so the check can only tell that it is declared; judging it needed help in the Skill, not a script.

## Lacked

A statement up front that a Skill stands alone and that its scripts live in its own folder, which would have saved two rounds of the PLAN. A way to see, for the whole repository, which controls are in which status without running a command by hand.

## Longed For

The control that checks the declarations, `controls/CTL1`, declared on its own and honest about its own status. The other controls on collectors declaring theirs as they move, and a Developing hook only if a bad declaration ever slips through.

## Closed

The Gap of this Change, G89, is closed by Cases T770 to T779, green in the collector with all 39 Cases of the package and the Cases T778 and T779 of Engineering.

## Sentence

Priorities Lead Agents Next Development, Optimising Code Health, Enabling Clear Knowledge About Collected Testing.
