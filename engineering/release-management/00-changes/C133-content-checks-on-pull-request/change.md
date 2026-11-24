# C133 change

## PLAN

Each gate becomes a workflow on plain `pull_request` that judges content only, and the ruleset makes its definition unreachable from any pull request that is not a WIRE. Nothing is built here; the approval of this pull request is the go for the first DO.

### Decisions

1. **Content-only means data in, verdict out.** A gate on `pull_request` reads the pull request's commits as Git data and runs the judge of the checked-out base commit, never code from the pull request. It never checks out, builds or runs the candidate. `verify Triggers` is the shape (release/C132: the judge of the default branch, the candidate as data).
2. **The trust is the ruleset, not the trigger.** The gate is trusted only while no pull request on `kaal/**` can change `.github`. That is wire controls step 3 (declared roots only on `wire/*`, Kai's go). Until it is on, a gate on `pull_request` stays judged by a pull request that edits it, so no WIRE of a converted gate is raised before the ruleset is verified in force. The ruleset is not in this Change; it is its own Change with its own go.
3. **Writing gates keep their write, only without the trigger.** `approve Sync` and `review Sync` write to the pull request (approval, label, comment). On a same-repository branch the token of `pull_request` may write, so they keep working; a fork pull request has a read-only token and is blocked for now (it was before). `sync-review` splits no further: `verify Sync` holds no token and reads the candidate as Git data, the two writers read the verdict of verify Sync as data.
4. **One Change per gate, smallest first.** D15 `sync-review`, then D16 `change-isolation`, then D17 Branching (`lineage-synchronization`), whose source rework release has in hand. Each DO changes the engineering source and its Case first (a plain `.test.mjs` judging the criterion: the workflow does not name `pull_request_target`, and the verdict is the base's judge), then its WIRE installs it on Kai's go. Each WIRE removes one name from the CTL20 baseline in the same pull request, so the ratchet ends at empty and the control becomes a plain preventive.
5. **The relay and handler of D14 stay.** Promotion Source already runs through a relay and a handler (C121) and is not reworked here. Whether it later simplifies to route A is a question for after the ruleset is on.
6. **What the live rulesets give today (Defect's read-only validation).** The only real boundary is the Owner's code-owner review at promotion into main. No ruleset has a path rule, and `kaal/**`, `hotfix/**` and `wire/**` need no code-owner review, so delivery can change in every lane and the content checks are a first line only. Route A therefore needs one GitHub-side rule a pull request cannot edit. Two options: (a) path-scoped CODEOWNERS on the delivery roots plus code-owner review in 20 integrating (recommended); (b) a push ruleset with a file-path restriction, availability unverified. This is the ruleset of the wire controls plan (step 3), Kai's go, detective then advisory then preventive, and it is its own Change.
7. **The CTO validates the trust boundary** (CPO handover, decision 3) on this PLAN before the first DO: that no delivery path reaches a gate through a pull request that is not a WIRE, including a hotfix, and that the merge-queue and merge-group runs of each gate are covered.

### Cases (plain `.test.mjs`; they land with each DO)

- the converted workflow does not name `pull_request_target` and runs on `pull_request`.
- it checks out nothing from the pull request and runs no candidate code (the checkout is the base commit or the default branch).
- its verdict equals the verdict of the old source for the same pairs.
- a pull request that edits the gate cannot change the verdict of the base's judge (the judge runs from the base).
- the CTL20 baseline lost exactly the converted workflow's name.

### Questions for the CPO

1. **Which ruleset, and the order.** Option (a) of decision 6 is recommended. And the order: Recommended: DOs D15 to D17 are built now, but no WIRE is raised until the delivery ruleset (wire controls step 3) is verified in force, because a converted gate is only safe behind it. The alternative, wiring early, opens a window where a pull request can edit its own judge.

### Not in this Change

No source, workflow, WIRE, ruleset change or flag. No change to D13, D14, CTL20 or CTL36. No hotfix bypass.
