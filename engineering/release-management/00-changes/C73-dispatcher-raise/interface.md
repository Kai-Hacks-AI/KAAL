# C73 interface

Drafts as they are added in the DO. T942 to T949 read them. None of them is on the collector until the DO.

## Draft of I40.md

````
---
id: release/I40
title: the Dispatcher only raises work to the next station
---
# release/I40 the Dispatcher only raises work to the next station

Contract: the Dispatcher raises pull requests and does nothing else. It never approves, merges, enables auto-merge, pushes or edits a branch. The job that holds its token reads no collector: it takes the decision of the job that does as data, reads it strictly, and makes one write, the creation of a pull request. What the Dispatcher raises is a proposal; it carries no authority. Raising is idempotent per collector and revision: overlapping or retried runs never create a second PROMOTION for the same collector state; the refusal of GitHub to open a second pull request for the same head and base is taken as the answer, not as a failure.

Owner: release management.
````

## Source contracts (`05-src/promotion-raise/`)

- `gather.mjs`: `listCollectors(api, repo)` returns the branches `kaal/<capability>/<concern>` from `GET git/matching-refs/heads/kaal/`. `gatherFacts(api, repo, collector)` returns the facts `decideRaise` reads (release/C72): `aheadOfMain` from `GET compare/main...<collector>`, `merged` (merged pull requests into the collector, newest first) from `GET pulls?state=closed&base=<collector>`, `open` (open pull requests from the collector) from `GET pulls?state=open&head=<owner>:<collector>`. GET only.
- `raise.mjs`: `readDecision(d)` accepts only action `raise`, a head that is a collector, base `main`, a 40-hex lowercase `revision`, a one-line title starting `PROMOTION: `; the title is cut to plain characters (200) and the body likewise (2000). `raiseAll({ api, repo, decisions, live })` returns one result per decision: `none`, `refused`, `would-raise` (not live), `already-raised` (the look `GET pulls?state=all&head=<owner>:<head>&base=main` finds a pull request whose body holds the marker `<!-- kaal-dispatch: <head>@<revision> -->`, no write), `raised` after exactly one `POST repos/<repo>/pulls` whose body is the cut body plus the marker, or `exists` when that POST is refused with status 422 and a message containing `pull request already exists` (no retry). Any other error is thrown.
- `seat.mjs`: `readCapacity(value)` returns the whole number 1 to 9 in the string, otherwise 1. `oneAtATime({ decisions, openPromotions, capacity = 1 })` keeps every skip as it is and keeps the first `raise` decisions while `openPromotions.length` plus the kept ones stays within `capacity`; every other `raise` becomes a skip with reason `seat-taken` (the detail names the open pull request when there is one). It is a policy that C89 and C75 may replace. `gather.mjs` also has `openPromotions(api, repo)`: `GET pulls?state=open&base=main&per_page=50`, every open pull request into main, since an enqueued one is still open. `gatherFacts` also returns `tip`, the revision from `GET git/ref/heads/<collector>`.
- `dispatch.mjs`: `decide` prints the decisions for every collector, passed through `oneAtATime` with the capacity of `KAAL_DISPATCH_CAPACITY`, each raise carrying the `tip` as `revision`; `raise` reads `KAAL_DECISIONS` and raises when `KAAL_DISPATCH_RAISE` is `on`. Its API function refuses everything but GET and the POST of a pull request.

## Draft of `app-manifest.json`

````
{
  "name": "App",
  "url": "https://github.com",
  "public": false,
  "hook_attributes": { "url": "https://example.invalid", "active": false },
  "default_events": [],
  "default_permissions": { "contents": "write", "metadata": "read", "pull_requests": "write" }
}
````

The name is a neutral template; the instance's display name (KAAL Dispatcher) lives in KAAL's instance map, not here, and is the controls thread's shape (release/C73 follows it).

## Shape of `dispatcher.yml`

Triggers: `schedule` (every 10 minutes) and `workflow_dispatch`. Top-level `permissions: {}`. Job `decide Dispatch` (`contents: read`, `pull-requests: read`, no App key) runs `dispatch.mjs decide` and outputs the decisions. Job `raise Dispatch` (`needs: decide`, `permissions: {}`) mints the App token with a pinned token action from `vars.KAAL_DISPATCHER_APP_ID` and `secrets.KAAL_DISPATCHER_KEY` and runs `dispatch.mjs raise` with `vars.KAAL_DISPATCH_RAISE`. Every action is pinned to a commit.
