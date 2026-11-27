# C51 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The PLAN's Cases held up. T98 to T102 went from RED to GREEN with the rename and nothing else moved, and the CPO's review of the DO caught the one false sentence, the README claim that the Exchange id was unchanged, before it shipped. Treating `KAAL Exchange` as a new Definition with a new id, not a renamed one, kept the identity story honest: the Kernel, `CASE`, `KAAL Agent` and the Exchange all changed ids, and the docs now say so.

## Learned

A Change that alters the Kernel reaches past its own capability. The installed Engine at `engineering/core` and Engineering's embed Acceptance Case both assert Core's packed Definitions, so the DO was red until both followed. That scope was only disclosed in the PLAN's follow-up and had to be authorized by the Owner afterwards, in two decisions. Process lessons: bring `main` into a collector only through a SYNC pull request on its own, because merging it into a DO branch fails Branching, and a revert commit does not repair that history; start over from the collector tip instead. Regenerate `test/verify.json` from a clean build, since a stale local `dist/` listed files the collector does not build.

## Lacked

A PLAN that named the cross-capability redelivery and the Acceptance Case as part of the Change, with the Owner's authorization recorded before the DO. Hosting's Node, claim and tests are still typed `KAAL Extension` and fail against this DO until Hosting's own Change retypes them. Ownership of the `embed.test.mjs` rename and the removal of the deprecated `capabilities()` are still open.

## Longed For

A way for Core to see which installed Engines and Acceptance Cases depend on its Definition ids, so that a change to one lists the other Changes it needs before the DO starts. A redelivery that Engineering's own adopter performs from the packed payload, so Core never edits `engineering/core` by hand.
