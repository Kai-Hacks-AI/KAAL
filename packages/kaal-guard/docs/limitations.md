# Guard: Limitations

What Guard does not establish, and the defects that reached a published version. The obligations they concern are in [Requirements](requirements.md).

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

A defect is established only by a Test Case that proved it failing. The versions it affects and the version that corrects it are named here.

| Affected | Corrected in | Defect | What happened |
| --- | --- | --- | --- |
| `0.0.1` | `0.0.2` | guard/D1 | `upgrade` skipped every asset the installation record did not list, so an asset the repository lacked was never installed or recorded (guard/F13). |
| `0.0.1` | `0.0.2` | guard/D2 | The record did not hold the version that wrote each asset, and `upgrade` named no versions (guard/F14). |
| `0.0.1` | `0.0.2` | guard/D3 | `init` judged existing files by path, not existing integration by declared check, so it could add a workflow that duplicated the repository's own jobs (guard/F17). |
| `0.0.1` | `0.0.2` | guard/D5 | The base copy of a trusted checker lost the mode the base records, so an executable checker run as `./checker.sh` failed to start and its check was cannot judge (guard/F7). |
| `0.0.2` | `0.0.3` | guard/D16 | Guard read a trusted check's declaration from the candidate, so a candidate that dropped `trusted`, rewrote the command or deleted the declaration could run its own checker, or none, and pass (guard/F7). |
| `0.0.2` | `0.0.3` | guard/D17 | The package's own `npm test` still ran the retired `0.0.1` suite, which failed (guard/N6). |

`0.0.2` is a deliberate breaking change from `0.0.1`, not a defect: there is no migration, no dual format and no rollback across it (guard/I5). The release notes in the README say how a `0.0.1` repository sets `0.0.2` up.

Up to `0.0.3`, `npm explore @kaihacksai/kaal-guard -- npm test` ran no tests and exited 0. Consumer verification (guard/F31–guard/F36) replaces it from `0.0.4`.
