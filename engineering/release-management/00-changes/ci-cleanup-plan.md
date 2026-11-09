# CI cleanup, stepwise (PLAN)

PLAN, nothing is built, moved or removed by this Change. The Owner's direction (9 Nov): clean the CI setup now, stepwise, with clean ownership, clean execution, no duplication, one step at a time. Basis: the CI ownership map (17 jobs and workflows on `main`, 7 duplicates D1 to D7), read against the controls already planned.

## Rule for every step

- **One Change per step**, one capability touched (F20), its own PLAN first, then RED, then DO, each with an exact-head CPO review.
- **Argued from intent, never from precedent.** A job stays only if a control's Requirement needs it; otherwise it is merged into the control that does, or retired. "It exists today" is not an argument.
- **One place.** A judgment is made once, by the capability that owns it; other places use it. Wiring that repeats a judgment per event becomes one reusable workflow per control.
- **Nothing is removed until its replacement is shown live** (trust root rule). Removal is its own step, after the replacement has judged real changes.
- **Out of scope here:** FAR gates (PLAN #1340) and the Owner's ruleset, context and account steps.

## Ordered steps

Each later step is argued in its own PLAN. This list fixes the order and the owner of each duplicate, so no step re-decides another.

| # | Step (one Change) | Closes | Owner of the judgment | Depends on |
| --- | --- | --- | --- | --- |
| 1 | **This PLAN**: the ordered steps, the disposition of every job | none | Release management (Delivery) | none |
| 2 | **Claim every job**: a Case, by parser, that each job of each workflow under `.github` is claimed by a control, or is listed as retiring with its end condition and the step that retires it. Starts RED on the unclaimed ones. No `.github` change | the map becomes enforced, not a document | Release management | 1 |
| 3 | **Testing lanes**: PLAN #1339 (Workspaces, Hosting, Acceptance, Engineering, Guard lanes, with the Guard overlap judged first) | D4 | test Integration, test Candidate | 2 |
| 4 | **Branching split and wiring**: verify Ancestry, isolate Change, bind Merge, accept Capability, each one reusable workflow used by the pull request, merge group and audit events | D3, D5 | Release management | 2 |
| 5 | **One "travels alone" rule**: the hand-rolled Guard acceptance boundary and the Core and `.github` isolation become one check with declared path sets (Change owns the rule, Guard runs it) | D2, D7 | the Change thread (with Guard) | 4 |
| 6 | **Approval**: native ruleset approval settings replace the review relay, admission and attestation trio | D6 | approve Change, approve Promotion | 4, and the Owner's ledger-digest decision |
| 7 | **Release workflow readiness**: whether Pack consumes the commit's CI verdict instead of re-running package tests, or states why it re-runs | D1 | version Package, approve Publishing | 3 |
| 8 | **Remove the replaced**: delete each replaced workflow and check only after its replacement judged real changes live | all | Release management | 3 to 7, and the Owner adding the contexts |

Steps 3, 5 and 7 can be planned in parallel with their predecessor but each is built only after the step it depends on has landed.

## Disposition of the map (proposed, to be confirmed by each step's own PLAN)

| Present | Disposition | Step |
| --- | --- | --- |
| `ci.yml` Hosting x3, Acceptance per host, Workspaces, Engineering | keep, claimed by a testing control; Guard and its host variants judged first | 3 |
| `codeql.yml`, `dependency-review.yml` | keep as used tools, claimed by scan Vulnerabilities and scan Dependencies | 2 |
| `change-isolation.yml`, `merge-group.yml` (isolation job), `guard-acceptance-boundary.yml` | merge into one isolate Change | 4, 5 |
| `lineage-synchronization.yml`, `branching-audit.yml`, `merge-group.yml` (Branching job) | split into verify Ancestry, isolate Change, bind Merge; one reusable workflow each | 4 |
| `promotion-source.yml`, `merge-group.yml` (Promotion Source job) | accept Capability, one reusable workflow | 4 |
| `change-isolation-review*.yml`, `merge-group-admission.yml`, `merge-group-review.yml` | retire for native approval settings | 6, 8 |
| `release.yml` | keep, realization of version Package and approve Publishing; readiness question D1 | 7 |
| `actions/setup-env`, `scripts/bind-group.sh` | keep while a job uses them; `bind-group.sh` becomes bind Merge | 4 |

## Open for the Owner

- Step 6 waits for the decision to give up ledger-digest attestation, recorded before the review check retires.
- Step 8 waits for the contexts to be added to the rulesets.
