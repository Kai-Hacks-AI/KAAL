# release/C99 Show WIP reads GitHub through Hosting and runs in a cloud session

## Defect (provisional release/D10)

An agent in a cloud session cannot run Show WIP: `node run.mjs <owner/repo> show-wip.json` ends with status 2, `gh api graphql failed 4 times … (HTTP 403)`, so no report is printed. Placement: Release, the command's owner. Cause: the command reaches GitHub on its own, through `gh`, and by a route (GraphQL) that this kind of session does not offer. The honest observation to keep: a fact GitHub's REST API cannot give is `not observed`, never guessed.

## From

Show WIP starts `gh` itself. The open pieces come from one GraphQL query. In a cloud session it prints nothing and exits 2.

## To

Show WIP starts no process. Every GitHub read goes through one Hosting entry (`hosting/C111`, its own Change, PLAN to follow) that calls the REST API only. The open pieces are read from REST (the pull list, each piece's reviews, the checks of its head). The report, its lines and the exit statuses are unchanged, and the command prints its report in a cloud session.

## Because

One home for reaching GitHub (Hosting), and a report the agents can run themselves instead of waiting for a person to run it.

## FAR (because of Features we have to Accept Regression)

1. Regression Case, GREEN on `main` today and after the DO:
   - release/T932: when every GitHub call fails, status 2, `show WIP: …` on standard error, nothing on standard output.
2. Accept list: the existing Cases of Show WIP (release/C61, C64 and the coordination Cases) stay GREEN. One fact changes visibly and is a Feature, not a loss: the count of unresolved review threads has no REST route, so a piece's `threads` is listed under `not observed` instead of a number. The command's rule already says a fact the host did not report is `not observed`, never guessed.
3. Feature Cases, RED on `main` today:
   - release/T930: with GraphQL refused and REST answered, the command prints a report and never asks GraphQL.
   - release/T931: the command starts no process itself and uses `@kaihacksai/kaal-hosting`.

## Sequence

1. This PLAN.
2. `hosting/C111`: the Hosting GitHub read entry (its own PLAN, DO and ACT, promoted to main).
3. The DO of this Change, raised from a `main` that holds `hosting/C111`. It turns T930 and T931 GREEN and keeps T932 GREEN.

No npm publish and no pin move: the command uses the in-repo workspace package.

## Not in this Change

Writing to GitHub, other GitHub callers (the dispatcher, the collector scripts), the daily page workflow (release/C64), any change to the Show WIP Skill Script or its report format, and any ruleset or `.github` change.
