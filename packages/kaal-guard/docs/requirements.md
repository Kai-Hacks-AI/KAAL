# Guard: Requirements (what)

Each obligation names, in brackets, the Intent outcomes it serves ([Intent](intent.md)). Architecture and the Test Cases trace back to these identifiers.

## Functional (F)

**guard/F1 Check list.** [guard/I1] A repository declares each check in its own Git-tracked file, `.kaal/config/guard/<name>.md`. The `.kaal` directory is a namespace, not a runtime dependency on Core. The file's name, without `.md`, is the check's stable name, so it contains no space or colon. The file is Markdown with typed frontmatter, and only the frontmatter is a declaration:
- `type`, the declaration's Type, always `Guard/Check`: Guard's own Business Language name, which selects its schema (`core/F6`);
- `command`, the check's command;
- `runs`, where it runs: `hook`, `ci` or both (`local` is refused, naming `hook`);
- optionally, the facts it needs (`facts`), a trusted checker file (`trusted`, guard/F7) and named outcomes for further exit statuses (`outcomes`, guard/F2).

The body is free Markdown for people and agents: what the check proves, and how to resolve its failures. The Skill points a resolver to it (guard/I7). Guard never reads the body to run a check, to give a verdict or to order checks.

```markdown
---
type: Guard/Check
command: node scripts/lineage.mjs
runs: [ci]
facts: [base, head]
trusted: scripts/lineage.mjs
outcomes: {"4": held}
---
Checks that a pull request lands on the lineage its base allows. When it is held, wait for the promotion it names.
```

The file follows Core's deterministic-frontmatter contract: typed values only, a schema per Type, undefined members refused, and no meaning taken from the body. Guard's schema for `Guard/Check` is the members above. Guard parses the frontmatter itself, with no dependency, as a strict subset of YAML:
- `key: value` lines;
- plain or double-quoted strings, and integers;
- flow lists such as `[a, b]`;
- for `outcomes`, a flow map whose keys are exit statuses written as double-quoted strings, such as `{"4": held}`.

Every key is a string. KAAL has one frontmatter parsing contract: Graph's Form reader, which Core uses to recognize a typed artifact, refuses a key that YAML 1.2's core schema reads as anything but a string, and `{4: held}` has an integer key. So Guard refuses an unquoted status key such as `{4: held}` as cannot judge, naming `{"4": held}`, rather than accept what KAAL's Engine rejects. An outcome's meaning and verdict are unchanged.

Anything else is refused (guard/F18). Guard conforms to that contract without depending on Core at runtime, as `contract.json` conforms to Core's Installation Contract. Its publisher checks that conformance with Core's validator before each release.

**guard/F2 Verdicts.** [guard/I2] A check's exit status is its verdict: `0` pass, `1` fail, `2` cannot judge, `3` not applicable. Any other status is cannot judge, unless the check declares a named outcome for it. The only named outcome is `held`: shown as held, never as a pass and never as a fail. A check owns its diagnostics: its own output goes, unchanged and as it runs, to the hook's terminal or the CI log, and Guard neither captures nor interprets it. Guard prints each verdict by its own name, one line per check, as `<verdict>: <check>: <evidence>`, where the evidence is the check's exit status (with the trusted checker's provenance, guard/F7), and never collapses one verdict into another. A fail or cannot-judge line is followed by an indented `do: <next step>` line (guard/N4).

- **Named outcomes.** An `outcomes` key is an exit status written in canonical decimal: `"0"` to `"255"`, with no sign and no leading zero. Any other key, such as `"04"`, is refused, naming the canonical form.

**guard/F3 One runner.** [guard/I2, guard/I3] The same runner and the same list serve both the hook and CI.

**guard/F4 Hook.** [guard/I2, guard/I3] `pre-push` runs the `hook` checks, as `kaal-guard run --hook`. Fail and cannot judge block the push. `--no-verify` skips the hook once, and the hook says that CI decides.

**guard/F5 CI gate.** [guard/I2, guard/I3] Each `ci` check runs in a named CI job that the repository can make required.
- Fail and cannot judge fail the job.
- Not applicable lets the job succeed, reported as not applicable in a notice and in the step summary, never as a pass.
- Held lets the job succeed, with a warning naming the check as held; the hold's explanation is in the check's own output in the log.
- **Guard's workflow.** The workflow `init --ci` installs uses current major versions of `actions/checkout` and `actions/setup-node`, pinned by commit SHA, on Node 24. It passes every GitHub expression to its `run:` lines through `env:`, quoted, so no branch name or SHA is ever read as shell.
- **Documentation.** The README states three things. The hook judges the working tree, not the pushed commit. Guard's workflow has two jobs, `Guard`, which runs `verify`, and the job that runs `run --ci`. On `pull_request`, CI checks run on GitHub's merge commit, not on the commit `head` names.

**guard/F6 Narrow adapters.** [guard/I3] The hook and the workflow jobs pass facts and act only on verdicts.

