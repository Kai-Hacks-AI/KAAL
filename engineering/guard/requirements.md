# Guard: Requirements (what)

Each obligation names, in brackets, the Intent outcomes it serves. Architecture and the planned tests trace back to these identifiers.

## Functional (F)

**guard/F1 Check list.** [guard/I1] A repository lists its checks in `guard.json`, under `checks`, keyed by a stable name. Each check gives a `command`, where it runs (`runs`: `local`, `ci` or both), and optionally the facts it needs (`facts`), a trusted checker file (`trusted`, guard/F7) and named outcomes for further exit statuses (`outcomes`, guard/F2).

```json
{
  "checks": {
    "unit": { "command": "node --test", "runs": ["local", "ci"] },
    "lineage": { "command": "node engineering/github/lineage.ts", "runs": ["ci"], "facts": ["base", "head"], "trusted": "engineering/github/lineage.ts", "outcomes": { "4": "held" } }
  }
}
```

**guard/F2 Verdicts.** [guard/I2] A check's exit status is its verdict: `0` pass, `1` fail, `2` cannot judge, `3` not applicable. Any other status is cannot judge, unless the check declares a named outcome for it. The only named outcome is `held`: shown as held, never as a pass and never as a fail. A check owns its diagnostics: its own output goes, unchanged and as it runs, to the hook's terminal or the CI log, and Guard neither captures nor interprets it. Guard prints each verdict by its own name, one line per check, as `<verdict>: <check>: <evidence>`, where the evidence is the check's exit status (with the trusted checker's provenance, guard/F7), and never collapses one verdict into another. A fail or cannot-judge line is followed by an indented `do: <next step>` line (guard/N4).

**guard/F3 One runner.** [guard/I2, guard/I3] The same runner and the same list serve both the hook and CI.

**guard/F4 Local hook.** [guard/I2, guard/I3] `pre-push` runs the `local` checks. Fail and cannot judge block the push. `--no-verify` skips the hook once, and the hook says that CI decides.

**guard/F5 CI gate.** [guard/I2, guard/I3] Each `ci` check runs in a named CI job that the repository can make required.
- Fail and cannot judge fail the job.
- Not applicable lets the job succeed, reported as not applicable in a notice and in the step summary, never as a pass.
- Held lets the job succeed, with a warning naming the check as held; the hold's explanation is in the check's own output in the log.

**guard/F6 Narrow adapters.** [guard/I3] The hook and the workflow jobs pass facts and act only on verdicts.

**guard/F7 Trusted checker.** [guard/I1, guard/I2] A check can name a `trusted` file or directory. The runner then takes exactly those files as the target revision (`base`) holds them, never the candidate's version, and runs them in place of the candidate's, so a candidate cannot certify itself.
- Guard establishes Git provenance only. The verdict's evidence names the base commit that supplied the checker's files.
- What the checker imports from elsewhere, its interpreter and its environment are outside Guard's guarantee. They belong to the environment the check runs in.
- When the base or the designated files on it cannot be obtained, or no word of the command names the trusted path, the check is cannot judge.

**guard/F8 Safe lifecycle.** [guard/I5, guard/I6]
- The package provides `init`, `upgrade` and `remove`.
- Guard writes a file only where none exists. It records each file it writes, with its SHA-256, in `guard.json` under `managed`.
- `upgrade` replaces only managed files that are unmodified.
- `remove` deletes only managed files that are unmodified, and unsets `core.hooksPath` only if Guard set it and recorded that.
- A pre-existing hook, workflow or `core.hooksPath` is never overwritten. Guard reports it and prints the one line to add.
- A modified managed file is left in place and reported.
- An External delivery follows the same rule for the target's existing files.

