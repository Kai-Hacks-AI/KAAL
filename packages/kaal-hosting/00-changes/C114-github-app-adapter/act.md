# C114 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- Review's question in the Approver's PLAN (#2702) fixed the design before any code: a fact is Hosting's only if Hosting made it, held in a private table and never a field. The same idea as the grant, so the second DO reused `grant.ts` rather than inventing a mechanism.
- The CPO's holds made the Cases better each time: executable instead of prose (T335), no selection of runs (`checks`), complete ordered contents across pages (T339), a default branch that fails closed and a demonstration that no consumer registers a fact (T340). Each came back as a small PLAN amendment, and the DO delivered the drafts unchanged.
- Fixing the SYNC's five documentation conflicts with a small DO first, then merging cleanly, kept the SYNC a single clean merge.

## Learned

- A draft Case has to run before the PLAN is approved. T326 as drafted could not pass (its grants were minted on one stand-in and used with another, and the transport check comes before the ability check); we found it only at the DO. Running every draft against a throwaway stub, even one that fails for the right reason, would have shown it.
- An amendment to a Case cannot ride in the DO. When a hold needs a Case to change, the DO PR must be closed and raised again after the amendment merges, because one working branch cannot carry both. Plan for it: keep the DO commit on a local branch and apply it once the PLAN has merged.
- A grant is bound to its transport, so every test that uses one mints on the stand-in it then uses. The raise Cases now do this through one fixture that answers the App's routes unrecorded while minting.
- Package exports are not a sandbox: they stop an import, not code that runs in the same process. The CPO said so, and trusted execution remains a prerequisite for activation; this Change makes forging a fact hard and unintended, not impossible.
- Documentation sections added at one anchor by two collectors conflict at the SYNC. New sections go where nothing else inserts.

## Lacked

- Node 24 on this host, so four publisher Cases (T79, T84, T85 and a teardown Case) could not run locally. CI ran them.
- A decision, in the PLAN, of how the command learns which App it is. I added `--app` and recorded it; it should have been asked in the PLAN.

## Longed For

- A single place that says which Cases need which fixture, so the next Change that raises through a grant does not rediscover the transport binding.
- The Dispatcher, Inspector and Approver declarations from their owners (Release and Review), so the adapter's mint can be exercised against real files and not only generated ones.

## Follow-ups

- Review's Approver DO reads facts through `readPullRequestFacts` with its own grant and treats `factOrigin` of `null` as unknown. Release's Dispatcher raises through `raisePullRequest` with a grant.
- Creating, installing and activating an App, storing a key, any WIRE, enforcement or publication remain with the Owner. Nothing here authorizes them.
- The Hosting retype Change (`KAAL Extension` to `KAAL Capability`) and the restructure of the 1260-word SKILL.md after the Skill standard.
