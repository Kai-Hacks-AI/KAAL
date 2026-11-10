# Release lifecycle and flow-driven controls (CTO assessment and PLAN)

Assessment and recommendations for the CPO, answering the two handovers of 10 November ("Release Management: lifecycle, controls and consolidation" and "Flow-Driven Control Architecture"). Nothing is built, moved, activated or retired. No ruleset, tag, GitHub Release, promotion or publication is changed or authorized. It extends `control-ownership-plan.md` and `control-chain-assessment.md` (the basis) inside the existing PLAN, RED and DO sequence; it is not a second program. The 15 controls keep their names and owners from the basis.

Method: the lifecycle is read transition by transition, and each control is placed where its judgment is required. Where a claim rests on GitHub's behavior it is marked **to prove live**, because documentation is not proof.

## 1. Recommended lifecycle

`kaal/* -> main -> package tag -> draft GitHub Release -> npmjs`, with one rule applied at every step: **an event requests progression, a control authorizes it.** A tag, a Release or a `release` event proves nothing about the transition before it. Each stage therefore re-reads its inputs from the trusted baseline and from the previous stage's recorded evidence, never from the event.

| Transition | Native mechanism | What progresses | What authorizes it (not the event) |
| --- | --- | --- | --- |
| `kaal/<capability>/* -> kaal/<capability>` and `-> main` | pull request, branch rulesets, merge queue (main only) | a Change, then a promotion | `gate (integration)` and `gate (promotion)` |
| `main -> tag` | package-qualified annotated tag (`<package>@<version>`), tag ruleset (creation restricted to the release workflow, no move or delete) | one version bound to one `main` commit | version Package: version greater than the registry's, the commit is on `main`, test Candidate evidence exists for that exact commit, the version is recorded in an admitted Change Record |
| `tag -> GitHub Release` | **draft** Release created from the tag, carrying the pack digest and the evidence | the Release identity and its evidence | version Package (identity), kept as a draft until Publishing is approved |
| `Release -> npmjs` | protected `npm` environment, trusted publishing (OIDC, provenance) | publication | approve Publishing (the environment's required reviewer), then verify Package Promotion (registry acceptance and an installed-artifact check) |

Design points that follow from GitHub's behavior (all **to prove live** before the stage is required):

- **Chain stages with `workflow_call` and `workflow_dispatch`, not with events.** A workflow that a `GITHUB_TOKEN` pushes (a tag) or creates (a Release) does not start another workflow, so a tag-triggered or `release`-triggered chain written with that token silently never runs. The two exceptions GitHub documents, `workflow_dispatch` and `repository_dispatch`, do start a run. A human publishing the draft Release does emit the event. Recommendation: one release workflow with reusable stages and the environment gate, started by an Owner dispatch; the Release event is never the only trigger of publication.
- **The publish step is a workflow job in the protected `npm` environment** (required reviewer = the Owner's approval, trusted publishing). That, not the Release being published, is approve Publishing. Publishing the Release is a record of intent.
- **Retries and partial failure.** Every stage is idempotent for the same tag. A failed publish is re-run for the same tag and commit (the version is still unpublished, nothing is retagged). A published version that fails verify Package Promotion is deprecated and superseded by a new version; a tag never moves and a version is never reused. A draft Release without a publish is deleted with its tag only by the Owner while the version is unpublished.

### Tag before npm, or after (Owner decision; PLAN #1348 chose after)

| | Tag before publication (decided) | Tag after publication (#1348 as written) |
| --- | --- | --- |
| What the tag means | the exact commit the Owner authorized to publish | the commit that was published |
| Evidence anchor | the draft Release and the tag exist while the approval is given, so the approver sees what is released | the evidence is assembled after the irreversible step |
| Orphan risk | a tag for a version that never publishes (mitigated: a failed publish retries on the same tag, a never-published tag is deleted by the Owner while unpublished, tag rulesets forbid anyone else) | none for tags, but a publish whose tagging step fails leaves a published version without its identity |
| Token and permissions | `contents: write` is held by the stage before the approval, so it needs the narrowest identity (a release workflow and its tag ruleset) | `contents: write` only after publication |
| Fits the Owner's flow | yes (`main -> tag -> Release -> npmjs`) | reverses two stages |

**Decision (Owner): tag before publication, with a tag-based ruleset on it.** The tag and the draft Release are created by version Package, and the publish is gated by approve Publishing. The tag ruleset, which the Owner named **publishing** (imported for trial tags `refs/tags/trial-*@*` only, active, no bypass actor, read-only check 10 November 2026), restricts creation of package tags to the release workflow's identity and forbids moving or deleting them; its definition is `tag-ruleset-proof.json` and the proof steps are in `proof-steps.md` in the project files; the real ruleset for `refs/tags/*@*` is a separate change with the Owner's go. #1348's tag preflight (no tag at another commit, no tag for an unpublished version of another commit) is kept and extended: preflight before the tag, creation of the tag, then after publication a check that tag, commit and registry agree. #1348's PLAN now follows the decision (tag before publication; the preflight, creation under the ruleset, and the post-publication check), so its RED is unblocked once the PLAN lands.

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

1. **Approvals are validation, Review's.** What I wrote as a native setting (required reviewers, the `npm` environment) is the deterministic carrier of a non-deterministic judgment. Release says where one is required; Review makes it; the script verifies its record. The matrix's "rule owner" for these three is therefore Review for the judgment, with Change's authority chain as the verified part.
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

### Rulesets as code (Owner, 10 November)

The JSON form of a ruleset is the code answer that closes the chain **Intent, Requirements, Architecture, Code** for the protected state. The three rulesets (`integration`, `promotion`, `publishing`) are today live settings with exported JSON kept outside the repository; the Owner's principle makes each one a versioned file in the repository whose content is what the requirements say.

| Layer | What it holds for a ruleset |
| --- | --- |
| Intent | the protection (for `publishing`: a package tag exists only for a releasable commit, created by one identity) |
| Requirements | the clauses it satisfies (F10 bind Merge, F11 approve Promotion, F13 serialize Promotion, F17 controls pinned to `main`, the version Package and approve Publishing clauses), each ruleset naming the requirement ids it carries |
| Architecture | which control each rule realizes and who owns it (the matrix above), and the two required contexts `gate (integration)` and `gate (promotion)` |
| Code | `05-src/protection/rulesets/<name>.json`, exactly the GitHub ruleset import format, reviewed like code |

Cases (verification, deterministic):

1. **Structure.** The file parses, and each rule it must hold is present for its requirement: `publishing` holds creation, update, deletion and non-fast-forward restrictions, the required status checks and the required deployment; `integration` and `promotion` require the two gates and the pinned workflows; no extra bypass actor. A rule with no requirement, or a requirement with no rule, fails.
2. **Names.** Every required context a ruleset names is a check the claims list (T22) and the workflows can produce, parsed, so a renamed job cannot leave a ruleset requiring a check that no longer exists.
3. **Drift.** The live ruleset (read through the GitHub API with a credential the Owner provides; reading some fields needs admin) equals the file. A difference fails with a recovery that names the action: import the file (Owner) or correct the file by a Change. A scheduled run, not a gate, so a settings change outside the process is noticed; it is the check of F17.

What this does not change: applying or editing a live ruleset stays the Owner's explicit go (an import), the proof rulesets stay trial-scoped, and a Change may edit the file but not the live state. The files are the proposal the Owner imports, and the Drift Case is what shows the import happened as written. Home of the drift check is open: audit Lineage's scheduled run or a control of its own (F17); not decided here, so the control count stays at 15.

#### Names and placement of the rulesets (decided by the Owner, 10 November)

**Names.** One ruleset per protected ref type, named by the lifecycle transition it protects, in the industry's own terms: `integration` (the collector branches `kaal/*`: a Change is integrated), `promotion` (`main`: a lineage is promoted), `publishing` (the package tags `*@*`: a version is published). They are the names already live (`integration` and `promotion` since the rename, `publishing` imported on 10 November), so nothing is renamed, and each name matches its gate (`gate (integration)`, `gate (promotion)`) and its transition in the lifecycle table. Rejected: `release` (a Release is a stage of this lifecycle, not one ref type), and `main` or `collector` (they name a branch, not the protection, and `collector` is KAAL's own term).

**Verbs or nouns (Owner's alternative: integrate, promote, publish).** Both are official terms (integrate, promote and publish are the standard verbs of continuous delivery, with integration, promotion and publishing as their nouns), so the choice is about our own naming rule, not vocabulary. The repository already uses both, each for a different thing:

| Thing | Form today | What it names |
| --- | --- | --- |
| workflows `KAAL / release / <step>` | verbs: integrate, promote, publish | the step that acts |
| controls | verb + Noun (`verify Ancestry`, `approve Promotion`, `serialize Promotion`) | the judgment (verb) on an object (Noun); the Noun is already `Promotion` |
| gates `gate (integration)`, `gate (promotion)` | nouns | the condition that must hold at the transition |
| rulesets `integration`, `promotion`, `publishing` | nouns | the protection of the ref type |

Argued: a ruleset and a gate are **conditions**, not actions; "the promotion ruleset" reads as a protection, while a ruleset named `promote` reads as an instruction. The control names already use the nouns as objects (`approve Promotion`), so a noun ruleset and a noun gate sit naturally beside them, and the verbs stay with the workflow steps, where they already are. One rule results: **verbs name steps (workflows), nouns name protections (rulesets and gates)**. Renaming to verbs would also cost: two live rulesets renamed again right after their last rename, the two gate names (which are the required contexts, so every ruleset and proof that names them changes), and every document and Case that names them, for no gain in meaning. **Decided (Owner, 10 November): nouns for rulesets and gates, verbs for workflow steps; no rename.** If the Owner prefers verbs throughout, the cost above is the price and the drift Case makes the rename checkable.

**Placement (Owner: "sounds about right").** Functional placement, Delivery, inside `engineering/release-management/`:

| What | Where | Why |
| --- | --- | --- |
| the three rulesets | `05-src/protection/rulesets/integration.json`, `promotion.json`, `publishing.json` (the folder name follows the boundaries table below) | they are Delivery's code, next to `lanes/` and `release-engine/`; the file name is the ruleset name |
| their requirement and architecture entries | the root documents 02 and 03 of release-management (the clauses and the control each rule realizes, with the ids) | tracing stays in the root documents, not beside the files |
| structure and name Cases | `04-test/protection.test.mjs` | Cases live in `04-test` |
| drift check | beside the Cases, run as the scheduled audit (home open) | verification, not a gate |
| the proof rulesets (trial-scoped, deleted after) | `00-changes/proof/` | they are the migration's temporary material (Change), they end at termination, and no live protection depends on them; today they sit in the project files |

Each file's name is the live ruleset's name, so the drift Case compares by name, never by position.

#### Folders of `05-src`: control boundaries named for their domain (proposal; Owner: components are control boundaries, domain-driven naming)

Each folder of `05-src` is a **control boundary**: an architecturally distinct part of Release management with its own model, named for its concept in the release language (the ubiquitous language of the lifecycle and the matrix), not for the mechanism that happens to implement it. One authoritative implementation per judgment still holds: a boundary may serve several controls (and run in several contexts), and a control is served by exactly one boundary. Every control has a boundary, including the four that are native settings and the two that are external tools: a boundary holds what is ours about a control (configuration, pinning, records, Cases) even when the mechanism is not. Controls remain named in the root documents, the job names and each folder's README ("Serves:", parsed); tracing stays in the root documents.

Mechanism names today, and what each is called in the domain:

| Today | Names a mechanism or tool | Domain concept (proposed name) |
| --- | --- | --- |
| `lanes/` | CI lanes | **`qualification/`**: qualifying an integration and a candidate by evidence |
| `merge-group/` | GitHub's merge group | **`landing/`**: how a Change lands (the code already says `landing`, `landedAs`) |
| `release-engine/` | "engine" | **`publishing/`**: bringing a verified version to the registry (also the lifecycle stage and the ruleset's name) |
| `rulesets/` (proposed earlier) | GitHub's term | **`protection/`**: the protected state of each transition, in code |
| `change-isolation/` | "Change" collides with the capability of that name | **`isolation/`** |
| `promotion-source/` | a rule's input | **`promotion/`**: which lineage may be promoted |
| `lineage/` | none; it is the domain concept | `lineage/` (kept) |
| (gate code inside `lanes/gate.mjs`) | two decisions in one place | **`progression/`**: the gates that decide whether a Change may progress; it reads verdicts and never produces them, so it does not belong with the test evidence |

Boundaries, with the controls each serves:

| Boundary | Controls inside | What is distinct about it |
| --- | --- | --- |
| `lineage/` | verify Ancestry (F7), audit Lineage (F5) | the history facts: freshness, ancestry, the account of every lineage |
| `landing/` | bind Merge (F10) | the method by which a Change lands, bound to the queued pull request |
| `isolation/` | isolate Change (F6) | what may travel with what; KAAL's path sets as data, one path rule |
| `promotion/` | accept Capability (F14) | which source may be promoted |
| `qualification/` | test Integration (F16), test Candidate (F12) | the evidence per lane and host: claims, declared overlaps; verification (Testing's mechanism, each capability's Cases) |
| `progression/` | `gate (integration)`, `gate (promotion)` (not among the 15: Release's own decision) | reads every verdict fail-closed, performs no judgment of its own |
| `publishing/` | version Package (F3), verify Package Promotion (F2), approve Publishing (F1, its verified part) | tag, pack, digest and the registry: from a promoted commit to a published version |
| `protection/` | approve Change (F15), approve Promotion (F11), serialize Promotion (F13), approve Publishing (F1, the setting) and the pinning of controls (F17) | the protected state of each transition as code: `protection/rulesets/integration.json`, `promotion.json`, `publishing.json`, and `protection/environments/tagging.json`, `candidate.json`, `npm.json` (the environments' settings, same principle), with their Cases; the validations themselves are Review's |
| `scanning/` | scan Vulnerabilities (F8), scan Dependencies (F9) | what is ours about the external tools: configuration (CodeQL languages and queries, dependency-review severity and license policy), the pinning of the tools (actions pinned by commit), the accepted-finding records (a dismissed finding names its reason, its owner and its end, a validation Review made and the script verifies), and the Cases (the configuration is present, the tools are pinned, no dismissal without a record, no record past its end) |

Each of the 15 controls is served by exactly one boundary (approve Publishing has a verified part in `publishing/` and its setting in `protection/`, the one control split by kind, verification and validation). Boundaries may call one another through their verdicts only: `progression/` reads `lineage/`, `landing/`, `isolation/`, `promotion/`, `qualification/` and `publishing/` as data, and none of them reads another's internals. A Case (verification) keeps the boundaries true: every one of the 15 controls is served by exactly one boundary, no boundary serves nothing, and no boundary imports another's implementation except through a verdict. It is a screen over the "Serves:" members and the imports, parsed.

Cost: none now. A folder is renamed only when its control's step lands (the Branching split moves `lineage/`, `landing/` and `isolation/`; the lanes step moves `qualification/` and `progression/`), so the names are decided before the first move, and no move is a separate program.

## 3. Target CI inventory: 21 current checks to 25 named checks

**Current (my count, from PR check runs and the workflow files):** 21 names = 11 test legs (Hosting x3, Acceptance x3, Guard x3, Workspaces, Engineering) + 10 others (Branching, Change Isolation, Change Isolation (review), Promotion Source, Dependency Review, CodeQL, CodeQL (javascript-typescript), CodeQL (actions), Guard Acceptance Boundary, Branching audit). Branching, Change Isolation, Change Isolation (review) and Promotion Source also exist as separate copies in `merge-group.yml`.

| Current | Disposition | Target | Why |
| --- | --- | --- | --- |
| 11 test legs | **keep** | test Integration (F16) / test Candidate (F12) | host, installed-artifact and package coverage is preserved; Guard overlap (D4) is evidence first; the lanes become one reusable workflow used at both transitions |
| Branching | **replace** (split) | verify Ancestry (F7), bind Merge (F10) | two judgments and two owners; the synchronization-shape verdict goes with isolate Change |
| Change Isolation | **keep, consolidate** the PR and merge-group copies | isolate Change (F6) | one implementation, two invocations |
| Guard Acceptance Boundary | **consolidate** | isolate Change (F6) | it is a path rule over the Guard boundary; one authoritative rule with a Guard boundary check |
| Change Isolation (review) | **replace** | approve Change (F15), approve Promotion (F11) as native settings | after the Owner's ledger-digest decision and proof; the pass-through admission job retires with it |
| Promotion Source | **keep, consolidate** | accept Capability (F14) | one reusable workflow for the PR and the merge group |
| Dependency Review | **keep, rename** | scan Dependencies (F9) | control-named job |
| CodeQL (3 names) | **keep, rename** | scan Vulnerabilities (F8) | the tool's names stay; the control claims them |
| Branching audit | **keep, rename** | audit Lineage (F5) | scheduled, not a gate |
| (none) | **add** | `gate (integration)`, `gate (promotion)` | the only required contexts; they read the controls' results fail-closed |
| (in `release.yml`, not among the 21) | **add as named checks** | version Package (F3), approve Publishing (F1), verify Package Promotion (F2) | the release stages become explicit and tested |

**Reconciliation.** 21 = 11 test legs + 10 others. The 10 others lose 2 (Change Isolation (review), Guard Acceptance Boundary) and gain 1 by the split (Branching -> verify Ancestry + bind Merge): 9. Add the two gates: 11. Add the three release-stage checks: 14. **Target: 14 named checks + the same 11 test legs = 25 names, of which 2 are the only required contexts.** The number of names rises by 4 and the required contexts fall to 2 (the current set of required contexts is the Owner's ruleset and is not restated here). The extra four are the explicit gates and the release stages that today exist only inside `release.yml`; none duplicates an existing judgment. The number is the outcome of the controls, not a target. approve Change, approve Promotion and serialize Promotion are native settings, not named checks; approve Publishing is the environment-gated publish job; scan Vulnerabilities keeps GitHub's three CodeQL names. That is how 15 controls and two gates give 14 names.

**Not counted:** `change-isolation-review-relay.yml` and the admission workflow produce no judgment of their own and retire with the review trio.

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
1. ~~Tag before or after publication~~ decided: before, under a tag ruleset (section 1). Still open: applying the real ruleset and the identity it names (item 4).
2. G13 (where Accept authority is read from) before any FAR gate activates.
3. The ledger-digest decision before the review trio retires.
4. Who holds tag-creation: the release workflow identity with `contents: write` and the tag ruleset (recommended) or a separate App.
5. Prerelease policy (refused until decided) and the `Version:` member convention of the admitted Change Record.
6. Whether the GitHub Release stage deserves its own control (a 16th, "bind Release") or stays inside version Package and approve Publishing (recommended: inside).
7. G12 (optional peers for verify Package Promotion), the interim home of the path rule, and the proof rulesets and contexts.

## 7. Risks and what is not claimed

This is an assessment, not proof of GitHub's behavior; every "to prove live" point needs its own run. The 21 count is mine, from check runs and workflows, and the CPO's approximation may include different contexts (for example, the queue's copies). The CodeQL names are GitHub's, so their count depends on the language matrix. No retirement is argued from this document alone.
