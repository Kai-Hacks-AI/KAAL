# C25 change

The Owner's order: the control comes first, before any folder migration, and it needs Test Cases for a correct setup (GREEN) and a bad setup (RED), so the ratchet has a clean concept to tighten against. More than one control for the folder structure.

## The split, as small Changes

Three ratchets, one each for `packages/`, `engineering/` and `.kaal/`. Each compares the current setup with the desired one. A ratchet is two things: a control for the **desired** setup, with a Test Case for a correct setup (GREEN) and Test Cases for bad setups (RED), and a baseline of the **current** gaps, which may only shrink. Each control is detective, with its own minimum evidence. They are separate small PLANs, in this order:

1. **`packages/` (C25, this PLAN).** Desired: a capability folder follows the layout template. The control, `verify Layout`, and its check come first, since the other two reuse the check. The baseline of current gaps is the list of failing folders; today that is every package.
2. **`engineering/`.** Desired: the layout, and the machinery of `engineering/<cap>` equals the machinery of `packages/<cap>` (N+1). Content is never compared. Its own control and baseline, because it moves at its own pace.
3. **`.kaal/`.** Desired: the layout, and the machinery of `.kaal/<cap>` equals the published N. Content is never compared. Its own control and baseline.
4. **One source per Skill, across all three.** A copy of a Skill or its payload that no stage or delivery role explains is waste. One control over the three places, after the ratchets.

The layout check is the same code in all three places, as the template is one layout in three places. 2 and 3 add the machinery comparison, which needs C25's machinery and content split. The delivery locations and WIRE stay with kaal-release, and CTL23 there is not repeated. Where a baseline is kept, and how a control reads it to tell a new gap from an old one, is for the PLAN of ratchet 2, once the first baseline exists.

## PLAN

1. Add the Intent I4, the Requirements F52, F53 and N21, the Architecture A4 and the gap G115 under `packages/kaal-engineering/`, and the Cases T1230 to T1237 as `T<n>.red.mjs`, beside the element each tests. T1237 tests the control and sits beside I4, which the control has, because the control is not in this package; the DO moves it next to the control in `packages/02-controls/`.
2. Observe the expected RED against the collector (`evidence.md`) and show that each Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file. `draft/` holds the check (`skills/kaal-engineering/scripts/check-layout.mjs`), and `interface.md` holds the draft of the control (`packages/02-controls/CTL2-verify-layout/CTL2.md`), for review only. The control is inline so that no second `CTL2` is listed before the DO.

## Ids

Proposed, to be confirmed by the allocator: Change engineering/C25, Intent engineering/I4, Requirements engineering/F52, F53 and N21, Architecture engineering/A4, control engineering/CTL2, Cases T1230 to T1237, gap G115. They are the next free at the collector tip `ced6598a`; engineering/CTL1 is held by the parked registration PLAN (#1954).

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

It judges one folder. A run over every capability gives the baseline: today every package uses the earlier numbering, so every package is FAIL, and the ratchet is that the number of failing folders may only go down. Nothing here makes it fail a pull request.

## Amends

N19 (skill-only) and its Case T1177 stated the first version: no script. The DO amends both to allow `scripts/check-layout.mjs`, and nothing else. T1177 also asserts there is no `04-controls` in the package, a name the layout does not have; the DO makes it `02-controls`, so the package still declares no control of its own. T1177 changes in that DO, and the Change lists it.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change: add the script from `draft/` to the Skill and the control from `interface.md` to `packages/02-controls/CTL2-verify-layout/`, amend N19 and T1177, and rename T1230 to T1237 to `.test.mjs`. No package is migrated, nothing is wired and nothing is published.

## ACT

A 4L retrospective in `act.md`, with the body shape the Dispatcher reads (a `Change` chapter and a `Records` chapter).

## Where the control sits

Proposed path: `packages/02-controls/CTL2-verify-layout/CTL2.md`. `packages/` is laid out at its own level like a capability: `AGENTS.md` at its root, and `02-controls` for the controls over the set, as `02-controls` in a package holds the controls over that package. Its other numbered folders (`00-backlog`, `01-changes`) are not created now.

The monorepo concern, weighed: `packages/` is normally only packages. Three things were checked on `main`. The root `package.json` lists its workspaces one by one, not by `packages/*`, so a folder that is not a package is never a workspace. The one tool that walks every entry of `packages/`, a test in kaal-release, looks for `<entry>/payload` and skips what is not there. The earlier `packages/extensions` is already a folder that is not a package. So the cost is small: any run over every capability must take only the entries that hold a `package.json`, and the evidence here does.

Why numbered and not `packages/controls`: a capability named `kaal-controls` already exists, and an unnumbered `controls` beside it would read as another capability. The number sorts the folder to the top with `AGENTS.md` and says it is not a package, the same way the numbers order the folders in a capability. If you prefer `packages/controls`, say so; the change is one path.

The mismatch is fixed: the template names `02-controls`, and so does the path. `04-controls` was the earlier numbering of release's own folder and has no place here.

## Owner questions

1. Answered by the Owner, and corrected: it is an engineering control and it controls the layout of `packages/`, so it sits at `packages/02-controls/`, beside `packages/AGENTS.md`. See "Where the control sits".
2. The split: is it the three ratchets you meant, with one control for the desired setup and a baseline of current gaps for each, and one source per Skill across all three?

## Not in this Change

No migration of any package, no WIRE, no ruleset, no required check, no preventive mode, no publication, and none of controls 2 to 4.