**guard/F7 Trusted checker.** [guard/I1, guard/I2] A check can name a `trusted` file or directory. The runner then takes exactly those files as the target revision (`base`) holds them, never the candidate's version, and runs them in place of the candidate's, so a candidate cannot certify itself. Each base copy keeps the file mode the base records: a file Git records as executable (`100755`) is executable, so a check whose command is the checker itself, such as `./checker.sh`, runs as it does in a checkout. Where the host has no executable bit (Windows), the mode has no effect and the obligation is met by writing the bytes.
- Guard establishes Git provenance only. The verdict's evidence names the base commit that supplied the checker's files.
- What the checker imports from elsewhere, its interpreter and its environment are outside Guard's guarantee. They belong to the environment the check runs in.
- When the base or the designated files on it cannot be obtained, or no word of the command names the trusted path, the check is cannot judge.
- **A trusted declaration is judged from the base.** Where the fact `base` is supplied, Guard also reads the declarations the base revision holds. A check whose base declaration names `trusted` is cannot judge, naming the check, when the candidate's declaration of it differs from the base's in any member, or is absent. Its next step is to land the declaration change on its own, reviewed, so that the base holds it. The check's own command never runs in that case. A check the base does not declare, or declares without `trusted`, runs as the candidate declares it. Without `base`, a trusted check is already cannot judge. A `base` that does not resolve to a commit Guard can read is cannot judge for every selected check, naming the base, and nothing runs: Guard cannot tell which checks the base trusts, so it never treats an unknown base as one that declares none. Only a resolved base that holds no declarations declares none.
- **The boundary that remains.** Under GitHub's `pull_request`, the candidate also supplies Guard's workflow and the installed Guard. Guard cannot defend against a candidate that changes them. That protection is the consumer's review rule for `.kaal/config/guard/` and `.github/`, and the README says so next to `trusted`.

**guard/F8 Safe lifecycle.** [guard/I5]
- The package provides `init`, `upgrade` and `remove`.
- Guard writes a file only where none exists. It writes each file byte for byte as a content the package catalogues, changes nothing in it, and registers it in the repository's installation record (guard/F29).
- `upgrade` replaces only managed files that are unmodified.
- `remove` deletes only managed files that are unmodified, and unsets `core.hooksPath` only if Guard set it and recorded that in its checkout state (guard/F29).
- `init` activates nothing; `init --hook` and `init --ci` activate one surface each, and `remove` undoes them (guard/F30).
- A pre-existing hook, workflow or `core.hooksPath` is never overwritten. Guard reports it and prints the one line to add.
- A modified managed file is left in place and reported.
- **A missing registered asset.** A file the record registers but the repository no longer has is reinstalled. `init` does this for the surfaces it is asked for, and `upgrade` for the surfaces the record shows activated. The file is reported as reinstalled, and nothing of the consumer's is overwritten, because no file is there.
- **Remove.** `remove` deletes the configuration directory only where it is the default `.kaal/config/guard/` inside the repository and is empty. A directory named with `--config` is never deleted.

