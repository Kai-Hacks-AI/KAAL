# C133 change

## PLAN

Route A stays the preferred direction, conditional on proof. The PLAN separates two outcomes, each evidenced on its own, and authorizes no DO until the first one is demonstrated. It builds nothing and changes no workflow, WIRE, ruleset or flag.

### The two outcomes

1. **Delivery-path isolation.** The declared delivery machinery (`.github`, `.githooks`, `.kaal`, `.agents`, `.claude`, from `delivery-locations.json`) can be changed only by an authorized WIRE. Required properties, each shown, not assumed:
   1. ordinary capability pull requests cannot modify declared delivery machinery;
   2. only authorized WIRE changes can modify it;
   3. a proposed change and its author cannot alter or bypass its own enforcement (the enforcement lives where the pull request cannot edit it, and has no bypass actor);
   4. the hotfix, SYNC, merge-queue and merge-group paths are covered explicitly, each with its own evidence: hotfix because the rule is not limited to `kaal/**`; a SYNC that carries a WIRE from main by a content-equals-main check, not by an exemption that opens a hole; the merge queue and merge group because the group commit is main plus the pull request and is safe only if the pull request could not touch delivery.
2. **Trusted judge execution.** A gate runs the judge of the default branch or the base, and treats the candidate only as data: its commits read as Git data, never checked out, built or run (release/C132 is the shape). This holds whatever the trigger is, and is shown by a Case per gate.

The outcomes are independent. Outcome 2 alone is not enough on a plain `pull_request`, because the workflow file is the pull request's own; it is safe only behind outcome 1. Outcome 1 without outcome 2 leaves a judge that reads candidate code.

### Decisions

1. **CODEOWNERS is not an acceptable fallback by itself.** It is an approval boundary, not an isolation boundary: it relies on a person judging each proposed change correctly. It may be added as a second line, never as the proof of outcome 1.
2. **The CTO proves outcome 1 first.** Before any DO, the CTO demonstrates, on the rules GitHub offers this repository (a path rule in a ruleset, its availability for a public repository in an organisation, its bypass actors, its reach over `kaal/**`, `hotfix/**`, `wire/**`, the merge queue and merge group), an enforceable and independent boundary with properties 1 to 4, using a deliberately introduced violation per property that is shown blocked. The live state read on 24 November: nine rulesets, none with a path rule; `20 - integrating` requires one approval with code-owner review off; only `old promotion` on main requires code-owner review. So today the boundary does not exist.
3. **If GitHub's rules cannot give it, this PLAN is returned.** The alternative architecture is then proposed to the CPO; CODEOWNERS judgment does not stand in for it.
4. **Order, not authority.** The proposed order stays D15 `sync-review`, D16 `change-isolation`, D17 Branching (`lineage-synchronization`), with D13 and D14 untouched and the relay and handler of D14 kept. The approval of this PLAN does not authorize a DO. A separate decision after the CTO's proof of outcome 1 does, and a WIRE of a converted gate waits for that proof and for Kai's go.
5. **Gate design, for the later DOs.** Each gate is a workflow on plain `pull_request` that judges content only. `sync-review` keeps `verify Sync` without a token and the two writers (`approve Sync`, `review Sync`) reading its verdict as data; on a same-repository branch the `pull_request` token may write, and a fork pull request stays blocked as before. Each WIRE removes one name from the CTL20 baseline in its own pull request, so the ratchet ends at empty.
6. **Case links.** Each DO's Case carries `// Case <id> tests: release/D15` (D16 and D17 in turn), so the Defects close by their Cases.

### Revision after the required-workflow experiment (25 November)

Defect ran an organisation ruleset with a required workflow on disposable branches of this public repository. Results, recorded here as the evidence the PLAN asked for:

