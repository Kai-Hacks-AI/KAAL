# Release lifecycle and flow-driven controls (CTO assessment and PLAN)

Assessment and recommendations for the CPO, answering the two handovers of 10 November ("Release Management: lifecycle, controls and consolidation" and "Flow-Driven Control Architecture"). Nothing is built, moved, activated or retired. No ruleset, tag, GitHub Release, promotion or publication is changed or authorized. It extends `control-ownership-plan.md` and `control-chain-assessment.md` (the basis) inside the existing PLAN, RED and DO sequence; it is not a second program. The 15 controls keep their names and owners from the basis.

Method: the lifecycle is read transition by transition, and each control is placed where its judgment is required. Where a claim rests on GitHub's behavior it is marked **to prove live**, because documentation is not proof.

## Provenance of decisions and live evidence

The CPO handover asked for an assessment. This document therefore separates what the Owner said, what was observed live, and what is the CTO's recommendation. **Nothing below authorizes implementation**: any build needs this PLAN landed, its RED and DO, and the specific Owner go for each ruleset, tag, Release, promotion or publication. Times are UTC, from the project chat on 10 November 2026.

| Item | Source | Status |
| --- | --- | --- |
| Tag before npm publication, with a tag-based ruleset on it | Owner, 06:30: "I'd say before and then have a tag based ruleset on it" | Owner's stated direction for the design; no tag or real ruleset exists |
| Ruleset `publishing` exists | read-only `gh api repos/.../rulesets` at 06:34 (id 26921478, tag, active, empty bypass list, target `trial-*@*`, rules creation, update, deletion, non-fast-forward) and the Owner's screenshots at 06:38 | live and **trial-scoped**: it covers no real tag (applies to 0 targets); the Owner imported it; no release is authorized by it |
| The tag ruleset UI offers "Require deployments to succeed" and "Require status checks to pass" | Owner screenshots, 06:38 and 06:50 | observed; enabling them has not been done and stays the Owner's go |
| Nouns for rulesets and gates, verbs for workflow steps | Owner, 06:42: "agree" to my recommendation | Owner's decision on naming |
| Four boundaries `integration/`, `promotion/`, `publishing/`, `process/`; each ruleset in its own step; a step is a clean package | Owner, 06:50, 06:53, 06:54, 06:55 | Owner's direction for the structure of `05-src`; no file is moved by this PLAN |
| Role split, verification versus validation, rulesets as code, deployments and status checks as the native mechanism | Owner, 06:28 to 06:40 | Owner principles the assessment applies |
| Six stages with Development first; hooks belong to Development; feedback versus evidence versus authorization | Owner/CPO briefing, 07:01 | Owner's direction, applied in section 1 and "Development to Integration"; assessment only |
| The 25 target names, the `candidate` environment, the attestation-based stage authentication, the recovery rules, the proof order | CTO | **recommendations** requiring the CPO's review and the Owner's go |

## 1. Recommended lifecycle

**Six stages (Owner, 10 November 07:01): Development, Integration, Promotion, Tagging, Release, Publishing.** Development is the first stage and is broader than coding: requirements, architecture, code, tests and documentation, everything that prepares a Change for integration. Its protection is early feedback (local Git hooks through Guard, fast Testing); GitHub protects every stage after it.

| Stage | Transition | Primary activity | Execution and protection |
| --- | --- | --- | --- |
| Development | work `->` a pushed Change | requirements, architecture, code, tests, documentation | local Git hooks, Guard, fast Testing: **feedback** |
| Integration | Change `->` capability collector | integrate | pull request, CI, integration controls, `gate (integration)`: **evidence and authorization** |
| Promotion | collector `->` `main` | promote | pull request, merge queue, promotion controls, `gate (promotion)` |
| Tagging | `main` `->` package-qualified tag | version, provenance | version Package, tag ruleset `publishing` |
| Release | tag `->` draft GitHub Release | readiness, artifact identity, evidence | draft Release, attested digest |
| Publishing | GitHub Release `->` npmjs | approve, publish, verify | protected `npm` environment, trusted publishing, installed-package verification |

The rule for reading it, the Owner's flow-first chain: **Stage, transition risk, control, authoritative implementation, execution context, evidence, gate.** Not every stage has an authoritative gate: Development's hooks give early feedback, and GitHub protects the progression. The transitions of the four later stages are the rows of the table below (Tagging, Release and Publishing are the last three rows).

The sequence `kaal/* -> main -> package tag -> draft GitHub Release -> npmjs` (the stages after Development), with one rule applied at every step: **an event requests progression, a control authorizes it.** A tag, a Release or a `release` event proves nothing about the transition before it. Each stage therefore re-reads its inputs from the trusted baseline and from the previous stage's recorded evidence, never from the event.

