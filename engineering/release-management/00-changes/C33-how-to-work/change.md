# C33 change

## PLAN

The smallest coherent design: one shared fixed trailer chapter, one guidance document per type, one mnemonic definition, and no new mechanism.

### 1. The chapter

Every template ends with the level-2 chapter `HOW TO WORK`, after the chapters of its type. Its text is fixed visible text that names two paths and nothing else (no URL, no copy of any step). For a typed template:

```
## HOW TO WORK

Work and review of a <TYPE>: engineering/release-management/03-architecture/A49-how-to-work/<type>.md
HOW TO WORK: engineering/HOW-TO-WORK.md
```

DEFAULT is deliberately the most open: its fixed text names only the mnemonic definition and says the specialized template and its guidance apply whenever the pull request fits a type:

```
## HOW TO WORK

Use the specialized template when the pull request fits a type. Otherwise work and review as the change needs: engineering/HOW-TO-WORK.md
```

The chapter is the same in the template and in every body: it is a trailer, repeated by design and carrying no content of its own, like the cue of release/C24. The envelope check reads it from the base template and requires the body to end with it verbatim (section 5).

### 2. Where the authority lives

- **Mnemonics: `engineering/HOW-TO-WORK.md`**, a KAAL Definition beside `engineering/VIVA-AQUA.md`, which already hosts a mnemonic that spans two capabilities. It defines HOW TO WORK once and places its words:
  - **HOW** (Human Observes Work) is the first word of the Definition `HOW ARE WE DOING?`, which Review owns. It is named, not copied, so there is no competing definition. It resolves by Node name, `engineering/` before `.kaal/`; today only the Review package payload holds it, so the definition names it and the deployment of Review into `.kaal/` makes it resolvable (deferred, section 8).
  - **TO** (Testing Orchestrated): the deterministic verification of the work is run in the order the phase needs, by the Worker, and its result is evidence. Testing owns verification; a Review judgment never replaces it and a passing check never replaces a Review (VIVA AQUA). Defined here for the first time, in the sentence Kai gave; moving it into Testing is deferred.
  - **WORK** (Worker, Owner, Reviewer, Knowledge): the Worker carries out the work; the Owner holds the target and intent and stays out of the stroke (ROWING); the Reviewer judges the observed work independently of the Worker; Knowledge is what the work and its review leave durable in the place that owns its meaning (`HOW ARE WE DOING?`). Defined here for the first time; moving it is deferred.
- **Procedure per type: `03-architecture/A49-how-to-work/<type>.md`**, eight short files owned by the release capability, each with the two headings `Work` and `Review`. They reference the interface requirements (F3, F10, F11, F14, F15, F16, F18, F22), `engineering/github/branching.md`, A47 and the Definitions above; they copy none of them.
- **Resolution rule, stated once in `HOW-TO-WORK.md`**: a reference is a path under `engineering/`, or a Node name that resolves by `kaal list --engine .kaal`. Where both exist, `engineering/` wins. No reference points into `packages/`.

### 3. The eight guidance files (the exact steps, to be written by the DO from this text)

Each step is one line. Work is the Worker's; Review is the Reviewer's. Verify marks a deterministic check (TO, Testing); judge marks independent judgment (HOW, Review).

**PLAN** (F2, F3)
- Work: (1) State the Change, the Gap it closes, From, To and Because briefly; detail goes in the Change files. (2) Write the Cases that prove the Gap and run them: they must be RED. (3) State what is not in the Change. Install and implement nothing.
- Review: (1) Judge that the Gap is real and that this Change is the one that closes it. (2) Verify the Cases at the exact head are RED, and for the right reason. (3) Judge the scope: nothing implemented or installed, the exclusions stated. Approve the PLAN only, never the later phases.

**DO** (F11)
- Work: (1) Turn the PLAN's RED Cases green with the least change; rename `.red` to `.test`. (2) Refactor only what the Refactor chapter names, behaviour unchanged. (3) Touch no PLAN file; a changed PLAN is an amended PLAN.
- Review: (1) Verify the Cases are green at the exact head and were not weakened, skipped or deleted. (2) Judge that the diff stays inside the PLAN's scope and does what Implement says. (3) Judge the refactor changes no behaviour.

**ACT** (F10)
- Work: (1) Write the 4L retrospective (Liked, Learned, Lacked, Longed For) from your own view, from what the evidence and the history showed. (2) Name each follow-up and its owner. Add no behaviour.
- Review: (1) Judge whether the 4L is honest and complete against the observed history of the Change (ROWING: the work as realized). (2) Verify that the ACT changes nothing but its records. (3) Check that each follow-up has an owner.

