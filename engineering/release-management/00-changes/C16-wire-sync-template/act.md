# C16 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The split showed its worth at once: with the template text in the capability, the nine engineering Cases went green on main without the host, and the wiring Change shrank to one claim, that the installed file equals the capability text. Cases that compare bytes are cheap to write and cannot be argued with. Change Isolation caught my mistake before anything reached main.

## Learned

I first wrote the capability Cases against the installed `.github` file, so the capability could not be green before its installation; the CPO's revision made that visible. Asking where a Case reads its evidence from should come before writing it. Worse, I then put the engineering records of the wiring into the same collector as the `.github` file, and the promotion failed Change Isolation: a wiring Change has two parts that travel in two collectors, `.github` first and the engineering records second, and the Cases run against the template on main. The earlier wiring for the fallback template showed this pattern, and I did not follow it. A sync that follows a promotion needs no decision of its own: its Reason is only why the collector must be fresh. Collectors are deleted when their promotion merges, so a Change that needs a collector after that must cut a new one. A first Branching run on any pull request fails on a stale auto-merge flag; the run from the enable event is the one that counts.

## Lacked

A statement, in the PLAN of any wiring Change, that its `.github` part and its engineering part are two collectors and two promotions, in this order. A Pull Promotion run on the real repository, whose supplier was not yet on main, so readiness was judged by hand. A way to open a pull request without a generated footer being added.

## Longed For

Change Isolation judged on the collector when files are added to it, so a mixed collector is refused at its first pull request and not at its promotion. Readiness read by the script from live facts, so that the order of sync, DO, ACT and promotion is shown by the tool. Auto-merge set at creation, so the first Branching run is the real one.
