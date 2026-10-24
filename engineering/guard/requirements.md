# Guard: Requirements (what)

Each obligation names, in brackets, the Intent outcomes it serves. Architecture and the planned tests trace back to these identifiers.

## Functional (F)

**F1 Check list.** [I1] A repository lists its checks in `guard.json`, under `checks`, keyed by a stable name. Each check gives a `command`, where it runs (`runs`: `local`, `ci` or both), and optionally the facts it needs (`facts`), a trusted checker file (`trusted`, F7) and named outcomes for further exit statuses (`outcomes`, F2).

```json
{
  "checks": {
    "unit": { "command": "node --test", "runs": ["local", "ci"] },
    "lineage": { "command": "node engineering/github/lineage.ts", "runs": ["ci"], "facts": ["base", "head"], "trusted": "engineering/github/lineage.ts", "outcomes": { "4": "held" } }
  }
}
```

**F2 Verdicts.** [I2] A check's exit status is its verdict: `0` pass, `1` fail, `2` cannot judge, `3` not applicable. Any other status is cannot judge, unless the check declares a named outcome for it. The only named outcome is `held`: shown as held, never as a pass and never as a fail. A check owns its diagnostics: its own output goes, unchanged and as it runs, to the hook's terminal or the CI log, and Guard neither captures nor interprets it. Guard prints each verdict by its own name, one line per check, as `<verdict>: <check>: <evidence>`, where the evidence is the check's exit status (with the trusted checker's provenance, F7), and never collapses one verdict into another. A fail or cannot-judge line is followed by an indented `do: <next step>` line (N4).

**F3 One runner.** [I2, I3] The same runner and the same list serve both the hook and CI.

**F4 Local hook.** [I2, I3] `pre-push` runs the `local` checks. Fail and cannot judge block the push. `--no-verify` skips the hook once, and the hook says that CI decides.

**F5 CI gate.** [I2, I3] Each `ci` check runs in a named CI job that the repository can make required.
- Fail and cannot judge fail the job.
- Not applicable lets the job succeed, reported as not applicable in a notice and in the step summary, never as a pass.
- Held lets the job succeed, with a warning naming the check as held; the hold's explanation is in the check's own output in the log.

**F6 Narrow adapters.** [I3] The hook and the workflow jobs pass facts and act only on verdicts.

**F7 Trusted checker.** [I1, I2] A check can name a `trusted` file or directory. The runner then takes exactly those files as the target revision (`base`) holds them, never the candidate's version, and runs them in place of the candidate's, so a candidate cannot certify itself.
- Guard establishes Git provenance only. The verdict's evidence names the base commit that supplied the checker's files.
- What the checker imports from elsewhere, its interpreter and its environment are outside Guard's guarantee. They belong to the environment the check runs in.
- When the base or the designated files on it cannot be obtained, or no word of the command names the trusted path, the check is cannot judge.

**F8 Safe lifecycle.** [I5, I6]
- The package provides `init`, `upgrade` and `remove`.
- Guard writes a file only where none exists. It records each file it writes, with its SHA-256, in `guard.json` under `managed`.
- `upgrade` replaces only managed files that are unmodified.
- `remove` deletes only managed files that are unmodified, and unsets `core.hooksPath` only if Guard set it and recorded that.
- A pre-existing hook, workflow or `core.hooksPath` is never overwritten. Guard reports it and prints the one line to add.
- A modified managed file is left in place and reported.
- An External delivery follows the same rule for the target's existing files.