1. A required workflow attached by the ruleset runs on a pull request into a targeted branch, and its content is the ruleset's, not the pull request's: a pull request that edited the workflow file still ran the ruleset's version.
2. A failing required workflow blocks the merge on a plain pull request (the merge was refused with "Repository rule violations found: Required workflows ... failed").
3. Branch patterns match one segment: `x/**` covers `x/a` and not `x/a/b`, so the targets need a second pattern for deeper names (`hotfix/*/**` and the like).
4. The merge queue is not available for a wildcard target, so collectors have none, and the queue of `main` was not exercised by this experiment.
5. The bypass list is empty (the Owner's confirmation); the API does not show it to the token used.
6. Not tested: fork pull requests.
7. **Lanes (follow-up).** A gate violation was blocked (merge refused with "Required workflows ... failed") on four disposable branch shapes: a hotfix-like one-segment (`hf/a`) and deep (`hf/x/b`) branch, and a wire-like one-segment (`wire/a`) and deep (`wire/x/b`) branch. The second pattern `<lane>/*/**` is what covers the deep names; without it `hf/x/b` got no rules.
8. **SYNC carrying a changed gate (follow-up).** A content judge comparing each changed `.github` file with a stand-in main passed a gate identical to it and failed a differing one (merge refused), so a content-equals-main check works without any exemption. The stand-in was a disposable branch, not the real main.
9. **Writing gates (follow-up).** A required workflow's token carries the permissions the workflow declares (contents read, pull-requests write) and it posted a PR comment and an approving review on same-repository pull requests, so `approve Sync` and `review Sync` can be converted. A bot approval is visible on the pull request and any branch protection that counts approvals counts it, which is how `approve Sync` already works today behind its flag.
10. **Merge group (follow-up).** With a repository ruleset requiring the merge queue on an exact branch name and that branch included in the organisation ruleset, the required workflow ran in the merge group (on a `gh-readonly-queue/...` ref) and passed. So a required workflow covers the merge group when its file has the `merge_group` trigger. Two cautions: the gate's judge must itself judge the group commit (the experiment's judge only echoed there), and a merge queue exists only on repository rulesets for an exact branch name, never a wildcard, so collectors (`kaal/**`) have none and the merge group matters for `main` alone.

What it means for the two outcomes. **Trusted judge execution (outcome 2)** can now be structural: the gates D15 to D17 become required workflows of the ruleset, whose definition a pull request cannot edit, so they need neither `pull_request_target` nor a path rule. The workflow source stays in engineering and is wired to the ref the ruleset names, which is a WIRE with the Owner's go; changing the ruleset itself is the Owner's. **Delivery-path isolation (outcome 1)** stays open: a required workflow protects only the workflows it runs, not `.githooks`, `.kaal`, `.agents` or `.claude`; the declared-set rule (wire controls plan) remains the cover for those and is separate evidence.

Decisions that follow (the approval of this revision does not authorize a DO or a WIRE):

1. Route A is carried by required workflows for outcome 2. CODEOWNERS stays out as the CPO ruled.
2. The targets are the lanes where a pull request can edit a gate: `kaal/**`, `hotfix/**`, `wire/**` with a second pattern per lane for names deeper than one segment, checked by a violation on a deep name. The pattern list is part of the evidence.
3. Shown by results 7 to 9: the lanes with the second pattern, the SYNC by content-equals-main, and the writing gates. Shown by result 10: the merge group, with the two cautions. Still to be shown before any converted gate is wired: the real-main version of the SYNC check (the stand-in was a branch), and each converted gate judging the group commit on `main`.
4. Fork pull requests stay blocked and untested; no Change claims them.
5. Who changes the ruleset: the Owner, by the ruleset update procedure, with the workflow source changing only through engineering and a WIRE.

### Evidence the PLAN asks for

- Outcome 1: per property, the rule as configured, and the violation introduced on a disposable branch and shown rejected, for each lane (a capability pull request, a hotfix, a SYNC carrying a WIRE, a merge-queue entry).
- Outcome 2 (with each DO, as plain `.test.mjs` Cases): the converted workflow does not name `pull_request_target`; it checks out nothing from the pull request and runs no candidate code; its verdict equals the old source's for the same pairs; a pull request that edits the gate cannot change the verdict of the base's judge; the CTL20 baseline lost exactly the converted workflow's name.

### Questions for the CPO

None open. The two outcomes, the CODEOWNERS ruling and the gate on the DO follow the CPO's review of this PLAN.

### Not in this Change

No source, workflow, WIRE, ruleset change or flag. No DO authorized. No change to D13, D14, CTL20 or CTL36. No hotfix bypass.
