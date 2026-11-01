# PLAN: stable KAAL CI gates

## Intent and authorization

Deliver two stable checks, `KAAL Main` and `KAAL Lineage`, over the complete
applicable CI matrix before C11 impact selection is ready. This is the bounded
full-matrix increment of #759, alongside #769's authoritative selector work.
Neither gate selects by paths, impact, capability ownership or candidate scope.

This Change is Markdown only. Owner alignment precedes implementation; live
shadow workflow/publisher changes require separate alignment, and ruleset
migration requires a later explicit Owner decision. Existing required checks stay
unchanged throughout PLAN and shadow. No synchronization, promotion, deployment,
publication, workflow or protection mutation is authorized by this document.

## Inspected baseline and effective enforcement

Inspected 2026-11-01. Engineering is pinned at
`3c5905a4a81445bf3bb41d3c3017d563f74a558b`; main at
`be3a2d09a386967bd5a1cd4a850f389951bc0796`. Their `.github/workflows/`
contents are identical. Refresh these pins and live rules before every phase.

Sources: [Engineering workflows](https://github.com/Kai-Hacks-AI/KAAL/tree/3c5905a4a81445bf3bb41d3c3017d563f74a558b/.github/workflows),
[main ruleset](https://github.com/Kai-Hacks-AI/KAAL/rules/24951062),
[lineage ruleset](https://github.com/Kai-Hacks-AI/KAAL/rules/24952357).
The ruleset API was read including inherited rulesets; it returned these two.

| Live ruleset | Target and enforcement | Required contexts, all bound to integration 15368 |
| --- | --- | --- |
| main, 24951062 | Active; `~DEFAULT_BRANCH` (currently main); strict up-to-date checks; applies on creation | Change Isolation; Branching; Promotion Source; Hosting (Linux), Hosting (Windows), Hosting (macOS); Workspaces; Acceptance; Engineering; CodeQL (actions), CodeQL (javascript-typescript): 11 |
| lineage, 24952357 | Active; `refs/heads/kaal/*`; strict up-to-date checks; status-check enforcement exempt on branch creation | Same 11, plus Guard, Guard (Windows), Guard (macOS): 14 |

Both require one approving review, dismiss stale reviews on push, resolve review
threads, require extra approval for unattributed changes, forbid force-pushes,
and have no bypass actors (`current_user_can_bypass: never`). Main also forbids
deletion. Allowed merge methods are squash/rebase on main and squash/rebase/merge
on lineage; the repository's Branching verdict decides the applicable method.
Neither ruleset requires code-owner review or last-push approval. These settings
are the baseline, not proof that GitHub's approval requirement identifies the
Owner: Owner validation remains a separate repository obligation.

Both retain a **separate code-scanning rule** for CodeQL: security alerts
`high_or_higher`, other alerts `errors`. A successful analysis job is not proof
of no blocking finding. This rule must remain independent of the aggregate.

Classic branch protection for main returned HTTP 403, `Resource not accessible
by integration`. Its presence and any additional classic protection on collectors
are unresolved. Before migration, obtain an administration-visible export of all
classic rules, effective inherited rules and branch-creation behavior; verify
representative branches and exact pattern matching. Do not infer absence from
403. No merge-queue rule was in the readable rulesets; if one is introduced,
`merge_group` support needs separate design and validation before use.

Observed gaps: main does not require any Guard context; neither ruleset requires
Acceptance (Windows), Acceptance (macOS), Dependency Review or Guard Acceptance
Boundary. The last is emitted only for PRs into kaal/guard, and there is no
separate readable ruleset requiring it. Dependency Review explicitly describes
itself as detective today. These checks still run; a green required subset does
not mean the full matrix has completed.

Concrete historical challenge: #773 merged at `2026-11-01T10:23:18Z` with head
`172330b94a64355b853405de07c47589a982cd20`. In
[CI run 41297155698](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41297155698),
Guard completed at 10:24:42Z, Guard (macOS) at 10:28:38Z, Guard (Windows) at
10:46:51Z, and Acceptance at 10:23:31Z, all after the merge. Another run for
the same head, 41297156559, also exists. This establishes an early full-matrix
completion gap, not its complete cause: duplicate runs and effective protection
at merge time need reconciliation. Today's lineage ruleset was updated later,
at `2026-11-01T10:31:37Z`; do not project today's settings onto that merge.

## Complete workflow inventory and proposed full-matrix policy

Workflow identity is its repository/path and API workflow ID, never its display
name: several workflows are named `KAAL`. Internal job IDs below are from the
pinned YAML. Record their API workflow IDs and immutable definitions in the DO's
policy, together with runner labels, commands/Guard declarations and owners.

| Workflow | Job IDs and expanded contexts | Existing events | Proposed required evidence |
| --- | --- | --- | --- |
| ci.yml | `hosting`: Hosting (Linux/Windows/macOS); `acceptance`: Acceptance (Windows/macOS); `lane`: Workspaces, Acceptance, Engineering; `guard`: Guard; `guard-hosts`: Guard (Windows/macOS) | PRs; pushes to main and kaal/** | All 11 job/host instances for every applicable gate |
| change-isolation.yml | `change-isolation`: Change Isolation | pull_request_target, including edited | Both PR gates |
| lineage-synchronization.yml | `lineage-synchronization`: Branching | pull_request_target, including edited and auto-merge changes | Both PR gates; latest relevant metadata judgment |
| promotion-source.yml | `promotion-source`: Promotion Source | pull_request_target, including edited | Both PR gates, including its explicit successful non-applicability judgment |
| codeql.yml | `analyze`: CodeQL (actions), CodeQL (javascript-typescript) | PRs/pushes main and kaal/**; weekly | Both languages for the matching PR or push; keep code-scanning rule separately |
| dependency-review.yml | `dependency-review`: Dependency Review | PRs main and kaal/** | Both PR gates; this proposes strengthening a detective check into a gate |
| guard-acceptance-boundary.yml | `acceptance-boundary`: Guard Acceptance Boundary | PRs into kaal/guard, including edited | KAAL Lineage only when target is kaal/guard; successful executed judgment required |
| branching-audit.yml | `audit`: Branching audit | Push main and kaal/**; daily; manual | KAAL Main on main push; scheduled/manual audits remain independent |
| guard-release.yml | `pack`: Pack; `publish`: Publish | Manual dispatch | Independent release path; neither aggregate starts or replaces it |
| release.yml | `pack`: Pack; `publish`: Publish; `accept`: Accept | Manual dispatch; workflow_call | Independent packed-artifact/release path; no waiting for a publication to permit a PR |

Linux uses ubuntu-latest; Windows windows-latest; macOS macos-latest. The Linux
Guard job builds the workspace, runs its broader suite and Guard verification;
other-host commands differ. Retain these exact obligations, existing assertions,
packed-consumer Acceptance and security analysis. A platform name alone does not
make one job interchangeable with another. A captured
[11-job run](https://github.com/Kai-Hacks-AI/KAAL/actions/runs/41297275148)
confirms the ci.yml expansion and runner labels; it is inventory evidence only.

Proposed totals are 17 required job instances per ordinary PR (11 CI + 3 policy
+ 2 CodeQL + 1 dependency review), 18 for a PR into kaal/guard, and 14 on a main
push (11 CI + 2 CodeQL + 1 push audit). No release or scheduled job belongs to
those event matrices. Applicability is an explicit trusted policy decision,
recorded before observing results; it is never inferred from absent jobs.

The broader mandatory set, particularly Dependency Review and the Guard boundary,
needs explicit Owner alignment before activation. No implementation may silently
shrink this proposed matrix to the currently required subset. If alignment is
pending, keep the proposal in shadow and report the difference.

## Gate identities and authoritative inputs

| Check context | Logical publisher entry point | Applicability | Assurance |
| --- | --- | --- | --- |
| KAAL Main | `kaal-main-gate` | PR whose current target is main; push to refs/heads/main | Complete event matrix; no impact exclusions |
| KAAL Lineage | `kaal-lineage-gate` | PR whose current target matches governed kaal/* collectors | Complete PR matrix plus target-specific boundary; no impact exclusions |

Target determines the gate, regardless of source branch. Synchronizations use the
same full matrix. Pushes to collectors retain existing checks/audits but are not
a substitute for a PR gate. Unknown events/targets cannot emit either success;
do not emit a skipped success for the inapplicable gate.

Establish a versioned target-owned full-matrix policy independently of C11:
explicit expected workflows/jobs/hosts, event/target applicability, permitted
workflow definitions, assurance commands, provider source and policy digest.
Reconcile this inventory against all trusted workflow definitions, Guard check
declarations and expanded jobs. Detect missing, renamed, added or unclassified
obligations and matrix drift. The observed job list must never define its own
expected matrix. Candidate-authored policy, authority flags, inventories and
artifact lists cannot remove an obligation. Foundation supplies KAAL digests.

For a PR, load evaluator and policy from the pinned trusted target and its
approved governance bootstrap; record the default-branch governance version too.
For a main push, use the already approved policy transition from the admitted PR
and immutable commit. A workflow/policy Change must use an explicitly reviewed
transition evaluated under the previous authority; it cannot approve its own
reduced assurance. If a collector lacks the accepted policy/evaluator, report
unresolved until a separately authorized integration makes it available.

The observation adapter reads GitHub independently, to the last API page, and
binds repository ID, PR number (or push identity), current target/ref and SHA,
head SHA, tested merge SHA/tree and its parents, event, workflow ID/path/version,
check suite, run ID/attempt, job/check ID, provider App and runner labels. PR runs
and pull_request_target runs have different execution/check attribution: establish
their relation to the candidate from API facts and trusted event input, not a
blanket equality with GITHUB_SHA. Required statuses on a synthetic merge commit
must be satisfied there when GitHub uses that commit; prove head/merge placement
in live shadow, including fork PRs. A main-push verdict belongs to the pushed
commit and cannot reuse a pre-merge verdict or a different event's result.

## Trusted publication and completion barrier

The collector must span the existing workflows. `needs` with `always()` can
provide a local barrier, but a ci.yml job cannot thereby wait for CodeQL or the
three pull_request_target workflows. Do not merge all workflows or execute PR
code in a privileged observer merely to obtain a single dependency graph.

Preferred publication design: a trusted observer with a dedicated GitHub App
check source, whose credentials and approved evaluator are inaccessible to
candidate execution. Its two Checks API contexts are exactly KAAL Main and
KAAL Lineage. Bind the eventual ruleset to that App's integration ID. This is a
proposed dependency, not an instruction to install an App now. An Actions-only
alternative is acceptable only after equivalent authoritative workflow/source
enforcement is demonstrated, including a candidate workflow emitting the same
name from the shared GitHub Actions App. Selecting integration 15368 alone does
not distinguish two Actions workflows. Do not migrate while producer spoofing
remains possible.

Keep the observer read-only over candidate data and isolate its publication
credential; no candidate checkout, install, executable artifact or cache is
consumed there. Cross-workflow completion notifications are wake-ups to requery
GitHub, never verdicts. If a workflow_run implementation is proposed, prove its
default-branch and SHA behavior and explicit publication on the evaluated commit:
its own workflow job check is not automatically the PR's required check. Direct
App checks avoid that event-attribution limitation. Reconcile lost/out-of-order
events, queued and never-started producers; bound waits and report timeout failure.

For one evaluation generation:

1. Create the applicable check in a non-success state before collecting results.
   Pin context, expected matrix, policy and producer generation independently.
2. Enumerate complete runs, attempts and expanded jobs. Verify attribution and
   definition before normalizing outcomes. Do not cherry-pick passing jobs across
   duplicate runs or partial reruns. Initially require a coherent complete attempt
   per workflow; a failed-jobs-only rerun that lacks complete fresh evidence needs
   a full rerun, not invented carries. Distinct workflows naturally have distinct
   run IDs, tied to the same evaluation context.
3. Wait until every expected producer and job is terminal. Each required job
   must be completed/success; skipped, neutral, cancelled, failed, timed out,
   missing and malformed evidence prevent success. Successful executed policy
   judgments saying not applicable are distinct from a skipped job. Missing runs
   stay non-success until the deadline, then fail explicitly.
4. Re-read head, target, policy, metadata and selected producer generations at
   finalization. Any change invalidates this evaluation. Serialize final writes
   per context/generation so a delayed old callback cannot overwrite a newer
   pending/failure. No success on API truncation, rate-limit failure or ambiguity.
5. Publish success only with the complete evidence ledger. Retain links and a
   machine-readable expected/observed comparison and explain every failed stage.

Required invariant: for every required job j, the publication time of success is
at least its completed_at time, and j is a verified success for that generation.
Ten passed CI jobs while Guard Windows runs must remain non-success, as must
eleven passed CI jobs while CodeQL or a policy producer remains unfinished.

A newer rerun, target advance/retarget, head push or relevant PR metadata change
must invalidate an older green before it can authorize a merge. GitHub checks
are commit-scoped, not arbitrary PR-tuple-scoped: test one head used by multiple
PRs/targets and simultaneous main push/PR events. Reject ambiguous attribution or
conservatively require all applicable contexts for that check name. The publisher
must demonstrate invalidation and merge-blocking behavior under those races in
live shadow; a ledger field alone does not make GitHub enforce it. Retain strict
up-to-date rules. An unprovable race or source boundary blocks migration.

## Reuse of #760/#764 and dependencies

#760's judgeExecution currently refuses `full-assurance`; #764's judgeAggregate
returns unresolved for main. These are deliberate safeguards. Do not relabel
main as `capability-pr` or fabricate impact evidence to get around them.

The bounded evaluator DO will introduce independent complete-matrix validation,
then enable a full-assurance path which reuses the execution checks in #760 and
the pure judgeSelection completeness checks in #764. For both gates, inventory =
required = selected and nonImpact = excluded = empty, after target applicability
has been independently resolved. Add a truthful versioned full-matrix provenance
schema rather than inventing an impactDigest. Preserve the existing selective
entry point's fail-closed behavior and regressions. The execution predicate is
shared; authority and normalization remain outside those pure contracts.

| Dependency | Needed for full-matrix gates? | Disposition |
| --- | --- | --- |
| #759 aggregation objective | Yes, this increment advances it | Do not close the issue's impact-aware scope on delivery of stable gates |
| #760 and #764 contracts | Yes; present on Engineering | Extend full mode only after independent matrix validation; preserve selective guards |
| #769 governed inventory, provenance and shadow obligations | Reuse these obligations | Share evidence/schema decisions; full matrix can precede its selector adapter |
| C11 #739 P1-P3 and Graph closure; ownership/Case-to-impact mapping | No | Still prerequisites for later selective lineage assurance; cannot delay or enable this full-matrix increment |
| Accepted full matrix, trusted observer and enforceable publisher source | Yes | Resolve before production use; independent of C11 |
| Effective protection export and actual merge-blocking evidence | Yes for migration | Administration access/evidence outstanding; no presumed absence of classic rules |

## Implementation sequence and negative tests

| Phase | Bounded Change and exit evidence |
| --- | --- |
| 1. PLAN alignment | Owner and affected capability/security owners review matrix, events, producer authority and deliberate strengthening of detective checks. No workflow/rules changes. |
| 2. Offline policy and evaluator | Engineering DO: versioned full-matrix policy, independent reconciliation, full-mode extension, pure adversarial tests and recorded-run adapter. No CI routing or required-check changes. |
| 3. Retrospective shadow | Replay captured main PR, main push, ordinary lineage, synchronization, and kaal/guard runs; compare all full-matrix evidence and the exact currently required subset separately. Include #773's completion timeline and duplicate runs. Missing history is unresolved, never reconstructed as green. |
| 4. Live shadow, separately aligned | Separate `.github`-only workflow Change and separately reviewed publisher infrastructure if needed; normal Engineering/Promote/Synchronize flows. Publish non-required stable contexts; all old required checks stay required. Verify real check source, commit placement, completion barrier and merge behavior. |
| 5. Migration decision | Present zero unexplained differences, challenge evidence, effective-rule export and exact before/after/rollback configuration. A separate Owner decision authorizes each ruleset change. |
| 6. Staged migration and observation | Add the correct stable gate alongside all old requirements first; prove it blocks on its own negative cases. Only then, by the approved staged decision, remove enumerated individual contexts whose obligations it enforces. Keep code scanning, review, freshness, merge policy and bypass settings. |

Tests must discriminate the failure; a missing export or unavailable API is
blocked evidence. Include a complete positive for each target/event and all
these negative families:

| Challenge | Required outcome |
| --- | --- |
| Remove Guard Windows from both manifest and observed jobs; omit a whole producer; truncate API page; hide one matrix child | Fail completeness; observed absence never reduces expectation |
| Alter candidate policy/workflow to omit, rename, skip or change the command/OS of a required job | Refuse unauthorized policy/definition drift; cannot certify itself |
| Required job failed, skipped, neutral, cancelled, timed out, queued forever or has no conclusion | No success; missing/unfinished evidence reaches explicit timeout failure |
| Delay the final CI job; separately delay CodeQL, Branching or Dependency Review; use same-workflow needs summary only | Remain non-success until every required instance and producer completes |
| Replay old head/base/merge tree, unrelated fork/repository/PR/event, wrong workflow/App/OS, expired policy | Reject attribution/freshness |
| Two runs for a workflow with conflicting outcomes; failed-only rerun; duplicate or contradictory job records | No passing union; require deterministic complete generation or fail unresolved |
| Old completion callback after new rerun/head/target/metadata; retarget main to lineage and back; same head on two PRs | Old success cannot satisfy new evaluation or overwrite its check |
| Candidate adds a fake KAAL Main/Lineage check with the same name, including through shared Actions App; observer token unavailable | Counterfeit cannot satisfy selected required source; missing trusted verdict blocks |
| Kill/cancel observer, omit wake-up, throttle API, exhaust pagination, supply executable artifact/cache | No green; trusted reconciliation recovers or fails explicitly; never execute candidate data |
| Dependency Review finding; Guard boundary violation; CodeQL scan succeeds but has a blocking finding | Required producer fails where applicable; independent code-scanning rule still blocks |
| Try head-only evidence when GitHub expects synthetic merge checks; try PR evidence for push main | Required status stays unsatisfied until correctly attributed full evidence exists |
| Owner approves while jobs run; all CI green without Owner approval; attempt direct push/bypass | CI barrier and independent review/freshness each still block their own missing obligation |

Use real API fixtures with immutable identities plus controlled live challenge
PRs after separate alignment. Record the instant each producer/job finishes and
the aggregate changes state; assert the time invariant, not just final green.

## Shadow acceptance, migration and rollback

Live shadow must cover each event/target class above, all three runner families,
positive/negative cases, rerun/cancellation and freshness/source races. Keep a
ledger of old-required verdict, complete-matrix verdict and aggregate verdict.
No aggregate green is permitted if any full obligation is incomplete or not
successful. Aggregate red while the old subset is green is expected for newly
covered obligations; name the cause and obtain Owner acceptance. All unexplained
differences block migration. A duration or number of green runs alone is no exit.

Before the Owner decision, refresh and export exact effective configurations,
source IDs, applicable branch patterns and classic rules; verify both contexts
have recent successful provider evidence and can be selected by GitHub. Demonstrate
real mergeability with only the proposed stable context as the test requirement
in an isolated approved validation scope; do not remove live required checks to
conduct shadow. Prove an unfinished/skipped/fake/stale producer and absent Owner
review each prevent merging. Resolve collector creation exceptions explicitly;
do not broaden them in migration. Main push failures are post-landing detection,
not prevention or automatic undo of an admitted merge; publication stays gated
by its independent release checks.

Migration keeps each stable name unchanged while internal jobs evolve through
reviewed policy updates. Main gets KAAL Main, lineage gets KAAL Lineage, bound to
the approved source. The independent code-scanning rule and Owner review remain.
The approved diff enumerates every removed context; any additional security rule
or classic requirement stays unless separately reviewed for equivalent coverage.

Rollback triggers: any false green, incomplete/stale/spoofed attribution, lost
required coverage, unresolved shadow difference, or publisher outage blocking
normal operation. First restore the exported individual required checks while
the stable gate is still required, retaining all independent controls. Where the
old export lacks accepted new coverage, also require explicit Guard, other-host
Acceptance and applicable security/boundary contexts (a narrow guard ruleset if
needed) before removing the faulty aggregate. Then remove the aggregate only
under the pre-approved rollback decision, verify effective enforcement and
rejudge open heads. Never disable all status requirements to recover. Restoring
last-known-good publisher/policy is a separate reviewed rollback; investigate
affected merges and obtain fresh full evidence, without automatic revert or
publication.

GitHub behavior references, checked 2026-11-01:
[required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks),
[protected branches and expected App source](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches),
[workflow events and trust context](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
GitHub can accept skipped/neutral checks; KAAL's evaluator must accept only
verified success. Event eligibility and actual source-bound enforcement must be
demonstrated before treating a displayed green as a governance guarantee.
