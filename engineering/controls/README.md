# Engineering's controls

> PLAN (engineering/C3): nothing below exists yet. This PLAN proposes seven Controls for the engineering concerns Engineering owns in this repository, each with its own Intent, Requirements, Architecture, Tests and realization, revised to the Owner's Control model (#585, comment 6501504603). The seven are a **bounded first delivery**, not a claim of complete coverage of Engineering's gates (#585, comment 6522975178): CodeQL and Dependency Review stay uncovered, and every report says so. Revised to the Owner's trace model (#619, comment of 2026-10-30 16:02; #585 re-review): a Control **Has** one or more Intents, and realization is evidenced only through the trace chain, never by a direct Control → mechanism Edge. "Dependencies" below separates what the DO needs from what is only a semantic reference or an optional complement, and imposes no promotion order on Controls or Intent.

## The model, as the Owner set it

A Control is a bounded, enduring engineering concern. It **Has** one or more Intents. Requirements answer the Intents, Architecture answers the Requirements, Tests give evidence for the claims, and code realizes the Architecture. A Change *delivers* an Intent once; a Control *has* one for as long as the concern lasts.

- **Who owns what.** Engineering owns these seven Control instances and their realizations, in `engineering/controls/`, which is repository-native and not `.kaal/`. Controls owns what a Control is (`Control`) and its outgoing `Control —Has→ Intent`, including the rule that a Control has at least one Intent. Requirements and Architecture own their outgoing traces. Testing owns what a test and its evidence mean. Graph owns the generic mechanics.
- **The trace chain, and no shortcut.** Realization is evidenced only through **Control → Intent → Requirements → Architecture → Test Cases (→ Defects) → Code → deployed realization**. Each link is owned by the owner of its source: Controls the `Has`, Requirements and Architecture their traces, Testing its Test Cases, with Defects traced Test Case → Defect and observations belonging to Test Runs. A Control Node carries `Has` Edges and nothing else: no Edge from a Control to Guard, Branching, a workflow or any other mechanism. Mechanisms appear where they belong, as references in a Control's Architecture (`guard-check:`, `workflow:`, `code:`, `branching:`, below) and in the code itself. A mechanism that exists, or is declared, is never evidence that a Control operated or is effective.
- **Reuse, not copies.** Every realization below already exists under its current owner: Engineering's checkers, Guard's check declarations, Branching's rules. A Control's Architecture names each one by a stable reference. Nothing is copied into `engineering/controls/`.
- **Assurance uses KAAL's own terms, not a separate notion of effectiveness.** Testing defines verification and validation, and Controls calibrates claims by them. Every claim of a Control, its Intent included, gets one of three assurance states:
  - **verified**: a Test Case decides it deterministically. This is preferred wherever a claim is testable, at every level, the Intent included.
  - **validated**: a person or an Agent judged it, because it rests on judgment rather than a test. The record names who judged, what, and where: for example, the Owner's review of the Control's PLAN. Human judgment is a first-class way to assure a claim, not a fallback. A validation assures a **design claim** only: that the Intent is the right concern and the design answers it. It never shows that the control operated.
  - **unresolved**: neither has decided it yet. It is shown on every run, never as passing. This is Testing's "unknown".
- **Design claims and operation claims are kept apart.** Each testing.md row says which it is.
  - A **design claim** is about the Intent, the Requirements and the Architecture. It is verified by a Test Case, or validated by a judgment such as the Owner's review of this PLAN.
  - An **operation claim** says the control acted on a particular pull request, commit or schedule. It is verified only from an observed record: a Run, a check result for a named commit, or a merge record. No review, Architecture reference, declared mechanism or GitHub rule stands for one. An operation claim without such a record is unresolved, and it is never validated.
- **Escalation, without new machinery.** When the structural test finds something it cannot decide, such as a gate no Control cites, two Capabilities claiming one path, or a reference that resolves twice, it reports the finding as unresolved and decides nothing. The Agent working the Change investigates with the authority it already has, and takes anything that needs a new decision to the Owner. This follows the direction PREACH describes. It is cited as a description, not as a contract (see "Dependencies").

## Layout

One directory per Control:

```
engineering/controls/<control>/
  <Name>.md          the Control Node, typed by `Control`: what the control is for, and one `Has` Edge per Intent. No other Edge
  intent.md          the Control's Intent Node, <control>/I1: the enduring concern and why it matters. A Control with several Intents has one Intent Node each; each of the seven has one today
  requirements.md    <control>/F…, <control>/N…: each names, in brackets, the Intents it answers
  architecture.md    <control>/A…: each names the Requirements it answers and the realization by reference
  testing.md         one row per claim, Intent included: verified (the test file and title), validated (who judged, what, where), or unresolved (why)
```

The bracket traces are the form every PLAN in this repository uses today. When Requirements and Architecture define their typed traces, the files follow them, in a Change of their own.

**Reference forms.** Each identity belongs to the owner of what it names. A Control only cites it.

- `guard-check:<name>` is the Guard check declaration `.kaal/config/guard/<name>.md`. This is KAAL integration configuration, not general repository authority.
- `workflow:<file>#<job>` is a job in `.github/workflows/<file>`.
- `branching:<heading>` is a section of `engineering/github/branching.md`.
- `code:<path>#<export>` is an Engineering module and the export that decides the rule.
- `test:<path>#<describe>` is a `describe` block in an existing test file.

## The seven Controls

### Change Isolation (`change-isolation`)

- **I1.** A Change to Core, and a Change to `.github/`, can each be reviewed, reverted and promoted on its own, because nothing unrelated travels with it.
- **F1** [I1]. A Change that touches Core holds only Core and its listed supporting files.
- **F2** [I1]. A Change that touches `.github/` holds nothing outside it.
- **N1** [I1]. It is decided from the changed paths alone, so an allowed supporting file passes whatever it contains. This is a stated limit, not a gap.
- **A1** [F1, F2, N1]. The rules are decided in `code:engineering/change-isolation/check.mjs`. That check runs at merge through `workflow:change-isolation.yml#change-isolation` and before a push through `guard-check:push`, and is declared as `guard-check:Change-Isolation`.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN. It is also verifiable: an Intent-level case reads `main`'s first-parent history from the commit that introduced Change Isolation, and finds no landing that mixes Core or `.github/` with anything else.
  - F1 is verified by `test:engineering/change-isolation/check.test.mjs#core travels alone` and `#aggregate changes`. F2 is verified by `#.github travels alone`.
  - That the check ran on a given pull request is unresolved. Only its check-run record for that commit would show it.
  - Mechanism level, in HAPTIC's terms: Program.

### Lineage (`lineage`)

- **I1.** Work reaches `main` only through its Capability's collector, so each promotion carries one Capability's reviewed Changes and nothing else.
- **F1** [I1]. A working branch lands in `kaal/<capability>`, and a collector is brought current with `main` only by a synchronization: a merge commit that names the `main` commit it merges and differs from that merge only where the two conflict.
- **F2** [I1]. Each flow lands with its own method: squash for a Change or a promotion, a merge commit for a synchronization. Auto-merge is set to that method.
- **A1** [F1, F2]. The rules are decided in `code:engineering/github/lineage.ts#synchronization`, `#methodFor`, `#autoMerge` and `#landing`. They run through `guard-check:Branching` in `workflow:lineage-synchronization.yml#lineage-synchronization` and before a push through `guard-check:push`. The reasoning is in `branching:Engineer` and `branching:Synchronize`.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN.
  - F1 is verified by `test:engineering/github/lineage.test.ts#synchronization`. F2 is verified by `#methodFor`, `#autoMerge` and `#landing`.
  - That a given landing was judged is unresolved, as for Change Isolation. Mechanism level: Program.

### Promotion source (`promotion-source`)

- **I1.** Only a Capability's own collector changes `main`, and only in a state that was validated against the `main` it lands on.
- **F1** [I1]. A pull request into `main` comes from a `kaal/*` branch of this repository.
- **F2** [I1]. Its head contains `main`'s tip, and the merge it would make is exactly the head's tree.
- **A1** [F1, F2]. The rules are decided in `code:engineering/github/lineage.ts#promotionSource` and `#promotionFreshness`. They run through `guard-check:Promotion-Source` in `workflow:promotion-source.yml#promotion-source`. The reasoning is in `branching:Promote`.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN.
  - F1 is verified by `test:engineering/github/lineage.test.ts#promotionSource`, and F2 by `#promotionFreshness`.
  - Operation is unresolved. Mechanism level: Program.

### Lineage audit (`lineage-audit`)

- **I1.** A pull request or collector that has fallen out of the branching policy is found, even when no new push judges it again.
- **F1** [I1]. On a schedule, collectors and working branches are judged again. The audit names a collector established from a stale `main`, a fully promoted collector due for deletion with the pull requests it would strand, a working branch reused after its Change merged, and a hold that does not evidence itself.
- **A1** [F1]. The judgments are `code:engineering/github/lineage.ts#establishment`, `#collector` and `#workingBranch`, with holds from `engineering/github/holds.json`. They run through `guard-check:Branching-audit` in `workflow:branching-audit.yml#audit`.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN.
  - F1 is verified by `test:engineering/github/lineage.test.ts#establishment`, `#collector` and `#workingBranch`.
  - **Unresolved:** that the schedule runs. A declared schedule is not a run, and only the audit's run records would show one. Mechanism level: Program.

### Required tests (`required-tests`)

- **I1.** No Change lands while KAAL's own tests fail.
- **F1** [I1]. Every pull request into a protected branch runs the acceptance, Engineering, Hosting and workspace tests, on each host they claim.
- **A1** [F1]. These are declared as `guard-check:Acceptance`, `guard-check:Engineering`, `guard-check:Hosting` and `guard-check:Workspaces`. They run as `workflow:ci.yml#hosting`, `#acceptance`, `#lane`, `#guard` and `#guard-hosts`, and `workflow:guard-acceptance-boundary.yml#acceptance-boundary`.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN.
  - That a lane fails on failing tests, and captures them, is verified by `test:engineering/lanes/evidence.test.mjs#the evidence lane's gate`.
  - **Unresolved:** that these checks are required before merge, and that they ran on a given Change. A ruleset declares the first and is not evidence of it. Mechanism level: Program.

### Review before merge (`review-before-merge`)

- **I1.** A Change lands on a protected branch only after its review is complete.
- **F1** [I1]. `main` and `kaal/*` change only through pull requests whose review is complete.
- **A1** [F1]. The mechanism is GitHub's branch protection, outside the repository. The rule is stated in `branching:Branches`.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN.
  - **F1 is unresolved.** The branch protection rule declares it, and that proves nothing about operation.
  - It is verifiable later, from observed records: a detective case reading each merged pull request's completed review through GitHub's API, as the Lineage audit already reads GitHub. That case is a later Change, not this one.
  - Whether a review was sound is a matter of judgment. It is validated by the reviewer, and no test decides it. Mechanism level: Human.

### One promotion at a time (`one-promotion`)

- **I1.** Promotions into `main` go up one pair at a time, in queue order, so each is validated against the `main` it lands on.
- **F1** [I1]. At most one promotion pair, a synchronization and its promotion, is open at a time.
- **A1** [F1]. It is directive today and kept by hand, as `branching:One promotion at a time` says. engineering/C2's Test Cases realize it once they are GREEN.
- **Assurance.**
  - I1 is validated by the Owner's review of this PLAN.
  - F1 is unresolved as a verification until engineering/C2's Test Cases are GREEN. Until then, the queue is kept by people and Agents.
  - Each promotion's go is the Owner's validation of that decision, recorded on its pull request. It is a design judgment, and it is not evidence that only one pair was open. That operation claim stays unresolved until a case reads it from observed pull request records.
  - Mechanism level: Human today, Program once engineering/C2 lands. In HAPTIC's terms, that is the control moving up the ladder.

## Coverage: a bounded first delivery

The invariant: **every discovered gate is either mapped to an owned Control, or reported as an unresolved coverage finding.** There are no silent exclusions, and partial coverage is never an overall GREEN.

- **Discovered, not listed.** The structural test discovers gates from the repository itself: every `.kaal/config/guard/*.md` declaration, and every workflow job that a pull request, push, merge group or schedule runs. It does not read them from this PLAN.
- **Uncovered today.** `workflow:codeql.yml#analyze` and `workflow:dependency-review.yml#dependency-review` are security gates that no Control documents. Each is reported as an **unresolved coverage finding** on every run, naming the gate. Covering one is a later Change to this scope.
- **Not a gate, stated.** `workflow:guard-release.yml` runs only by dispatch and gates no Change. It is listed as not a gate, with that reason, on every run. The test checks the reason from the workflow's own triggers, so if the workflow gains a pull request, push or schedule trigger, it becomes an uncovered gate.
- **The overall result.** The coverage report's overall state is unresolved while any coverage finding is open, whatever the seven Controls show. It never reads as complete or GREEN on partial coverage.

## Branching as a Definition Node

This is the Owner's decision A on #585. The DO gives `engineering/github/branching.md` frontmatter, `name: Branching`, typed by `KAAL Definition`, as MOVE and GLUE are. Its text, its rules and its ownership do not change. With no `Realized by` Edge any more, its purpose is narrower: the Architecture's `branching:` references then resolve through Graph's `identify` to one typed Node and a heading in it, as `code:` and `guard-check:` references resolve to theirs. Nothing points an Edge at it.

## Structural Test Cases

`engineering/controls/controls.test.mjs` joins `npm run test:engineering`. These tests check the shape and the traces. The evidence for each control's claims is the existing tests that its testing.md cites. Each case is first observed RED against a deliberately broken fixture, built in a scratch copy of the repository. A RED that shows only a missing module or Node counts as blocked, not as evidence.

| Case | Checks | Fixture that must fail, naming the cause |
| --- | --- | --- |
| Each Control is whole | Every `engineering/controls/<control>/` holds its Control Node, typed by `Control`, its Intent Node or Nodes, and the other three files | A Control directory with no requirements.md |
| A Control Has its Intents | Each Control Node is run through Controls' own conformance check, not a copy of it. Zero `Has` Edges is nonconforming; several are conforming. With Intent present, each target resolves to an `Intent`-typed Node; a wrong or malformed target is nonconforming. With Intent absent, each target is reported unresolved, distinctly from nonconforming, and never as GREEN | A Control Node with no `Has` Edge. One whose `Has` targets requirements.md. The tree with Intent absent, reported as GREEN |
| No direct realization | A Control Node carries no Edge but `Has`, and nothing in a Control directory links a Control to a mechanism as its realization | A Control Node with a `Realized by` Edge to Guard |
| Traces resolve | Every Requirement names an Intent that exists, every Architecture element names Requirements that exist, and every testing.md row names a Requirement | A Requirement citing `I9`, which does not exist |
| Every claim has an assurance state | Every Intent and Requirement has a testing.md row, marked as a design or an operation claim: **verified**, citing a test file and `describe` title that exist; **validated**, naming who judged, what, and a link to where; or **unresolved**, with its reason. Unresolved rows are listed on every run, never as passing | A row citing a `describe` title that is not in the file. A validated row with no link. A Requirement with no row |
| References resolve | Every `guard-check:`, `workflow:`, `branching:` and `code:` reference resolves to exactly one declaration, job, heading or export | A Control citing `guard-check:Nonexistent` |
| No undocumented gate | Every discovered gate, every `.kaal/config/guard/*.md` declaration and every job a pull request, push, merge group or schedule runs, is cited by a Control or reported as an unresolved coverage finding, naming it | A new `.kaal/config/guard/New.md`. A new job in `ci.yml`. A schedule trigger added to `guard-release.yml` |
| No GREEN on partial coverage | While any coverage finding is open, the report's overall state is unresolved, never complete or GREEN, even when every Control's claims are verified or validated | Today's tree, with CodeQL and Dependency Review uncovered, reported as complete |
| No silent exclusion | A gate can leave the report only by being cited by a Control. Anything listed as not a gate carries a reason the test checks against its triggers | An exclusion list that drops `codeql.yml` |
| Operation needs observed evidence | Every testing.md row says whether it is a design or an operation claim. An operation claim is verified only by citing an observed Run, check result or merge record, or else stays unresolved. A validated operation claim is refused | A row claiming "Change Isolation ran on #NNN" as validated by the Owner's review. An operation row citing a ruleset, or `guard-check:Change-Isolation`, as its evidence |
| Nothing copied | `engineering/controls/` holds only Markdown | A `.mjs` file placed in a Control directory |

**What these tests do not claim.** Coverage is not effectiveness. They show that every discovered gate is documented by a Control or reported as a coverage finding, and that every claim is verified, validated or visibly unresolved. They do not show that a ruleset requires a check, that a check ran, or that a control works. Nothing in this PLAN or its DO claims a ruleset enforces a control.

## Dependencies

Three kinds, kept apart:

- a **semantic reference** cites a concept another Capability owns and imports nothing;
- a **technical dependency** is something the DO's code or Nodes need in order to build or resolve;
- an **order prerequisite** is something that must be on `main` first.

| Concept | Owner | Kind | Needed for C3? | Where it stands |
| --- | --- | --- | --- | --- |
| `Control`, `Has`, Controls' conformance check | Controls | Technical: each Control Node is typed by `Control`, carries `Has` Edges, and is checked by Controls' own check | **Yes**, available in `kaal/engineering` | Planned in controls/C6 (#619), with two Owner decisions open there; `kaal/controls`, not on `main` |
| Claim calibration: type, mechanism, evidence | Controls | Semantic reference | Yes, as a reference only | `kaal/controls` |
| Verification, validation, findings, unknown | Testing | Semantic reference | Yes, as a reference only | On `main` |
| `Intent` Definition | Intent | Optional complement. When Intent is present, each `Has` target resolves to an `Intent`-typed Node through Controls' check. When it is absent, the Controls still work and each target is reported unresolved, never GREEN | No: not a runtime, package or promotion dependency | `kaal/intent`, typed `KAAL Skill` there, not in the promotion queue |
| Typed Requirement and Architecture traces | Requirements, Architecture | Semantic reference | No, deferred. The bracket traces stand meanwhile | Open (#603) |
| Test Case → Defect, Code → deployed realization | Testing; open | Semantic reference: the chain's later links | No. Until they are typed, the chain is shown by the bracket traces and the references, and nothing claims more | #583 plans the first; the owner of the second is open on #619 |
| HAPTIC | Controls | Semantic reference: names each Control's mechanism level | No, optional. Nothing imports it, and nothing fails without it | `kaal/controls` |
| PREACH | Agents | Semantic reference: describes the escalation above | No, optional. It is cited as a description, not a contract, and it is not mandatory | `kaal/agents` (#613 merged there), not on `main` |
| Guard check declarations and verdicts | Guard | Semantic reference: cited by `guard-check:` name only | Yes, as a reference only | On `main`. Guard keeps its authority: a Control never restates, overrides or reinterprets a check's verdict |
| `KAAL Definition`, admission, `identify` | Core, Graph | Technical, already used by Engineering's tests | Yes | On `main` |

**So the DO needs one thing:** Controls' `Control`, `Has` and conformance check available in `kaal/engineering`. That says when the DO can start. It sets no order on Controls' or Intent's promotion, which stays the Owner's queue, and it needs Intent not at all. Everything else is either already on `main` or deferred. Any conflict found while doing it returns to the Owner for alignment.

## Contracts reused

Core's admission (`register`, `catalog`), Graph's `identify` and Edge form, and Controls' `Control`, `Has` and conformance check. Nothing new is added to any of them.

## Owner decisions

1. **Branching's Node.** Decided, A (#585): `branching.md` becomes a KAAL Definition Node, with its rules and ownership unchanged.
2. **The scope.** These seven are a bounded first delivery. The DO documents exactly the approved list, and the two security gates stay reported as unresolved coverage findings until a later Change covers them.
3. **The trace model.** Decided on #619: `Has`, one or more Intents, Intent as an optional complement, and no direct realization shortcut. This PLAN follows it and uses no `Realized by`, so it is unaffected by how #619's open decisions land (removing or deprecating `Realized by`, and how Controls' check recognizes Intent's Definition). If they change `Has` or the check's outcomes, this PLAN follows.

Approving this PLAN authorizes the engineering/C3 DO only, once Controls is on `main`. It authorizes no synchronization, promotion or publication, and no change to any check, ruleset or workflow.
