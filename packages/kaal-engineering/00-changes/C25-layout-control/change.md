# C25 change

The Owner's order: the control comes first, before any folder migration, and it needs Test Cases for a correct setup (GREEN) and a bad setup (RED), so the ratchet has a clean concept to tighten against. More than one control for the folder structure.

## The split, as small Changes

Three ratchets, one each for `packages/`, `engineering/` and `.kaal/`. Each compares the current setup with the desired one. A ratchet is two things: a control for the **desired** setup, with a Test Case for a correct setup (GREEN) and Test Cases for bad setups (RED), and a baseline of the **current** gaps, which may only shrink. Each control is detective, with its own minimum evidence. They are separate small PLANs, in this order:

1. **`packages/` (C25, this PLAN).** Desired: a capability folder follows the layout template. The control, `verify Layout`, and its check come first, since the other two reuse the check. The baseline of current gaps is a list that names each package and its specific findings; today every package is on it.
2. **`engineering/`.** Desired: the layout, and the machinery of `engineering/<cap>` equals the machinery of `packages/<cap>` (N+1). Content is never compared. Its own control and baseline, because it moves at its own pace.
3. **`.kaal/`.** Desired: the layout, and the machinery of `.kaal/<cap>` equals the published N. Content is never compared. Its own control and baseline.
4. **One source per Skill, across all three.** A copy of a Skill or its payload that no stage or delivery role explains is waste. One control over the three places, after the ratchets.

The layout check is the same code in all three places, as the template is one layout in three places. 2 and 3 add the machinery comparison, which needs C25's machinery and content split. The delivery locations and WIRE stay with kaal-release, and CTL23 there is not repeated. Where a baseline is kept, and how a control reads it to tell a new gap from an old one, is for the PLAN of ratchet 2, once the first baseline exists.

## PLAN

1. Add the Intent I4, the Requirements F52, F53, F54 and N21, the Architecture A4 and the gap G115 under `packages/kaal-engineering/`, and the Cases T1230 to T1238 as `T<n>.red.mjs`, beside the element each tests. T1237 tests the control and sits beside I4, which the control has, because the control is not in this package; the DO moves it next to the control in `engineering/02-controls/CTL2-verify-layout/`.
2. Observe the expected RED against the collector (`evidence.md`) and show that each Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file. `draft/` holds the check (`skills/kaal-engineering/scripts/check-layout.mjs`), and `interface.md` holds the draft of the control (`engineering/02-controls/CTL2-verify-layout/CTL2.md`), for review only. The control is inline so that no second `CTL2` is listed before the DO.

## Ids

