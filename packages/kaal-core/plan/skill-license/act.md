# C151 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The CPO's review separated two standards cleanly: agentskills.io makes `license` optional, and the KAAL product makes a bundled license mandatory. The Change states the stricter rule without weakening it and still lets Core's check stay small, since it only allows the file in the layout. A layout rule that matches the whole name (`LICENSE` with at most one suffix, as a file) was easy to test at its edges.

## Learned

Allowing a thing and requiring it are different obligations with different owners. Core can allow the file because it sees only the Skill folder, and presence and alignment with the package need the package, so they belong to an adopter that holds both. Saying so in the Definition kept the requirement honest without a check that could not be made.

## Lacked

No Skill carries its license yet, and four have no `license` field at all. Nothing enforces presence or compares the file with the package, so the product requirement is stated and not yet met. The repo-free Change (core/C150) touches the same files on its own collector, so one of the two needs a SYNC before promotion.

## Longed For

The adopting control that checks every Skill for its license file and compares it with its package's license, and each capability's follow-up that adds the file. The Owner's open question remains: the repository root is PolyForm Noncommercial while the packages are MIT.
