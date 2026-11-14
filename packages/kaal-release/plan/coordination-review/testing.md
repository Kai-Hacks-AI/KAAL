# Show WIP v2: Testing (target)

Cases trace [requirements.md](requirements.md). They are runnable files, `T<n>.red.mjs`, beside the requirements, using the fixtures of [../coordination/fixtures.mjs](../coordination/fixtures.mjs). They fail now because the report has no `review` and the facts carry no `head` (RED). Run by hand: `node packages/kaal-release/plan/coordination-review/red.mjs`. Not in `npm test`, so CI stays green. The DO makes them GREEN and renames them `.test.mjs`. The v1 Cases T33 to T39 keep running and must stay GREEN.

| Case | Requirement | What it shows |
| --- | --- | --- |
| coordination/T40 | F11 | The review sequence lists only REVIEW pieces, ranked from 1; the station order, then the type order, then the reference decide; unlisted stations and types follow; without a `review` key the order is the station order, then reference; the shuffled input gives the same sequence. |
| coordination/T41 | F12 | A REVIEW piece with passed checks, a pending-sync-free path and an observed head is clean; checks that reported nothing make it not clean with a reason; an unobserved head makes it unknown, never clean; a piece that is not REVIEW has no entry. |
| coordination/T42 | F13 | An open SYNC into a REVIEW piece's `from` or `into` makes it not clean, naming the sync and where it goes; a sync is not behind itself; a sync into an unrelated place changes nothing; a sync that is not of the declared type changes nothing. |
| coordination/T43 | F15 | The rendering shows the section, a numbered line per entry with `@` and seven characters of the head, CLEAN or NOT CLEAN with reasons, `@unknown` for an unobserved head, and a sentence when no piece waits for review. |
| coordination/T44 | F14 | The reader maps the host's head into the facts of every piece. |

Moved in pull/C8: the Cases `T40` to `T44` now live in `packages/kaal-release/test/coordination/` (its fixtures as `review-fixtures.mjs`), run by `test/show-wip.test.mjs`. The hand runner `red.mjs` is retired.
