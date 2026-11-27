# C162 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The CPO's hold on the PLAN was right and cheap to act on. Separating the product property from the adopter's policy, and `declared` from `demonstrated`, made the judge small: one pure function, a verdict that says `demonstrated: unknown` in the data, and an acceptance that can make a setup acceptable without ever making the package independent. The Cases T129 to T133 went from RED to GREEN with the Definition and the judge, and nothing else moved.

## Learned

Building the DO exposed a design flaw the PLAN review did not: a section inside the Installation Contract changes that Definition's bytes and so its id, and Guard's published `contract.json` pins that id as its `format`. The Owner chose a Definition of its own, amended in a small PLAN amendment, and T133 now holds the Contract's identity. A new payload Definition also reaches past Core: Engineering's embed Acceptance Case hard-codes the payload's file list and Node count, so the DO was red there until the Owner authorized that edit. Local Acceptance does not run in the sandbox, so only CI could show it.

## Lacked

A PLAN that listed every consumer of the payload's contents: Guard's pinned format id, Engineering's literal counts and file lists, the pinned lists in Core's own tests. Nothing yet demonstrates independence: an isolated installation of a packed package is no one's check, so `demonstrated` is `unknown` for every package.

## Longed For

Acceptance Cases that derive the payload's files and Node count from the packed package, so a new Definition needs no edit outside Core (Engineering C44 is moving that way). An adopting control that runs the judge over each capability package and a baseline of today's dependents, and the isolated-install evidence that turns `unknown` into a verdict.