**F9 Execution contract.** [I2] A `command` is a program and its arguments, written as words separated by spaces, with double or single quotes grouping a word. It has no shell features: no pipes, redirection, variables or comments. The program is started directly. On Windows a `.cmd` or `.bat` program, such as npm, runs only under `cmd`, so each of its words is quoted, and a word holding a character `cmd` reads as syntax (`" & | < > ^ % !`) is cannot judge. An adapter supplies facts to `kaal-guard run` as `--head`, `--base`, `--base-ref` and `--changed <file>`. A check runs as a command, from the repository root, with no stdin. It receives only these facts, as environment variables, when the adapter supplied them:
- `GUARD_HEAD`, the candidate commit;
- `GUARD_BASE` and `GUARD_BASE_REF`, the target commit and its name;
- `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.

Guard does not tell a check where it is running. Equal facts, the same tree, the same command and the same tool versions give the same verdict. A local base from a stale fetch is a different fact, so the verdict may legitimately differ; the hook prints the base it used.

**F10 No silent gate.** [I2, I4] Missing verification never satisfies a gate.
- A command that cannot start is cannot judge.
- A fact a check declares and does not receive is cannot judge.
- A check that is not in `guard.json` is cannot judge.
- A `ci` check that no workflow job declares fails Guard's consistency check, `kaal-guard verify`, which runs in CI as the job `Guard`. `verify` checks only Guard's own integration contract: a check is declared when a workflow job invokes it in Guard's declared form ([Run](run.md#verify)), read deterministically from the workflow files; Guard infers nothing from scripts or other YAML. Declared integration is all `verify` claims. That GitHub ran the check is CI execution evidence, and that GitHub requires it is repository governance.

**F11 Package code update.** [I5] Changing the installed version, through the consumer's dependency and lockfile, changes Guard's code and nothing in the repository. It rewrites no managed asset, no entry of `guard.json` and none of the consumer's checks.

**F12 Asset upgrade.** [I5] `upgrade` moves each unmodified managed asset to the installed version's content. It keeps each modified asset and every file Guard did not write, and it never changes `checks` or any other consumer entry of `guard.json`. It reports each file as upgraded, current or kept.

**F13 New assets.** [I5] An asset the installed version manages, which the repository does not have and `guard.json` does not record, is installed by `upgrade` under `init`'s rule (only where no file exists) and recorded under `managed`.

**F14 Writer version.** [I5] `guard.json` records the package version that wrote its managed assets, and `upgrade` reports the version it moves them from and to.

**F15 Older configuration.** [I5] A `guard.json` written by an earlier published version is read by a later one with the same meaning, or refused as cannot judge with a reason and a next step. It is never silently reinterpreted.

**F16 Rollback.** [I5] Installing an earlier published version and running `upgrade` returns each unmodified managed asset to that version's content, and moving forward again works the same way. Modified and consumer-owned files are untouched both ways.

**F17 Existing integration.** [I1, I5] Adoption is not upgrade. When a repository's checks already run through Guard from its own hook and workflows, `init` adds no managed asset that duplicates that integration. It installs the workflow only for `ci` checks that no existing workflow job declares, and never with a job name an existing workflow already uses. It reports the existing integration as executed by Guard but not managed. Guard never takes ownership of a file it did not write. A consumer that wants a managed surface removes its own file, runs `init`, and undoes that through Git.

**F18 Consumer bytes.** [I1, I5] Guard writes only its own entries of `guard.json`, `managed` and `config`. Every other byte stays as the consumer wrote it, and `init` followed by `remove` leaves `guard.json` as it was.

F13–F15, F17 and F18 state obligations the published lifecycle may not meet. Whether it does is evidence the consumer acceptance (A12) produces: a suspected Defect is established only by the Test Case that proves it RED ([Testing](testing.md#defects)). It is not assumed here.

## Nonfunctional (N)

- **N1** [I4, I5] Linux, macOS and Windows. The hook is POSIX `sh`; the runner runs on Node LTS.
- **N2** [I2] Deterministic: no network, no clock dependence and no polling of GitHub.
- **N3** [I5] No state beyond the repository and `core.hooksPath`.
- **N4** [I2, I5] Every fail or cannot-judge verdict says what to do next.
- **N5** [I6] An External delivery is a handful of readable files that the target can maintain on its own, with no KAAL element in them.
- **N6** [I5] The Embed package depends on no other KAAL element, of any kind, and is published to npm as `@kaihacksai/kaal-guard`, under the Owner's npm scope, first as `@kaihacksai/kaal-guard@0.0.1`. Its command is `kaal-guard`. It is published only with the Owner's authorization.
- **N7** [I4] Adopting Guard in KAAL keeps every check identity, OS matrix entry and the coverage of KAAL's existing CI.
- **N8** [I4, I5] KAAL's development dependency stays `file:packages/kaal-guard`, and KAAL's hook, workflows and `guard.json` stay KAAL's own. A published version is accepted as a consumer would use it only in a disposable clone of KAAL (A12), never by switching KAAL's own dependency.
- **N9** [I5] Consumer acceptance evidence names its candidate's source: `packed`, the package at a commit before publication, which is simulated; or `registry`, the published version with its registry integrity. Only `registry` evidence counts toward a Release. Neither claims anything about KAAL's real GitHub enforcement.
