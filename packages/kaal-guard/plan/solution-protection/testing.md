# Solution protection: Testing

The planned outer Cases are in `packages/kaal-guard/test/plan/solution-protection.red.mjs`. Each title names the identifiers it checks. They are immutable to DO and CHECK. The file is `.red.mjs` so that no loop of the shipped manifest picks it up. The DO turns them GREEN, renames it to `.test.mjs`, moves it into `test/acceptance/` and adds them to Guard's manifest. They run the `kaal-guard` command in throwaway Git repositories and use no other KAAL code.

| Case | Checks | Loop |
| --- | --- | --- |
| guard/T1670: `plan` finds a `guard.json` beside a package, lists its `solution` check by id, and builds a matrix with one entry for it | guard/F41, guard/F45, guard/A21, guard/A23 | Requirements |
| guard/T1671: a `package.json` with a `test` script and no registration or `exempt` entry fails `plan`, naming the folder and the line to add; an `exempt` entry with a reason passes; a registered check whose command is not the package's own `npm test` (for example `node -e 0`) fails `plan`, naming the check | guard/F43, guard/F44, guard/A22 | Requirements |
| guard/T1672: a candidate that adds a registration is planned including it; one that removes a baseline registration, or changes its command or aggregates, is cannot judge (exit 2) naming the file and the check; deleting `guard.json` while its `package.json` stays, and removing the `test` script while the package stays, are never planned (cannot judge, or a completeness failure naming the package); the same removal alone in a diff of registration files only is planned, and so is deleting a package's `guard.json` together with its `package.json` (the suite no longer exists) | guard/F42, guard/I11, guard/A21 | Requirements |
| guard/T1673: a missing or unparseable `aggregates.json` on the base is cannot judge, never an empty list; `aggregates: ["delivery"]` and a `.md` declaration with `aggregates` are refused | guard/F43, guard/N17, guard/A21 | Requirements |
| guard/T1674: `fold` fails with no reports, with a missing report (naming the check), with a report that is not success, and with an unexpected extra report, and passes only when the reported set equals the expected set and each is success | guard/F46, guard/N15, guard/A23 | Requirements |
| guard/T1675: `run --check <id> --report` writes a report with the id, aggregates, result, finding, fix hint and registration file; a command that cannot start is recorded as cannot judge and exits non-zero | guard/F48, guard/N15, guard/A24 | Requirements |
| guard/T1676: a failing `fold` writes `guard-report.json` naming the check, the aggregate, the registration file and the next step, and prints the report's path | guard/F48, guard/I12, guard/A24 | Requirements |
| guard/T1678: a report whose run id differs from the plan's, one whose `head` is another revision, one whose executed script differs from the plan's, and one left in the reports directory from an earlier run each fail `fold`, naming the check and the differing member; reports of the plan's run and revision pass | guard/F46, guard/F48, guard/A23 | Requirements |
| guard/T1679: `run` records the run id, the judged `head` and the script it executed, taken from its own arguments and the package's `package.json`, and records `cannot judge` when the command it was given is not the package's `test` script | guard/F44, guard/F48, guard/A24 | Requirements |
| guard/T1742: `run` refuses to judge when the working tree is not the judged revision (another commit, or a changed tracked file), writes a report naming both revisions and runs no suite | guard/F44, guard/F48, guard/A23 | Requirements |
| guard/T1743: an unreadable `package.json` is refused: `plan` is cannot judge naming the file and `run` records cannot judge | guard/F44, guard/N15, guard/A21 | Requirements |
| guard/T1677: the solution template names a fold job `Solution protection` and per-check jobs by id, runs on `pull_request` and `merge_group`, and no per-check job name equals a fold name; `plan`, `run` and `fold` import nothing of Controls, Testing or Core | guard/F47, guard/N16, guard/A25 | Architecture |

## RED evidence

Run with `node --test packages/kaal-guard/test/plan/solution-protection.red.mjs` on Node 24. At `guard/C171` all ten are RED, blocked before behavioural assertion, because the command has no `plan` or `fold` and `run` has no `--report`. The run is outside Guard's own `npm test` until the DO.

## Follow-ups (not this Change)

Each is its own Change and its own go: each capability registers its suite with a `guard.json` (architecture, backlog, controls, defect, engineering, research, retro, guard); the WIRE of the template; the ruleset requiring `Solution protection`; retiring the Workspaces lane after the soak; the `change` and `delivery` aggregates; solution controls as members through their wrapper command.
