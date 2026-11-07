# Engineering: Branching judges the merge method the queue is configured with (B1 F1a)

Capability: Engineering. Target: kaal/engineering-b1-fix. Record number is provisional until integration (01 and 02 travel in #1119).

## Intent

With a merge queue on `main`, GitHub reports every pull request's auto-merge method as "merge", whatever method was asked. Branching expects squash for a promotion, so under a queue it fails every promotion (found live on #1119). The label says nothing under a queue; the queue's own configured method, from the trusted `rules/branches/<base>` response, is the fact to judge. This Change gives the checker that judgment and fails closed. The workflow that supplies the rules is a separate `.github` Change (F1b).

## Content

- `engineering/github/lineage.ts`: `effectiveMethod(reported, rules, baseRef, defaultBranch)`. For the default branch with rules given: a `merge_queue` rule's `merge_method` decides, when auto-merge is on; auto-merge off stays off; no queue rule leaves the reported label. A rules response that is not a list, a queue method it does not know (or none), or queue rules that disagree throw, so the verdict is unjudgeable (exit 2). A collector base keeps the reported label. `auto-merge` takes an optional trailing `<rules.json>`.
- `engineering/github/branching.sh`: passes `KAAL_RULES` when the job sets it. Absent, behaviour is exactly as before.
- `engineering/github/lineage.test.ts` (T128 to T136, in `test:github` and `test:engineering`): queue squash over reported merge passes; queue merge or rebase fails a promotion; no queue rule keeps today's failure; auto-merge off still fails; unreadable, unknown or disagreeing rules are unjudgeable; collector base and absent rules are unchanged; the CLI end to end (0, 1, 1, 2, 2).

No ledger entry is carried; nothing here touches `.github`, the ledger or the Change Isolation checker.

## Check

RED first: with the source stashed the suite fails to load (`effectiveMethod` is not exported). GREEN with it: 130 of 130 in `engineering/github/lineage.test.ts`, the existing autoMerge Cases unchanged.

## Act

Nothing sets `KAAL_RULES` until F1b is on `main`, so Branching behaves as today meanwhile. No queue, ruleset, promotion or publication.
