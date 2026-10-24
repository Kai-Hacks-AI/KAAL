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

F13–F15, F17 and F18 state obligations the published lifecycle may not meet. Whether it does is evidence the consumer acceptance (A12) produces, as the hypotheses H1–H5 ([Testing](testing.md#consumer-upgrade)). It is not assumed here.

**F19 Guard's Skill.** [I7] Guard has one Agent Skill, `kaal-guard`, that conforms to the Agent Skills standard. It is organized by BASS:
- *Bare*: how to read a verdict line, its `do:` line and the check's own output, with no Skill needed;
- *Agent*: how the repository's agent instruction files may point to the Skill;
- *Skill*: the verdicts and what each asks of the resolver, how to reproduce a check with the same facts (`kaal-guard run --check <name>`), what belongs to the repository and what to Guard, and what never resolves a verdict (editing `guard.json` to silence a check, `--no-verify`, or changing a trusted checker in the candidate);
- *Script*: none. A script is added only when a deterministic step justifies one, and never with a runtime or LLM dependency of its own.

The Skill names no particular consumer and invents no consumer-specific fix.

**F20 Diagnostic content.** [I1, I7] The Skill and the consumer docs recommend what a consumer's failing Test Case prints: the contract it checks, what was expected, what was observed, the evidence, and the next action or the command that reproduces it. This is guidance for people and agents, not a format. Guard parses none of it, and a check that ignores it loses nothing.

**F21 Reminder.** [I7, N4] After the verdict lines of a run that has a fail or cannot judge, Guard adds one line naming the Skill's location, as a path that exists in the repository. In CI it also adds that line to the fail and cannot-judge annotations and to the step summary. A run of only pass, not applicable or held adds nothing. Where no Skill is found, the line says so and names the package's copy of it.

**F22 Unchanged verdicts.** [I1, I2] Adding I7 changes no exit status, no verdict and no verdict line, and it does not change how a check's own stdout and stderr reach the terminal or the log.

**F23 Embed installation.** [I5, I7] The package carries the Skill's source. `init` installs it, as a whole, at its one canonical location (N10), and only where none of its files exists. Each file is recorded under `managed`, and its writer under `writers`. A pre-existing or modified Skill file is kept and reported, and then Guard installs no other file of the Skill. `upgrade` moves unmodified Skill files forward and installs Skill files a consumer lacks (F13). `remove` deletes only unmodified Skill files, and only the directories it leaves empty. Guard never writes or removes another skill beside it, and never copies the Skill into a supplier's own directory. A path inside the package alone does not meet F23.

**F24 Discovery.** [I7] At the canonical location, the installed Skill is a directory named `kaal-guard` holding a `SKILL.md` whose `name` is `kaal-guard`. An agent reaches it in one of two ways, which are reported apart and never claimed as equal:
- *native discovery*: the agent lists and activates the Skill from that directory by itself;
- *instruction-based access*: the reminder (F21), or an instruction pointer the consumer adopts (F26), names the path, and the agent reads it.

Which way a given supplier uses is observed, not asserted (N9).

**F25 External delivery.** [I6, I7] An External delivery puts its own variant of the Skill at the target's canonical location (N10), as part of the same Change. That variant describes the delivered hook and runner, not the package, and it names no KAAL element and no npm package. The target owns it afterwards, and a later update is a new External Change. A Skill already at that location is kept and reported. The delivery writes no supplier directory and no instruction file.

**F26 Agent instruction files.** [I1, I7] Guard never creates, edits or removes `AGENTS.md` or any supplier's instruction file (`CLAUDE.md` and the like). They belong to the consumer, and adapting them to a supplier belongs to CASE Agent, not to Guard. `init` and an External delivery present one optional pointer for the consumer to adopt: a line for `AGENTS.md` that names the canonical Skill path and says when to read it. It is shown only when `AGENTS.md` exists and does not already name that path. Guard proposes nothing for a supplier's file, nothing that points back from the Skill, and nothing that duplicates the Skill.

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
- **N10** [I7] The Skill has one canonical location: `.agents/skills/kaal-guard/`. The Agent Skills standard defines a Skill's directory, not where it lives, and KAAL had no placement convention: its Agent Skills assume no host, and #258 has deployed none. `.agents/skills/` is the cross-agent directory that Codex ([docs](https://learn.chatgpt.com/docs/build-skills)) and GitHub Copilot ([docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills)) discover natively. Claude Code discovers natively only `.claude/skills/` ([docs](https://code.claude.com/docs/en/skills)), so it reaches the canonical Skill by instruction-based access (F24), as recorded in [Testing](testing.md#agent-guidance). No copy is made for any supplier. Changing the location is a PLAN Change.
- **N11** [I7] The Skill adds no runtime dependency. Guard needs no network and no LLM to install it, name it or report it.
