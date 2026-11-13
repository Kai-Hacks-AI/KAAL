# C20 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's ruling arrived while C12 was still in its collector, so the amendment cost one small Change and no rework on main. Writing the Cases first showed exactly which two delivered assertions the ruling replaced, so the DO named them instead of quietly loosening them.

## Learned

Two threads claimed the same Change id within a minute, because ids are taken from what is visible on the branches at that moment. The clash was found only when the coordinator compared the PRs. Dropping the separate fallback result left the reader simpler: one registry, with DEFAULT as one more entry, and the judge needs no special case beyond the missing route and identity rows.

## Lacked

A way to claim an id before opening the PLAN, and a check that two open PLANs do not use the same id. The reference from F17 to F19 points at a file that is in another collector, so it can only be checked after both land.

## Longed For

Id allocation that is visible to every thread at once. Both collectors on main, the hotfix route defined, and the envelope check promoted together with its templates.
