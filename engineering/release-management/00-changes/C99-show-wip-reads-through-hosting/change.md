# release/C99 Show WIP reads GitHub through Hosting and runs in a cloud session

## Defect (provisional release/D10)

An agent in a cloud session cannot run Show WIP: `node run.mjs <owner/repo> show-wip.json` ends with status 2, `gh api graphql failed 4 times … (HTTP 403)`, so no report is printed. Placement: Release, the command's owner. Cause: the command reaches GitHub on its own, through `gh`, and by a route (GraphQL) that this kind of session does not offer. The rule to keep: a fact the host did not report is `not observed`, never guessed.

## Defect (provisional release/D11): the Dispatcher's dry run fails without a token

The Dispatcher's dry run reads open pull requests with its own unauthenticated `fetch` and got HTTP 403 "API rate limit exceeded" (unauthenticated reads: about 60 an hour for a shared address). Placement: Release, the Dispatcher's owner. Cause: it reaches GitHub itself instead of asking Hosting. Decision of the Owner (19 November 2026): a Defect, not a hotfix; it rides with this Change in this collector. Scope of this slice: the open-pull-request reads only. The reads of references, comparisons and closed pull requests still use the unauthenticated route, so D11 stays partly open and is closed by a later slice (recorded as a known gap, not hidden).

## From

Show WIP starts `gh` itself, knows the routes it reads (GraphQL for the open pieces, REST for branches and tags) and maps what comes back to facts. In a cloud session the GraphQL route is refused, so it prints nothing and exits 2.

## To

Show WIP asks Hosting for facts about the host ("the open pieces of this repository", each with its reviews, checks and review threads) and knows nothing about routes, GraphQL, REST or `gh`. Hosting (`hosting/C111`, its own Change, PLAN to follow) chooses the transport the environment can reach, and with it the binary: `gh`, `git` or any other command the environment has, a different one per environment if need be, never visible to a caller (GraphQL where it is allowed, the cloud session's review-thread route where it is not) and answers each fact it could not read as unknown, never a guess. Environment-specific routes live only inside Hosting. The service is a Hosting Script under the `kaal-hosting` Skill, like `readRevision` (hosting/C110): one implementation with two doors, the library Show WIP calls from code and the command an agent runs through the Skill. It is not one script with a switch over environments: each transport is its own small Script (one per binary or route, for example `gh` GraphQL, `gh` REST, the cloud review-thread route), all answering one shared fact shape, and choosing among them is a thin step that tries what the environment can reach and gives up as unknown. Show WIP keeps what is its own: the mapping of those host records to its facts, the stations, and the report. The report, its lines and the exit statuses are unchanged, no fact of it is dropped, and the command prints its report in a cloud session. A fact Hosting answers as unknown is `not observed`, as the command's rule already says.

## Because

One home for reaching GitHub (Hosting), and a report the agents can run themselves instead of waiting for a person to run it.

## FAR (because of Features we have to Accept Regression)

1. Regression Case, GREEN on `main` today and after the DO:
   - release/T1202: when every GitHub call fails, status 2, `show WIP: …` on standard error, nothing on standard output.
2. Accept list: the existing Cases of Show WIP (release/C61, C64 and the coordination Cases) stay GREEN. Nothing is accepted as lost.
3. Dispatcher slice (D11), RED on `main` today: `decide` reads the open pull requests once through Hosting's `readPullRequests`; `promotion-raise/gather.mjs` filters that list by base (`openPromotions(api, repo, pulls)`) and by head (`gatherFacts(api, repo, collector, pulls)`) and holds no `state=open` route.
   - release/T1203: with an `api` that refuses every `state=open` route, both functions still return the right open lists from the supplied pulls.
   - release/T1204 (static): `gather.mjs` holds no `state=open` route and `dispatch.mjs` reads the open pulls from `@kaihacksai/kaal-hosting`.
3b. Feature Cases, RED on `main` today. The report side is environment-neutral: no assertion names a route or an environment.
   - release/T1200 (the Defect's proof): in a session where GraphQL is refused and the rest of the host answers, the command prints a report. The environment lives in the stand-in `gh`, not in the assertion.
   - release/T1201: the open-piece read names no route (`graphql`, `ccr`) and starts no process, the GraphQL query is gone from `read.mjs`, and the pieces come from `@kaihacksai/kaal-hosting`.
4. Cases that belong to Hosting, drafted for the `hosting/C111` PLAN and not part of this Change: the unresolved review-thread count is read from the cloud route where GraphQL is refused and from GraphQL where it is allowed; where no route answers, the fact is unknown and never a zero; one answer shape in every environment.

## Sequence

1. This PLAN.
2. `hosting/C111`: the Hosting GitHub read Script under the `kaal-hosting` Skill, with the transport choice inside it (its own PLAN, DO and ACT, promoted to main).
3. The DO of this Change, raised from a `main` that holds `hosting/C111`. It turns T1200 and T1201 GREEN, and with the Dispatcher slice T1203 and T1204, and keeps T1202 GREEN.

No npm publish and no pin move: the command uses the in-repo workspace package.

## Not in this Change

The inventory views (`overview`, a place, `settled`: branches, tags, compare, package files) keep their present reads and move to Hosting in the next slice, in their own Change; this Change is the open-piece read, which is the default report and the Defect. Writing to GitHub, other GitHub callers (the Dispatcher's reads of references, comparisons and closed pull requests: later slice; the collector scripts), the daily page workflow (release/C64), any change to the Show WIP Skill Script or its report format, and any ruleset or `.github` change.
