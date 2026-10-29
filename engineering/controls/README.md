# Engineering's controls

> PLAN (engineering/C3): nothing below exists yet. This PLAN proposes seven Controls for the engineering concerns Engineering owns in this repository, each with its own Intent, Requirements, Architecture, Tests and realization, revised to the Owner's Control model (#585, comment 6501504603). The seven are a proposed, bounded scope. The DO waits for Controls (`kaal-controls`) to be on `main` and synchronized into `kaal/engineering`, and for the Edge in "What Engineering asks of other Capabilities" below.

## The model, as the Owner set it

A Control is a bounded, enduring engineering concern. It has an Intent. Requirements answer the Intent, Architecture answers the Requirements, Tests give evidence for the claims, and code realizes the Architecture. A Change *delivers* an Intent once; a Control *has* one for as long as the concern lasts.

- **Who owns what.** Engineering owns these seven Control instances and their realizations, in `engineering/controls/`, which is repository-native and not `.kaal/`. Controls owns what a Control is (`Control`, `Realized by`) and its outgoing `Control —has→ Intent`. Requirements and Architecture own their outgoing traces. Testing owns what a test and its evidence mean. Graph owns the generic mechanics.
- **Reuse, not copies.** Every realization below already exists under its current owner: Engineering's checkers, Guard's check declarations, Branching's rules. A Control's Architecture names each one by a stable reference. Nothing is copied into `engineering/controls/`.
- **Traceability is not evidence.** A `Realized by` Edge says where a control is claimed to be realized. Only a Test Case gives evidence for a claim. Where no test can, the claim is listed as **unevidenced**, never left silent.

## Layout

One directory per Control:

```
engineering/controls/<control>/
  <Name>.md          the Control Node, typed by `Control`: what the control is for, one `Realized by` Edge per realizing Node, and its `has` Edge to intent.md
  intent.md          <control>/I1…: the enduring concern and why it matters
  requirements.md    <control>/F…, <control>/N…: each names, in brackets, the Intents it answers
  architecture.md    <control>/A…: each names the Requirements it answers and the realization by reference
  testing.md         one row per claim: the Requirement, the existing test file and title that evidence it, or "unevidenced" and why
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
- **A1** [F1, F2, N1]. The rules are decided in `code:engineering/change-isolation/check.mjs`. That check runs at merge through `workflow:change-isolation.yml#change-isolation` and before a push through `guard-check:push`, and is declared as `guard-check:Change-Isolation`. It is `Realized by` Guard and Branching.
- **Tests.** F1 is evidenced by `test:engineering/change-isolation/check.test.mjs#core travels alone` and `#aggregate changes`. F2 is evidenced by `#.github travels alone`.

### Lineage (`lineage`)

- **I1.** Work reaches `main` only through its Capability's collector, so each promotion carries one Capability's reviewed Changes and nothing else.
- **F1** [I1]. A working branch lands in `kaal/<capability>`, and a collector is brought current with `main` only by a synchronization: a merge commit that names the `main` commit it merges and differs from that merge only where the two conflict.
- **F2** [I1]. Each flow lands with its own method: squash for a Change or a promotion, a merge commit for a synchronization. Auto-merge is set to that method.
- **A1** [F1, F2]. The rules are decided in `code:engineering/github/lineage.ts#synchronization`, `#methodFor`, `#autoMerge` and `#landing`. They run through `guard-check:Branching` in `workflow:lineage-synchronization.yml#lineage-synchronization` and before a push through `guard-check:push`. The reasoning is in `branching:Engineer` and `branching:Synchronize`. It is `Realized by` Guard and Branching.
- **Tests.** F1 is evidenced by `test:engineering/github/lineage.test.ts#synchronization`. F2 is evidenced by `#methodFor`, `#autoMerge` and `#landing`.

### Promotion source (`promotion-source`)

- **I1.** Only a Capability's own collector changes `main`, and only in a state that was validated against the `main` it lands on.
- **F1** [I1]. A pull request into `main` comes from a `kaal/*` branch of this repository.
- **F2** [I1]. Its head contains `main`'s tip, and the merge it would make is exactly the head's tree.
- **A1** [F1, F2]. The rules are decided in `code:engineering/github/lineage.ts#promotionSource` and `#promotionFreshness`. They run through `guard-check:Promotion-Source` in `workflow:promotion-source.yml#promotion-source`. The reasoning is in `branching:Promote`. It is `Realized by` Guard and Branching.
- **Tests.** F1 is evidenced by `test:engineering/github/lineage.test.ts#promotionSource`, and F2 by `#promotionFreshness`.

### Lineage audit (`lineage-audit`)

- **I1.** A pull request or collector that has fallen out of the branching policy is found, even when no new push judges it again.
- **F1** [I1]. On a schedule, collectors and working branches are judged again. The audit names a collector established from a stale `main`, a fully promoted collector due for deletion with the pull requests it would strand, a working branch reused after its Change merged, and a hold that does not evidence itself.
- **A1** [F1]. The judgments are `code:engineering/github/lineage.ts#establishment`, `#collector` and `#workingBranch`, with holds from `engineering/github/holds.json`. They run through `guard-check:Branching-audit` in `workflow:branching-audit.yml#audit`. It is `Realized by` Guard and Branching.
- **Tests.** F1 is evidenced by `test:engineering/github/lineage.test.ts#establishment`, `#collector` and `#workingBranch`. **Unevidenced:** that the schedule runs. That is GitHub's, and no repository test can show it.

### Required tests (`required-tests`)

