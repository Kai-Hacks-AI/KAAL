# change/C12 evidence (PLAN)

Run on Node 24.22.3, from the repository root, at the PLAN head on top of `main` (104b17e).

## RED on `main` plus the PLAN files

`node --test packages/kaal-change/00-changes/C12-change-folder/T*.red.mjs packages/kaal-change/0[1-3]-*/**/T10[5-6]*.red.mjs`: 10 Cases, 0 pass, 10 fail. Each fails on a behavioural or existence assertion:

| Case | Tests | Why it fails today |
| --- | --- | --- |
| T1052 | G4 | `capability/Change-Record.md` does not state act.md or the change kinds; no folder control ships |
| T1053 | C12 | this folder still holds unwired `.red.mjs` Cases (the DO is not done) |
| T1054 to T1059, T1061 | I26, F53, F54, F55 | the folder control is absent: `skills/kaal-change/scripts/folder-control.mjs` |
| T1060 | A26 | the folder control is absent |

## Each Case can pass

In a scratch copy of the package with the DO applied by hand (the draft moved to `skills/kaal-change/scripts/folder-control.mjs`, a stub `folder-control-cli.mjs` that names `@kaihacksai/kaal-hosting`, two sentences added to `capability/Change-Record.md`, one line to `SKILL.md`, the Cases renamed to `.test.mjs`): T1052 to T1060 pass, 9 of 10.

T1061 stays RED there, correctly: the repository on `main` holds 11 Cases of the wrong orientation, all in release-management (C26: T206, T208; C27: T281, T282, T284; C56: T732 to T735; C66: T862, T863). It turns GREEN only after release's migrations are on `main`, which is why the DO waits for them. The control, run on `main` alone, reported exactly those 11 and nothing the other way.

## Existing Cases

`node --test packages/kaal-change/test/*.test.mjs` gives the same result with and without the PLAN files: 28 pass, 5 fail (the 5 are not touched by this PLAN). The PLAN adds no file that the package ships.

## Not shown

- The wrapper `folder-control-cli.mjs` and its Git access through Hosting: T1060 checks them, the DO writes them.
- Guard running this Change's `kaal-guard.json`: `main` has no discovery yet (it is on `kaal/guard/registration`). The file is inert here.

## CPO clarification (review on #1960): ACT admission and the deleted registration

Read at `main` 104b17e; no live setting was read.

1. **Where ACT admission requires green today.** The ACT template (`engineering/release-management/05-src/wiring/templates/act.md`, step 4) says the merge "requires the 4L retrospective recorded and green checks", but its architecture, release/A29, is a "directive control ... enforces nothing". The mechanism is the ruleset of the target: an ACT pull request into `kaal/**` is held by the old integration ruleset (24952357, captured in `release/C34-ruleset-set-1/baseline-old.json`): 14 required checks (Change Isolation, Hosting x3, Workspaces, Branching, Acceptance, Engineering, Promotion Source, CodeQL x2, Guard x3), `strict` up to date, one approval. The new `integrating`/`collecting` source requires only `verify Stages`. Nothing in either identifies a pull request as an ACT or requires the DO's checks to have been green before it; what is required is that the ACT's own head is green.
2. **What the ACT head's CI runs of this Change.** Engineering's cases sweep (`engineering/cases/cases.test.mjs`) runs every `T<n>.test.mjs` under `engineering/*/00-changes` forever, so there a deregistration removes nothing. For `packages/`, no lane names the element or Change Cases of `kaal-change` today (`test:collector` is not in CI); Guard registration is how they run once discovery is on `main`. There, the deleted registration is the only thing that ran the Change's Cases.
3. **The gap, shown.** `demo/transcript.txt`, section "ACT gap": after the DO a later merge into the collector breaks only the change-oriented Case (a lib-only change, which does not select the Change's check). The ACT pull request then adds `act.md` and deletes the registration. Guard on the ACT diff and on a `--full` run both pass, because the check is no longer in the tree. Replayed at the ACT head, the same command fails.
4. **The smallest answer, no new mechanism.** `act.md` stays the closure signal and Guard stays lifecycle-agnostic. The retirement control derives the retiring commands from the deleted registration (`retiring`, read from the state before) and its wrapper can replay them at the head (`--replay`). That makes the check being retired green in the ACT's own final CI. It does not re-judge the rest of CI, add a status or an evidence file, or ask admission to do more. If admission already guarantees the Change's Cases at the ACT head by other means, the replay is redundant and the control can drop it; T1059 and T1060 would then lose their two assertions.