| Transition | Native mechanism | What progresses | What authorizes it (not the event) |
| --- | --- | --- | --- |
| `kaal/<capability>/* -> kaal/<capability>` and `-> main` | pull request, branch rulesets, merge queue (main only) | a Change, then a promotion | `gate (integration)` and `gate (promotion)` |
| `main -> tag` | package-qualified annotated tag (`<package>@<version>`), tag ruleset (creation restricted to the release workflow, no move or delete) | one version bound to one `main` commit | version Package: version greater than the registry's, the commit is on `main`, test Candidate evidence exists for that exact commit, the version is recorded in an admitted Change Record |
| `tag -> GitHub Release` | **draft** Release created from the tag, carrying the pack digest and the evidence | the Release identity and its evidence | version Package (identity), kept as a draft until Publishing is approved |
| `Release -> npmjs` | protected `npm` environment, trusted publishing (OIDC, provenance) | publication | approve Publishing (the environment's required reviewer), then verify Package Promotion (registry acceptance and an installed-artifact check) |

Design points that follow from GitHub's behavior (all **to prove live** before the stage is required):

- **Chain stages with `workflow_call` and `workflow_dispatch`, not with events.** A workflow that a `GITHUB_TOKEN` pushes (a tag) or creates (a Release) does not start another workflow, so a tag-triggered or `release`-triggered chain written with that token silently never runs. The two exceptions GitHub documents, `workflow_dispatch` and `repository_dispatch`, do start a run. A human publishing the draft Release does emit the event. Recommendation: one release workflow with reusable stages and the environment gate, started by an Owner dispatch; the Release event is never the only trigger of publication.
- **The publish step is a workflow job in the protected `npm` environment** (required reviewer = the Owner's approval, trusted publishing). That, not the Release being published, is approve Publishing. Publishing the Release is a record of intent.
- **Retries and partial failure.** Every stage is idempotent for the same tag. A failed publish is re-run for the same tag and commit (the version is still unpublished, nothing is retagged). A published version that fails verify Package Promotion is not rolled back: it opens a recorded incident, is deprecated and superseded by a new version; a tag never moves, is not deleted and a version is never reused. An abandoned tag stays with its version burned and its draft Release unpublished (details under "Trust between stages and recovery").

### Tag before npm, or after (Owner direction: before; PLAN #1348 chose after)

| | Tag before publication (decided) | Tag after publication (#1348 as written) |
| --- | --- | --- |
| What the tag means | the exact commit the Owner authorized to publish | the commit that was published |
| Evidence anchor | the draft Release and the tag exist while the approval is given, so the approver sees what is released | the evidence is assembled after the irreversible step |
| Orphan risk | a tag for a version that never publishes. It is never moved or deleted (the ruleset forbids both): a failed publish is retried on the same tag, and an abandoned tag stays, its version is burned and never reused, and its draft Release is left unpublished with a note | none for tags, but a publish whose tagging step fails leaves a published version without its identity |
| Token and permissions | `contents: write` is held by the stage before the approval, so it needs the narrowest identity (a release workflow and its tag ruleset) | `contents: write` only after publication |
| Fits the Owner's flow | yes (`main -> tag -> Release -> npmjs`) | reverses two stages |

**Owner direction (06:30): tag before publication, with a tag-based ruleset on it.** This PLAN follows it as a recommendation; no tag exists. The tag and the draft Release are created by version Package, and the publish is gated by approve Publishing. The tag ruleset, which the Owner named **publishing** (imported for trial tags `refs/tags/trial-*@*` only, active, no bypass actor, read-only check 10 November 2026), restricts creation of package tags to the release workflow's identity and forbids moving or deleting them; its definition is `tag-ruleset-proof.json` and the proof steps are in `proof-steps.md` in the project files; the real ruleset for `refs/tags/*@*` is a separate change with the Owner's go. #1348's tag preflight (no tag at another commit, no tag for an unpublished version of another commit) is kept and extended: preflight before the tag, creation of the tag, then after publication a check that tag, commit and registry agree. #1348's PLAN now follows the decision (tag before publication; the preflight, creation under the ruleset, and the post-publication check), so its RED is unblocked once the PLAN lands.

## 2. Transition-to-control matrix (all 15 controls)

KAAL control owner is Engineering Release Management for every row (`control-ownership-plan.md`). The rule owner is the reusable owner. Guard is the execution mechanism where marked; it is not the semantic owner. Cases are the existing or planned ones; **bind Merge** is covered for its auto-merge verdicts (#1349, RED #1352).

| Transition | Control (F#) | Risk it stops | Rule owner | Guard | Evidence it produces | Cases |
| --- | --- | --- | --- | --- | --- | --- |
| each Change into a collector | approve Change (F15) | an unauthorized Change enters | Change (authority) | native approval setting | an approval bound to the head | FAR plan; settings proof after the ledger-digest decision |
| | isolate Change (F6) | Core and `.github` travel together | Change (path rule, name undecided), KAAL supplies the path sets | yes | verdict at the head | `change-isolation` Cases; one authoritative path rule |
| | verify Ancestry (F7) | a Change on a stale or wrong lineage | Release (freshness) | yes | verdict at the head | Branching Cases, per-control RED after the split |
| | test Integration (F16) | the product does not work on a host | the owning capabilities' Cases (Testing mechanism) | yes | lane results per host in `gate (integration)` | lanes T22 to T24 |
| | scan Vulnerabilities (F8), scan Dependencies (F9) | known-vulnerable code or dependency | the scanners | no (the tool) | code-scanning and review results | control-named jobs to add |
| | bind Merge (F10) | landing by a method the flow does not name | Release | yes (`held` before a method is knowable) | method verdict | T25 to T29 (RED) |
| collector `-> main` (promotion) | accept Capability (F14) | a promotion from outside a collector | Release | yes | verdict at the head | Promotion Source Cases |
| | approve Promotion (F11), serialize Promotion (F13) | an unapproved or concurrent promotion | Release (what), Change (authority) | native ruleset and merge queue | approval, queue position | proof ruleset after Owner decisions |
| | test Candidate (F12) | the candidate fails on a host or installed | the owning capabilities' Cases | yes | `gate (promotion)` lane results at the queue's commit | lanes T22 to T24; early readiness Case (G17) |
| | audit Lineage (F5) | a lineage left unaccounted | Release | yes (scheduled) | audit verdict, not a gate | Branching audit Cases |
| `main -> tag -> Release` | version Package (F3) | wrong, lower or duplicate version; tag at another commit | Release | yes | the tag, the draft Release, the pack digest | #1348 T1 to T3, after the lifecycle decision |
| `Release -> npmjs` | approve Publishing (F1) | publication without the Owner | Release | native environment | the approved run | trusted-publishing and environment proof |
| | verify Package Promotion (F2) | a published package that does not install | Release | yes | registry acceptance and installed result recorded on the Release | G12 (optional peers) and installed-artifact Cases |

Placement check against the objective ("executes before the risk it protects can materialize"): version Package runs before the tag and before any publish; approve Publishing runs before `npm publish`; verify Package Promotion runs after. test Candidate's evidence for the commit is **reused**, not re-run, at the tag stage (the control compares the commit and the pack digest); a re-run there would be an unjustified duplicate. The same control may run at two transitions (verify Ancestry, isolate Change, bind Merge) through one implementation.

**Hook and CI.** The pre-push hook and CI already call the same judgments (`lineage.ts`, `check.mjs`) through Guard; the competing parts are the path matchers (`check.mjs` regexes against the boundary workflow's grep) and the fact-resolution wrappers (`control-chain-assessment.md`). Equivalence is proved by a shared Case, and the hook runs the cheap subset, not the CI matrix.

### Development to Integration: hooks, feedback, evidence, authorization (Owner briefing, 10 November)

**Feedback, evidence and authorization are three different things.** *Feedback* is what Development gives a developer or agent early and cheaply; a hook can be skipped (`git push --no-verify`), unavailable or stale, so its result is never relied on by anything else. *Evidence* is what a trusted run produced on GitHub for an exact commit (Guard's checks and the lanes). *Authorization* is a decision made on evidence by a gate, a ruleset, an approval. Development yields feedback only. Integration yields evidence and authorization. CI therefore never accepts a hook result in place of its own evidence; where it avoids repeating work, it reuses **trusted evidence for the same commit or the same attested artifact** (promotion reading integration's results for an unchanged commit, the publishing stages reading the attested digest), never a developer's local run.

**What exists today.** `.githooks/pre-push` runs `kaal-guard run --hook`, which runs one declared check, `push` (`.kaal/config/guard/push.md`, `runs: [hook]`, command `engineering/github/push-check.sh`). That check calls the same implementations CI calls: `engineering/github/lineage.ts` (Promotion Source, freshness and synchronization for Branching) and `engineering/change-isolation/check.mjs` (Change Isolation). CI wraps the same implementations in other shell wrappers with facts from the pull-request event (`branching.sh`, `change-isolation.sh`, `promotion-source.sh`, declared `runs: [ci]` in `.kaal/config/guard/`), plus an inline grep in `guard-acceptance-boundary.yml` that duplicates the path rule. Guard already lets one check declare where it runs (`runs: [hook]`, `runs: [ci]`), which is the mechanism for one control, several contexts.

| Item the Owner asked for | Assessment |
| --- | --- |
| 1. Controls that execute in Development | **verify Ancestry** (freshness and synchronization), **accept Capability** (Promotion Source) and **isolate Change** (Change Isolation) today, through `push`. Recommended additions as feedback only: the **fast subset of test Integration** (see 3). Not local, by nature: bind Merge (needs the pull request's auto-merge facts), the two scans (server-side), approve Change, approve Promotion, approve Publishing and every Tagging, Release and Publishing control; version Package's ordering check needs the registry and is not run locally |
| 2. Hooks that invoke them | `pre-push` (exists). No other hook is recommended now: a commit-time hook would add a second place to maintain; a hook is added only when a control's feedback is wanted earlier than push and is cheap |
| 3. Cases appropriate locally | the pure, fast Cases of the controls above (their RED fixtures) and the relevant subset of the owning capabilities' Cases for the changed paths, chosen by data: each Case records the contexts it runs in (hook, pull request, merge group, release), as the allocation rule of the ownership plan already requires. Host matrices, installed-artifact verification and the full suites stay CI-only, marked as intentional |
| 4. Implementations shared with CI | `lineage.ts` and `check.mjs` are already shared. Not shared today: the fact resolution (local Git for the hook, the event for CI) is written four times, and the path rule is written twice (`check.mjs` regexes, the boundary workflow's grep) |
| 5. Feedback versus trusted evidence | every hook result is **feedback**; the same control's result in the pull request or queue run is **evidence**; the gate's decision is **authorization** |
| 6. Wrappers, path rules and judgments to consolidate | one fact-resolver per control with two fact sources behind one Guard check declared `runs: [hook, ci]`, replacing `push-check.sh` and the three CI wrappers; one path-set mechanism replacing the grep; after the equivalence proof below |

**Hook-to-CI reuse assessment.** *Reuse that is sound:* the judgments themselves (already shared), the Guard check mechanism (`runs:`), the Cases' fixtures (one RED fixture set judged in both contexts), the trusted baseline for the checker. *Reuse not to build:* CI reading a hook's output, or skipping a job because a hook passed. *Equivalence to prove before any wrapper retires:* for the same fixtures and real change sets the hook and CI invocations return the same verdict and exit status (a shared Case, run in both contexts), and the hook's latency is measured before and after (target: not slower). Where the hook cannot resolve a fact CI has (for example the auto-merge method), it says "not verified locally" and never guesses; that is feedback, not a pass.

**Placement of Development: no boundary of its own (CTO recommendation).** The six stages do not need six directories or six rulesets, and Development should not have its own. It has no control of its own and no authoritative gate; a hook is an execution mechanism and not a capability; a directory for it would invite a second implementation of the controls it only calls. So Development is represented by: (1) the `runs:` declarations of the Guard checks in `.kaal/config/guard/` (hook versus CI), (2) the thin hook adapter `.githooks/pre-push` (Engineering's KAAL realization, which must stay at the repository root), (3) the per-Case context allocation in `process/qualification/` (which Cases run in the hook), and (4) a "Runs in" member in each control's README (hook, pull request, merge group, release), so a reader of any boundary sees where its control also runs. The stage-to-boundary map is therefore: Development has none (shared implementations and hook configuration), Integration is `integration/`, Promotion is `promotion/`, Tagging, Release and Publishing are one protected chain in `publishing/` (the tag ruleset `publishing`, the draft Release and the `npm` environment), and `process/` holds the end-to-end machinery. Three rulesets, as before; Development has none, because a local hook cannot be a ruleset.

**Effect on the 21 to 25 reconciliation.** No check name is added or removed: hooks are not GitHub checks and are not counted (3.1 already lists them separately). What changes is implementations: four fact-resolving wrappers and one inline grep become one fact-resolver per control and one path-set mechanism, so the number of **invocations** per control stays the same and the number of **implementations** falls. These are retirement candidates, each its own authorized Change after the equivalence proof, and the new shared check is built, demonstrated and required before the old wrapper retires (never in the same step).

**Acceptance check for the Owner's criterion.** A developer or agent meets in Development the same protective semantics GitHub later enforces: the same judgment, the same verdict vocabulary and the same recovery text (T25 to T29), with no competing implementation. It is verified by a shared Case family, planned and not yet registered: for each control that runs in Development, the same fixture gives the same verdict from the hook and from CI. Release drives the whole lifecycle starting at Development; hooks give early feedback, Guard executes protection, Testing verifies, Review validates, and Release governs progression.

### Check against the Owner's role split (10 November)

Release drives a change from intent to delivery. Change implements a given change. Guard protects what we have and shall have. Testing verifies quality. Review judges the result. The matrix above was written with "rule owner" columns; read against the split, the owner column holds except for the points below, which I flag for the Change, Guard and Review threads to argue from their own position.

| Control | Reads as | Flag |
| --- | --- | --- |
| verify Ancestry, bind Merge, accept Capability, audit Lineage, version Package, serialize Promotion, verify Package Promotion | the flow itself (which source may progress, by which method, in which order, with which version) | none: Release |
| test Integration, test Candidate | quality evidence | none: Testing's mechanism and each capability's Cases. Release decides **when** the evidence is required, not what it judges |
| scan Vulnerabilities, scan Dependencies | quality and protection evidence from tools | none: the scanner owns the judgment; Release requires it |
| approve Change, approve Promotion, approve Publishing | a judgment of the result by a person or a bound review | **conflict with how the matrix wrote them.** Under the split these are Review's judgments. Release owns the point at which an approval is required (the stage), Change owns what an approval attaches to (the PLAN/DO and the head), and Review owns the judgment. The matrix named Change for authority only; it should name Review for the judgment and the native setting as its mechanism |
| isolate Change | protection of an invariant about what a change may contain | **open, see below** |

No other control has an owner that the split contradicts. The split also confirms the allocation of the gates: `gate (integration)` and `gate (promotion)` are Release's (they sequence progression) and only read the others' verdicts.

### Verification and validation (Owner, 10 November)

Every capability has a deterministic element (the Script of BASS) and non-deterministic ones (Bare, Agent, Skill). On top of that: **verification is deterministic and is Testing's; validation is non-deterministic and is Review's; QA needs both.** Read against the controls, each one splits into the part that can be verified by a script and the part that only a judgment can validate. The gates may read the verifiable part; the validation must have happened, and its record is verified.

| Control | Kind | Verified (Script, deterministic) | Validated (judgment, Review) |
| --- | --- | --- | --- |
| verify Ancestry (F7), bind Merge (F10), accept Capability (F14), audit Lineage (F5), isolate Change (F6) | verification | the verdict itself, from Git and GitHub facts | none; the Skill/Agent element is guidance only: the recovery text of the verdict (T25 to T29) |
| serialize Promotion (F13) | verification | the queue's behavior, a native deterministic setting | none |
| test Integration (F16), test Candidate (F12) | verification (Testing proper) | the Cases' results per host | whether the Cases are the right ones is validation, argued at their PLAN and RED review |
| scan Vulnerabilities (F8), scan Dependencies (F9) | verification, with validation in the follow-up | the tool's findings at the head | accepting or dismissing a finding is a judgment (Review), recorded, not decided by the tool |
| version Package (F3) | verification, with validation upstream | ordering, tag preflight, record present (T1 to T3) | which version a change deserves (breaking or not) is a judgment made in the Change and reviewed |
| verify Package Promotion (F2) | verification | the registry accepted the version and the installed package works | none |
| approve Change (F15), approve Promotion (F11), approve Publishing (F1) | **validation** | that an approval exists, is bound to the exact head or run, comes from the designated authority, and is not stale (a script, fail-closed) | the approval itself: a person or a review agent judging that the result is what was intended. This is Review's, not Release's, Change's or Guard's |
| FAR Accept (F18) | validation | the Accept's authorization chain (G13, Change's verifier) | the Accept is a human judgment that a RED may stand |

Consequences argued in the PR:

1. **Approvals are validation, Review's; Guard only executes.** Native settings (required reviewers, the environment, the ruleset) only **carry and verify** the decision; Guard runs the deterministic checks and takes on none of the domain judgments (Guard does not decide whether a change should be approved, which version it deserves or whether a finding is acceptable). What I wrote as a native setting (required reviewers, the `npm` environment) is the deterministic carrier of a non-deterministic judgment. Release says where one is required; Review makes it; the script verifies its record. The matrix's "rule owner" for these three is therefore Review for the judgment, with Change's authority chain as the verified part.
2. **A gate reads verifications; it never performs or replaces a validation.** `gate (integration)` and `gate (promotion)` pass only on verified results and verified records of validations. A validation that an agent produces counts only where the authority behind it is verified (G13), the same rule as an Accept.
3. **QA needs both, per transition.** At each transition the matrix should show the verification that can fail the build and the validation that can still decline it. Today the validation is mostly implicit (the CPO's exact-head review, the Owner's go); the assessment names it so the gates can verify its record.
4. **Nothing is lost by the split.** No control changes name, number or implementation; the table only says which part of each is Testing's and which is Review's, so the Review thread can argue its half from its own position.

### Release's position on path isolation (`travel`)

The question from the Change thread: Change declares what a change touches, Guard protects; which half is which? Release's argument, from its own position:

1. **Release needs a verdict, not a rule.** At integration and at promotion it requires one answer, "this change keeps Core and `.github` apart", from one implementation. It does not own the answer and does not want a second copy of it in a workflow.
2. **The invariant is protection.** "Core and `.github` never travel together" is a statement about what must remain true of every change that reaches `main`. By the split that is Guard's kind of rule: it protects what we have, and the rule evolves only through an authorized Change.
3. **What a change touches is declaration.** The declared scope of a given change (which paths it concerns, which Change Record it belongs to, what it carries) is Change's: Change implements the change and knows its own scope. Change should expose the declared scope as data a check can read.
4. **Therefore:** Change owns the declaration of a change's scope; Guard owns the protective judgment that the declared and actual scope respect the invariants (Core and `.github` apart is the first invariant); KAAL's path sets are data in the repository; Release only orders and requires the verdict. `engineering/change-isolation/` stays KAAL's adapter during incubation and never remains a second authoritative judgment once Guard (or Change) offers the rule, as the earlier condition already says.
5. **Not on the critical path.** None of this blocks the release-management route. It changes who the adapter calls, not whether the verdict exists.

This is a position, not a decision. The Change thread argues the declaration, the Guard thread the protection, and the Owner decides the interim placement. If Change prefers to own both halves, Release's requirement does not change: one implementation, one verdict, invoked at each boundary.

### Thesis: the tag stage prepares, publishing only moves a verified artifact (Owner, 10 November)

The Owner's thesis: the checks and preparation at the tag stage can be what makes npm publication right. Assessment: **yes, and it is the reason to put the controls at the tag and the draft Release.** The irreversible step then has nothing left to decide.

| Stage | Controls run | What is produced and bound |
| --- | --- | --- |
| prepare (version Package, F3, and test Candidate, environment `candidate`) | version greater than the registry's, tag preflight, version recorded in an admitted Change Record, test Candidate evidence for that exact commit; **pack once** from the commit and install the packed tarball in fresh repositories on the supported hosts (today test Candidate's Acceptance) | the tarball and its digest; a successful `candidate` deployment on the commit |
| tag and draft GitHub Release (version Package) | the `publishing` ruleset requires the named status checks and the `candidate` deployment for this commit; the creating job runs from `main` | the annotated tag `<package>@<version>`; the draft Release carrying the tarball, its digest and the evidence |
| approval (approve Publishing, F1, validation) | the Owner (or the designated authority) validates this draft Release: the tag, the digest and the attached evidence | an approval bound to the digest in the protected `npm` environment |
| publishing (the step) | one deterministic check, no judgment: the tag, the tarball's digest and the approval agree; then publish **that tarball** (never repack) with trusted-publishing provenance | the version on the registry |
| after publishing (verify Package Promotion, F2) | the registry holds the same version and integrity as the digest; the tag still names the released commit | the closing record on the Release |

What this assigns: the pre-publication half of what `verify Package Promotion` is called today (installing the exact packed artifact) belongs to **test Candidate** at the draft Release, run before approval, because it verifies what will be moved. `verify Package Promotion` keeps the half that only exists after: that the registry now serves what was verified. approve Publishing stays validation. version Package is the control that creates the identity the others bind to.

Limits to state plainly. With required status checks and a required `candidate` deployment, the `publishing` ruleset makes GitHub itself witness that the checks ran before a package tag exists; what it cannot witness is the content of the evidence, so the publish step still re-reads the evidence from the trusted baseline and the tag-creating workflow is pinned and trusted (the trust root). The digest equality check is what makes "publishing only moves a verified artifact" true; it is a RED Case of version Package. Whether npm's trusted publishing publishes a pre-packed tarball with provenance is to prove live before the stage is required.

### Deployments and status checks as the native mechanism (Owner, 10 November)

The Owner's guess: GitHub deployments and status checks can carry the tag, Release and npmjs controls natively. Assessment: **yes; the native mechanisms carry the controls, and the tag ruleset enforces the preconditions itself.** Three native mechanisms, each used for what it can prove:

| Mechanism | Used for | Native or custom |
| --- | --- | --- |
| Status checks and check runs on the `main` commit (the results already produced by the promotion: the `gate (promotion)` result, test Candidate, version Package) | the evidence that the commit is releasable; read by the tag-creating job from the trusted baseline | native; the job reads and verifies, which is a script (verification) |
| Environments, one per irreversible or identity-bearing step, with deployment protection | `tagging` (restricted to runs from `main`; holds the credential that may create package tags) and `npm` (restricted to package tags; required reviewers = the approval; trusted publishing is bound to it) | native settings; the approval is the validation (Review's) |
| Deployments and deployment statuses | the record: each job that targets an environment creates a deployment, so tag creation and publication are recorded with their commit, ref, actor and result | native; the status reflects the job's result, so a final step that fails after publication (verify Package Promotion) must fail the same job, or the deployment reads success for an unverified publication |

**Primary design (Owner, 10 November: the tag ruleset UI offers both fields).** The live ruleset `publishing` (active, empty bypass list, target `trial-*@*`) has Restrict creations, Restrict updates, Restrict deletions and Block force pushes checked. Available and unchecked: **Require deployments to succeed** ("environments that must be successfully deployed to before refs can be pushed"), **Require status checks to pass** ("commits must first be pushed to another ref where the checks pass", which holds because the commit is on `main`), Require linear history and Require signed commits. Restrict commit metadata and Restrict tag names are Enterprise-only and not relied on. The `publishing` ruleset is the primary enforcement, not a fallback: for the real package-tag pattern it (1) restricts creation to a single identity, (2) forbids moving and deleting, (3) **requires the named status checks** to have succeeded for the commit the tag names (the `gate (promotion)` result, test Candidate, version Package's preflight) and (4) **requires a successful deployment** to a `candidate` environment on that commit before the tag can exist. The `candidate` deployment is made by an earlier preparation job (pack once, install the packed tarball on the supported hosts); the tag-creating job cannot be its own precondition, so the order is prepare, then tag, then draft Release, then approve, then publish. A tag that exists therefore means GitHub itself saw the checks and the deployment succeed; nothing relies on the creating workflow's own account of them. The creating job still verifies the same facts as a script, so the Case can fail first with a precise message (recovery in the verdict, T25 to T29), and the ruleset is the backstop that cannot be skipped.

How it composes: the `publishing` ruleset fixes who may create a package tag and what must already be true; the `tagging` environment makes the creating credential available only to a workflow run from `main`; the draft Release carries the packed tarball and its digest; the `npm` environment allows deployment only from the package tag, requires the approval, and records the publication as a deployment; verify Package Promotion is the last step of that job. This answers the open question of who holds tag creation: an App (or a repository role) whose credential is an environment secret of `tagging` and which is the ruleset's single bypass actor. That is the Owner's choice to make, and the design no longer needs a free-floating `contents: write` token.

Proven vs not (nothing here is proven live; each line is a RED/proof item before the stage becomes required):

- **Likely supported, to confirm:** environments restricted to selected branches and tags (a tag name pattern such as `*@*`; to confirm that `@` and the pattern match package tags); required reviewers on the `npm` environment; a job targeting an environment creates a deployment with a status; OIDC trusted publishing bound to a named environment; `workflow_dispatch` and `workflow_call` chaining.
- **Supported (the UI shows both fields), semantics to prove:** the proof is `tag-ruleset-proof-checks.json` and its steps in `proof-steps.md` (not applied; the Owner edits the live ruleset). Still to prove live with the trial ruleset: how GitHub evaluates them for a ref that is being created (the status checks must be reported on the commit the tag names, with contexts the ruleset can name; the required deployment must be to that commit and environment before the tag push), that a refusal gives the creating job a message it can turn into a recovery, and that the bypass actor does not also bypass these two rules.
- **Risks to settle:** required reviewers on an environment may or may not allow the person who triggered the run to approve it (self-review prevention); with one Owner this decides whether approve Publishing is a real second judgment or only a confirmation. A deployment status that reads success while a later verification fails is the failure mode named above.
- **Not claimed:** that a deployment proves the registry accepted the package. Only verify Package Promotion proves that, and its result must change the deployment status.

### Tag identity: a GitHub App, and what lives as code (Owner decision, 10 November)

**Decision (Owner):** package tags are created by a GitHub App, which is the `publishing` ruleset's only bypass actor; the App's key is a secret of the `tagging` environment. This closes the open question of who holds tag creation. Nothing about the Owner's own account setup is documented here or anywhere in KAAL; the table says only which artifacts are repository state and which are not.

**A consequence to prove, not to hide.** A bypass actor skips the rules of the ruleset it bypasses. So for the App, the ruleset's required status checks and required deployment (the primary design above) cannot be what makes it wait. What the ruleset then does is the fence: nobody else can create, move or delete a package tag. The ordering (the `gate (promotion)` result, test Candidate, version Package's preflight and the `candidate` deployment, all for the commit) is carried by the tag job itself: it `needs` the earlier jobs, it runs in the `tagging` environment whose deployment branch rule allows `main` only, and it verifies the facts as a script before it mints the token. The live proof list gains one line: how the bypass actor behaves against the two extra rules (already named as to prove) decides whether the ruleset also constrains the App or only everyone else.

| Piece | In the repository as code | Only in GitHub (a human step, or a secret value) |
| --- | --- | --- |
| The App's permission set | an App manifest file (name aside, the permissions and events only: `contents: write` as the proposal, nothing else) | registering the App from the manifest and installing it on the repository (a browser confirmation; consent is not scriptable) |
| The App as bypass actor | the `publishing` ruleset JSON with the App as its only bypass actor (the App's numeric id is a reference, not a secret, and is the one account-specific value in the file; how it is supplied is the Owner's call) | importing or applying the ruleset to the live repository (the Owner's go) |
| The environments | `tagging`, `candidate` and `npm` as JSON: deployment branch rules, required reviewers, the names of the secrets and variables the workflows read | the secret values, and who the reviewers are as accounts |
| The key | the secret's **name** referenced by the workflow | generating the private key, storing it as the `tagging` secret, rotating it. Never in code, never in a log |
| Minting the token | the workflow job: an existing action turns the App id and key into a short-lived installation token, requesting only the permission the step needs (USE, not build) | nothing |
| Drift | Cases: the live ruleset and environments against the files (structure, names, drift, recovery text), and the token's reported permissions against the manifest | the credential the drift job itself needs to read the live state; whether it can read rulesets and environments with the repository token is to prove |

What cannot be code, in short: registering and installing the App, generating and storing its key, and the approvals of people. What must be: everything that says what the App may do and where it is a bypass actor.

**Placement and trace (Owner agreed, 10 November).** Everything for the App lives in `publishing/`, because Tagging sits inside Publishing: the App's manifest, `publishing/ruleset.json` naming the App as its only bypass actor, `publishing/environments/` (`tagging`, `candidate`, `npm`) and the Cases that compare the live settings with these files. The one piece outside it is the tagging workflow, which lives in `.github` like every workflow; `publishing/` lists it (by path, in its README "Serves:" and "Runs in:" members) so a Case can check that it exists and uses the environment and secret names the files declare.

| Level | Holds, for the tag identity |
| --- | --- |
| Intent (I1) | only an approved, correctly shaped package reaches npmjs, and a package tag names exactly the released commit and cannot be moved or deleted |
| Requirements | F3 version Package (tag at the released commit, version set by a recorded Change), F1 approve Publishing (the protected `npm` environment), F2 verify Package Promotion, F17 (the three rulesets as versioned JSON with structure, name and drift Cases) |
| Architecture | `publishing/` holds the Tagging, Release and Publishing chain: the ruleset, the environments, the App manifest, the Cases, the README; the App is the sole creator; the key is a `tagging` secret, never in the repository |
| Code | `publishing/ruleset.json`, `publishing/environments/*.json`, the App manifest, the drift Cases, and the `.github` tagging workflow (listed, not owned) |

The Cases that close the chain, each failing with its recovery (T25 to T29): the ruleset names the App as its only bypass actor and has the creation, update, deletion and non-fast-forward rules; the environments match their files; the manifest asks for the permission set the workflow requests and nothing more; the workflow named by `publishing/` exists, runs in `tagging` and reads only the declared secret name; the live ruleset, environments and token permissions match the files (drift, scheduled). Nothing is created or activated by this section.

### Trust between stages and recovery (CTO recommendation)

**Who may do what, as three separate permissions, not one.**

| Act | Identity and permission | Constraint |
| --- | --- | --- |
| create a protected package tag | the single **bypass actor** of the `publishing` ruleset: a GitHub App (or a repository role; the Owner chooses) whose credential is a secret of the `tagging` environment, available only to a workflow run from `main`; permission `contents: write` for tags only | the ruleset requires the named checks and the `candidate` deployment for that commit, and the tag name matches `*@*` |
| create the draft GitHub Release | the release workflow's own token (`contents: write`) in the same `tagging` job or the next one | creates a **draft** only; it grants nothing: no event it emits is relied on |
| approve publication and publish | the protected `npm` environment's required reviewer (approve Publishing, validation), then trusted publishing by OIDC bound to that environment and workflow | the job has no `contents: write`; it cannot create or move a tag |

**How each stage authenticates the previous one (never an event payload or a dispatch input).** A dispatch or event input only *names* a commit and a version. Each stage re-reads the facts: the tag stage reads, through Git and the API, that the commit is on `main`, that the named status checks and the `candidate` deployment succeeded for exactly that commit, and verifies the tarball's digest against a **signed artifact attestation** produced by the preparation job (`gh attestation verify`; GitHub's artifact attestations bind a digest to the workflow identity). The draft-Release stage checks the tag object points at that commit and that the asset it uploads has the attested digest. The npm stage checks the tag, the draft Release's asset digest against the attestation, and the environment approval, then publishes **that** tarball. A stage that cannot verify fails with its recovery text (T25 to T29). **To prove live before the stage is required:** attestation support for the digest, the dispatch chain (workflow_dispatch and workflow_call start runs where a tag or Release created with `GITHUB_TOKEN` does not), the bypass actor's behavior with the two new rules, and a publish of a pre-packed tarball with provenance.

**Retry, deletion and failure, reconciled with an immutable tag.** The ruleset forbids moving and deleting a package tag, so no recovery depends on either. (1) A failure before publication is retried: the same workflow runs again on the same tag and commit and passes the preflight. (2) A tag whose release is abandoned stays; its version is **burned** (never reused, the next version is used), and its draft Release stays unpublished with a note naming why. If a tag must ever be deleted (a leaked secret, say), that is an explicit Owner act: the Owner edits the ruleset, deletes, restores it, and records it as an incident. (3) A published npm package is **not rolled back**: a failed post-publication verification (verify Package Promotion) opens a recorded incident (a Defect record in `.kaal/changes/` naming the package and version), the version is deprecated on the registry with a message and superseded by a new version; unpublishing is not assumed to be available (the registry's policy limits it) and is not a planned recovery. The GitHub Release is edited to say so. The deployment's status must read failure when verification fails, so the record does not claim success.

### Rulesets as code (Owner, 10 November)

The JSON form of a ruleset is the code answer that closes the chain **Intent, Requirements, Architecture, Code** for the protected state. The three rulesets (`integration`, `promotion`, `publishing`) are today live settings with exported JSON kept outside the repository; the Owner's principle makes each one a versioned file in the repository whose content is what the requirements say.

| Layer | What it holds for a ruleset |
| --- | --- |
| Intent | the protection (for `publishing`: a package tag exists only for a releasable commit, created by one identity) |
| Requirements | the clauses it satisfies (F10 bind Merge, F11 approve Promotion, F13 serialize Promotion, F17 controls pinned to `main`, the version Package and approve Publishing clauses), each ruleset naming the requirement ids it carries |
| Architecture | which control each rule realizes and who owns it (the matrix above), and the two required contexts `gate (integration)` and `gate (promotion)` |
| Code | `05-src/<step>/ruleset.json`, exactly the GitHub ruleset import format, reviewed like code |

Cases (verification, deterministic):

1. **Structure.** The file parses, and each rule it must hold is present for its requirement: `publishing` holds creation, update, deletion and non-fast-forward restrictions, the required status checks and the required deployment; `integration` and `promotion` require the two gates and the pinned workflows; no extra bypass actor. A rule with no requirement, or a requirement with no rule, fails.
2. **Names.** Every required context a ruleset names is a check the claims list (T22) and the workflows can produce, parsed, so a renamed job cannot leave a ruleset requiring a check that no longer exists.
3. **Drift.** The live ruleset (read through the GitHub API with a credential the Owner provides; reading some fields needs admin) equals the file. A difference fails with a recovery that names the action: import the file (Owner) or correct the file by a Change. A scheduled run, not a gate, so a settings change outside the process is noticed; it is the check of F17.

What this does not change: applying or editing a live ruleset stays the Owner's explicit go (an import), the proof rulesets stay trial-scoped, and a Change may edit the file but not the live state. The files are the proposal the Owner imports, and the Drift Case is what shows the import happened as written. Home of the drift check is open: audit Lineage's scheduled run or a control of its own (F17); not decided here, so the control count stays at 15.

#### Names and placement of the rulesets (Owner direction, 10 November)

**Names.** One ruleset per protected ref type, named by the lifecycle transition it protects, in the industry's own terms: `integration` (the collector branches `kaal/*`: a Change is integrated), `promotion` (`main`: a lineage is promoted), `publishing` (the package tags `*@*`: a version is published). They are the names already live (`integration` and `promotion` since the rename, `publishing` imported on 10 November), so nothing is renamed, and each name matches its gate (`gate (integration)`, `gate (promotion)`) and its transition in the lifecycle table. Rejected: `release` (a Release is a stage of this lifecycle, not one ref type), and `main` or `collector` (they name a branch, not the protection, and `collector` is KAAL's own term).

**Verbs or nouns (Owner's alternative: integrate, promote, publish).** Both are official terms (integrate, promote and publish are the standard verbs of continuous delivery, with integration, promotion and publishing as their nouns), so the choice is about our own naming rule, not vocabulary. The repository already uses both, each for a different thing:

| Thing | Form today | What it names |
| --- | --- | --- |
| workflows `KAAL / release / <step>` | verbs: integrate, promote, publish | the step that acts |
| controls | verb + Noun (`verify Ancestry`, `approve Promotion`, `serialize Promotion`) | the judgment (verb) on an object (Noun); the Noun is already `Promotion` |
| gates `gate (integration)`, `gate (promotion)` | nouns | the condition that must hold at the transition |
| rulesets `integration`, `promotion`, `publishing` | nouns | the protection of the ref type |

Argued: a ruleset and a gate are **conditions**, not actions; "the promotion ruleset" reads as a protection, while a ruleset named `promote` reads as an instruction. The control names already use the nouns as objects (`approve Promotion`), so a noun ruleset and a noun gate sit naturally beside them, and the verbs stay with the workflow steps, where they already are. One rule results: **verbs name steps (workflows), nouns name protections (rulesets and gates)**. Renaming to verbs would also cost: two live rulesets renamed again right after their last rename, the two gate names (which are the required contexts, so every ruleset and proof that names them changes), and every document and Case that names them, for no gain in meaning. **Owner's decision (06:42): nouns for rulesets and gates, verbs for workflow steps; no rename.** If the Owner prefers verbs throughout, the cost above is the price and the drift Case makes the rename checkable.

**Placement (Owner: "sounds about right").** Functional placement, Delivery, inside `engineering/release-management/`:

| What | Where | Why |
| --- | --- | --- |
| the three rulesets | `05-src/integration/ruleset.json`, `05-src/promotion/ruleset.json`, `05-src/publishing/ruleset.json` (each in its own boundary, see the table below) | they are Delivery's code, next to `lanes/` and `release-engine/`; the file name is the ruleset name |
| their requirement and architecture entries | the root documents 02 and 03 of release-management (the clauses and the control each rule realizes, with the ids) | tracing stays in the root documents, not beside the files |
| structure and name Cases | `04-test/rulesets.test.mjs` | Cases live in `04-test` |
| drift check | beside the Cases, run as the scheduled audit (home open) | verification, not a gate |
| the proof rulesets (trial-scoped, deleted after) | `00-changes/proof/` | they are the migration's temporary material (Change), they end at termination, and no live protection depends on them; today they sit in the project files |

Each file's name is the live ruleset's name, so the drift Case compares by name, never by position.

#### Folders of `05-src`: four control boundaries (proposal; Owner: the three steps plus one, which gives the rulesets a home)

Each folder of `05-src` is a **control boundary** named for its domain concept in the release language, not for a mechanism. The Owner's structure is four: **`integration/`, `promotion/`, `publishing/`** (the three steps, named like their rulesets and gates) and a **fourth that holds what is not one step's**. One authoritative implementation per judgment still holds.

**The rule that places a control.** A control that acts at one step is judged in that step's boundary. An implementation used at more than one step lives once, in the fourth boundary, and each step calls it through its verdict and holds only its own data (which checks and lanes it expects, its gate). The fourth also holds the protected state of all three steps as code. Controls and their boundaries stay named in the root documents and in each folder's README ("Serves:", parsed); tracing stays in the root documents.

**The fourth boundary is `process/` (Owner, 10 November).** Argued: release management is the first process-driven topic. Integration, promotion and publishing are its **clean process steps**, each with controls that act at that step only. The **end-to-end process** cannot be placed cleanly in one step: the judgments that hold at several steps, the machinery the steps share, and the protected state that spans them. `process/` is the home of exactly that, named for the domain concept (a process, as in the Owner's "release is the process which drives changes from intent to delivery"), not for a mechanism. It replaces my earlier proposal `protection/`, which named what some of these controls do, not what they are; the other names considered (`invariants`, `assurance`, `safeguards`) fit worse. **Pattern for future process-driven topics:** one folder per clean step, named for the step, plus `process/` for the end-to-end part.

| Boundary | Controls judged here | Why here | Also holds |
| --- | --- | --- | --- |
| `integration/` | approve Change (F15, the verified record of the approval), test Integration (F16, which lanes and hosts it expects) | acts only at integration | `ruleset.json` (the `integration` ruleset), `gate (integration)`: its expected contexts and job |
| `promotion/` | accept Capability (F14), approve Promotion (F11, the verified record), serialize Promotion (F13, the queue's expectation), test Candidate (F12, which lanes and hosts it expects) | acts only at promotion | `ruleset.json` (the `promotion` ruleset), `gate (promotion)`: its expected contexts and job |
| `publishing/` | version Package (F3), approve Publishing (F1, the verified part: tag, digest and approval agree), verify Package Promotion (F2) | acts only at the tag, Release and npm stages | `ruleset.json` (the `publishing` ruleset), `environments/tagging.json`, `candidate.json`, `npm.json`, the stage workflows, the preparation and publish jobs |
| `process/` | verify Ancestry (F7), audit Lineage (F5), isolate Change (F6), bind Merge (F10), scan Vulnerabilities (F8), scan Dependencies (F9) | each applies at more than one step (ancestry, isolation, merge method, scans at integration and promotion; lineage audit across all) | the lane implementation that **test Integration and test Candidate share** (`process/qualification/`, one implementation at two contexts), the fail-closed gate function both gates call (`process/gate/`), the scan configuration, pinning and accepted-finding records (`process/scanning/`), the Cases that read the three rulesets as one set (structure, names, drift; F17) |

What is shared stays one: **test Integration and test Candidate are two controls with two inputs (the integration head; the queue's candidate and the packed artifact) and one implementation** in `process/qualification/`, called by each step with its own expected list. So the folders hold: a step's controls and data; the end-to-end part's implementations, shared kernels and protected state. The two scans keep their external tools but have their configuration, pinning, accepted-finding records (reason, owner, end) and Cases in `process/scanning/`.

**Fit check of `process/` (Owner: each ruleset goes into its own boundary).** Cross-cutting controls (verify Ancestry, audit Lineage, isolate Change, bind Merge, both scans) fit: each holds at several steps and none is one step's. The shared lane implementation and the gate function fit: they are end-to-end machinery the steps call. **The rulesets go into their boundaries, because a step's ruleset is what binds that step's controls together** (Owner: "it's what binds the controls, after all"): the ruleset names the contexts and gates the step requires, the checks, deployments and approvals its controls produce, the merge method and the queue, so it is the one place where the step's controls become a single protected transition. A step boundary without its ruleset would hold controls that nothing joins; the ruleset without its controls would be a list of names. Hence: `integration/ruleset.json`, `promotion/ruleset.json` and `publishing/ruleset.json`, so each step shows its own protected state. The **environments are placed by the same logic**: `tagging`, `candidate` and `npm` are all stages of publishing (prepare in `candidate`, create the tag in `tagging`, publish in `npm`), so they go in `publishing/environments/tagging.json`, `candidate.json`, `npm.json`; none spans steps (the `candidate` deployment is produced by publishing's preparation and read by publishing's tag ruleset). What stays in `process/` is the **reading of the three as one set**: the structure, name and drift Cases and the pinning of controls (F17) load the three files from their boundaries and judge them together (a Case in `process/`, not a file in it).

**A step boundary is a clean package: "this is checked here" (Owner).** Everything that protects a step is in its boundary and can be read there: its **controls** (the judgments, or the verified record of a native one), its **ruleset** (what binds them), its **gate** (its expected contexts and job), its **environments** (publishing), its **Cases**, and a **README** that says what the step protects, which controls it serves ("Serves:") and what it depends on ("Depends on:", parsed). A reader who opens `integration/`, `promotion/` or `publishing/` sees the whole protected transition. The only dependencies allowed are calls to `process/` (through its verdicts and shared implementations) and the named external inputs below; a Case fails a README whose "Depends on" names anything else, or a step that imports another step's implementation.

Check of each step against it, and what lives elsewhere (flagged, not hidden):

| Step | In the boundary | Lives elsewhere (flag) |
| --- | --- | --- |
| `integration/` | approve Change (verified record), test Integration (expected lanes), `ruleset.json`, `gate (integration)`, Cases, README | (1) the workflow files are in `.github/workflows`, which travels alone; the boundary lists the jobs and a Case parses the workflow to show every job the step names exists; (2) the pre-push hook and Guard's configuration (`.githooks/`, `.kaal/config/guard/`) call the same judgments; the README links them; (3) the approvals' authority (G13, Change's verifier, PLAN #1342) is Change's input |
| `promotion/` | accept Capability, approve Promotion (verified record), serialize Promotion (queue expectation, in the ruleset), test Candidate (expected lanes), `ruleset.json`, `gate (promotion)`, Cases, README | (1) workflow files in `.github` as above; (2) the collector naming rule (`kaal/<capability>/<leaf>`) is KAAL content the step reads as data and holds as a file in the step; (3) FAR authorization and the ledger-digest decision are Change's and the Owner's inputs |
| `publishing/` | version Package, approve Publishing (verified part), verify Package Promotion, `ruleset.json` (the `publishing` ruleset), `environments/tagging.json`, `candidate.json`, `npm.json`, Cases, README | (1) workflow files in `.github` as above; (2) the `publishing` ruleset requires the `gate (promotion)` result of the previous step: a **cross-step read through a status context**, named in the README, never an import; (3) the packages' own versions and the admitted Change Record (`.kaal/changes/`) are inputs from Change and the packages; (4) the npm side (trusted-publishing binding on npmjs) is configured at npmjs, outside the repository, and the README states it as the step's one external fact; (5) installed-artifact verification runs Hosting's and Acceptance's Cases through `process/qualification/` |

So each step meets the principle with three kinds of declared exceptions: workflow files that must stay in `.github`, inputs owned by other capabilities, and the one cross-step status context. None is a hidden dependency, and each is checkable because the README names it.

Boundaries talk through verdicts only: each step's gate reads its own controls and the fourth's verdicts as data; no boundary imports another's internals. A Case (verification) keeps this true: every one of the 15 controls is served by exactly one boundary (a shared implementation counts for `process/`, a step's data for its step), no boundary serves nothing, and no boundary imports another's implementation except through a verdict. It is a screen over the "Serves:" members and the imports, parsed.

**Folder names follow the product vocabulary (Owner, 10 November).** The Owner cleared Development, Integration, Promotion and Publishing as product names, and Process as the name of the end-to-end boundary around them, and pointed out that the same naming question applies to the folder structure here. So the `05-src` folders are the cleared product words, nothing else: `integration/`, `promotion/`, `publishing/` and `process/`, with no folder named for a repository mechanism or for the uncleared Tagging and Release (they stay inside `publishing/`). Whether the end-to-end boundary is spelled `process/` or `processing/` is the Owner's open question ("Process is fair, I guess"). If the Owner picks Processing, the folder is renamed in that one step: it is created only when its first control lands, so no move is needed before then, and the references to it (the "Serves:" and "Depends on:" members of the READMEs, the Cases that read the three rulesets as one set, and this document) are found by the same parsed screen that checks the boundaries. Assessment only: no folder is created or moved by this change.

**`development/` is a named domain of the structure (Owner decision, 10 November; CPO comment on #1354).** The Owner decided that `development/` belongs in the named-domain structure, as intentional domain-driven design: visible Development, Integration, Promotion, Publishing and cross-stage Process domains, with each control mapped to the domain in which it applies. This supersedes the "no folder" recommendation of the approved #1353 assessment, which was the CTO's recommendation and not an Owner decision. The CPO withdrew the objection and confirmed the meaning.

- **Development is feedback-only.** It holds the hook-point-to-control map, the context facts the stage supplies (and the one table mapping Guard's surfaces to stages), the hook-versus-CI equivalence and latency Cases, and the README that says what the hook feeds back ("Runs here:"). It holds **no control, no judgment, no ruleset, no gate and no environment**, and no duplicate of a judgment: a hook calls the existing controls through Guard. A Case fails any file in it that implements a judgment. Because it protects no transition, I do not call it a protected boundary; it is a domain with a different job from the three steps, which hold controls, rulesets and gates.
- **Where the rest stays.** The `runs:` declarations stay in `.kaal/config/guard/` (Guard reads them there; `development/` reads them, parsed). The hook adapter stays at `.githooks/pre-push` (and the other hook entries beside it), because Git reads the hooks from there.
- **Cost and rule.** One more folder, created when its first Case lands (not now). The rule above keeps it free of judgments. The three rulesets and the 21 to 25 names do not change.
- **No implementation is authorized by this decision** (CPO): the hook PLAN (#1355) is the next step, then RED and DO. The spelling Process or Processing stays separately open.

Cost: none now. A folder is created or renamed only when its control's step lands (the Branching split moves the lineage, landing and isolation code into `process/`; the lanes step moves the lanes and the gate into `process/qualification/` and `process/gate/`; version Package and the stage workflows create `publishing/`), so the names are decided before the first move and no move is a separate program.

## 3. CI inventory: the current checks, the target, and the reconciliation

**What one check is (definition used throughout).** A **check** is one distinct *check-run or status-context name* that GitHub shows on a pull-request head or a merge-group commit, plus the scheduled audit. Not the same thing: a **workflow job definition** (one entry under `jobs:`, which a matrix can expand into several check names), a **required context** (a name a ruleset requires; today and in the target a subset of the checks), a **local hook** (not a GitHub check, listed separately), and an **invocation** (the same implementation run in a second context, which is not a second check). A name emitted by two workflows (a pull-request copy and a merge-group copy) is one check name with two invocations.

### 3.1 The current checks, enumerated by exact source

Source: the 22 job definitions in the 14 workflow files of `.github/workflows/` on this branch (parsed, matrices expanded), and the check runs GitHub reported on the head of #1349 (19 names, listed 10 November 06:17). Reproduce: `gh api repos/<owner>/<repo>/commits/<sha>/check-runs --jq '.check_runs[].name' | sort -u` on any pull-request head, and parse the workflow files for the rest.

| # | Check name (context) | Source: workflow, job, event | Counted because |
| --- | --- | --- | --- |
| 1 to 3 | Hosting (Windows), Hosting (Linux), Hosting (macOS) | `ci.yml` `hosting` (matrix of 3), pull_request and merge_group | on every PR head |
| 4 to 5 | Acceptance (Windows), Acceptance (macOS) | `ci.yml` `acceptance` (matrix of 2) | on every PR head |
| 6 to 8 | Workspaces, Acceptance, Engineering | `ci.yml` `lane` (matrix of 3: the Linux legs) | on every PR head |
| 9 to 11 | Guard, Guard (Windows), Guard (macOS) | `ci.yml` `guard`, `guard-hosts` (matrix of 2) | on every PR head |
| 12 to 14 | CodeQL (actions), CodeQL (javascript-typescript), CodeQL | `codeql.yml` `analyze` (matrix of 2); the aggregate `CodeQL` is GitHub's code-scanning result | on every PR head |
| 15 | Dependency Review | `dependency-review.yml`, pull_request | on every PR head |
| 16 | Change Isolation | `change-isolation.yml` (pull_request_target); a second job, `merge-group.yml` `change-isolation` (merge_group), emits the same name | on every PR head |
| 17 | Branching | `lineage-synchronization.yml` (pull_request_target); `merge-group.yml` `branching` emits the same name | on every PR head |
| 18 | Promotion Source | `promotion-source.yml` (pull_request_target); `merge-group.yml` `promotion-source` emits the same name | on every PR head |
| 19 | Change Isolation (review) | `merge-group-admission.yml` `admission` (pull_request_target, pass-through) and `merge-group-review.yml` (merge_group) emit the same name | on every PR head |
| 20 | Guard Acceptance Boundary | `guard-acceptance-boundary.yml`, pull_request | counted: it appears only when its paths change |
| 21 | Branching audit | `branching-audit.yml`, push, schedule, dispatch | counted: the scheduled audit |

That is **21 checks**. Accounted for but **not counted** as checks (listed so nothing is missing): `Relay review event` (`change-isolation-review-relay.yml`, pull_request_review) and `Change Isolation (review event)` (`change-isolation-review.yml`, workflow_run), both helper contexts of the review trio; `Pack`, `approve Publishing` and `verify Package Promotion` (`publish.yml`, dispatch and workflow_call only, never on a pull request). Together: 26 names from 22 job definitions. **Local hooks, listed separately and not counted:** `.githooks/pre-push` (runs Guard's `push` check, which calls `lineage.ts` and `check.mjs`, the same judgments as the CI wrappers) and Guard's two pre-push templates. **Invocations that are not extra implementations:** Change Isolation, Branching, Promotion Source and Change Isolation (review) each run in two or three workflows (pull request, merge group, hook) through the same checker.

Required contexts today are the Owner's rulesets and are not restated here; I have not claimed a count of them.

### 3.2 The target checks, by transition and control

Target names are one per control job or matrix leg, emitted at the transitions shown. This is a **design count, not a verified one**: nothing is built and no run has produced these names.

| Transition | Check names emitted | Control (F#) | Execution |
| --- | --- | --- | --- |
| integration | isolate Change; verify Ancestry; bind Merge; scan Dependencies; CodeQL (actions), CodeQL (javascript-typescript), CodeQL; the 11 test legs (Hosting x3, Acceptance x3, Guard x3, Workspaces, Engineering) as the matrix of **test Integration**; `gate (integration)` | F6, F7, F10, F9, F8, F16 | PR checks through Guard where applicable; approve Change (F15) is a native setting, emits no check |
| promotion | the same names, run in the merge group (invocations, not new names); accept Capability; the 11 legs again as **test Candidate**; `gate (promotion)` | F14, F12 and the above | approve Promotion (F11) and serialize Promotion (F13) are native settings, no check |
| publishing | version Package; approve Publishing; verify Package Promotion | F3, F1, F2 | workflow_call stages and the protected environment; not PR checks |
| scheduled | audit Lineage | F5 | scheduled run |

Unique target names: the 11 test legs, isolate Change, verify Ancestry, bind Merge, accept Capability, scan Dependencies, the 3 CodeQL names, audit Lineage, `gate (integration)`, `gate (promotion)`, version Package, approve Publishing, verify Package Promotion = **25**. Only the two gates are required contexts in the target; the others are evidence the gates read.

### 3.3 Reconciliation, check by check

Every one of the 21 current checks and the five helper and release jobs has a disposition. A disposition is a recommendation; nothing retires before its replacement is built, demonstrated and required, and each retirement is its own authorized Change with the Owner's go.

| Current | Disposition | Target | Why |
| --- | --- | --- | --- |
| the 11 test legs (checks 1 to 11) | **keep** | test Integration (F16) and test Candidate (F12) | host, installed-artifact and package coverage is preserved; the Guard overlap (D4) is evidence first; the lanes become one reusable implementation used at both transitions |
| Branching (17) | **replace** (split) | verify Ancestry (F7), bind Merge (F10) | two judgments and two owners; the synchronization-shape verdict goes with isolate Change |
| Change Isolation (16) | **keep, consolidate** the pull-request and merge-group copies | isolate Change (F6) | one implementation, two invocations |
| Guard Acceptance Boundary (20) | **consolidate** | isolate Change (F6) | a path rule over the Guard boundary: one authoritative rule |
| Change Isolation (review) (19) and its relay and review-event helpers | **replace** | approve Change (F15), approve Promotion (F11) as native settings, whose approvals the gates verify | after the Owner's ledger-digest decision and proof; the pass-through admission job retires with it |
| Promotion Source (18) | **keep, consolidate** | accept Capability (F14) | one implementation for the PR and the merge group |
| Dependency Review (15) | **keep, rename** | scan Dependencies (F9) | control-named job |
| CodeQL (12 to 14) | **keep** | scan Vulnerabilities (F8) | the tool's names stay; the control claims them |
| Branching audit (21) | **keep, rename** | audit Lineage (F5) | scheduled, not a gate |
| `Pack`, `approve Publishing`, `verify Package Promotion` (publish.yml) | **keep, restage** | version Package (F3, preparation), approve Publishing (F1), verify Package Promotion (F2) | become the stages of the lifecycle |
| (none) | **add** | `gate (integration)`, `gate (promotion)` | the only required contexts in the target |

**Arithmetic.** 21 current checks, minus 2 retired by consolidation (Change Isolation (review), Guard Acceptance Boundary), minus 1 replaced by the split (Branching), plus 2 from the split (verify Ancestry, bind Merge) is 20; plus the two gates is 22; plus the three release-stage names, which exist today only inside `publish.yml` and are not among the 21, is **25**. Each of the 15 controls appears in 3.2 or as a native setting; the local hooks and the invocation counts do not enter the 25.

**Performance.** Baseline before any change, from recent real runs: critical path, elapsed and runner time per workflow, repeated executions (the same suite in more than one job, `npm ci` per job, the per-event copies). Targets to measure after consolidation: the per-event copies removed (one reusable workflow per control instead of a copy per event), `npm ci` shared, and evidence reuse between promotion and release. A regression in the critical path needs an argument or a fix; protection is never dropped for speed.

## 4. Retirement plan (each its own authorized Change; proof first)

1. Build and prove the control; make it required (a proof ruleset, the Owner imports it); only then retire the predecessor. Never both in one step.
2. Equivalence across event, host, inputs and RED fixtures, and every context the predecessor ran in kept or argued away (`control-ownership-plan.md`, "Proof before retirement").
3. Order: (a) Branching split (verify Ancestry, bind Merge; isolate Change with the Guard boundary), (b) native approvals and the review trio, after the ledger-digest decision, (c) per-event copies to reusable workflows, (d) the gates, then the required contexts, (e) legacy lanes by the testing PLAN's positive list. `release.mjs` and the shims retire as the last caller is rewired, with the early readiness signal (G17) restored first.
4. Remaining exceptions stay documented: the optional-peer scope (G12), the carried Guard overlap file (G16), and anything the Owner keeps.

## 5. Implementation sequence (inside the existing sequence)

PLAN (this document) -> the three rulesets as JSON files with their structure and name Cases (before any import) -> RED and DO per control, in this order: bind Merge recovery (#1349 line) -> Branching split -> version Package (after the tag-timing decision) -> tag and draft Release stage -> approve Publishing environment proof -> gates (after G13 and the verifier) -> required contexts -> retirements. Live proof of each GitHub behavior above (tag-triggered workflows, the Release event, the dispatch chain, the environment approval, the queue) is part of its RED, with the proof ruleset the Owner imports.

## 6. Open decisions

Owner, one at a time in this order:
1. Tag before publication under a tag ruleset is the Owner's stated direction (provenance table); implementing it needs the PLAN, RED, DO and the Owner's go. Still open: applying the real ruleset and the identity it names (item 4).
2. G13 (where Accept authority is read from) before any FAR gate activates.
3. The ledger-digest decision before the review trio retires.
4. ~~Who holds tag-creation~~ Decided (Owner, 10 November): a GitHub App, the ruleset's only bypass actor, key in the `tagging` environment secret. Open: the App's permission set and the bypass behavior proof.
5. Prerelease policy (refused until decided) and the `Version:` member convention of the admitted Change Record.
6. Whether the GitHub Release stage deserves its own control (a 16th, "bind Release") or stays inside version Package and approve Publishing (recommended: inside).
7. G12 (optional peers for verify Package Promotion), the interim home of the path rule, and the proof rulesets and contexts.

## 7. Risks and what is not claimed

This is an assessment, not proof of GitHub's behavior; every "to prove live" point needs its own run. The 21 count is mine, from check runs and workflows, and the CPO's approximation may include different contexts (for example, the queue's copies). The CodeQL names are GitHub's, so their count depends on the language matrix. No retirement is argued from this document alone.
