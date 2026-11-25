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

### Evidence the PLAN asks for

- Outcome 1: per property, the rule as configured, and the violation introduced on a disposable branch and shown rejected, for each lane (a capability pull request, a hotfix, a SYNC carrying a WIRE, a merge-queue entry).
- Outcome 2 (with each DO, as plain `.test.mjs` Cases): the converted workflow does not name `pull_request_target`; it checks out nothing from the pull request and runs no candidate code; its verdict equals the old source's for the same pairs; a pull request that edits the gate cannot change the verdict of the base's judge; the CTL20 baseline lost exactly the converted workflow's name.

### Questions for the CPO

None open. The two outcomes, the CODEOWNERS ruling and the gate on the DO follow the CPO's review of this PLAN.

### Not in this Change

No source, workflow, WIRE, ruleset change or flag. No DO authorized. No change to D13, D14, CTL20 or CTL36. No hotfix bypass.