- **I1.** No Change lands while KAAL's own tests fail.
- **F1** [I1]. Every pull request into a protected branch runs the acceptance, Engineering, Hosting and workspace tests, on each host they claim.
- **A1** [F1]. These are declared as `guard-check:Acceptance`, `guard-check:Engineering`, `guard-check:Hosting` and `guard-check:Workspaces`. They run as `workflow:ci.yml#hosting`, `#acceptance`, `#lane`, `#guard` and `#guard-hosts`, and `workflow:guard-acceptance-boundary.yml#acceptance-boundary`. It is `Realized by` Guard and Branching.
- **Tests.** That a lane fails on failing tests, and captures them, is evidenced by `test:engineering/lanes/evidence.test.mjs#the evidence lane's gate`. **Unevidenced:** that a ruleset requires these checks before merge. Rulesets live outside the repository.

### Review before merge (`review-before-merge`)

- **I1.** A Change lands on a protected branch only after its review is complete.
- **F1** [I1]. `main` and `kaal/*` change only through pull requests whose review is complete.
- **A1** [F1]. Realized by GitHub's branch protection, outside the repository. The rule is stated in `branching:Branches`. It is `Realized by` Branching.
- **Tests.** **Unevidenced:** no repository test can show the review requirement. The Control documents the concern and claims no evidence.

### One promotion at a time (`one-promotion`)

- **I1.** Promotions into `main` go up one pair at a time, in queue order, so each is validated against the `main` it lands on.
- **F1** [I1]. At most one promotion pair, a synchronization and its promotion, is open at a time.
- **A1** [F1]. It is directive today and kept by hand, as `branching:One promotion at a time` says. engineering/C2's Test Cases realize it once they are GREEN. It is `Realized by` Branching.
- **Tests.** **Unevidenced** until engineering/C2's Test Cases are GREEN. Then testing.md cites them.

**Gates outside these seven.** `workflow:codeql.yml#analyze` and `workflow:dependency-review.yml#dependency-review` are security gates. No Control documents them, so they are listed here as known and **uncovered**, and the structural test reports them as uncovered on every run. Covering one is a change to this PLAN's scope, not to that list. `workflow:guard-release.yml` runs only by dispatch and gates no Change.

## Branching as a Definition Node

This is the Owner's decision A on #585. The DO gives `engineering/github/branching.md` frontmatter, `name: Branching`, typed by `KAAL Definition`, as MOVE and GLUE are. Its text, its rules and its ownership do not change. That lets a `Realized by` Edge point at it.

## Structural Test Cases

`engineering/controls/controls.test.mjs` joins `npm run test:engineering`. These tests check the shape and the traces. The evidence for each control's claims is the existing tests that its testing.md cites. Each case is first observed RED against a deliberately broken fixture, built in a scratch copy of the repository. A RED that shows only a missing module or Node counts as blocked, not as evidence.

| Case | Checks | Fixture that must fail, naming the cause |
| --- | --- | --- |
| Each Control is whole | Every `engineering/controls/<control>/` holds its Control Node, typed by `Control`, and the four files. The Node's `has` Edge resolves to its intent.md | A Control directory with no requirements.md |
| Traces resolve | Every Requirement names an Intent that exists, every Architecture element names Requirements that exist, and every testing.md row names a Requirement | A Requirement citing `I9`, which does not exist |
| Every claim is evidenced or says it is not | Every Requirement has a testing.md row. A row either cites a test file and `describe` title that exist, or says "unevidenced" with its reason | A row citing a `describe` title that is not in the file. A Requirement with no row |
| References resolve | Every `guard-check:`, `workflow:`, `branching:` and `code:` reference resolves to exactly one declaration, job, heading or export | A Control citing `guard-check:Nonexistent` |
| No undocumented gate | Every `.kaal/config/guard/*.md` declaration, and every job a pull request, push or schedule runs, is cited by a Control or listed as uncovered | A new `.kaal/config/guard/New.md`. A new job in `ci.yml` |
| Nothing copied | `engineering/controls/` holds only Markdown | A `.mjs` file placed in a Control directory |
| Realized by | Each `Realized by` Edge resolves through Graph's `identify` to Guard or Branching | An Edge to a Node that does not exist |

**What these tests do not claim.** Coverage is not effectiveness. They show that every repository-declared gate is documented by a Control, and that every claim is evidenced or marked unevidenced. They do not show that a ruleset requires a check, that a check ran, or that a control works. Nothing in this PLAN or its DO claims a ruleset enforces a control.

## What Engineering asks of other Capabilities

These are reported for the Owner's alignment. Engineering does not invent shared semantics.

- **Controls: `Control —has→ Intent`.** Controls defines `Control` and `Realized by`. It has no Edge for `has` yet. The DO needs one, and it is Controls' to define.
- **Intent: the `Intent` Definition.** It is on `kaal/intent`, not on `main`. Whether a Control's intent.md is a Node typed by `Intent` follows that Definition once it is promoted.
- **Requirements and Architecture: typed traces.** These are planned in their own Changes (Requirements #603 is open). Until they land, the bracket form above is the trace. No conflict exists today. If their form differs, the files move to it in a Change of their own.

## Contracts reused

Core's admission (`register`, `catalog`), Graph's `identify` and Edge form, and Controls' `Control` and `Realized by`. Nothing new is added to any of them.

## Owner decisions

1. **Branching's Node.** Decided, A (#585): `branching.md` becomes a KAAL Definition Node, with its rules and ownership unchanged.
2. **The scope.** Are these seven the right Controls to document first? The DO documents exactly the approved list, and the two security gates stay visibly uncovered.

Approving this PLAN authorizes the engineering/C3 DO only, once Controls is on `main` with its `has` Edge. It authorizes no synchronization, promotion or publication, and no change to any check, ruleset or workflow.
