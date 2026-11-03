# Guard: Limitations

What Guard does not establish, the Defects that reached a published version, and the Defects found before a release. The obligations they concern are in [Requirements](requirements.md).

## What Guard does not establish

- **That a check is unchanged.** Guard runs the checks a repository declares and reports their verdicts. It does not establish that a check or a Test Case it runs is unchanged since the repository accepted it: a changed test can still return pass, and that pass is not a guarantee from Guard. Review changes to checks and Test Cases as any other change, and use `trusted` where a checker must come from the base commit (guard/F7).
- **What a trusted checker depends on.** Guard establishes Git provenance of the trusted files only. What the checker imports from elsewhere, its interpreter and its environment are outside Guard's guarantee (guard/F7).
- **A candidate that changes Guard itself.** Under GitHub's `pull_request`, the candidate also supplies Guard's workflow and the installed Guard. Guard cannot defend against a candidate that changes them; that protection is the repository's review rule for `.kaal/config/guard/` and `.github/` (guard/F7).
- **That GitHub ran or requires a check.** `kaal-guard verify` shows declared integration only. That a check ran is the evidence of its CI job, and that a merge requires it is the repository's branch protection or rulesets (guard/F10).
- **What the pushed commit holds.** The hook judges the working tree, not the pushed commit. On `pull_request`, CI checks judge GitHub's merge commit, not the commit `head` names.
- **Equal verdicts on unequal facts.** A local base from a stale fetch is a different fact, so the hook's verdict may differ from CI's; the hook prints the base it used (guard/F9).
- **Native discovery of the Skill by every agent.** Some agents discover `.agents/skills/` natively; others reach the Skill only through the reminder line or a pointer the repository adds (guard/F24, guard/N10).
- **What `verified` does not establish.** Provenance of the installed bytes, behaviour no case covers, changes outside the comparison and the repository's integration (guard/F33–guard/F36, and "What `verified` establishes, and its limits" in [Requirements](requirements.md)).

## Defects in published versions

A Defect is a durable statement of behaviour Guard must not show: a negative Requirement. A Test Case tests it and says so in its title, beside the Requirement it verifies. "Tested by" is derived from those titles and is never written on its own. Each case is named under its realization:
- **delivered**: in this package, and run by your installation's `npm test`;
- **publisher**: a Guard case that only the publisher runs, against a packed candidate, allocated in [Testing](testing.md); your run never reports it as passed;
- **retired**: a case retired with `0.0.1` that no longer runs, kept as historical evidence.

An observed RED established the Defect in the version named. An observed GREEN evidences its correction from that version, within the case's scope. A later GREEN never erases a RED, and a Defect has no status.

| Defect | Prohibited behaviour | Tested by | Observed in Test Runs |
| --- | --- | --- | --- |
| guard/D1 | `upgrade` must not skip an asset the installation record does not list: an asset the repository lacks is installed and recorded (guard/F13) | retired: guard/T38 | RED in `0.0.1` (guard/T38, `packed`, Linux); its case was retired with `0.0.1`, so no GREEN is observed against it |
| guard/D2 | the record must not omit the version that wrote each asset, and `upgrade` must name the versions (guard/F14) | retired: guard/T39 | RED in `0.0.1` (guard/T39, `packed`, Linux); its case was retired with `0.0.1`, so no GREEN is observed against it |
| guard/D3 | `init` must not judge existing integration by path, adding a workflow that duplicates the repository's own jobs (guard/F17) | publisher: guard/T43 | RED in `0.0.1` (guard/T43, `packed`, Linux); GREEN from `0.0.2` (guard/T43, publisher) |
| guard/D5 | the base copy of a trusted checker must not lose the mode the base records, so that an executable checker run as `./checker.sh` cannot start (guard/F7) | delivered: guard/T81 | RED in `0.0.1` (guard/T81); GREEN from `0.0.2` (guard/T81) |
| guard/D16 | Guard must not read a trusted check's declaration from the candidate, which lets a candidate drop `trusted`, rewrite the command or delete the declaration and pass (guard/F7) | delivered: guard/T94, guard/T95, guard/T96 | RED in `0.0.2` (guard/T94–guard/T96); GREEN from `0.0.3` (guard/T94–guard/T96) |
| guard/D17 | the package's own `npm test` must not run a retired suite (guard/N6) | publisher: guard/T98 | RED in `0.0.2` (guard/T98); GREEN from `0.0.3` (guard/T98, publisher) |

