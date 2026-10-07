# Retro

## Learned

The first external embedding showed that KAAL was closer to being portable than it looked: the host transition was missing one selection step rather than another architecture. It also exposed a sharper boundary. Composition dependencies are real KAAL information, but today they are only discoverable indirectly through Agent Skill prose. Six review rounds spent making that indirect source safe enough to refuse uncertainty. That is evidence for a future machine-readable dependency meaning, not a reason to enlarge this Change.

## Liked

That Enercon could be used as a real external proving ground without becoming part of KAAL's implementation and without being modified. I liked that selection stays explicit by Node identity and that incomplete composition fails rather than quietly producing something that looks installed. The Change also kept installation, Agent wiring and checking separate instead of turning first embedding into a large convenience command.

## Lacked

A first-class declaration of capability dependencies. The amount of review attention required by the compatibility reader is disproportionate to the small bootstrap capability we actually needed. I also lacked the final proof of performing the embedding in Enercon itself; this Change correctly proves against a scratch clone, while the real host embedding belongs after this lands.

## Longed

For the next step to be boring: land this, use it to embed KAAL into Enercon for real, and learn from that operation. If the dependency problem recurs, establish the machine-readable meaning deliberately in its own Change. Beyond that, I want an installed external KAAL to be able not only to understand and compose itself, but eventually to carry the full lifecycle needed to evolve itself there.