**guard/F9 Execution contract.** [guard/I2] A `command` is a program and its arguments, written as words separated by spaces, with double or single quotes grouping a word. It has no shell features: no pipes, redirection, variables or comments. The program is started directly. On Windows a `.cmd` or `.bat` program, such as npm, runs only under `cmd`, so each of its words is quoted, and a word holding a character `cmd` reads as syntax (`" & | < > ^ % !`) is cannot judge. An adapter supplies facts to `kaal-guard run` as `--head`, `--base`, `--base-ref` and `--changed <file>`. A check runs as a command, from the repository root, with no stdin. It receives only these facts, as environment variables, when the adapter supplied them:
- `GUARD_HEAD`, the candidate commit;
- `GUARD_BASE` and `GUARD_BASE_REF`, the target commit and its name;
- `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.

Guard does not tell a check where it is running. Equal facts, the same tree, the same command and the same tool versions give the same verdict. A local base from a stale fetch is a different fact, so the verdict may legitimately differ; the hook prints the base it used.

**guard/F10 No silent gate.** [guard/I2, guard/I4] Missing verification never satisfies a gate.
- A command that cannot start is cannot judge.
- A fact a check declares and does not receive is cannot judge.
- A check that is not in `guard.json` is cannot judge.
- A `ci` check that no workflow job declares fails Guard's consistency check, `kaal-guard verify`, which runs in CI as the job `Guard`. `verify` checks only Guard's own integration contract: a check is declared when a workflow job invokes it in Guard's declared form ([Run](run.md#verify)), read deterministically from the workflow files; Guard infers nothing from scripts or other YAML. Declared integration is all `verify` claims. That GitHub ran the check is CI execution evidence, and that GitHub requires it is repository governance.

**guard/F11 Package code update.** [guard/I5] Changing the installed version, through the consumer's dependency and lockfile, changes Guard's code and nothing in the repository. It rewrites no managed asset, no entry of `guard.json` and none of the consumer's checks.

**guard/F12 Asset upgrade.** [guard/I5] `upgrade` moves each unmodified managed asset to the installed version's content. It keeps each modified asset and every file Guard did not write, and it never changes `checks` or any other consumer entry of `guard.json`. It reports each file as upgraded, current or kept.

**guard/F13 New assets.** [guard/I5] An asset the installed version manages, which the repository does not have and `guard.json` does not record, is installed by `upgrade` under `init`'s rule (only where no file exists) and recorded under `managed`.

**guard/F14 Writer version.** [guard/I5] `guard.json` records, for each managed asset, the Guard version whose content last wrote it or confirmed it unchanged, whichever installer did so. `upgrade` reports, for each asset, the version it moves it from and to. An asset with a recorded hash and no recorded version was written by `0.0.1`, the only published version that recorded none. A modified asset keeps the version that last wrote it, so assets of different versions can coexist.

**guard/F15 Older configuration.** [guard/I5] A `guard.json` written by an earlier published version is read by a later one with the same meaning, or refused as cannot judge with a reason and a next step. It is never silently reinterpreted.

**guard/F16 Rollback.** [guard/I5] Installing an earlier published version and running `upgrade` returns each unmodified managed asset to that version's content, and moving forward again works the same way. Modified and consumer-owned files are untouched both ways.

**guard/F17 Existing integration.** [guard/I1, guard/I5] Adoption is not upgrade. When a repository's checks already run through Guard from its own hook and workflows, `init` adds no managed asset that duplicates that integration. Guard recognizes existing integration only through its own declared integration contract, read exactly as `verify` reads it ([Run](run.md#verify)): a job declares a `ci` check with a step that runs `kaal-guard run --check <name>` in the declared form, and a job declares the consistency check with a step whose whole `run:` value is `kaal-guard verify`, `npx kaal-guard verify` or `npx --no kaal-guard verify`, optionally followed by `--github`. The workflow Guard installs carries a job only for a `ci` check that no other workflow declares, and the `Guard` job only when no other workflow declares the consistency check. When neither remains, `init` installs no workflow. Guard reads nothing else in a workflow: not job names, triggers, matrices or scripts. A job of the consumer's that runs a check in any other form is not recognized, so the consumer either writes the step in the declared form or keeps Guard's job. `init` reports each recognized declaration as `executed by Guard, not managed: <check> in job <key> of <file>`, and records nothing for it. Guard never takes ownership of a file it did not write. A consumer that wants a managed surface removes its own file, runs `init`, and undoes that through Git.

**guard/F18 Consumer bytes.** [guard/I1, guard/I5] Guard writes only its own entries of `guard.json`: `managed`, `config` and `writers`, the version guard/F14 records for each managed asset. Every other byte stays as the consumer wrote it, and `init` followed by `remove` leaves `guard.json` as it was.

guard/F13–guard/F15, guard/F17 and guard/F18 state obligations the published lifecycle may not meet. Whether it does is evidence the consumer acceptance (guard/A12) produces: a suspected Defect is established only by the Test Case that proves it RED ([Testing](testing.md#defects)). It is not assumed here.

**guard/F19 Guard's Skill.** [guard/I7] Guard has one Agent Skill, `kaal-guard`, that conforms to the Agent Skills standard. It is organized by BASS:
- *Bare*: how to read a verdict line, its `do:` line and the check's own output, with no Skill needed;
- *Agent*: how the repository's agent instruction files may point to the Skill;
- *Skill*: the verdicts and what each asks of the resolver, how to reproduce a check with the same facts (`kaal-guard run --check <name>`), what belongs to the repository and what to Guard, and what never resolves a verdict (editing `guard.json` to silence a check, `--no-verify`, or changing a trusted checker in the candidate);
- *Script*: none. A script is added only when a deterministic step justifies one, and never with a runtime or LLM dependency of its own.

The Skill names no particular consumer and invents no consumer-specific fix.

**guard/F20 Diagnostic content.** [guard/I1, guard/I7] The Skill and the consumer docs recommend what a consumer's failing Test Case prints: the contract it checks, what was expected, what was observed, the evidence, and the next action or the command that reproduces it. This is guidance for people and agents, not a format. Guard parses none of it, and a check that ignores it loses nothing.

**guard/F21 Reminder.** [guard/I7, guard/N4] After the verdict lines of a run that has a fail or cannot judge, Guard adds one line naming the Skill's location, as a path that exists in the repository. In CI it also adds that line to the fail and cannot-judge annotations and to the step summary. A run of only pass, not applicable or held adds nothing. Where no Skill is found, the line says so and names the package's copy of it.

**guard/F22 Unchanged verdicts.** [guard/I1, guard/I2] Adding guard/I7 changes no exit status, no verdict and no verdict line, and it does not change how a check's own stdout and stderr reach the terminal or the log.

**guard/F23 Standalone installation.** [guard/I5, guard/I7] The package carries the Skill's one source, and Guard's own lifecycle installs it without Core, as its installation contract (guard/F27) states: only at `.agents/skills/kaal-guard/`, as a whole, and only where none of its files exists. Every file is recorded under `managed`, with its writer under `writers`. A pre-existing or modified file is kept and reported, and then nothing else of the Skill is installed. `upgrade` moves the unmodified Skill to the installed version's source and installs it where a consumer lacks it (guard/F13). `remove` deletes only unmodified Skill files, and only the directories it leaves empty. Guard never writes or removes another skill beside it, and never writes a supplier-specific location. That is Core enrichment (guard/N12). A path inside the package alone does not meet guard/F23.

**guard/F24 Discovery.** [guard/I7] At the canonical location, the installed Skill is a directory named `kaal-guard` holding a `SKILL.md` whose `name` is `kaal-guard`. An agent reaches it in one of two ways, which are reported apart and never claimed as equal:
- *native discovery*: the agent lists and activates the Skill from that directory by itself;
- *instruction-based access*: the reminder (guard/F21), or an instruction pointer the consumer adopts (guard/F26), names the path, and the agent reads it.

Which way a given supplier uses is observed, not asserted (guard/N9).

**guard/F25 External delivery.** [guard/I6, guard/I7] An External delivery puts its own variant of the Skill at `.agents/skills/kaal-guard/` in the target, as part of the same Change. Where Engineering's delivery tooling uses Core at delivery time, Core adds the deployments the target's declared providers need. Either way the delivered files are plain and self-contained. That variant describes the delivered hook and runner, not the package, and names no KAAL element and no npm package. The target owns it afterwards, and a later update is a new External Change. A Skill already at a location is kept and reported. The delivery writes no instruction file.

**guard/F26 Agent instruction files.** [guard/I1, guard/I7] Guard never creates, edits or removes `AGENTS.md` or any supplier's instruction file (`CLAUDE.md` and the like). They are the consumer's. Standalone, `init` reports the Skill's canonical path and says that an agent which does not discover `.agents/skills/` reaches it through the reminder or a pointer the consumer adds. Provider-specific pointers are Core enrichment (guard/N12). No pointer points back from the Skill, none is circular, and none duplicates the Skill's content.

**guard/F27 Installation contract.** [guard/I5, guard/I6, guard/I7] Guard ships one installer-neutral installation contract, `contract.json` in the package. It states what an installation of Guard is:
- each asset (the hook, the workflow and the Skill): its source in the package, its path in the repository, and its rules (installed only where absent, kept when modified, removed only when unmodified, with the directories that removal empties);
- the ownership record: Guard's own entries of `guard.json` (`managed`, `config` and `writers`), and nothing else;
- the runtime prerequisite, Node 24 or later;
- the provider requirement: an agent resolving a failing verdict reaches the Skill named `kaal-guard`. The canonical deployment and the reminder meet it, and the contract names no other supplier location.

The contract is an instance of Core's Installation Contract: Core owns that Definition, its schema and its outer conformance Test Cases (`core/T1`…, defined in `core/C3`). Guard owns its instance, versioned with the package, and the implementation that realizes it. Guard's standalone lifecycle realizes exactly this instance. Any installer that realizes it, Core among them, leaves a repository that Guard's lifecycle can upgrade and remove, and the reverse. Conformance is verified at engineering time (guard/N12), so the package gains no dependency.

## Nonfunctional (N)

- **guard/N1** [guard/I4, guard/I5] Linux, macOS and Windows. The hook is POSIX `sh`; the runner runs on Node 24 or later from `0.0.2`. Raising the floor from Node 20 is a breaking consumer prerequisite: it is stated in the package's README and in the release's notes, and an older Node is refused with that next step.
- **guard/N2** [guard/I2] Deterministic: no network, no clock dependence and no polling of GitHub.
- **guard/N3** [guard/I5] No state beyond the repository and `core.hooksPath`.
- **guard/N4** [guard/I2, guard/I5] Every fail or cannot-judge verdict says what to do next.
- **guard/N5** [guard/I6] An External delivery is a handful of readable files that the target can maintain on its own, with no KAAL element in them.
- **guard/N6** [guard/I5] The Embed package depends on no other KAAL element, of any kind, and is published to npm as `@kaihacksai/kaal-guard`, under the Owner's npm scope, first as `@kaihacksai/kaal-guard@0.0.1`. Its command is `kaal-guard`. It is published only with the Owner's authorization.
- **guard/N7** [guard/I4] Adopting Guard in KAAL keeps every check identity, OS matrix entry and the coverage of KAAL's existing CI.
- **guard/N8** [guard/I4, guard/I5] KAAL's development dependency stays `file:packages/kaal-guard`, and KAAL's hook, workflows and `guard.json` stay KAAL's own. A published version is accepted as a consumer would use it only in a disposable clone of KAAL (guard/A12), never by switching KAAL's own dependency.
- **guard/N9** [guard/I5] Consumer acceptance evidence names its candidate's source: `packed`, the package at a commit before publication, which is simulated; or `registry`, the published version with its registry integrity. Only `registry` evidence counts toward a Release. Neither claims anything about KAAL's real GitHub enforcement.
- **guard/N10** [guard/I7] The Skill has one canonical source, `skills/kaal-guard/` in the package, and one standalone deployment, `.agents/skills/kaal-guard/`. Which further deployments and instruction pointers a repository needs is decided only by Core's Agent Realization, when Core manages the installation. As documented: Codex discovers `.agents/skills/` ([docs](https://learn.chatgpt.com/docs/build-skills)), Claude Code discovers natively only `.claude/skills/` ([docs](https://code.claude.com/docs/en/skills)), and GitHub Copilot discovers both ([docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills)). Claude Code's behaviour is also observed (O1). Standalone, Claude Code reaches the Skill through instruction-based access (guard/F24).
- **guard/N11** [guard/I7] The Skill adds no runtime dependency. Guard needs no network and no LLM to install it, name it or report it.
- **guard/N12** [guard/I5, guard/I6, guard/I7] Contract, standalone conformance and Core enrichment are distinct, and are not required to be feature-equivalent:
  - the contract: Core owns the Installation Contract Definition, schema and outer conformance Test Cases; Guard owns its instance, `contract.json` (guard/F27);
  - standalone conformance is Guard's own lifecycle, which guarantees local correctness within the instance, with no KAAL dependency;
  - Core enrichment is Core's realization of the same instance, through Hosting where Core chooses. It adds CASE registration, provider-aware deployments and pointers, dependency and conflict handling and cross-Capability verification. Core keeps its additional deployments in its own record, and Guard's lifecycle never touches them.

  KAAL Engineering executes Core's conformance Test Cases against Guard's instance at engineering time, and the evidence is Guard's; the Test Case definitions stay Core's and are not copied. Guard holds no placement table, schema or CASE coordination of its own, and Core holds no Guard asset rule beyond what it reads from the instance. External delivery may use Core and Hosting at delivery time, and nothing of either reaches the target.
