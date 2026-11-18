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

T1061 stays RED there, correctly: the repository on `main` holds 15 Cases and one document of the wrong orientation, all in release-management (C26: T206, T208; C27: T281, T282, T284; C56: T732 to T735; C66: T862, T863; and, since a Defect is enduring, C67: T870 to T873 and the document D1). It turns GREEN only after release's migrations are on `main`, which is why the DO waits for them. The control, run on `main` alone, reported exactly those 16 findings and nothing the other way.

## Existing Cases

`node --test packages/kaal-change/test/*.test.mjs` gives the same result with and without the PLAN files: 28 pass, 5 fail (the 5 are not touched by this PLAN). The PLAN adds no file that the package ships.

## Not shown

- The wrapper `folder-control-cli.mjs` and its Git access through Hosting: T1060 checks them, the DO writes them.
- Guard running this Change's `kaal-guard.json`: `main` has no discovery yet (it is on `kaal/guard/registration`). The file is inert here.

## CPO review 1 (#1960): ACT admission and the deleted registration

Read at `main` 104b17e; no live setting was read.

1. **Where ACT admission requires green today.** The ACT template (`engineering/release-management/05-src/wiring/templates/act.md`, step 4) says the merge "requires the 4L retrospective recorded and green checks", but its architecture, release/A29, is a "directive control ... enforces nothing". The mechanism is the ruleset of the target: an ACT pull request into `kaal/**` is held by the old integration ruleset (24952357, `release/C34-ruleset-set-1/baseline-old.json`): 14 required checks (Change Isolation, Hosting x3, Workspaces, Branching, Acceptance, Engineering, Promotion Source, CodeQL x2, Guard x3), strict up to date, one approval. The new `integrating`/`collecting` source requires only `verify Stages`. Nothing identifies a pull request as an ACT or requires the DO's checks to have been green earlier; what is required is that the ACT's own head is green.
2. **What the ACT head's CI runs of this Change.** Engineering's cases sweep (`engineering/cases/cases.test.mjs`) runs every `T<n>.test.mjs` under `engineering/*/00-changes` forever, so there a deregistration removes nothing. For `packages/`, no lane names the element or Change Cases of `kaal-change` today (`test:collector` is not in CI); Guard registration is how they run once discovery is on `main`, and the deleted registration is then the only thing that ran the Change's Cases.
3. **The gap, shown** (`demo/transcript.txt`, "ACT gap"). After the DO a later merge breaks only the change-oriented Case (a lib-only change, which does not select the Change's check). The ACT adds `act.md` and deletes the registration; Guard on the ACT diff and on a `--full` run both pass, because the check is no longer in the tree.

## CPO review 2 (#1960): defects, and verification instead of Case files

1. **A Defect is enduring.** The change kinds are C and G only. A Case in a Change folder that tests a Defect, and a Defect document in a Change folder, are findings; a Defect and its verification live outside, beside the Defect. On `main` that adds C67 (T870 to T873 and `D1-envelope-hotfix-route.md`) to the migration: 15 Cases and 1 document.
2. **Retirement judges continuity of verification, not Case identity.** `judgeRetirement` takes the execution evidence of the run that judged the head, in the shape `assess` already reads (`{ by, evaluations: [{ run, plan, result, cases, findings }] }`, `plan` being the registered check as Guard names it). It runs nothing. For each element the Change touched it requires a Case that claims the element (read at the head) and passed in a counted evaluation of a check that survives; Cases may be moved, renamed, split, consolidated, rewritten or replaced (T1054, T1059 show each). History is the Change's records (non-executable files); executable Cases and helpers are not frozen (T1058). The deleted registration's own checks must be evaluated at the head and not fail, so the deletion cannot hide a failing Change check from the ACT's own final CI. No counted evidence is a finding (cannot judge), never a pass. Producing the evaluations is the run's and Testing's.
3. **Open:** today's CI does not emit per-Case evaluations for `packages/` Cases. The wrapper reads them from a file (`--evidence`); which job produces that file is the instance's decision, and the DO of this Change does not wire it.
