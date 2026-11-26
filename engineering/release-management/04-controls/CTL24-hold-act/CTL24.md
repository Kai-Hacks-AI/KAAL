---
id: release/CTL24
title: hold Act
description: It reveals a retro that reflects a Change of a collector while the Cases that apply to the carried Changes are not really green.
type: detective
status: designed
has: [release/I56]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL24 hold Act

A detective control that is meant to become preventive. `hold Act` holds the ACT of a collector back until the work is done: it reveals an ACT that has come too early. It measures the tree of a collector: with no retro that reflects a carried Change it says PASS, there is no ACT to hold; with one it finds the Cases that apply to the carried Changes from the content (its folder, and the Cases that test the elements the Change justifies along the relationships) and says FAIL, with the message `finish your work first` and the Cases named, while any is parked red or observed RED. It says UNKNOWN, which never passes, when an applicable Case was not observed green or no Case applies, and PASS only when every applicable Case is really green. It reports how many are red, green and unknown. PASS is not an approval and not a merge decision.

It reads the tree it is handed and the observations of Testing, never an exit code and never the history of the branch. It judges only the completion of the work: it does not say whether the Cases are good or the code is right, and not whether a pull request was entitled to change them. Making it a required check, in a hook for early feedback and in a ruleset, are other steps with their own Owner decisions.

It rolls out detective first, as the other controls of this repository did: (1) its verdict is observed on real collector pull requests without blocking anything; (2) it runs as an advisory CI check behind a feature flag, and the evidence is collected; (3) only after that is validated and the Owner authorizes it is the check required in the `23 - collecting` ruleset, and from then on the control is preventive and its type changes in the Change that makes it so. The judge only judges; what a verdict does is decided where it is asked, and once the check is required UNKNOWN does not pass.

It has one Intent, release/I56.
