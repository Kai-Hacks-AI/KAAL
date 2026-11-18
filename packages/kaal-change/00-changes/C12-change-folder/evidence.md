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
