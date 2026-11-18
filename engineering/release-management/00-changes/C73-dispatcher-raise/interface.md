# C73 interface

Drafts as they are added in the DO. T942 to T947 read them. None of them is on the collector until the DO.

## Draft of I40.md

````
---
id: release/I40
title: the Dispatcher only raises work to the next station
---
# release/I40 the Dispatcher only raises work to the next station

Contract: the Dispatcher raises pull requests and does nothing else. It never approves, merges, enables auto-merge, pushes or edits a branch. The job that holds its token reads no collector: it takes the decision of the job that does as data, reads it strictly, and makes one write, the creation of a pull request. What the Dispatcher raises is a proposal; it carries no authority.

Owner: release management.
````

## Source contracts (`05-src/promotion-raise/`)

- `gather.mjs`: `listCollectors(api, repo)` returns the branches `kaal/<capability>/<concern>` from `GET git/matching-refs/heads/kaal/`. `gatherFacts(api, repo, collector)` returns the facts `decideRaise` reads (release/C72): `aheadOfMain` from `GET compare/main...<collector>`, `merged` (merged pull requests into the collector, newest first) from `GET pulls?state=closed&base=<collector>`, `open` (open pull requests from the collector) from `GET pulls?state=open&head=<owner>:<collector>`. GET only.
- `raise.mjs`: `readDecision(d)` accepts only action `raise`, a head that is a collector, base `main`, a one-line title starting `PROMOTION: `; the title is cut to plain characters (200) and the body likewise (2000). `raiseAll({ api, repo, decisions, live })` returns one result per decision: `none`, `refused`, `would-raise` (not live) or `raised` after exactly one `POST repos/<repo>/pulls`.
- `dispatch.mjs`: `decide` prints the decisions for every collector; `raise` reads `KAAL_DECISIONS` and raises when `KAAL_DISPATCH_RAISE` is `on`. Its API function refuses everything but GET and the POST of a pull request.

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