Proposed, to be confirmed by the allocator: Change engineering/C25, Intent engineering/I4, Requirements engineering/F52, F53, F54 and N21, Architecture engineering/A4, control engineering/CTL2, Cases T1230 to T1238, gap G115. They are the next free at the collector tip `ced6598a`; engineering/CTL1 is held by the parked registration PLAN (#1954).

## What the check judges

From the tracked files of one capability folder and the layout template, and from nothing else:

| Setup | Result |
| --- | --- |
| follows the template | PASS |
| a numbered folder the template does not have (for example the earlier `00-changes`, `01-intent`) | FAIL, names it |
| an element folder or `13-source` without the folder that verifies it (`test-cases`, `unit-tests`) | FAIL, names it |
| a folder in `13-source` the template does not have | FAIL, names it |
| a tracked file under `dist` | FAIL, `dist is committed` |
| the template or the folder cannot be read | UNKNOWN, never a pass |

It judges one folder. A run over every capability gives the baseline: today every package uses the earlier numbering, so every package is FAIL, and the baseline is that list, not a count. Nothing here makes it fail a pull request.

## Amends

N19 (skill-only) and its Case T1177 stated the first version: no script. The DO amends both to allow `scripts/check-layout.mjs`, and nothing else. T1177 also asserts there is no `04-controls` in the package, a name the layout does not have; the DO makes it `02-controls`, so the package still declares no control of its own. T1177 changes in that DO, and the Change lists it.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change: add the script from `draft/` to the Skill and the control from `interface.md` to `engineering/02-controls/CTL2-verify-layout/`, amend N19 and T1177, and rename T1230 to T1238 to `.test.mjs`. No package is migrated, nothing is wired and nothing is published.

## ACT

A 4L retrospective in `act.md`, with the body shape the Dispatcher reads (a `Change` chapter and a `Records` chapter).

## The contract of the future ratchet

Three things, kept apart. C25 delivers the first; the other two are stated so the ratchet Change has a contract, and are not built here.

1. **CTL2's per-package result.** For one folder, PASS, FAIL with its findings, or UNKNOWN. This is the check as built here.
2. **The baseline.** A record that identifies each package and its specific findings, never an aggregate count, because a count lets one package regress while another improves with the number unchanged. A later Change writes it from a run over every capability.
3. **The ratchet's obligation.** For each package, a finding the baseline no longer lists must not come back: a run that finds it again is a regression, whatever the other packages do. A package may only shed findings, and a new package starts clean. UNKNOWN is never read as progress.

## Where the control sits

**Rule: `packages/` is special because of the workspace.** It holds only packages, and gets no numbered steering folders (`00-backlog`, `01-changes`, `02-controls`). Its steering lives in `engineering/`, at the level of the area folders. The Owner accepted two files beside the packages, `packages/AGENTS.md` for work across packages and `packages/README.md` so the folder renders well on GitHub, and nothing else. The check's `--workspace` mode (Requirement F54, Case T1238) judges this: GREEN for packages plus those two files, RED for any other file or any numbered steering folder. This rule is stated for the PLAN; its place in the Skill's reference is part of the DO.

Proposed path: `engineering/02-controls/CTL2-verify-layout/CTL2.md`, with its Test Cases beside it, following the controls convention (release's `04-controls/CTL23-verify-delivery/`). `engineering/` gets the layout's numbered steering folders at its own level, beside the area folders, starting with `02-controls`. `packages/` stays pure packages, which is the usual monorepo convention. Workspace config does not move: the root `package.json` lists the workspaces one by one, a capability's ownership is its `ownership.kaal.json`, and KAAL's own integration config stays in `.kaal/config`. Nothing is added to `packages/`.

Why `engineering/` is the right place, in the repository's terms. Controls are consumer-owned, and `engineering/` is where KAAL, as its own consumer, keeps what it runs. The existing controls tests (controls T1094 to T1096) walk every file under `engineering/` and check that every declared minimum names a fixture, a real and a real-failure kind, so a control placed here is under those checks from its first day, and CTL2's `[fixture:2, real:1, provoked:1:fail]` meets them; one under `packages/` would not be.

What it relates to. Today the controls are scattered by the area that wrote them: release's under `engineering/release-management/04-controls/` (CTL1 to CTL23), and `engineering/controls/` is the Controls capability's own area with its records. The finder finds a control wherever it sits, so nothing has to move for `02-controls` to work, and C25 moves nothing. Bringing the existing controls into `engineering/02-controls/` is a later Change of its own, with their ids unchanged. One thing to decide then, not now: `engineering/controls/` (an area) and `engineering/02-controls/` (the steering folder) have near names. The number tells them apart; if it still confuses, the area is the one to rename.

`00-backlog` and `01-changes` at the `engineering/` level: the same rule applies and the same restraint. The layout gives a level these steering folders, and each is created only when something moves in. Nothing moves in now. Changes are today kept per area (`engineering/release-management/00-changes/`, `engineering/controls/00-changes/`) and in each package, and the backlog is kept outside the repository, so creating either folder now would be empty or would move records for no reason. They are named here so the layout stays one rule. The template (`package-layout.json`) describes a capability folder; adding the steering folders of the `engineering/` level to it is an amendment of C24's reference, in the PLAN that first needs a second one.

Not decided here and for the ratchet PLANs: how a run over `engineering/<cap>` tells a capability folder from today's area folders, which have the earlier numbering. The check judges one folder it is given, so this is a question for the engineering ratchet, not for C25.

## Owner questions

1. Answered by the Owner, and corrected: it is an engineering control and sits in the steering folder `engineering/02-controls/`. See "Where the control sits".
2. The split: is it the three ratchets you meant, with one control for the desired setup and a baseline of current gaps for each, and one source per Skill across all three?

## Not in this Change

No migration of any package, no WIRE, no ruleset, no required check, no preventive mode, no publication, and none of controls 2 to 4.
