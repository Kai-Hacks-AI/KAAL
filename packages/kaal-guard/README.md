# @kaihacksai/kaal-guard

Connects a repository's own checks to its local Git `pre-push` hook and to GitHub CI, with one meaning per check. Guard runs the checks you list and reads their verdicts. It never interprets what a check tests or what it prints.

The command is `kaal-guard`. Node 24 or later and Git 2.26 or later. On an older Node or Git every command is cannot judge, naming the version it needs as the next step, before anything is read or written. The hook is POSIX `sh`, which Git for Windows provides.

## Start

```sh
npm install --save-dev @kaihacksai/kaal-guard
npx kaal-guard init              # prepares Guard; activates nothing
npx kaal-guard init --hook       # also activates the Git hook
npx kaal-guard init --ci         # also activates Guard's workflow, if you want it to run every ci check
npx kaal-guard init --hook --ci  # both
```

Three things stay apart. **Initialization** prepares Guard: `init` creates `.kaal/config/guard/`, where you declare your checks, the installation record, and Guard's Skill at `.agents/skills/kaal-guard/`, which an agent reads to resolve a failing verdict. Installing the Skill activates nothing. **Registration** says what Guard may execute: each declaration's `runs` names `hook`, `ci` or both, and the two sets may differ. **Activation** says where it executes, and it is always your choice: `--hook` and `--ci` each activate one surface, and neither implies the other. Every form is safe to repeat.

Your CI is yours: you decide which job runs each check. `init` writes only what is missing and reports in up to four parts:

