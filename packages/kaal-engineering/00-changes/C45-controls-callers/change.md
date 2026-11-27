# C45 change

Asked by Controls (27 Nov, C160) and started by the coordinator on the Owner's choice "library only, callers move later". To keep npm unblocked, Controls keeps today's file-reading scripts as deprecated shims outside the published files until these callers are on main.

## The callers found on main

| Caller | What it does today | Moves to |
| --- | --- | --- |
| `codeql.yml`, step "Judge the findings" (two jobs) | `judge-mode.mjs --mode preventive --findings F` | `judge-run.mjs`, same arguments |
| `verify-workflow-names.yml`, step "Judge the findings against the accepted baseline" | `judge-mode.mjs --mode ratchet --findings F --baseline B --previous P` | `judge-run.mjs`, same arguments |
| the Controls Case T778 and the Controls check | `check-controls.mjs DIR [--records R]` walks DIR | `check-run.mjs DIR [--records R]` |
| evidence | `evidence.mjs` reads records from a path | `evidence-run.mjs` |
| registry | `registry.mjs` reads Git (`filesAt`) | `registry-run.mjs` |

Controls named five callers; a search of the repository finds exactly these and no more. Anything Controls finds beyond them is a new row here.

## The entry points

Plain `.mjs` in `13-source/controls/` of this package, each doing only what the script did, nothing more:

1. `hosting-files.mjs`: the one place that reads. `filesOf(dir)` turns Hosting's `list` and `read` into `{path, text}` entries with `/`-separated repository-relative paths and the same name filter the scripts apply today (`node_modules`, `.git`). `recordsOf(path)` and `jsonOf(path)` use `readFile`. `entriesAt(repo, ref)` uses `readRevision`. It imports no file system, process, path or operating system module.
2. The five runners call `filesOf`, `recordsOf`, `jsonOf` or `entriesAt`, then call the controls function that exists today (`checkControls`, `findControls`, `judgeEvidence`, `registryAt`, `judgeMode`) and print and exit exactly as the script does. Argument forms and exit codes are unchanged, so a caller changes one path in one command line.
3. The workflow sources `13-source/workflows/codeql.yml` and `13-source/workflows/verify-workflow-names.yml` call `judge-run.mjs` instead of the controls script. Each is a source in this Change and a separate WIRE with its own Owner go. No ruleset changes.

## Design questions, with recommendations

1. **How a trusted workflow gets Hosting. Decided (coordinator, CTO side).** Both workflows run from the default branch with no install, and Hosting's `dist` is not committed. The judging jobs add `npm ci --ignore-scripts` and a build of Hosting, on the trusted checkout and its committed lockfile only, so the job still runs nothing from the head. The jobs use the npm cache so the added cost stays well under a minute. The alternative, a built `judge-run` published by Release, is not taken. Each workflow WIRE still needs its own Owner go.
2. **What Controls exports. Confirmed by Controls (#2842).** The library `scripts/lib/evidence.mjs` exports `parseRecords(text)`. `registryAt(files, station)` already takes `{path, text}` entries, which the runners build from what Hosting reads; Controls adds no `filesAt`. Library functions keep their names, inputs and outputs. The old paths stay as deprecated shims with today's command lines and exit codes until these entry points are on main, so no caller breaks first. The runners import from `scripts/lib/<same name>.mjs` once #2842 and its DO are on main, and until then `hosting-files.mjs` parses records itself (one line to delete).
3. **Line endings.** Controls C160 asks Hosting to hand over text it need not normalise. The runners pass Hosting's text through untouched. If the Cases show `\r\n` reaching a control on Windows, that is a Hosting gap, and this Change reports it and does not patch it.
4. **Order.** Recommend the entry points and the two workflow sources first, the two WIREs after each Owner go, then Controls drops the reading. No WIRE is authorized by this PLAN.

## What this Change pins (Cases, plain `.test.mjs`)

- T1620: `hosting-files.mjs` and the five runners import no file system, process, path or operating system module and import Hosting.
- T1621: each runner calls the controls function it replaces the script's CLI for, and passes the file reads through `hosting-files.mjs`.
- T1622: `check-run.mjs` over `engineering/controls` prints the same lines and exits with the same code as `check-controls.mjs` does, so the move changes no verdict. It is the Controls Case's own folder, so no fixture is invented.
- T1623: the workflow sources call `judge-run.mjs` with the same `--mode` and file arguments they passed to `judge-mode.mjs`, and no longer call the controls script.
- T1624: apart from those lines and the install and build steps, each workflow source is the live workflow, so no job, permission, trigger or check name changes.

T1620 to T1623 are RED until the DO writes the sources. T1624 is a guard and is GREEN today (the sources equal the live workflows); it turns RED if the DO changes anything beyond the judge calls and the install steps.

## Not in this Change

A WIRE, a ruleset change, and any edit to the controls Skill (Controls C160 does that after these callers are on main).

## Amendment: the Cases of F93 and F95

The first DO changed the two workflow sources, and two existing Cases pin them: T1412 of F93 and T1417 of F95. The PLAN did not name them, because the lane that found the callers did not run every Case of the capability, so they went RED and hold Act on the ACT named them. This amendment, in its own PR before any further DO, changes what they expect and nothing else:

- T1412: each gate job installs Hosting (`npm ci --ignore-scripts -w @kaihacksai/kaal-hosting`) and builds it first, then runs its judge, then `judge-run` in preventive mode in place of `judge-mode`.
- T1417: Hosting is installed and built before the judge, and `judge-run` in ratchet mode replaces `judge-mode`, with the same baseline arguments.
- F93 and F95 say the same in words.

Every other Case of the capability is GREEN with these two; removing the build step from `codeql.yml` turns T1412 RED. This authorizes no WIRE, flag or ruleset.