**guard/F9 Execution contract.** [guard/I2] A `command` is a program and its arguments, written as words separated by spaces, with double or single quotes grouping a word. It has no shell features: no pipes, redirection, variables or comments. The program is started directly. On Windows a `.cmd` or `.bat` program, such as npm, runs only under `cmd`, so each of its words is quoted, and a word holding a character `cmd` reads as syntax (`" & | < > ^ % !`) is cannot judge. An adapter supplies facts to `kaal-guard run` as `--head`, `--base`, `--base-ref` and `--changed <file>`. A check runs as a command, from the repository root, with no stdin. It receives only these facts, as environment variables, when the adapter supplied them:
- `GUARD_HEAD`, the candidate commit;
- `GUARD_BASE` and `GUARD_BASE_REF`, the target commit and its name;
- `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.

Guard does not tell a check where it is running. Equal facts, the same tree, the same command and the same tool versions give the same verdict. A local base from a stale fetch is a different fact, so the verdict may legitimately differ; the hook prints the base it used.

**guard/F10 No silent gate.** [guard/I2] Missing verification never satisfies a gate.
- A command that cannot start is cannot judge.
- A fact a check declares and does not receive is cannot judge.
- A check the configuration does not declare is cannot judge.
- A `ci` check that no workflow job declares fails Guard's consistency check, `kaal-guard verify`, which runs in CI as the job `Guard`. Its next step names the step to add to a job of the consumer's workflow, or `init --ci`; Guard never fills the gap itself (guard/F17). `verify` checks only Guard's own integration contract: a check is declared when a workflow job invokes it in Guard's declared form (the declared form, below), read deterministically from the workflow files; Guard infers nothing from scripts or other YAML. Declared integration is all `verify` claims. That GitHub ran the check is CI execution evidence, and that GitHub requires it is repository governance.
- **Unreadable workflows.** A workflow entry `verify` or `init` cannot read, such as a directory or a dangling link named `*.yml`, makes the command cannot judge (exit 2), naming the entry. It is never a fail, and never a stack trace.

  The declared form, read from `.github/workflows/*.yml` and `*.yaml` as lines:
  - The jobs are the `  <key>:` lines indented two spaces directly under a top-level `jobs:` line.
  - A job declares a check with a step whose whole `run:` value, on that one line, is `kaal-guard run`, `npx kaal-guard run` or `npx --no kaal-guard run` with `--check <name>`, the name a plain word, as in `- run: npx kaal-guard run --check <name> --github`.
  - `--check ${{ matrix.check }}` declares each check the job lists on a line of its own as `- { check: <name>, … }`.
  - A job declares every `ci` check with a step whose whole `run:` value is `kaal-guard run --ci`, with one of the same prefixes and options after it. This is the form of Guard's own workflow, which the consumer opts into with `init --ci` (guard/F17).
  - A job declares the consistency check with a step whose whole `run:` value is `kaal-guard verify`, with one of the same prefixes, optionally followed by `--config <dir>` and then `--github`.
  - Nothing else declares anything: a block script, a chained command, a quoted name, another expression or matrix key, `echo`, `name:` or `env:` text, a comment.

**guard/F11 Package code update.** [guard/I5] Changing the installed version, through the consumer's dependency and lockfile, changes Guard's code and nothing in the repository. It rewrites no managed asset, nothing in `.kaal/config/guard/` and none of the consumer's checks.

**guard/F12 Asset upgrade.** [guard/I5] `upgrade` moves each unmodified managed asset to the installed version's content. It keeps each modified asset and every file Guard did not write, and it never changes a check's declaration (guard/F1). It reports each file as upgraded, current or kept.

**guard/F13 New assets.** [guard/I5] An asset the installed version manages, which the repository does not have, is installed by `upgrade` under `init`'s rule (only where no file exists). It does so only for a surface the record shows activated (guard/F30): `upgrade` never activates a surface, so it never installs the hook or Guard's workflow where the consumer has not activated them.

- **A missing registered asset** (also guard/F8). A file the record registers but the repository no longer has is reinstalled. `init` does this for the surfaces it is asked for, and `upgrade` for the surfaces the record shows activated. The file is reported as reinstalled, and nothing of the consumer's is overwritten, because no file is there.

**guard/F14 Writer version.** [guard/I5] The installation record registers, for each managed asset, the Guard version that wrote it or confirmed it unchanged, and the SHA-256 that version installed (guard/F29). `upgrade` reports, for each asset, the version it moves it from and to. A modified asset no longer matches its registered hash, so it is reported as modified and kept with its registered version, and assets of different versions can coexist.

**guard/F15 Older configuration.** [guard/I5] A configuration written by an earlier published version is read by a later one with the same meaning, or refused as cannot judge with a reason and a next step. It is never silently reinterpreted. `0.0.1`'s root `guard.json` is refused, and the next step it names is the fresh `0.0.2` setup.

**guard/F16 Rollback.** [guard/I5] From `0.0.2` on, installing an earlier published version and running `upgrade` returns each unmodified managed asset to that version's content, and moving forward again works the same way. Modified and consumer-owned files are untouched both ways. Rollback to `0.0.1` is not supported.

**guard/F42 Supported upgrade paths.** [guard/I5] Each release declares the earlier versions it supports moving from. For each one it states the path (a dependency and lockfile change, then `upgrade`), its prerequisites, what changes and what is kept, how a failure shows and how to recover, and how to verify the result (`npm explore @kaihacksai/kaal-guard -- npm test`, then `kaal-guard verify`). A version it does not declare is not supported, and the release says what to do instead.

Supported upgrade paths to `0.0.5`:

| From | Path | Prerequisites | What changes, and what is kept | If it fails | Verify |
| --- | --- | --- | --- | --- | --- |
| `0.0.2` | Change the dependency to `0.0.5` and its lockfile entry (`npm install --save-dev @kaihacksai/kaal-guard@0.0.5`), run `npx kaal-guard upgrade`, and commit the result. | Node 24 or later, Git 2.26 or later and npm; the installation record `0.0.2` wrote is committed. | Guard's workflow, where CI is activated and you have not modified it, moves to `0.0.5`'s content, which checks out with `persist-credentials: false`. The hook, the `.gitattributes` files and the Skill ship unchanged, so only the version the record registers for them moves (guard/F14). The declarations `0.0.2` reads are read with the same meaning (guard/F15). Your declarations, your own files and every managed file you modified are kept, and reported as kept. | If `upgrade` ends in cannot judge, it names the cause and a next step: follow it and run `upgrade` again. To go back, install `0.0.2` again and run `upgrade` (guard/F16). | `npm explore @kaihacksai/kaal-guard -- npm test` gives `verified`, and `npx kaal-guard verify` passes in the repository. |
| `0.0.3` | Change the dependency to `0.0.5` and its lockfile entry (`npm install --save-dev @kaihacksai/kaal-guard@0.0.5`), run `npx kaal-guard upgrade`, and commit the result. | Node 24 or later, Git 2.26 or later and npm; the installation record `0.0.3` wrote is committed. | Guard's workflow, where CI is activated and you have not modified it, moves to `0.0.5`'s content, which checks out with `persist-credentials: false`. The hook, the `.gitattributes` files and the Skill ship unchanged, so only the version the record registers for them moves (guard/F14). Your declarations, your own files and every managed file you modified are kept, and reported as kept. | If `upgrade` ends in cannot judge, it names the cause and a next step: follow it and run `upgrade` again. To go back, install `0.0.3` again and run `upgrade` (guard/F16). | `npm explore @kaihacksai/kaal-guard -- npm test` gives `verified`, and `npx kaal-guard verify` passes in the repository. |
| `0.0.4` | Change the dependency to `0.0.5` and its lockfile entry (`npm install --save-dev @kaihacksai/kaal-guard@0.0.5`), run `npx kaal-guard upgrade`, and commit the result. | Node 24 or later, Git 2.26 or later and npm; the installation record `0.0.4` wrote is committed. | Guard's workflow, where CI is activated and you have not modified it, moves to `0.0.5`'s content, which checks out with `persist-credentials: false`. The hook, the `.gitattributes` files and the Skill ship unchanged, so only the version the record registers for them moves (guard/F14). Your declarations, your own files and every managed file you modified are kept, and reported as kept. | If `upgrade` ends in cannot judge, it names the cause and a next step: follow it and run `upgrade` again. To go back, install `0.0.4` again and run `upgrade` (guard/F16). | `npm explore @kaihacksai/kaal-guard -- npm test` gives `verified`, and `npx kaal-guard verify` passes in the repository. |

`0.0.1`, and any version this table does not list, is not a supported source: set Guard up fresh, as the `0.0.2` release notes in the README describe.

**guard/F17 Existing integration.** [guard/I1, guard/I5] Adoption is not upgrade, and Guard never takes over CI. The consumer owns its Test Cases, their commands, its CI workflows and the assignment of each check's execution. A declaration's `runs: [ci]` states the check's intended scope, not who executes it. Guard recognizes integration only through its own declared integration contract, read exactly as `verify` reads it (guard/F10): a job declares a `ci` check with a step that runs `kaal-guard run --check <name>` in the declared form, declares every `ci` check with a step that runs `kaal-guard run --ci` in the declared form, and declares the consistency check with a step whose whole `run:` value is `kaal-guard verify`, `npx kaal-guard verify` or `npx --no kaal-guard verify`, optionally followed by `--config <dir>` (guard/F28) and then `--github`. Guard reads nothing else in a workflow: not job names, triggers, other matrices or scripts.
- `init` installs no workflow unless the consumer activates CI with `init --ci` (guard/F30). Guard's workflow is one fixed, catalogued content (guard/F29): the `Guard` job, which runs `verify`, and one job that runs `kaal-guard run --ci`. Opting in is the consumer's one decision to hand every `ci` check to that job, so no check is registered a second time.
- `init --ci` installs it only where no file is at its path and no workflow of the repository declares a check or the consistency check. Otherwise it installs nothing for CI and reports what it found, because Guard's workflow would run those checks a second time.
- Without the opt-in, `init` reports each `ci` check that no job declares as missing coverage, with the step to add to a job of the consumer's own workflow and `init --ci` as the alternative. `verify` fails on it with the same next step (guard/F10). Guard never fills the gap itself: it generates, lists or infers no job for an undeclared check.
- `init` reports each recognized declaration as `executed by Guard, not managed: <check> in job <key> of <file>`, and records nothing for it. Guard never takes ownership of a file it did not write and never changes a workflow of the consumer's. A consumer that wants Guard's workflow in place of its own removes its own file, runs `init --ci`, and undoes that through Git.

**guard/F18 Configuration contract.** [guard/I1, guard/I2, guard/I5] Guard owns its configuration contract: the schema of the declarations (guard/F1) and of its state (guard/F29), where they are found (guard/F28), and their deterministic validation. The repository owns its declarations and the checks they name.
- A member the schema does not define is refused, in a declaration's frontmatter or in Guard's state. So is a value of the wrong type, or a frontmatter outside guard/F1's subset.
  - **Why.** A misspelled or unsupported member would otherwise drop a protection silently. A `trustd` that is ignored, for instance, takes the checker from the candidate, against guard/F7 and guard/F10.
  - **Extensibility.** The schema is the installed version's. A new member arrives only with a Guard version that defines it, and an older Guard refuses it because it cannot honour it. A repository's own notes belong in the body, which Guard never reads.
- A refused configuration is cannot judge. The diagnostic names the file, the member, the rule it breaks, and the nearest member the schema defines when one is close, as in `trustd: not defined; did you mean trusted?`. The next step is to correct the declaration, or to install the Guard version that defines the member. No command writes anything on the strength of a refused configuration, and `run` gives no other verdict.
- Guard never writes a declaration. `init` creates `.kaal/config/guard/` only where it is missing, and it writes no check. It reports how to declare the first check.
- `init` followed by `remove` leaves every declaration as the repository wrote it, byte for byte. That holds by construction, because Guard writes only its managed assets and its checkout state, never a declaration.

**guard/F19 Guard's Skill.** [guard/I7] Guard has one Agent Skill, `kaal-guard`, that conforms to the Agent Skills standard. It is organized by BASS:
- *Bare*: how to read a verdict line, its `do:` line and the check's own output, with no Skill needed;
- *Agent*: how the repository's agent instruction files may point to the Skill;
- *Skill*: the verdicts and what each asks of the resolver, how to reproduce a check with the same facts (`kaal-guard run --check <name>`), what belongs to the repository and what to Guard, and what never resolves a verdict (editing a check's declaration to silence it, `--no-verify`, or changing a trusted checker in the candidate);
- *Script*: none. A script is added only when a deterministic step justifies one, and never with a runtime or LLM dependency of its own.

The Skill names no particular consumer and invents no consumer-specific fix.

**guard/F20 Diagnostic content.** [guard/I1, guard/I7] The Skill and the consumer docs recommend what a consumer's failing Test Case prints: the contract it checks, what was expected, what was observed, the evidence, and the next action or the command that reproduces it. This is guidance for people and agents, not a format. Guard parses none of it, and a check that ignores it loses nothing.

**guard/F21 Reminder.** [guard/I7, guard/N4] After the verdict lines of a run that has a fail or cannot judge, Guard adds one line naming the Skill's location, as a path that exists in the repository. In CI it also adds that line to the fail and cannot-judge annotations and to the step summary. A run of only pass, not applicable or held adds nothing. Where no Skill is found, the line says so and names the package's copy of it.

**guard/F22 Unchanged verdicts.** [guard/I1, guard/I2] Adding guard/I7 changes no exit status, no verdict and no verdict line, and it does not change how a check's own stdout and stderr reach the terminal or the log.

**guard/F23 Standalone installation.** [guard/I5, guard/I7] The package carries the Skill's one source, and Guard's own lifecycle installs it without Core, as its installation contract (guard/F27) states: only at `.agents/skills/kaal-guard/`, as a whole, and only where none of its files exists. Every file is registered in the installation record (guard/F29) with its SHA-256 and the version that wrote it. A pre-existing or modified file is kept and reported, and then nothing else of the Skill is installed. `upgrade` moves the unmodified Skill to the installed version's source and installs it where a consumer lacks it (guard/F13). `remove` deletes only unmodified Skill files, and only the directories it leaves empty. Guard never writes or removes another skill beside it, and never writes a supplier-specific location. That is Core enrichment (guard/N12). A path inside the package alone does not meet guard/F23.

**guard/F24 Discovery.** [guard/I7] At the canonical location, the installed Skill is a directory named `kaal-guard` holding a `SKILL.md` whose `name` is `kaal-guard`. An agent reaches it in one of two ways, which are reported apart and never claimed as equal:
- *native discovery*: the agent lists and activates the Skill from that directory by itself;
- *instruction-based access*: the reminder (guard/F21), or an instruction pointer the consumer adopts (guard/F26), names the path, and the agent reads it.

Which way a given supplier uses is observed, not asserted.

**guard/F26 Agent instruction files.** [guard/I1, guard/I7] Guard never creates, edits or removes `AGENTS.md` or any supplier's instruction file (`CLAUDE.md` and the like). They are the consumer's. Standalone, `init` reports the Skill's canonical path and says that an agent which does not discover `.agents/skills/` reaches it through the reminder or a pointer the consumer adds. Provider-specific pointers are Core enrichment (guard/N12). No pointer points back from the Skill, none is circular, and none duplicates the Skill's content.

**guard/F27 Installation contract.** [guard/I5, guard/I7] Guard ships one installer-neutral installation contract, `contract.json` in the package. It states what an installation of Guard is:
- each asset (the hook, the workflow and the Skill): its source in the package, its path in the repository, and its rules (installed only where absent, kept when modified, removed only when unmodified, with the directories that removal empties);
- the catalogue of every content each asset path has had in a published version, which is knowledge about Guard, not about any repository;
- the ownership record: the repository's installation record and Guard's checkout state (guard/F29), and nothing else;
- the runtime prerequisite, Node 24 or later;
- the provider requirement: an agent resolving a failing verdict reaches the Skill named `kaal-guard`. The canonical deployment and the reminder meet it, and the contract names no other supplier location.

The contract is an instance of Core's Installation Contract: Core owns that Definition, its schema and its outer conformance Test Cases (`core/T1`…). Guard owns its instance, versioned with the package, and the implementation that realizes it. Guard's standalone lifecycle realizes exactly this instance. Any installer that realizes it, Core among them, leaves a repository that Guard's lifecycle can upgrade and remove, and the reverse. Conformance is verified at engineering time (guard/N12), so the package gains no dependency.
- **Bytes and mode on every host.** A file Guard installs keeps the bytes Guard wrote, and so its SHA-256, in every clone, whatever the clone's `core.autocrlf`. Guard therefore installs, for each directory it writes into, a `.gitattributes` of its own that marks its files `-text`. Each one is an asset of `contract.json`, catalogued and registered like the others: `.githooks/.gitattributes` with the hook, `.github/workflows/.gitattributes` with the workflow, naming only `guard.yml`, and `.agents/skills/kaal-guard/.gitattributes` inside the Skill. Where `core.fileMode` is `false`, Git cannot record the hook as executable from the file alone, so `init --hook` reports the one command that records it, `git add --chmod=+x .githooks/pre-push`. Guard stages nothing itself.

**guard/F28 Configuration discovery.** [guard/I2, guard/I3, guard/I5] The configuration is the directory `.kaal/config/guard/`, holding the declarations.
- `kaal-guard` takes the directory from `--config <dir>` when that is given. Otherwise it resolves the fixed convention, `.kaal/config/guard/` at the repository's top level (`git rev-parse --show-toplevel`), from any working directory.
- The hook and the workflow Guard writes pass `--config` explicitly, so a reader sees where the configuration lives. A consumer's own workflow may omit it, so KAAL's `kaal-guard run --check <name>` keeps working unchanged.
- The effective declarations are the `.md` files directly in that directory, in name order. The hook and CI therefore resolve the same declarations for the same tree.
- A directory found in neither way is cannot judge, naming `kaal-guard init` as the next step.
- The `.kaal` directory is a namespace, and resolving it needs no KAAL element.
- **Declarations.** A `.md` entry in the configuration directory that is not a regular file, such as a symbolic link, a directory or a socket, is refused as cannot judge, naming the entry. Guard never skips it silently, so a declaration cannot vanish from a run.

**guard/F29 Lifecycle state.** [guard/I5] Guard's bookkeeping has two scopes. Each lives where its lifecycle lives, and neither lives in the declarations or in a managed asset.
- **Repository scope: what this repository installed.** A tracked JSON file, `.kaal/state/guard/installation.json`, which only Guard's lifecycle writes. It sits apart from the consumer's declarations in `.kaal/config/guard/` and from every managed asset. It holds the surfaces the consumer activated (`activated`, guard/F30) and, for each asset Guard installed, the path, the SHA-256 and the version that wrote it. It travels with every clone, because it is committed with the assets it describes.
  - An asset is Guard's in this repository only when the record registers it. It is unmodified only while its content's hash equals the registered one.
  - A file at a managed path that the record does not register is not Guard's, even when its bytes equal a published content, and it is left alone and reported. Matching published bytes alone proves neither who installed a file nor who authorized it.
  - A registered asset that is missing, or whose hash differs, is reported. Neither is silently re-registered.
  - The package's **catalogue** in `contract.json` (guard/F27) is separate. It lists the SHA-256 of every content each asset path has had in a published version from `0.0.2` on. `init` and `upgrade` write only catalogued content, and `upgrade` reads the catalogue to know which registered version an unmodified asset holds.
  - No mark is written into any asset. The hook keeps its shebang as its first line and its executable mode, the workflow stays plain YAML, and `SKILL.md` begins with its required frontmatter, as the Agent Skills standard requires.
  - When Core manages the installation, Core registers Guard's assets in this record, in this shape (`core/F33`). It registers only the assets it wrote. It never registers a file it found, even one whose bytes equal a catalogued content. It keeps `activated` and every other entry unchanged, and it never installs the hook or the workflow (`core/F37`). Core's own record holds only the provider deployments it generates. This record alone decides which assets are Guard's.
- **Checkout scope: Guard's setup of the hook path.** That is whether Guard set `core.hooksPath`, in which Git configuration scope, and to what. It is never tracked. It is JSON that only the lifecycle writes, and it is kept in the Git metadata of the scope Guard wrote, with every path resolved through `git rev-parse`, never by assuming `.git` is a directory:
  - Without `extensions.worktreeConfig`, Guard sets `core.hooksPath` in the repository's shared configuration (`git config --local`), which every worktree reads. The state goes to `$(git rev-parse --git-common-dir)/kaal/guard/state.json`, where every worktree finds it.
  - With `extensions.worktreeConfig`, Guard sets it for the current worktree only (`git config --worktree`). The state goes to `$(git rev-parse --git-path kaal/guard/state.json)`, which Git resolves into that worktree's own metadata.
  - Guard sets `core.hooksPath` only when `git config --show-scope core.hooksPath` shows it unset in every scope.
  - `remove` unsets it only in the recorded scope, and only while the value there is still the one Guard set. A worktree, or a fresh clone, that has no state for its scope leaves `core.hooksPath` alone.
  - `remove` deletes the state it used.

When Core manages the installation, Core's installation record holds the same facts.
- **Bytes and mode on every host (also guard/F27).** A file Guard installs keeps the bytes Guard wrote, and so its SHA-256, in every clone, whatever the clone's `core.autocrlf`. Guard therefore installs, for each directory it writes into, a `.gitattributes` of its own that marks its files `-text`. Each one is an asset of `contract.json`, catalogued and registered like the others: `.githooks/.gitattributes` with the hook, `.github/workflows/.gitattributes` with the workflow, naming only `guard.yml`, and `.agents/skills/kaal-guard/.gitattributes` inside the Skill. Where `core.fileMode` is `false`, Git cannot record the hook as executable from the file alone, so `init --hook` reports the one command that records it, `git add --chmod=+x .githooks/pre-push`. Guard stages nothing itself.

**guard/F30 Initialization, activation and execution.** [guard/I1, guard/I3, guard/I5] Three concerns stay apart: initialization prepares Guard, registration declares what it may execute, and activation decides where it executes. The consumer, or an agent installing Guard on its behalf, makes every activation choice; neither activation implies the other, and a check registered for one surface is never promoted to the other.
- **Registration.** A declaration's `runs` names the surfaces a check is registered for: `hook`, `ci` or both (guard/F1). The hook and CI may register different sets. The word is `hook`, not `local`, because it names the surface that executes the check: a check can run on a developer's machine through `run --check` or `run --ci` too, so `local` would not say which.
- **Initialization.** `kaal-guard init` creates `.kaal/config/guard/` where it is missing and the installation record (guard/F29), and activates nothing: no hook, no `core.hooksPath`, no workflow. It also installs the canonical Skill (guard/F23), which runs nothing.
- **Activation.** `init --hook` initializes as needed, installs Guard's hook and sets `core.hooksPath` under guard/F29's rule; in a checkout where the hook is already Guard's registered one, it only sets `core.hooksPath`. `init --ci` initializes as needed and installs Guard's workflow under guard/F17's rule. `init --hook --ci` does both. The record lists each surface activated through Guard. Each form is idempotent: run again, it writes nothing that is already in place, and it never overwrites a consumer's file.
- **Execution.** `kaal-guard run --hook` runs the checks registered for the hook, `run --ci` those registered for CI, and `run --check <name>` exactly one, for reproduction and for consumer-owned CI jobs that assign checks one by one. A consumer may run CI entirely through `run --check` steps of its own; `run --ci` is the form of Guard's workflow, never a compulsory delegation.
- **Undo.** `kaal-guard remove --hook` deactivates the hook: it deletes Guard's hook if unmodified, unsets `core.hooksPath` only as guard/F29 allows, and drops `hook` and the hook's registration from the record. `remove --ci` deletes Guard's workflow if unmodified and drops `ci` and its registration. `remove` alone deactivates both, then deletes the record, the checkout state and the configuration directory if it is empty. No form deletes or changes a declaration, a check's Test Case or a file the record does not register; a modified asset is kept, reported, and from then on the consumer's.
- **Upgrade.** `upgrade` moves registered, unmodified assets, and installs an asset a newer version adds only to a surface the record shows activated (guard/F13). It never activates a surface.
- **Reports.** `init` says, for each surface not activated, how to activate it or integrate it by hand: the line for a hook of the consumer's own, and for each `ci` check no job runs, the step to add or `init --ci` (guard/F17).

### Consumer verification

A consumer can verify the installed package with one command. Before `0.0.4`, the package kept a `test` script but shipped no tests, so `npm explore @kaihacksai/kaal-guard -- npm test` ran 0 tests and exited 0: a false green, which guard/F31–guard/F36 remove.

- **guard/F31** [guard/I8] **Delivered cases.**
  - **What ships.** The package ships its outer acceptance cases (`test/acceptance/`, with their harness) and a verification entry. Its inner Code tests ship from guard/F39 on. The Test Cases of the verification itself do not ship, so a delivered run never verifies its own verifier; the publisher runs them before each release.
  - **Inventory.** The entry declares the inventory of the delivered cases by name, so a case that did not run is detected.
  - **Package under test.** The cases exercise the installed copy as their package under test. The harness resolves that as its own package directory, which, once installed, is the installed copy.

- **guard/F32** [guard/I8] **Invocation.**
  - **Command.** `npm explore @kaihacksai/kaal-guard -- npm test` runs the verification. The package's `test` script runs the entry and nothing else.
  - **Prerequisites.** It needs Node 24 or later, Git (guard/N1) and npm on PATH, and nothing installed beyond Guard.
  - **Repeatability.** It can be repeated.

- **guard/F33** [guard/I8] **One result.** A run ends in exactly one of three results, each with its own exit status and named in a final summary line.
  - **`failed`, exit 1.** At least one delivered case failed, or the consumer changed during the run (guard/F35).
  - **`cannot verify`, exit 2.** No case failed, but the run cannot claim verification. That happens when:
    - a prerequisite is missing;
    - no case executed;
    - a case was skipped or marked todo;
    - a declared case did not execute;
    - the installed files do not match the shipped manifest (guard/F34);
    - the verification itself could not complete. The output names the error and asks for it to be reported.
  - **`verified`, exit 0.** Every declared case executed and passed.
  - **Next step.** Every `failed` and `cannot verify` names its cause and a next step (guard/N4).

- **guard/F34** [guard/I8] **Evidence of what was exercised.** The output names:
  - the package name, its version and its install location;
  - the SHA-256 of each installed file, checked against the manifest shipped with the entry. The manifest excludes itself. A mismatch is `cannot verify`, naming the files.
  - the lockfile integrity, where npm recorded it in `node_modules/.package-lock.json`. Elsewhere it is reported as unknown, never guessed.

  The tarball the cases exercise is a re-pack of the installed copy, so its integrity is not the registry's `dist.integrity`. The manifest ships inside the package, so a match is consistency evidence: the installed files are the ones the package says it ships. It is not independent provenance. Provenance is the registry's integrity and npm's provenance attestation, which the lockfile's integrity points to. The summary line `kaal-guard-verification {…}` carries all of it as JSON.

- **guard/F35** [guard/I8] **Intact consumer.**
  - **Scratch space.** The delivered cases write only to the operating system's temporary directory.
  - **The consumer.** The entry takes the consumer to be the directory that holds the outermost `node_modules` on the installed copy's resolved path, and it requires that directory to have a `package.json`. That covers a direct dependency, a nested one and a hoisted workspace dependency under npm, and pnpm's `node_modules/.pnpm/` store. A copy that is not under a `node_modules` directory, such as a link or a source checkout, or one whose directory has no `package.json`, such as a global installation, is `cannot verify`, and the cases do not run. Under `npm explore`, both the working directory and `INIT_CWD` are the package directory, so neither names the consumer.
  - **The check.** It compares the consumer's content, `node_modules/@kaihacksai/kaal-guard` included, before and after the run. A difference is `failed`, naming the paths. The comparison cannot tell Guard's writes from yours, an editor's or Git's, so the next step asks you to check whether you or a tool changed those paths during the run, and to report the output if nothing did. Keep the project idle while the verification runs.
  - **What is compared.** Every path under the consumer is compared, except `node_modules` directories, the installed copy excepted. Each regular file is compared by its SHA-256, a link by its target and a directory by its presence. A socket, a FIFO or a device is compared by its kind and never opened. An entry that disappears between being listed and being read, such as a lock Git removes, counts as absent. Git's object store and files over 64 MiB are compared by size and modification time. Other dependencies are not compared.

- **guard/F36** [guard/I8] **Package, not integration.**
  - **Scope.** The verification judges the package only. It reads none of the consumer's configuration, installation record, hook or workflow.
  - **Pointer.** Its output says so and names `kaal-guard verify` for this repository's integration.
  - **Who observed it.** The result is the consumer's own observation of its run. It is not release evidence of the package's publisher.

**What `verified` establishes, and its limits (guard/F33–guard/F36).** `verified` establishes only these three things:
- every case the shipped manifest declares executed and passed against the installed copy;
- each installed file other than the manifest has the SHA-256 the manifest gives it, and the copy holds no file the manifest does not ship;
- nothing the comparison covers changed during the run.

It does not establish these:
- **Provenance.** The manifest ships in the package, so whoever can change the installed files can also change the manifest to match. Only the registry's integrity and npm's provenance attestation bind the bytes to a publication. The lockfile integrity is reported for that, and is never checked against the registry.
- **What the cases do not cover.** A behaviour without a delivered case is not verified.
- **The consumer beyond the comparison.** The comparison takes in every path under the consumer except `node_modules` directories, and adds the installed copy. A symbolic link counts by its target text, not by what it points to. Git's object store and files over 64 MiB count by size and modification time, so a same-size rewrite that restores the modification time is not detected there. Other dependencies, the copy's own `node_modules` (where pnpm links `.bin`), the temporary directory the cases use, and npm's cache and logs in the user's home are not compared.
- **The consumer's integration.** That stays with `kaal-guard verify` (guard/F36).

### The complete product

The package carries its complete consumer-facing specification and its Test Cases, owned by responsibility, not by loop depth. A test is classified by what it verifies and by whether the consumer needs it.

- **guard/F37** [guard/I9] **The product contract ships.**
  - **What it holds.** The package's `docs/` holds Guard's product Intent, Requirements, Architecture, Testing and Limitations.
  - **What each part covers.**
    - Testing: the Product Verification Test Plan. That is the loops, the trace from each delivered case to the identifiers it covers, the identifiers allocated to the publisher's Engineering Test Plan, and those no Test Case verifies (guard/F38). The publisher's Engineering Test Plan does not ship.
    - Limitations: what Guard does not establish, and each Defect that reached a published version, naming the versions it affects and the version that corrects it.
    - Operations: the README and the Skill.
  - **Single definition.** Every product identifier is defined there and only there. Every identifier a delivered case cites is defined there.
  - **Readable alone.** The contract is intelligible without KAAL's repository. It cites no document outside the package as its authority, and it carries no plan, Change history or engineering evidence.

- **guard/F38** [guard/I8, guard/I9] **Declared coverage, failing closed.**
  - **What the manifest declares.** It declares every product identifier, and for each one either the delivered cases that cover it, in each loop, or one allocation to the publisher's Engineering Test Plan that names what the publisher runs, or one statement that no Test Case verifies it and why. For example: "guard/I8, guard/F31–guard/F36: allocated to the publisher's Engineering Test Plan".
  - **Not verified by this run.** An allocated identifier is reported as not verified by this run, allocated to the publisher. One that no Test Case verifies is reported as unverified. Neither is ever counted as covered, and neither changes the result.
  - **Uncovered.** An identifier with neither a covering case that ran and passed, nor an allocation, nor a statement that no Test Case verifies it is `cannot verify`, named, with its next step.
  - **The output.** It prints coverage per loop and lists every allocated and every unverified identifier, and the summary line carries them.
  - **No concealment.** `verified` never conceals an absent loop, an uncovered boundary, an allocation or an unverified identifier.

- **guard/F39** [guard/I8, guard/I9] **Product-owned loops.**
  - **Which loops ship.** `npm test` runs every loop the package owns: the outer acceptance cases (Intent, Requirements, Architecture) and the inner Code tests of the shipped implementation.
  - **Accounting.** Each case is accounted for by name under its loop. A loop with no executed case is `cannot verify`, naming the loop.
  - **What does not ship.** Tests that verify the verification itself, or the publisher's release process, are the publisher's and do not ship.

- **guard/F40** [guard/I8] **Declared applicability.**
  - **Declaring it.** A case may declare the platforms where it does not apply.
  - **On such a platform.** The case is not run and is reported as not applicable, named. It does not count as skipped.
  - **An undeclared skip** is still `cannot verify` (guard/F33).
  - **Identifiers it leaves uncovered.** An identifier whose only covering cases are not applicable on this platform is named as not verified here. That is `cannot verify` unless the contract itself declares that identifier not applicable on the platform.

## Nonfunctional (N)

- **guard/N1** [guard/I5] Linux, macOS and Windows. The hook is POSIX `sh`; the runner runs on Node 24 or later from `0.0.2`. Raising the floor from Node 20 is a breaking consumer prerequisite: it is stated in the package's README and in the release's notes, and an older Node is refused with that next step.
  - **Git.** Guard needs Git 2.26 or later, for `git config --show-scope`. On an older Git every command is cannot judge, naming Git 2.26 as the next step, before it reads or writes anything, as for an older Node.

- **guard/N2** [guard/I2] Deterministic: no network, no clock dependence and no polling of GitHub.

- **guard/N3** [guard/I5] No state beyond the repository (its installation record included), `core.hooksPath` and Guard's checkout state in Git's metadata (guard/F29).

- **guard/N4** [guard/I2, guard/I5] Every fail or cannot-judge verdict says what to do next.

- **guard/N6** [guard/I5] The Embed package depends on no other KAAL element, of any kind, and is published to npm as `@kaihacksai/kaal-guard`, under the Owner's npm scope, first as `@kaihacksai/kaal-guard@0.0.1`. Its command is `kaal-guard`. It is published only with the Owner's authorization.
  - **The package's own tests.** The package's own test files pass on Node 24, run from the package, and none of a retired suite runs. The package's `npm test` is the consumer's verification (guard/F32).

- **guard/N15** [guard/I1, guard/I5] The workflow Guard installs leaves no credential behind for the code it runs. Each checkout in it sets `persist-credentials: false`, so no step after the checkout can read the run's token from the repository's Git configuration, whatever that token may do in the consumer's context.

- **guard/N10** [guard/I7] The Skill has one canonical source, `skills/kaal-guard/` in the package, and one standalone deployment, `.agents/skills/kaal-guard/`. Which further deployments and instruction pointers a repository needs is decided only by Core's Agent Realization, when Core manages the installation. As documented: Codex discovers `.agents/skills/` ([docs](https://learn.chatgpt.com/docs/build-skills)), Claude Code discovers natively only `.claude/skills/` ([docs](https://code.claude.com/docs/en/skills)), and GitHub Copilot discovers both ([docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills)). Standalone, Claude Code reaches the Skill through instruction-based access (guard/F24).

- **guard/N11** [guard/I7] The Skill adds no runtime dependency. Guard needs no network and no LLM to install it, name it or report it.

- **guard/N12** [guard/I5, guard/I7] Contract, standalone conformance and Core enrichment are distinct, and are not required to be feature-equivalent:
  - the contract: Core owns the Installation Contract Definition, schema and outer conformance Test Cases; Guard owns its instance, `contract.json` (guard/F27);
  - standalone conformance is Guard's own lifecycle, which guarantees local correctness within the instance, with no KAAL dependency;
  - Core enrichment is Core's realization of the same instance, through Hosting where Core chooses. It adds CASE registration, provider-aware deployments and pointers, dependency and conflict handling and cross-Capability verification. Core keeps its additional deployments in its own record, and Guard's lifecycle never touches them.

  Core's conformance Test Cases are run against Guard's instance before each release, and the evidence is Guard's; the Test Case definitions stay Core's and are not copied. Guard holds no placement table, schema or CASE coordination of its own, and Core holds no Guard asset rule beyond what it reads from the instance.

- **guard/N13** [guard/I8] The verification realizes KAAL Testing's consumer-verification semantics in Guard's own code. Guard depends on no Testing package, and the entry uses only Node's built-ins. It adds no command and no runtime dependency to the package.
