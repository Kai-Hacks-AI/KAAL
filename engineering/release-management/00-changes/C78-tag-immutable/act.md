# C78 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Publishing stage had one hard-coded rule in code; declaring `rules` as a list with a control per rule gave it the same shape as the branch stages, so the judge's trace to a control with an Intent now applies there too. The CPO's scoping of the Intent (an existing published tag cannot be updated; deletion and recreation are not covered) kept the claim honest from the PLAN on.

## Learned

The old `rule` key has to stay until the new judge is on `main`, because `verify Stages` on a PROMOTION runs main's judge, which still reads `rule`. A new key must be ignorable by main's judge, and an old key can only go in a later Change. The CPO's wording matters: CTL15 prevents updating a published trial tag; it is not complete tag immutability, and no text should say it is.

## Lacked

A statement, in one place, of which ruleset protects deletion and re-creation of a published tag, so the gap this control leaves is named by an owner and not by a reviewer's caution. The live tag ruleset loaded beside the old one, so the control can leave Implemented.

## Longed For

The removal Change for the compatibility keys (`requires`, `also`, `rule`) planned as soon as the three judge Changes are on `main`. A decision on whether deletion of a published tag deserves a control of its own.