`0.0.2` is a deliberate breaking change from `0.0.1`, not a defect: there is no migration, no dual format and no rollback across it (guard/I5). The release notes in the README say how a `0.0.1` repository sets `0.0.2` up.

Up to `0.0.3`, `npm explore @kaihacksai/kaal-guard -- npm test` ran no tests and exited 0. Consumer verification (guard/F31–guard/F36) replaces it from `0.0.4`.

## Defects found before a release

These Defects were found by the publisher's release review in a candidate, and corrected before that version was published. No published version shipped them, so a consumer could not have installed them. Each is a Defect all the same: a durable prohibition, tested by a case that cites it in its title, with its RED kept as the evidence that established it. "Tested by" is derived as above.

An observation names its result, the candidate it concerns, and the Test Run that made it: the pull request that recorded it. It claims no published version for a RED. It claims an environment or a commit only where the publisher recorded one, and for these it recorded none. A later GREEN is added beside a RED and never replaces it, and a Defect has no status.

| Defect | Prohibited behaviour | Tested by | Observed in Test Runs |
| --- | --- | --- | --- |
| guard/D6 | a declaration that is a symbolic link, or a directory named `<name>.md`, in the configuration directory must not be skipped, so that a failing check vanishes and the run passes (guard/F28) | delivered: guard/T84 | RED in the `0.0.2` candidate (guard/T84, #433); GREEN from `0.0.2` (guard/T84, #451) |
| guard/D7 | Git must not rewrite the hook, the workflow and the Skill Guard installed to CRLF under `core.autocrlf=true`, so that the hook fails under `sh` and `upgrade` and `remove` call Guard's own files modified (guard/F27, guard/F29) | delivered: guard/T85 | RED in the `0.0.2` candidate (guard/T85, #433); GREEN from `0.0.2` (guard/T85, #451) |
| guard/D8 | where `core.fileMode` is `false`, the hook must not be committed without its executable bit, so that other clones never run it (guard/F4) | delivered: guard/T86 | RED in the `0.0.2` candidate (guard/T86, #433); GREEN from `0.0.2` (guard/T86, #451) |
| guard/D9 | Guard's workflow must not use unpinned actions built for Node 20, and must not put `github.base_ref` into a `run:` line as shell (guard/F5) | delivered: guard/T87 | RED in the `0.0.2` candidate (guard/T87, #433); GREEN from `0.0.2` (guard/T87, #451) |
| guard/D10 | a registered asset the repository lost must not stay lost: `init --hook` must reinstall the hook and `upgrade` the Skill, and `core.hooksPath` must not stay set with no hook to run (guard/F8, guard/F13) | delivered: guard/T88 | RED in the `0.0.2` candidate (guard/T88, #433); GREEN from `0.0.2` (guard/T88, #451) |
| guard/D11 | an unreadable workflow entry must not make `verify` fail (exit 1) with a stack trace instead of cannot judge (guard/F10, guard/F17) | delivered: guard/T89 | RED in the `0.0.2` candidate (guard/T89, #433); GREEN from `0.0.2` (guard/T89, #451) |
| guard/D12 | `remove --config <dir>` must not delete that directory when it is empty, inside or outside the repository (guard/F8) | delivered: guard/T90 | RED in the `0.0.2` candidate (guard/T90, #433); GREEN from `0.0.2` (guard/T90, #451) |
| guard/D13 | an `outcomes` key written with a leading zero, a sign or above 255 must not be accepted: it never matches the exit status it names (guard/F2, guard/F18) | delivered: guard/T91 | RED in the `0.0.2` candidate (guard/T91, #433); GREEN from `0.0.2` (guard/T91, #451) |
| guard/D14 | an older Git must not be accepted: without `--show-scope`, `init --hook` may set a local `core.hooksPath` over a global one (guard/N1) | delivered: guard/T92 | RED in the `0.0.2` candidate (guard/T92, #433); GREEN from `0.0.2` (guard/T92, #451) |
| guard/D18 | with `run --ci` or `run --hook`, a candidate that changes a trusted check's `runs` so that it no longer names that surface must not remove the check from the run unjudged, so that the run can pass (guard/F7) | delivered: guard/T100 | RED in the `0.0.3` candidate (guard/T100, #505); GREEN from `0.0.3` (guard/T100, #505) |
