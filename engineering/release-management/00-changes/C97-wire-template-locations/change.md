# C97 change

## PLAN

1. Add T1170 (release/F75), RED, and the drafts in `interface.md`: the Requirement F75, the corrected Target hint of the template, and the amendment of T281.
2. Observe T1170 RED and that it passes with the drafts (`evidence.md`).
3. The PLAN changes no template, source, `.github` file, variable or setting.

## What changes

The Target hint says: the operational destination, by path, under one of the wirable delivery locations declared in `engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json`. No root is named. The three chapters and the cue are unchanged.

## FAR

1. **Regression.** All green Cases of `engineering/release-management` stay green, in particular T282 (the install judge) and T1159 to T1164.
2. **Accept list.** T281 asserts that the template source equals the draft of release/C27, which still holds the old hint. The DO amends T281: it keeps the chapter and cue judgement on the source, and drops the equality with a draft that is a record of what C27 decided. The exact text is now pinned by T1170 through F75. T281 stays green.
3. **Feature.** T1170.

## Not in this Change

- A Case that any template must look a certain way (release-wide), and a control that the installed templates are an accepted version: both are the Owner's concept for templates and are their own Changes.
- WIRE #2046 itself: it installs the corrected source after this Change is on `main`.
