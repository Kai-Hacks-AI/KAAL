# C156 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Change was as small as its PLAN said. One function, its type and its export left Core, T128 went from RED to GREEN, and Core's tests, README and architecture document moved to `catalog` with nothing else touched. Engineering's one caller had already moved on main, so the DO needed no cross-capability edit and no Owner decision.

## Learned

Waiting for Engineering's move to land on main was the right order: the DO could not be green while a caller still used the old name, and a SYNC of main into the collector, as its own pull request, made the move visible to the collector before the DO started. The SYNC was a clean merge of main, so it decided nothing by hand.

## Lacked

A way to see every caller of a Core export before removing it. The PLAN named the callers it knew, and a search of the repository confirmed them, but nothing checks that an export has no consumer left.

## Longed For

A check that lists the callers of each public export of a package, so a removal states what it breaks before the DO. Publishing readiness stays a separate decision: this Change only removes the second spelling while kaal-core 0.0.1 is unpublished.
