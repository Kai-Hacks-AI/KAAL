# C14 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The fallback being two chapters with a reserved declaration. Once DEFAULT was settled as an identity and not a TYPE, the Cases for the text became small, and a reviewer could read all eight in one sitting. Reading the text from the Change itself made every Case runnable by hand with Node and nothing else, which is what let the RED and the GREEN be shown and not claimed.

## Learned

I put the contract Cases on the wired `.github` file, and that made the capability depend on its own wiring while the wiring had to wait for the capability. The circle was invisible while I wrote the Cases and obvious as soon as someone asked which Change could be complete first. A Case should read the artefact its Change owns, and the host installation should only compare against it. I also learned that a Case which is green on today's text proves nothing: three of the first Cases passed on the old template until I added assertions that only the new text could satisfy. Delivery again cost more than the Change: updating a branch from its base made it neither a Change nor a synchronization, and the check that explains this is right, but only after I had made the mistake.

## Lacked

A statement, before I started, of the order in which a capability and its wiring travel and what each one's evidence is. I worked the wiring first and had to undo it. A way to repair my own synchronization branch: the force-push I needed was refused, so a replacement pull request was the only route, and the approval of the old one did not carry over.

## Longed For

A synchronization that stays valid when its base moves, instead of going behind after every neighbouring merge. A check that names a Case reading a file outside its own Change before the PLAN is reviewed, so a circle shows up at the PLAN and not at the review of the DO.
