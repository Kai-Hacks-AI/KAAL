# C27 change

The CPO's comment on the C24 ACT (#2107) proposed a revision of the numbered layout, a new Change and not a rewrite of that ACT. The Owner agreed with the direction ("yes, makes sense; review the idea first, align with me"), asked for it before the Exchange PLAN, said that the number scheme is engineering's own decision and that capabilities should not care about it, and gave the go to raise this PLAN, expecting review to challenge it. This page gives the reasoning so each step can be judged.

## The idea

The numbered concerns follow one order, each answering the one before it:

| Folder | Concern | Answers |
| --- | --- | --- |
| `10-intent` | why | |
| `11-requirements` | what | the intent |
| `12-architecture` | the shape | the requirements |
| `13-source` | what is built | the architecture |
| `14-operations` | how it is run and observed | the source: it has to be run to deliver behaviour |
| `15-defects` | what that operation and observation can reveal | the operation |

`00-backlog` and `01-changes` stay before them: they steer the work and are not a concern of the capability itself.

## What moves, and why

1. **`02-controls` goes, Controls move into `14-operations/controls`.** A Control needs execution to produce evidence, which is what Operations is. Controls keep their identities (`<capability>/CTL<n>`) and can still govern any stage of the lifecycle; only the folder they sit in changes. Only controls over the package itself sit there, as before. A control over how a consumer runs its repository stays consumer space.
2. **`14-defects` becomes `15-defects`.** Defects follow operation, because a Defect's state is derived from Test Case runs, and runs are execution.
3. **`14-operations` is closed:** it may hold `controls`, and `runs` where a judged and stamped fallback record is needed, and nothing else. `runs` is optional and is created only when a record exists (git tracks no empty folder), as every folder that appears only when something moves in. No record mechanism is designed here: a proof helps a decision, and persisting it comes only when something needs it (YAGNI, the Owner's rule).
4. **What verifies `14-operations` is its `controls`.** Every element kind says what verifies it done. If the folder is present it must hold `controls`; a package with no `14-operations` is not judged for it, as for any absent folder.
5. **The layout check needs no new rule.** It reads the template. The one generalisation: the "stray child" rule that named `13-source` reads a `closed` flag the template sets on `13-source` and `14-operations`. A folder with the earlier numbering is already "a numbered folder the template does not have".

## Same numbers in the three places, and the engineering level

The template is one layout in three places, so `packages/<cap>`, `engineering/<cap>` and `.kaal/<cap>` all use these names. The `engineering/` level itself uses the same folder names and creates one only when something moves in. Today that is `engineering/14-operations/controls/CTL2-verify-layout/`, which replaces `engineering/02-controls/`. The Exchange folder is a later PLAN; the number `02` is taken by `02-learnings` (below), so it takes another number then. It is not in this Change.

## The steering group: backlog, changes, learnings

After review the Owner asked for the steering group before the numbered concerns to be settled in this Change, because the release PLANs (the hold and the demand ACT) place a retrospective and need its home before their DO. The group is `00-backlog`, `01-changes` and `02-learnings`. `02-learnings` holds what the capability learned. Its `retros` folder holds the retrospective of each collector, kept with the capability (`<capability>/02-learnings/retros/`), each with front matter `reflects: [C…]` naming the Changes it looks back on.

- **Closed, one child.** The folder may hold only `retros`, as `14-operations` may hold only what it names. A stray folder is named by the check.
- **No verifier is invented.** The retrospective is kaal-retro's object, and what verifies one is its rule to state. The layout gives the place and reserves nothing else, as it does for `00-backlog` and `01-changes`, which name no element either.
- **Absent is not judged.** A package with no `02-learnings` is PASS, as for any absent folder. The folder appears when a retrospective moves in, since git tracks no empty folder.
- **Why `02`.** The slot was `02-controls`, which this Change removes. Controls moved to Operations, and learnings is a steering concern that comes before the product: what we learned shapes what we plan.
- **Where research and trials sit** is not settled here. Operations is fine for now, and trials and outside research may deserve their own place later; that is a follow-up, once their protocol exists.

## Alternatives considered

- **Keep `02-controls` and only renumber defects.** Rejected: it leaves Controls ahead of the Source they need to run.
- **Controls as a numbered folder of their own after Source.** Possible, but a Control's evidence is an operation of the capability; a separate folder would invent a concern the order does not need.
- **A Run-record folder at the top level.** Rejected (YAGNI): `runs` stays an optional child of `14-operations`.

## What this does not do

- No capability looks for a folder by number or by name. Engineering hands each capability its locations (the template's role-to-path map, read by the wiring). That is a separate Change, as are the shared finder library and its naming convention (`find-<things>`), the Exchange folder and the ratchets. The defect thread already takes its places as input in #2113.
- No migration: all 12 packages are FAIL today and stay FAIL, with different findings. The baseline for the ratchet is written after this Change, so it is written once.
- No wiring, no ruleset, no publication, no preventive mode.

## The word Operations

In the published-style packages `docs/operations.md` already says how the package is run and used, and `kaal-operations` is a planned capability, listed with kaal-requirements, kaal-architecture and kaal-coding. `14-operations` is the folder whose meaning `kaal-operations` will own. Until it exists, engineering holds the placement. The shipped `docs/operations.md` should later be derived from or point at the folder, not duplicate it; that is for the shipped-documents question.

## PLAN

1. Add the Intent I5, the Requirements F56, F57 and F58 and the gap G117 under `packages/kaal-engineering/`, and the Cases T1241 to T1245 as `T<n>.red.mjs` beside the element each tests (T1244 tests CTL2 and sits beside I4, as T1237 does).
2. Observe the expected RED against the collector, and show that each Case can pass on a throwaway copy that holds `draft/` and the control at its new place (`evidence.md`).
3. The PLAN adds no package file outside the elements, Cases and this folder. `draft/` holds the revised template and the check with the `closed` rule, for review only.

## Ids

Proposed, to be confirmed by the allocator: Change engineering/C27, Intent engineering/I5, Requirements engineering/F56, F57 and F58, gap G117, Cases T1241 to T1245. They are the next free at the collector tip `e3a096d4`.

## DO

Not authorized by this PLAN. After the Owner's go, into the collector of this Change:

- move the template and the check from `draft/` into the Skill and remove `draft/`; update `package-layout.md` to match;
- move `engineering/02-controls/CTL2-verify-layout/` to `engineering/14-operations/controls/CTL2-verify-layout/`, and remove T1237, which T1244 supersedes;
- amend the Cases that pin the earlier layout, listed below, and F45, F48 and F49 where they name `02-controls` or `14-defects`;
- rename T1241 to T1245 to `.test.mjs`.

## Amends

Observed in the throwaway root, these existing Cases go RED when the template changes, and the DO amends each to the new layout and nothing else: T1221 (the numbered list), T1225 (`02-controls` scope, now the controls of `14-operations`), T1230, T1231, T1234 and T1236 (their fixtures use `14-defects`), and T1232, T1233, T1235 and T1238, whose fixtures also use the earlier names though they still pass. T1177 asserts no control in the package at the earlier name and is amended to `14-operations`. T1228 needs the Hosting package and fails the same on the collector.

## Questions for review

1. Is Controls in Operations the right reading, given that Controls can govern any stage? (The Owner and the CPO agree; the reasoning is item 1 above.)
2. Is `verifiedBy: controls` for `14-operations` enough, or should an Operations element have its own verifier?
3. Should `runs` be declared now, or left out until a record exists? (The Owner said to put it in.)

## ACT

A 4L retrospective in `act.md`, with the body shape the Dispatcher reads (a `Change` chapter and a `Records` chapter).
