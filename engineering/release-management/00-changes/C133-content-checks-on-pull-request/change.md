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

### Design in files first, hosting second

KAAL lives in files. Git and GitHub are only the hosting. So the design starts from files and asks the hosting for the least it must give, going to repo level only where files cannot deliver it, and to org level only where repo level cannot (Owner's design rule, 25 November).

**What the files carry (the whole design, no hosting needed to state it).**

- The judges are files: the declared-set judge (release/A67 `delivery-locations.json`, F73 `deliveryMixed`), the content-equals-main judge, and the judge of each gate. They read files only, the candidate and main's copy as data.
- Trust is a property of content, not of a place: a gate file is trusted when its content equals main's copy of it, byte for byte. A pull request that changes a gate file is judged by main's copy of the judge, never by its own, and the verdict is "the gate file is unchanged, or the pull request is a WIRE or SYNC whose content equals main's or the engineering source".
- The delivery set is a declared file, so "only a WIRE changes delivery" is a file-level statement checked by the declared-set judge.
- The relay and handler of the repo-level route are themselves files, with sources in engineering, installed by a WIRE, and held byte-equal by the same content judge.

**What files cannot give.** A verdict nobody is bound to. Something outside the pull request has to run the trusted copy of the judge and make its result count at merge. That is the only thing asked of the hosting, and it is asked at the lowest level that can give it, set out below per outcome. Residual risk common to every level: the hosting setting (ruleset) is not a file, so a detective judge of the ruleset names (release/C120) stays, and the bypass list stays empty.

### The ladder per outcome

**Outcome 2: trusted judge execution** (the judge that gates a pull request is not one that pull request can change).

1. *File level delivers the judge, not the call.* A judge script that reads the candidate as Git data and runs from the default branch (release/C132 is the shape) is file level and is built. It cannot make the call of the judge trusted: the workflow that invokes it is itself a file of the pull request, which can rewrite the job to pass or delete it. Residual risk at this level: a rewritten or removed job.
2. *Repo level can, by one route; two others cannot.*
   - **Required status check alone** cannot: it trusts the name, so a rewritten job that reports the same name passes. (A deleted job does block, since a missing required check blocks.)
   - **Branch-protected workflow files** cannot today: no ruleset has a path rule (nine rulesets, read 24 November), a path push rule is unverified for this public repository, and CODEOWNERS was ruled out as an approval boundary only.
   - **`workflow_run` with a relay and a handler, and the handler's check required** can. The relay is a plain `pull_request` workflow that only hands over the pull request number; the handler is a `workflow_run` workflow, and GitHub runs it from the default branch, so no pull request can edit it. The handler reacquires every fact, reads the candidate as Git data with the default branch's judge, sets the check in progress first and completes it. A pull request that deletes or renames the relay makes no check appear, and a required check that never appears blocks the merge; one that rewrites the relay can only change the number it hands over. This is already built and running here (change-isolation-review, release/C121 promotion source), so it is the proven shape. Residual risk: changing the handler is a change on `main` (the Owner's code-owner review at promotion); the required check name must be in the rulesets of every lane, which only the Owner changes; two runs and a delay; the merge group of `main` needs the handler to run on `merge_group` too (to be shown); forks stay blocked.
3. *Org level is not needed for this, so it is the fallback and not the route.* The experiment shows an organisation ruleset's required workflow also works (runs from the ruleset's ref, a failing one blocks, deep branch names need a second pattern, a merge queue exists only for an exact branch name on a repository ruleset). It would remove the relay and the delay, but it ties the gates to the organisation, widens the blast radius to every repository in it, and a repository could not move without losing the gates. It is kept as a later hardening if the repo-level route proves too slow or too fragile, and nothing here relies on it. Residual risk of choosing it: the organisation's admins and ruleset become part of the trust base.

**Outcome 1: delivery-path isolation** (only authorized WIREs change the declared delivery machinery).

1. *File level delivers the detection.* The declared-set rule (release/A67 `delivery-locations.json`, F73 `deliveryMixed`) reads the changed paths of a pull request as data and says whether a declared root is touched and by which lane. It is built as a judge and is detective. File level cannot prevent: a verdict nobody is bound to is not isolation. Residual risk: it only reports.
2. *Repo level makes it binding, on the same route as outcome 2.* The declared-set judge runs in the handler of outcome 2, so no pull request can edit it, and its check is required in every lane (`kaal/**`, `hotfix/**`, `wire/**`) with a second pattern for deep names. A pull request that touches a declared root fails unless it is a `wire/*` pull request from `main`, which a second trusted judge verifies (the content of each delivery file equals main's). That gives the four properties asked for: capability pull requests cannot change delivery; only a WIRE can; the pull request cannot alter its own enforcement, since the handler is on `main` and the lane rules are the Owner's; hotfix, SYNC (content equals main) and, for `main`, the merge group are covered by the same judge. Residual risk: the ruleset itself. Nothing in the repository stops an admin dropping the required check, so a detective judge of the ruleset names (release/C120) stays, and the bypass list stays empty (confirmed by the Owner).
3. *Org level and path rules:* not used. A path push rule is unverified and would be one more repo-level setting; if it turns out to exist it can harden this, but the design does not depend on it.

**Existing patterns.** The experiment found that `x/**` matches one segment only. The current rulesets use that shape (`kaal/**`, `hotfix/**`, `wire/**`), so deeper branch names may today sit outside them. That is a defect of the rulesets to check by experiment on a disposable branch, with the second pattern as the fix, and it is the Owner's to change.

Decisions (the approval of this revision does not authorize a DO or a WIRE):

1. Route A is carried by the repo-level route: the relay and handler with a required check, for outcome 2, with the declared-set judge in the handler for outcome 1. The org required workflow is the recorded fallback, not the design. CODEOWNERS stays out.
2. D15 sync-review, D16 change-isolation and D17 Branching become relay and handler pairs (D14 already is one); each is its own DO after the proof below.
3. Before any converted gate is wired: a violation shown blocked through the handler route on a plain pull request, a hotfix-pattern and a wire-pattern branch (one and two segments), and a SYNC carrying a changed gate; the handler judging the group commit on `main`; the writing gates' permissions in the handler (a `workflow_run` token can write, so `approve Sync` and `review Sync` keep working; to be shown).
4. Forks stay blocked and untested.
5. Who changes what: the handler and relay sources only through engineering and a WIRE; the rulesets only by the Owner.

### Evidence the PLAN asks for

- Outcome 1: per property, the rule as configured, and the violation introduced on a disposable branch and shown rejected, for each lane (a capability pull request, a hotfix, a SYNC carrying a WIRE, a merge-queue entry).
- Outcome 2 (with each DO, as plain `.test.mjs` Cases): the converted workflow does not name `pull_request_target`; it checks out nothing from the pull request and runs no candidate code; its verdict equals the old source's for the same pairs; a pull request that edits the gate cannot change the verdict of the base's judge; the CTL20 baseline lost exactly the converted workflow's name.

### Questions for the CPO

None open. The two outcomes, the CODEOWNERS ruling and the gate on the DO follow the CPO's review of this PLAN.

### Not in this Change

No source, workflow, WIRE, ruleset change or flag. No DO authorized. No change to D13, D14, CTL20 or CTL36. No hotfix bypass.
