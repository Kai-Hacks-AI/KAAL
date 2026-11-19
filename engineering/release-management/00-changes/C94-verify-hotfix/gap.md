# C94 gap

Gap id `release/G66` (reserved to the hotfix capability thread, taken over from C31).

| Target artefact | Baseline | Gap |
| --- | --- | --- |
| a control for the Hotfix trace | none; F17 and the envelope check (CTL11) judge the shape of the body only | a Hotfix can name a Defect that is not recorded, that has no reproducing Case, or two Defects, and nothing reads whether the Case was RED against the baseline and GREEN against the corrected revision |
| release/F71, release/A66 | none | the requirement and the architecture of that control are not stated |
| the facts | none | no reader gets the Defect, its Cases and the diff from the base as Git data; C31 left the lookups to a caller that does not exist |
| the check's source | none | no workflow source runs such a check on a pull request with no token |
