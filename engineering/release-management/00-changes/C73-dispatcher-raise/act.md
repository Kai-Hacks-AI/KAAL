# C73 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The CPO's two rounds of review made the Dispatcher smaller and safer: the first asked that the seat be a replaceable policy and that duplicates be prevented by a uniqueness the platform guarantees, not by a look before the write; the second removed `contents: write` until the slice that needs it and asked for the tip to be checked right before the POST. Writing T949 and T950 as RED Cases before touching the sources made both requirements measurable, and a stand-in GitHub that keeps one open pull request per head and base made the race testable without a network.

## Learned

GitHub cannot pin a pull request to a commit when it is created, so the guarantee at the write boundary is detect-and-report plus the gate (review and checks bind to the head SHA), not prevention. A refusal of a second open pull request for the same head and base is the idempotency, and only that exact refusal may be treated as an answer. A dry run does not need the App: minting the token only for a live run lets the first run happen before the Owner has created anything. The collector lags main, so its pull requests need a SYNC before `verify Stages` passes, and the first run of Branching fails on every new pull request until auto-merge is toggled.

## Lacked

A real run: nothing here proves a real token mint, a real schedule or the real order in which collectors are decided. The pinned commit of the token action had to be read from outside this repository, and no Case checks that it still is the commit of the tag it names. The priority HOTFIX, WIRE, KAAL and the queue capacity are not decided anywhere yet.

## Longed For

The first dry run after the WIRE, read next to what a person would have raised, before `KAAL_DISPATCH_RAISE` is switched on. The promote SYNC (release/C74) and the seat and priority (release/C75), so that a raised PROMOTION is also the next one to go.

## Left for the Owner

Create and install the KAAL Dispatcher App from `05-src/promotion-raise/app-manifest.json`, store the secret `KAAL_APP_DISPATCHER_KEY` and the variable `KAAL_APP_DISPATCHER_ID`, then the go for the WIRE of `dispatcher.yml`, alone; the first run is a dry run, and `KAAL_DISPATCH_RAISE=on` is a second, separate step after the dry run has been read.
