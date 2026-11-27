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

1. **How a trusted workflow gets Hosting.** Both workflows run from the default branch with no install, and Hosting's `dist` is not committed. A runner that imports Hosting needs `npm ci --ignore-scripts` and a build of Hosting in the job. Recommend adding those two steps to the judging jobs: the lockfile is committed and the checkout is the trusted one, so the job still runs nothing from the head. It costs about a minute a job and widens the job's dependencies to Hosting's; if the Owner prefers no install in a trusted job, the alternative is to publish a built `judge-run` (a Release matter). Owner to choose before the WIRE.
2. **What Controls exports.** The runners need `readRecords`'s parsing as a function of text, not of a path (`parseRecords(text)`), and `filesAt`'s result as `{path, text}`. Recommend Controls export both in C160's DO; until then the runners parse records themselves in `hosting-files.mjs`, and this Change names the line to delete. Controls to confirm.
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
