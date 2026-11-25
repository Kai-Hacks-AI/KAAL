# C131 change

## PLAN

One file, one record field and one change of where the judge reads `previous`. The enforcement stays the same on both sides of the change, and the DO proves it before the switch. Nothing here installs a workflow, changes a ruleset, sets a flag or removes a use of the trigger.

### Decisions (the approval of this pull request is the go for the DO)

1. **The baseline file.** `04-controls/CTL20-gate-verify-triggers/baseline.json`, a sorted JSON list of unique finding names: the paths of the workflows that use `pull_request_target`. At adoption it is the five of `main` today. It is the same list the judge derives now, so approving this Change is the adoption decision and adds no allowance.
2. **The declaration.** `baseline-source` of CTL20 becomes the path of that file, `engineering/release-management/04-controls/CTL20-gate-verify-triggers/baseline.json`, as CTL36 does. Free text today, so it is valid under the current finder and under C24's strict finder. `strategy`, `owner` and `exit` are unchanged.
3. **Where the judge reads `previous`.** The accepted baseline is the file in the base of the pull request, read as Git data (`git show <base>:<path>`), never the candidate's own. The baseline of the head is the file in the head, the findings are those of the head's workflows. The judge still hands all three to `judge-mode --mode ratchet`, which stays the one place where the rule is written. A missing or unreadable file in the base is UNKNOWN, which never passes.
4. **A rename keeps the baseline honest.** Because `previous` is now the file, a pull request that removes a use of the trigger must also remove its name from `baseline.json`, in the same pull request; otherwise the allowance is stale and the generic mechanics of controls C22 say so. Today the base derives it for free. This is the intended change of behavior, and decision 5 shows that nothing else moves.
5. **Equal enforcement, shown before the switch.** A Case checks that `baseline.json` equals the findings of the repository's `.github/workflows` (so the file cannot drift unnoticed), and a second runs the old derived path and the new file path over the same base and head pairs (a new use, a removed use, an unchanged tree, a second use in one workflow, a workflow only on the base) and requires the same verdict and the same `next`. The old path is removed in the same DO once the pairs agree.
6. **One adoption, no separate history yet.** The history file (`history.jsonl`, controls C25) is added to CTL20 and CTL36 by its own Change after controls' C25 is on `main`. A missing history reads as UNKNOWN there and the finder does not require it.
7. **Order with controls.** This Change is on `main` before controls' C24 collector is promoted. The evidence for that promotion is `check-controls` run under the strict finder on the real controls of `main`: CTL20 and CTL36 both valid.
8. **The judge runs from the base.** The installed `verify-triggers.yml` already runs the judge of the base, so no workflow change and no WIRE is part of this Change. The DO changes the judge, the record, the file and the Cases only.

### Cases (plain `.test.mjs`; they land with the DO, ids taken then after the highest on main)

- the file is a sorted list of unique names and equals the findings of `.github/workflows` today.
- the same verdict and `next` as the derived path for the pairs of decision 5.
- the accepted baseline is read from the base, not from the head: a head file that lists more is growth and fails; a head file that lists less passes and `next` drops it.
- a base with no file, or an unreadable one, is UNKNOWN.
- the record: `baseline-source` is the path of an existing file, `strategy`, `owner` and `exit` unchanged, still preventive and `has` release/I50.
- the Cases T1126, T1129, T1134 and T1407 to T1411 stay green, changed only where a seed must now carry the file.

### Questions for the CPO

1. **A resolved use must edit the file.** Decision 4 makes a pull request that removes a use of `pull_request_target` also edit `baseline.json`. The alternative, keeping the derived baseline, keeps the old behavior but gives no baseline file, so it cannot be the ratchet standard. Recommended: the file.

### Not in this Change

No history file (after controls' C25), no workflow or WIRE, no ruleset change, no flag, no removal of a use of the trigger, no change to CTL36.
