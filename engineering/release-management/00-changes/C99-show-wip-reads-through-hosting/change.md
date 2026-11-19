# release/C99 Show WIP reads GitHub through Hosting and runs in a cloud session

## Defect (provisional release/D10)

An agent in a cloud session cannot run Show WIP: `node run.mjs <owner/repo> show-wip.json` ends with status 2, `gh api graphql failed 4 times … (HTTP 403)`, so no report is printed. Placement: Release, the command's owner. Cause: the command reaches GitHub on its own, through `gh`, and by a route (GraphQL) that this kind of session does not offer. The rule to keep: a fact the host did not report is `not observed`, never guessed.

## From

Show WIP starts `gh` itself, knows the routes it reads (GraphQL for the open pieces, REST for branches and tags) and maps what comes back to facts. In a cloud session the GraphQL route is refused, so it prints nothing and exits 2.

## To

Show WIP asks Hosting for facts about the host ("the open pieces of this repository", each with its reviews, checks and review threads) and knows nothing about routes, GraphQL, REST or `gh`. Hosting (`hosting/C111`, its own Change, PLAN to follow) chooses the transport the environment can reach (GraphQL where it is allowed, the cloud session's review-thread route where it is not) and answers each fact it could not read as unknown, never a guess. Environment-specific routes live only inside Hosting. Show WIP keeps what is its own: the mapping of those host records to its facts, the stations, and the report. The report, its lines and the exit statuses are unchanged, no fact of it is dropped, and the command prints its report in a cloud session. A fact Hosting answers as unknown is `not observed`, as the command's rule already says.

## Because

One home for reaching GitHub (Hosting), and a report the agents can run themselves instead of waiting for a person to run it.

## FAR (because of Features we have to Accept Regression)

1. Regression Case, GREEN on `main` today and after the DO:
   - release/T932: when every GitHub call fails, status 2, `show WIP: …` on standard error, nothing on standard output.
2. Accept list: the existing Cases of Show WIP (release/C61, C64 and the coordination Cases) stay GREEN. Nothing is accepted as lost.
3. Feature Cases, RED on `main` today. The report side is environment-neutral: no assertion names a route or an environment.
   - release/T930 (the Defect's proof): in a session where GraphQL is refused and the rest of the host answers, the command prints a report. The environment lives in the stand-in `gh`, not in the assertion.
   - release/T931: the open-piece read names no route (`graphql`, `ccr`) and starts no process, the GraphQL query is gone from `read.mjs`, and the pieces come from `@kaihacksai/kaal-hosting`.
4. Cases that belong to Hosting, drafted for the `hosting/C111` PLAN and not part of this Change: the unresolved review-thread count is read from the cloud route where GraphQL is refused and from GraphQL where it is allowed; where no route answers, the fact is unknown and never a zero; one answer shape in every environment.

## Sequence

1. This PLAN.
2. `hosting/C111`: the Hosting GitHub read entry, with the transport choice inside it (its own PLAN, DO and ACT, promoted to main).
3. The DO of this Change, raised from a `main` that holds `hosting/C111`. It turns T930 and T931 GREEN and keeps T932 GREEN.

No npm publish and no pin move: the command uses the in-repo workspace package.

## Not in this Change

The inventory views (`overview`, a place, `settled`: branches, tags, compare, package files) keep their present reads and move to Hosting in the next slice, in their own Change; this Change is the open-piece read, which is the default report and the Defect. Writing to GitHub, other GitHub callers (the dispatcher, the collector scripts), the daily page workflow (release/C64), any change to the Show WIP Skill Script or its report format, and any ruleset or `.github` change.
