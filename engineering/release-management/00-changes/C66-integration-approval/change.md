# C66 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the control, the `integrating.json` source and the stage declaration) and the Cases T860 to T864, all RED.
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no Intent item, no control item, no change to the ruleset source, `stages.json` or the judge, nothing under `.github`, no ruleset and no setting.

## Mechanism

One rule added to the `integrating` ruleset source: `pull_request` with `required_approving_review_count` 1 and `dismiss_stale_reviews_on_push` true, no Code Owner requirement, no last-push or thread rule. The targets stay `kaal/**`, `hotfix/**` and `wire/**`; the bypass list stays empty, so no actor, bot or person skips it. `collecting.json`, `hotfixing.json` and `wiring.json` stay checks-only. The stage declaration in `stages.json` names the rule, its settings and the control that answers for it (release/CTL10), so `verify Stages` (release/C70) judges the source against it. This is the first setting of the new rulesets that is the answer to a control: control to Intent (release/I36), the Intent's Requirements and Architecture after it, the control's Cases (T860 to T864) covering it, and `integrating.json` the code that turns them from red to green.

What follows when it is live (to be stated in the control and read by the Owner):

- **A SYNC into `hotfix/**` or `wire/**`** needs an approval too, where today only `kaal/**` does. It comes from the bot of release/CTL8 (a verified pure SYNC) or from a person. Until the bot is on and proven, a person approves every such SYNC.
- **A hotfix** needs an approving review of its exact head, and a later push dismisses it. A fix pushed after the approval needs a new one: slower on purpose, and the Owner's trade for not forging success.
- **Who approves.** `CODEOWNERS` names only `@kaihacksai`. The rule does not require a Code Owner review and does not require approval of the last push by someone other than its pusher (`require_last_push_approval` false), so any approving review by a person with write access counts, the CPO's login among them. The Owner confirms which login approves before loading.
- **The unattributed-changes risk.** A pull request that holds commits not attributed to its author may need an extra approval when the setting `require_extra_approval_for_unattributed_changes` is on. Whether it is set on `kaal/**` is not confirmed, and a bot approval may not satisfy it. It is checked against the live ruleset before loading, and if it applies, release/CTL8 cannot clear it and release/CTL9 puts that SYNC in front of a person.
- **A bot approval** counts toward a required number of approvals; it does not satisfy a Code Owner review, which this rule does not require.

## Installation, timing and the old ruleset

- **Installing is the Owner's, by hand.** Nothing here is loaded. The ruleset update procedure applies the source to the live `integrating` ruleset (27372397). No bypass list. Setting a rule on a live ruleset is an Owner decision.
- **When.** After the sync bot has made its first live approval, that is after `KAAL_SYNC_APPROVE=on` is proven on a real SYNC. Loading earlier would make every SYNC into `hotfix/**` and `wire/**` wait for a person with no bot to offer.
- **Follow-up, one tick off the old ruleset.** Once this rule is live and proven equivalent to the old integration ruleset's approval, that `pull_request` rule is removed from the old integration ruleset (24952357), alone, never reducing protection; its other requirements (14 checks, `non_fast_forward`, code scanning) stay as they are. The evidence needed first: both rulesets active on `kaal/**`; an unapproved PR into `kaal/**` refused; an approval refused after a later push (dismissed); the same on `hotfix/**` and `wire/**`; a pure SYNC with the bot's approval accepted; the live approval parameters equal to the old rule's (count 1, no Code Owner review). The removal is its own Change and its own Owner decision.

## Ids

Change `release/C66`, Cases T860 to T864, control `release/CTL10`, Intent `release/I36` (the next free after I35), allocated 17 Nov 2026 by the coordinator, except I36 which this PLAN takes and reports.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change, and only after the precursor release/C70 (`verify Stages` judges a ruleset against the rules its stage declares, traced to controls) is on `main`: add `I36.md` and `CTL10.md` equal to the drafts, the `pull_request` rule in `integrating.json`, the declaration in `stages.json`; rename T860 to T864 from `.red.mjs` to `.test.mjs` when green. A `status` line waits for release/C62.

## ACT

A 4L retrospective in `act.md`.

## Left open

- **The precursor is release/C70** (PR #1897). Without it the PROMOTION fails `verify Stages`, which uses main's judge. The declaration here follows its format.
- **Approver login** and the unattributed-changes setting: the Owner confirms both before loading.
- **DIRT.** On main this is Implemented. Running needs the load by the Owner and a real refusal; Tested needs the failure evidence above.
- **Hotfix latency** is accepted by the Owner's ruling; a faster path is not designed here.

## Old Cases the drafts make fail

Eight Cases read the real ruleset sources or `stages.json` through the judge, which still accepts one rule per branch ruleset: release/T481, T482, T483, T487, T511, T512, T760 and T761. They fail with the drafts until release/C70 makes the judge interpret declared rules, and are amended there, never skipped.
