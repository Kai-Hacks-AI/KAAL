# C72 change

## Because

Kai (18 Nov 2026): raise the PROMOTION automatically when a collector's ACT merges, in thin slices. Before anything can raise a PROMOTION, there must be a rule that says when one is due, and the rule must be provable on its own, with no identity, no token and no pull request. A person can read a dry run next to what they would have done.

## From

No rule. The readiness of a collector is known only to whoever raises its PROMOTION.

## To

`decideRaise(facts)` answers `raise` or `skip` with a reason, and for `raise` the title and body. `decide` (the command) reads the facts as JSON on stdin and prints the decision.

## Mechanism

Facts about one collector: its name, the number of commits it holds that main does not, the pull requests merged into it (newest first, with title and body) and the open pull requests whose head is the collector.

Decision, in this order:

1. The branch is not `kaal/<capability>/<concern>`: skip, `not-a-collector`. HOTFIX and WIRE are not promoted this way in this slice.
2. A PROMOTION of it into main is open: skip, `already-open`, with its number.
3. It holds nothing main lacks: skip, `nothing-to-promote`.
4. The newest merged pull request that is not a SYNC is not an ACT (or there is none): skip, `not-ready`, naming what it was. A SYNC after the ACT does not undo the ACT; a PLAN or DO after it does.
5. That ACT's body has no `## Change` line: skip, `no-change-id`.
6. Otherwise raise: title `PROMOTION: <the ACT's title without its `ACT: ` prefix>`, body with the Change section copied from the ACT and one line saying which ACT made it ready.

Nothing else is read. The command has no network code.

## PLAN

1. Add the drafts of `interface.md` (Intent, source contracts) and the Cases T932 to T936, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no control, no source, no workflow and no `.github` file, and changes no ruleset and no setting.

## Ids

Change `release/C72`, Cases T932 to T941 (five used: T932 to T936), Intent `release/I39`, gap `release/G95`. Agreed with the release thread on 18 Nov 2026. Slices that follow: C73 (T942-T951, I40, G96), C74 (T952-T961, G97), C75 (T962-T971, G98).

## DO

On the go of the Owner, into the collector of this Change: add `01-intent/I39-collector-promotion-raised/I39.md` and `05-src/promotion-raise/decide.mjs` and `cli.mjs`, equal to the drafts. Rename T932 to T936 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md`.

## Then

Release/C73 gives the Dispatcher an identity and makes the raise live. A dry-run workflow that gathers the facts and shows the decision belongs there, with the identity it needs.

## Left open

- Facts are gathered by a later slice. This one proves the rule, not the gathering.
- HOTFIX and WIRE branches are out of this slice.