**SYNC** (F14, branching.md#synchronize)
- Work: (1) Name the one Change that drives the synchronization and why now. (2) Branch from the collector tip and merge a main commit as a merge commit. (3) Resolve every conflict explicitly in that merge commit; add no content.
- Review: (1) Verify the head is a merge commit of main into the collector tip and the checks are green. (2) Judge each conflict resolution. (3) Approve the exact head; a later push needs a new approval.

**PROMOTION** (F15, Pull Promotion)
- Work: (1) Confirm the collector holds PLAN, DO and ACT with nothing red; read the advisory Pull Promotion report. (2) Synchronize just in time, only when you hold the seat. (3) List each Change with its phases and say why now.
- Review: (1) Verify the exact head, the checks and the qualification evidence. (2) Judge the priority: why this and why now. The advisory report is never approval. (3) Verify no `.github` or `.githooks` file travels (that is WIRE).

**HOTFIX** (F16, A36)
- Work: (1) Reference the KAAL Defect and state what is broken, in which state, and why now. (2) Add a RED Case that reproduces it, then the minimal correction on a `hotfix/` branch. (3) Carry nothing else.
- Review: (1) Verify the Case is RED before and green after. (2) Judge the urgency and that the correction is minimal and nothing rides along. (3) Check the correction also returns to the collector.

**WIRE** (F22, A47)
- Work: (1) Name the Source already on `main`, the Target and the Verification. (2) Install the unchanged copies; a move is declared with its preimage hash. (3) Run the installed-equals-source Case and the operational acceptance. Develop nothing; a defect goes back to the Engineering Change.
- Review: (1) Verify byte equality of each installed file with its source and that nothing else changed. (2) Verify the operational acceptance. (3) Check the Owner's authorization of this WIRE exists.

**DEFAULT** (F18, F19)
- Work: (1) Say plainly what changes and why; use a specialized template when one fits.
- Review: (1) Read the change against its stated purpose and judge it. Nothing more is prescribed.

### 4. What is not repeated

The files only point: they cite requirements and Definitions by path or Node name. No mnemonic expansion, no step, no rule is repeated in a template; the chapter holds two paths.

### 5. Controls

- `templates.mjs`: a template whose last chapter is `HOW TO WORK` has that chapter removed from the chapters of its type and its visible text recorded as the trailer of the type (`trailers[TYPE]`). The registry therefore stays the type's own chapters, and F3, F10, F11, F14, F15, F16, F18 and F22 keep saying what the type's own chapters are, plus one sentence that the shared trailer follows (F23).
- `envelope.mjs` and `check.mjs` (trailers travel in the existing `options` argument): a body of a type that has a trailer must end with the chapter `HOW TO WORK`, equal to the trailer of the base template, verbatim. A missing, changed, repeated or misplaced trailer is a finding. A type whose template carries no trailer is judged as today. A body is not asked for the trailer's content a second time: the trailer is the only chapter allowed to be repeated from the template.
- The Change-identity rule, the cue and the other shared rules are untouched.

### 6. Cases (all RED on `main`; the DO turns them green)

- T440: `A49-how-to-work/` holds exactly the eight files, each with the headings `Work` and `Review` and between one and four steps in each; the Work and Review texts of any two types differ; PLAN review and ACT review share no step.
- T441: every path in the guidance, in `HOW-TO-WORK.md` and in the trailers exists under `engineering/`; none points into `packages/`; the resolution rule is stated once.
- T442: `HOW-TO-WORK.md` defines HOW, TO and WORK in the meanings of the assignment, names HOW as the first word of `HOW ARE WE DOING?` and does not restate that Definition; each Engineering template source ends with the `HOW TO WORK` chapter of its type, and DEFAULT's is the open one.
- T443: `readTemplates` removes the trailer from the registry and records it; `verifyEnvelope` accepts the exact trailer and rejects a missing, changed, repeated or non-final one; the existing F17 findings are unchanged.
- T444: F23 states the shared trailer, and each of F3, F10, F11, F14, F15, F16, F18 and F22 names it once and keeps its own chapter list.
- T445 (executed at WIRE, never a prerequisite of the ACT): each installed template equals its Engineering source byte for byte. It stays `.red.mjs` through the promotion.

### 7. Delivery order and dependencies

1. release/C25 (#1683) first: it creates the Engineering sources for plan, do, act, promotion and default. This Change adds the trailer to those sources and to `sync-template.md`, `fallback`-related text, the hotfix source and `wire.md`, so it must be built on `main` after C25.
2. This collector (PLAN, DO, ACT) is promoted as an Engineering promotion: guidance, definition, trailer in the sources, the check and the Cases. No `.github` or `.githooks` file travels.
3. A separately authorized WIRE `wire/how-to-work` installs the trailer in the installed templates (T445). It needs the WIRE path of release/C27 and the Owner's go. WIRE has no installed template yet; its trailer arrives with the bootstrap install of `wire.md` (release/C27), which this Change must not delay or duplicate.
4. The envelope check must accept the trailer before any installed template carries it; otherwise bodies fail. Order inside the DO: check first, sources second.

### 8. Not in this Change, deferred

Moving TO into Testing and WORK into a roles Definition; deploying Review and Testing into `.kaal/` so HOW resolves there; a registry of templates (Owner decision on #1530); the declaration migration of the older default template; any enforcement that a reviewer actually followed the steps; automating the review; hooks, rulesets or merge blocking; and executing any WIRE or deployment.

### 9. Conflicts found

- F3, F10, F11, F14, F15, F16, F18 and F22 each say "exactly N chapters and nothing else"; resolved by F23, a shared trailer that is not one of the type's own chapters, with one added sentence in each.
- F17 forbids text that is not the type's chapters; the trailer is allowed only as the exact base text, so a PR still cannot change what it is judged by.
- The older default template is undeclared and keeps its path; it receives the DEFAULT trailer only through C25's source and the WIRE.