- **installed by Guard:** `.kaal/config/guard/`, the installation record and the Skill; with `--hook`, `.githooks/pre-push` and `core.hooksPath` set to `.githooks`; with `--ci`, `.github/workflows/guard.yml`. A file Guard registered that the repository no longer has is reinstalled and reported as reinstalled by the `init` that names its surface; plain `init` reinstalls only the Skill's files, and lists any other under still to do.
- **left untouched:** any of these the repository already had, and any file at those paths that Guard did not write.
- **still to do in this repository:** how to activate each surface you have not; where `core.fileMode` is false, `git add --chmod=+x .githooks/pre-push`, so the hook is committed executable; the line to add for each file left untouched, and for each `ci` check that no workflow job runs, the step to add to a job of your own workflow ([CI](#ci-and-what-verify-does-not-say)).
- **executed by Guard, not managed:** each check, and `verify`, that one of the repository's own workflows already runs in Guard's declared form (see `kaal-guard verify`).

Neither checkout in Guard's workflow keeps the run's token in the repository's Git configuration (`persist-credentials: false`, guard/N15), so a step that runs after it, a check of yours included, cannot read that token, whatever it may do in your repository. A `ci` check that fetches or pushes over HTTPS after checkout therefore has no stored credential; give it its own, or own a modified workflow.

`init --ci` is one decision: Guard's workflow has two jobs, `Guard`, which runs `verify`, and `Guard checks`, which runs every `ci` check, so you register nothing twice. It is installed only where no workflow of yours already runs a check or `verify` in Guard's declared form, since it would run those a second time; `init --ci` then installs nothing for CI and names what it found. `upgrade` never installs it.

`init --hook` sets `core.hooksPath` only when all three of these hold:

- it is unset in every Git configuration scope,
- the hook in `.githooks` is the one Guard installed,
- Git runs no hooks of the repository's own from `.git/hooks`, which setting it would turn off.

Every file Guard writes is content the package catalogues in its `contract.json`, an instance of KAAL Core's Installation Contract format and the one list of the files Guard installs, written byte for byte. Guard registers each one, with its SHA-256 and the version that wrote it, in `.kaal/state/guard/installation.json`, which you commit with the files. The record also lists the surfaces you activated. A file is Guard's only while that record registers it and its SHA-256 is unchanged; matching bytes alone never make a file Guard's. When Guard sets `core.hooksPath`, it records that in its checkout state in Git's metadata (`kaal/guard/state.json` there), never in a tracked file. Only Guard writes the record and the state.

Each directory Guard writes into gets a `.gitattributes` of Guard's own: `.githooks/.gitattributes` beside the hook, `.github/workflows/.gitattributes` beside the workflow, and one in the Skill's directory. Each one marks only Guard's own files `-text`, so a clone with `core.autocrlf=true` keeps them byte for byte and they stay Guard's. It is a catalogued, registered file like the others. Beside a hook or workflow of the repository's own, or in a Skill directory that holds files of the repository's own, it is not installed, and `init` says why.

## Declare the checks

The checks are yours: any program your repository already runs. Declare each one in its own file, `.kaal/config/guard/<name>.md`. The file's name, without `.md`, is the check's name, so it has no spaces or colons:

```markdown
---
type: Guard/Check
command: node checks/scope.mjs
runs: [ci]
facts: [base, changed]
---
What this check proves, and how to resolve its failures. Guard never reads this part.
```

Only the frontmatter, between the two `---` lines, is a declaration. The body is for the people and agents who resolve a failure; it never changes a verdict or the order the checks run in.

- **`type`**: always `Guard/Check`.
- **`command`**: a program and its arguments, as words separated by spaces. Double or single quotes group a word. There are no shell features: no pipes, redirection, variables or comments. It runs from the repository root, with no stdin.
- **`runs`**: `hook`, for the Git hook, and/or `ci`, for a CI job. `local`, the word of `0.0.1`, is refused, naming `hook`.
- **`facts`** (optional): the facts the check needs. A fact that is not supplied makes the check cannot judge. The facts it receives, as environment variables:
  - `head` is `GUARD_HEAD`, the candidate commit.
  - `base` is `GUARD_BASE`, and `base-ref` is `GUARD_BASE_REF`: the target commit and its name.
  - `changed` is `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.
- **`trusted`** (optional): a file or directory Guard takes as the base commit holds it, never the candidate's version, and runs in place of the candidate's. It needs the `base` fact, and the verdict names the base commit that supplied it. That is Git provenance for exactly the designated files, and nothing more: what they import from outside the designation, the interpreter and the environment the check runs in are not covered. To bring a helper file under it, designate a directory that holds the checker and the helper. A trusted check's declaration is judged from the base too: when the candidate changes it in any member, `runs` included, or deletes it, the check is cannot judge and nothing runs, until that change lands on its own and the base holds it. A `base` that names no commit Guard can read, such as an unfetched one, makes every selected check cannot judge, naming the base, since Guard cannot tell which of them the base trusts; nothing runs. Under GitHub's `pull_request`, the candidate also supplies Guard's workflow and the installed Guard, which Guard cannot defend against: protect `trusted` with a review rule for `.kaal/config/guard/` and `.github/`, such as a code owner.
- **`outcomes`** (optional): `{"4": held}` names exit status 4 as held. The status is a double-quoted key: KAAL reads every frontmatter key as a string, so an unquoted `{4: held}` is refused, naming the quoted form. The key is the status in plain decimal, `"4"` to `"255"`: `"04"` and `"+4"` are refused, naming `"4"`. Held is shown as held, never as a pass and never as a fail.

The frontmatter is a strict subset of YAML that Guard reads itself: one `key: value` line per member; plain or double-quoted strings and integers; flow lists such as `[hook, ci]`; and the flow map of `outcomes`, its keys double-quoted. Anything else, a member Guard does not define, or a value of the wrong type is refused as cannot judge, naming the file, the member and the rule, and the member you probably meant (`trustd: not defined for Guard/Check; did you mean trusted?`). Nothing then runs and nothing is written. The installation record and the checkout state are held to the same rule.

`kaal-guard` reads the directory `--config <dir>` names, or else `.kaal/config/guard/` at the repository's top level, from any directory inside it. Only the `.md` files directly in it are declarations, taken in name order. Each must be a regular file: a `.md` entry that is a symbolic link or a directory is cannot judge, naming it, so a check can never drop out of a run unseen. Where there is none, every command but `init`, `upgrade` and `remove` is cannot judge and says to run `kaal-guard init`.

**Limitation: `Guard/Check` is not registered.** `type: Guard/Check` names the type Guard owns, and Guard's own validation above decides whether a declaration is valid; it always runs and is always required. KAAL Core reads each declaration as a typed artifact. It reports the artifact *registered* only when the Engine admits a Type Definition named `Guard/Check` that the Guard Capability owns. Guard installs no such Type Definition, so your declarations are *unregistered*: `kaal verify` lists them with that state and passes, and no Core verification has checked them beyond Guard. That is not a defect in your declarations, and it does not make them globally verified. Once a `Guard/Check` Type Definition is registered, Core reports the same unchanged declarations as registered, and Guard runs them as before.

A `guard.json` from `0.0.1` is refused, with the steps to set Guard up afresh: remove what `0.0.1` installed, declare each of its checks as a file, delete `guard.json` and run `kaal-guard init`.

## Verdicts

A check's exit status is its verdict:

| Status | Verdict | Hook | CI job |
| --- | --- | --- | --- |
| 0 | pass | lets the push through | succeeds |
| 1 | fail | blocks | fails |
| 2 | cannot judge | blocks | fails |
| 3 | not applicable | lets the push through | succeeds, reported as not applicable |
| a status named `held` | held | lets the push through | succeeds, with a warning |
| any other | cannot judge | blocks | fails |

Guard prints one line per check, `<verdict>: <check>: <evidence>`. A fail or cannot-judge line is followed by `do: <next step>`. The check's own output goes, unchanged, to the terminal or the CI log. A run with a fail or cannot judge ends with one more line naming where the `kaal-guard` Skill is, which explains each verdict and what resolves it; with `--github`, its error annotations and step summary name it too. Where no Skill is deployed in the repository, that line names the package's own copy.

## Commands

```sh
npx kaal-guard run --hook             # the hook checks, as the hook runs them
npx kaal-guard run --ci               # the ci checks, as Guard's workflow runs them
npx kaal-guard run --check <name> [--github] [--head <commit>] [--base <commit>] [--base-ref <name>] [--changed <file>]
npx kaal-guard verify [--github]      # each ci check is declared by a workflow job
npx kaal-guard init [--hook] [--ci]   # prepares Guard, and activates the surfaces you name
npx kaal-guard upgrade                # moves only registered, unmodified files to this version's content
npx kaal-guard remove [--hook] [--ci] # undoes the surfaces you name, or everything; keeps your declarations
```

Every command takes `--config <dir>`. `--github` adds GitHub annotations and a step-summary table.

`upgrade` reports each file as upgraded or current, with the versions it moves between, or as kept: modified since Guard wrote it, which keeps its registered version, or not Guard's. It installs a file a newer version adds only for a surface you activated, or for the Skill, which every `init` installs, and never activates a surface: only `init --hook` and `init --ci` do. A registered file of an activated surface, or of the Skill, that the repository no longer has is reinstalled. Installing an earlier version from `0.0.2` on and running `upgrade` moves unmodified files back the same way.

## The hook

For each pushed branch, the hook:

1. takes the remote's default branch (`<remote>/HEAD`, else `<remote>/main`) as the base and prints the commit it used;
2. supplies `head`, `base`, `base-ref` and `changed`, and runs the `hook` checks.

The checks run in your working tree as it stands, not in the commit being pushed: uncommitted changes count, so commit or stash them first when the verdict must be the pushed commit's. When Git cannot give a fact, such as an unfetched base or changed paths it cannot compute, the hook supplies nothing in its place, so a check that needs it cannot judge. The hook is local feedback only: CI decides. `git push --no-verify` skips it once.

A repository with a `pre-push` hook of its own adds this line to it:

```sh
sh node_modules/@kaihacksai/kaal-guard/templates/pre-push "$@" || exit 1
```

## CI, and what verify does not say

A job declares a check with a step whose whole `run:` line is `kaal-guard run`, `npx kaal-guard run` or `npx --no kaal-guard run` with `--check <name>`. Further arguments are words, plain or quoted, such as `--head "$HEAD"`; a shell operator after the invocation, such as `|| true`, `;`, `|` or `&`, or a `${{ }}` expression other than `${{ matrix.check }}`, makes the step declare nothing, because its exit status would no longer be Guard's. Prefer `npx --no`: where the package is not installed it fails, instead of fetching whatever the registry holds under the command's name:

```yaml
- run: npx --no kaal-guard run --check unit --github
```

`--check ${{ matrix.check }}` declares each check the job lists as a line `- { check: <name> }`. A step that runs `kaal-guard run --ci` declares every ci check: that is the form of Guard's own workflow, which you opt into with `init --ci`. A check no job declares is missing coverage: `init` and `verify` name the step to add, and Guard never runs it in CI on its own. A job declares `verify` with a step whose whole `run:` line is `kaal-guard verify`, with the same prefixes, optionally followed by `--config <dir>` and `--github`. Nothing else declares anything, and `verify` infers nothing from scripts or other YAML.

Three claims stay apart:

| Claim | Established by |
| --- | --- |
| The check is declared in a workflow | `kaal-guard verify` |
| GitHub ran the check | the CI job's run and its verdict line |
| A merge requires the check | the repository's branch protection or rulesets |

On `pull_request`, GitHub checks out the merge of the pull request into its base, not the commit `head` names, so a check judges that merge result; Guard's workflow passes the pull request's own head and base as the facts. Neither `init` nor `verify` makes a job required, or proves that it ran. To have a merge depend on a check, add its job as a required check in branch protection yourself.

## Diagnosis

| Symptom | Do |
| --- | --- |
| `cannot judge: …` | Fix the named cause. It blocks and never passes. |
| `held: …` | Read the check's own output for the reason. |
| The hook passes but CI fails | Compare the base the hook printed with CI's base, run `git fetch`, then push again. |
| `verify` names a check no job declares | Give a job the declared step, and make the job required. |
| `init` or `upgrade` kept a file | It is yours: either Guard's record does not register it, or you changed it. Add the printed line yourself. |
| The hook doesn't run | Check `git config core.hooksPath`. |

## Remove

```sh
npx kaal-guard remove --ci     # undoes CI only
npx kaal-guard remove --hook   # undoes the hook only
npx kaal-guard remove          # undoes both, and removes the installation record
npm uninstall @kaihacksai/kaal-guard
```

Each form deletes only the registered files of that surface you haven't changed and marks it no longer activated; a file you changed is kept and reported. Plain `remove` also deletes the Skill's registered, unchanged files, the installation record, and `.kaal/config/guard/` where it is left empty. A directory you named with `--config` is never deleted. It unsets `core.hooksPath` only in the scope Guard's checkout state records, and only while it still holds the value Guard set; a clone or worktree without that state leaves it alone. No form touches your declarations in `.kaal/config/guard/` or your Test Cases.

## Verify the installed package

To check that the copy of Guard you installed works as intended, run this from your project:

```sh
npm explore @kaihacksai/kaal-guard -- npm test
```

It runs every test loop Guard owns against the installed copy: the acceptance cases for Intent, Requirements and Architecture, and the inner Code tests. They ship with the package. Each case works in a temporary repository of its own, outside your project, and your project is left as it was. It needs Node 24 or later, Git and npm on `PATH`, and the network is not needed. A run takes a few minutes, and on Windows up to about eleven. Keep your project idle while it runs: the run checks that your project is unchanged afterwards, and it cannot tell its own changes from yours, an editor's or Git's.

The run prints:
- the package, its version, where it is installed, and the integrity npm recorded for it in `node_modules/.package-lock.json` (npm's hidden lockfile, not your project's `package-lock.json`);
- a digest of the installed files;
- one line per case, and a line per loop;
- the coverage of Guard's promises: each one covered by a case of this run, or allocated to the publisher's Engineering Test Plan with what the publisher runs, or named as unverified because no Test Case checks it. An allocated or unverified promise is not verified by your run, and the output says so;
- whether your project is unchanged.

It ends in exactly one result:

| Result | Exit | Meaning |
| --- | --- | --- |
| `verified` | 0 | Every declared case ran and passed, except a case declared not applicable on your platform, which is named. Every promise is covered by this run, or named as allocated to the publisher or as unverified. |
| `failed` | 1 | A case failed, or your project changed during the run. The output names which. For a change, check whether you, an editor or a tool such as Git changed those paths during the run; if nothing did, report the output. |
| `cannot verify` | 2 | Nothing failed, but the run cannot claim verification. A prerequisite may be missing, the installed files may not match the manifest the package ships, a case may have been skipped or not run, a loop may have run no case, or a promise may be neither covered, nor allocated, nor named as unverified. If the verification itself could not complete, the output names the error; report it. The output names the cause and what to do. |

The run's last line, `kaal-guard-verification {…}`, carries the same as JSON for tools. Under `npm explore`, npm may print its own lines after it, so look for the line by its prefix rather than taking the last line of the output.

The installed files are checked against a manifest that ships inside the package. A match shows the copy is consistent with what the package says it ships. It is not independent provenance: for that, rely on your lockfile's integrity and npm's provenance for the published version.

**What `verified` does and does not tell you.** It tells you three things. Every case the package declares ran and passed against your installed copy, apart from those named as not applicable on your platform. Your installed files match the package's manifest. Nothing the comparison covers changed during the run.

It does not tell you these:
- **Where the bytes came from.** Someone who could edit the installed files could also edit the manifest, so only your lockfile's integrity and npm's provenance can answer that.
- **Behaviour no case covers**, the promises allocated to the publisher's Engineering Test Plan, and those no Test Case verifies. The output lists them.
- **Changes outside the comparison.** The comparison takes in every path in your project except `node_modules` directories, and adds Guard's installed copy. A symbolic link counts by its target, not by what it points to. Git's object store and files over 64 MiB count by size and modification time only. Your other dependencies, the temporary directory the cases use, and npm's cache and logs in your home directory are not compared.

This judges the package only, not how your repository uses it. For your repository's integration, run `npx kaal-guard verify`. The result is your own observation of your run.

## Guard's contract

What Guard promises, and how each promise is checked, ships with the package in `docs/`: [Intent](docs/intent.md), [Requirements](docs/requirements.md), [Architecture](docs/architecture.md), [Testing](docs/testing.md) and [Limitations](docs/limitations.md). The identifiers there, such as `guard/F7`, are the ones the delivered cases name.

## What Guard does not establish

Guard runs the checks you declare and reports their verdicts. It does not establish that a check or a Test Case it runs is unchanged since you accepted it: a changed test can still return pass, and that pass is not a guarantee from Guard. Review changes to your checks and Test Cases as you review any other change, and use `trusted` where a checker must come from the base commit.

## Release notes

### 0.0.4

Added:

- You can verify the installed package. `npm explore @kaihacksai/kaal-guard -- npm test` runs every test loop Guard owns against your installed copy: the acceptance cases for Intent, Requirements and Architecture, and the inner Code tests. It ends in `verified` (exit 0), `failed` (1) or `cannot verify` (2), names the package, its version, its location and the installed files' digest, and leaves your project as it was. [Verify the installed package](#verify-the-installed-package) says what each result means and what `verified` does not tell you.
- Every promise Guard makes is covered by a case of that run, allocated to the publisher's Engineering Test Plan with what the publisher runs, or named as unverified because no Test Case checks it. An allocated or unverified promise is printed as not verified by your run. A promise that is none of these, or a loop that runs no case, is `cannot verify`.
- A case that does not apply on your platform is declared, named as not applicable and not counted as skipped. One inner case is not applicable on Windows.
- The run removes every temporary directory its cases make, whether they pass or fail. It compares sockets, FIFOs and devices in your project by their kind and never opens them, and it counts a file that disappears while being read, such as a lock Git removes, as absent. When your project changed during the run, it names the paths and asks you to check whether you or a tool such as Git changed them, instead of telling you to restore them.
- Guard's contract ships in `docs/`: its Intent, Requirements, Architecture, Testing and Limitations, with every identifier the cases name.

Fixed:

- Up to `0.0.3`, `npm explore @kaihacksai/kaal-guard -- npm test` ran no test and exited 0. It now runs the delivered cases, and a run that cannot claim verification says so.

Nothing changes in `run`, `verify`, `init`, `upgrade` or `remove`, or in the declarations: Guard's code, its templates and its Skill are byte for byte those of `0.0.3`. After you move to `0.0.4`, `upgrade` rewrites the version fields of the installation record, `.kaal/state/guard/installation.json`, to `0.0.4`, even though no managed asset's bytes change: a one-file diff to commit.

### 0.0.3

Fixed:

- A trusted check can no longer be bypassed by the change it judges. Where the base declares a check `trusted`, a candidate that changes its declaration in any member, or deletes it, makes it cannot judge, naming the check; nothing runs. That includes changing `runs` so the check leaves the surface being run, which before the Release still took it out of `run --ci` or `run --hook` unjudged. Land such a declaration change on its own first. A check the base doesn't declare, or declares without `trusted`, runs as before.
- A `base` that is not a commit Guard can read is cannot judge for every selected check, naming the base, never read as a base that declares nothing trusted.
- `verify` reads a step as Guard's only when the invocation is its whole `run:` line. A step such as `npx --no kaal-guard run --check unit --github || true`, which can never fail, no longer counts as declaring `unit`. This was so in `0.0.2` too.
- The package's own `npm test` runs its current suite and passes.
- Plain `init` no longer passes over a registered hook or workflow the repository has lost, such as `.githooks/pre-push` while `core.hooksPath` still points at it: it lists the file under still to do, naming the `init --hook` or `init --ci` that reinstalls it.

Changed:

- The comment at the top of Guard's workflow (`.github/workflows/guard.yml`) names its two jobs. `upgrade` moves an unmodified `0.0.2` workflow to it; the jobs and steps are unchanged. `init`'s own output names the two jobs too, where it said one.

Documented: what `trusted` cannot guard and the review rule it needs, that the hook judges the working tree, that Guard's workflow has two jobs, and that CI checks judge GitHub's merge commit.

### 0.0.2

`0.0.2` is a deliberate breaking change within `0.0.x`. There is no migration from `0.0.1`, no dual format and no rollback to it: a `0.0.1` repository sets `0.0.2` up afresh.

Breaking:

- The checks are declared one per file, in `.kaal/config/guard/<name>.md`. A `guard.json` is refused as cannot judge, naming the fresh setup.
- `runs` names `hook` where `0.0.1` said `local`. `local` is refused, naming `hook`.
- `init` activates nothing on its own. `--hook` activates the hook, and `--ci` installs Guard's workflow, which now runs `verify` and every `ci` check in two jobs, `Guard` and `Guard checks`. (These notes said one job when `0.0.2` was published; corrected in `0.0.3`.)
- Guard's installation record is `.kaal/state/guard/installation.json`, and a `core.hooksPath` Guard set is recorded in Git's metadata, not in a tracked file.
- Node 24 or later, and Git 2.26 or later.
- `outcomes` keys are exit statuses in plain decimal, from `"4"` to `"255"`.

New:

- Guard's Skill, at `.agents/skills/kaal-guard/`, explains each verdict, and a failing or cannot-judge run names where it is.
- `verify` shows that a workflow job declares each `ci` check.
- Guard's `.gitattributes` keep its files byte for byte in clones with `core.autocrlf=true`.
- Guard's workflow pins its actions by commit SHA, runs Node 24, and passes the pull request's facts to the shell through `env:`.

Setting `0.0.2` up in a `0.0.1` repository:

1. With `0.0.1` still installed, run `npx kaal-guard remove`, or delete the hook and workflow it wrote.
2. Declare each check of `guard.json` as `.kaal/config/guard/<name>.md` ([Declare the checks](#declare-the-checks)), writing `hook` for `local`.
3. Delete `guard.json`.
4. Install `0.0.2` and run `npx kaal-guard init`, with `--hook`, `--ci` or both for the surfaces you want.

Known limitation: see [What Guard does not establish](#what-guard-does-not-establish).

MIT licensed.
