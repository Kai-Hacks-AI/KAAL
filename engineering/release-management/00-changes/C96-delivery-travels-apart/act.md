# C96 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's correction of the first slice made this one small: no per-location flag, every declared location and the root manifest and lockfile are delivery, detective first. The CPO's review removed the one exception I had added (Core), and the Case that says a Core change with other solution paths and delivery is still reported (T1165) made the independence of the rules a fact, not a promise. Injecting the reader in `deliveryMixed` kept both the unreadable-declaration case and the Core case one function argument each.

## Learned

The checker is run in two shapes, in the repository and as a lone copy by the wrapper scripts, and a static import of a repository file breaks the second; a Case already existed for exactly that and caught it in CI, not in my local run, where the same Case fails on `main` for lack of Foundation's file. A local failure list that equals `main`'s count can hide a new failure: compare names, not counts. Printing a new line from the CLI changes what the CLI tests pin, so the report goes after the verdict and only when the gate passes.

## Lacked

A local environment that runs Engineering as CI does, so that a Case that depends on Foundation's file is not noise. The first Branching run of every new PR fails stale; I disabled and re-enabled auto-merge each time.

## Longed For

The decision of the Owner about making the rule preventive, after it has run for real. Retiring Core's special rule (release/C98), which makes the Core path list and its supporting files vanish from the checker. The same declaration read by the other places that still carry a list of delivery roots.
