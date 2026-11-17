# C60 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Kai's alternative to my separate settings control: testing the real effect, a live approval that the repository either accepts or refuses, said more than reading a setting that mostly answers UNKNOWN, and it removed a control. Reusing the C58 scaffolding as `fixtures.mjs` made four Cases cheap. Writing the DO into the tree before the PLAN was merged showed exactly which three C58 Cases would move, so the PLAN could say so.

## Learned

An escalation path that only listens to failing verdicts has a hole: a pure SYNC whose approval is refused has a passing verdict and waits unseen. The refusal can be told from other failures only by GitHub's message, so the classification is narrow on purpose and everything else stays an unnamed failure. The collector must be branched from the tip that holds what the Change builds on: I first made it from `main`, could not delete it (the proxy refuses branch deletes) and had to use another name. Reading the live rulesets through the API answered in minutes what had been an open gap for two days.

## Lacked

A real refusal from GitHub: the Cases stand in the message that GitHub is known to return. Evidence from a real live run, which needs the WIRE, the repository setting and `KAAL_SYNC_APPROVE=on`. A way to remove a stale branch I created myself.

## Longed For

The first live approval of a pure SYNC, recorded as the evidence that CTL8 is Running. One place that lists the repository settings and variables a source needs, so the Owner sets them by one decision.

## Left for the Owner

The WIRE of the changed workflow, "Allow GitHub Actions to create and approve pull requests", a person for `KAAL_SYNC_REVIEWER` if CODEOWNERS names only the author, and `KAAL_SYNC_APPROVE=on`. The empty branch `kaal/release/sync-approval` is stale and can be deleted.
