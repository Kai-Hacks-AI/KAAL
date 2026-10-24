# @kaihacksai/kaal-guard

Connects a repository's own checks to its local Git `pre-push` hook and to GitHub CI, with one meaning per check. Guard runs the checks you list and reads their verdicts. It never interprets what a check tests or what it prints.

The command is `kaal-guard`. Node 20 or later and Git 2.26 or later. The hook is POSIX `sh`, which Git for Windows provides.

## Start

```sh
npm install --save-dev @kaihacksai/kaal-guard
npx kaal-guard init              # prepares Guard; activates nothing
npx kaal-guard init --hook       # also activates the Git hook
npx kaal-guard init --ci         # also activates Guard's workflow, if you want it to run every ci check
npx kaal-guard init --hook --ci  # both
```

Three things stay apart. **Initialization** prepares Guard: `init` creates `.kaal/config/guard/`, where you declare your checks, and the installation record. **Registration** says what Guard may execute: each declaration's `runs` names `hook`, `ci` or both, and the two sets may differ. **Activation** says where it executes, and it is always your choice: `--hook` and `--ci` each activate one surface, and neither implies the other. Every form is safe to repeat.

Your CI is yours: you decide which job runs each check. `init` writes only what is missing and reports in up to four parts:

- **installed by Guard:** `.kaal/config/guard/` and the installation record; with `--hook`, `.githooks/pre-push` and `core.hooksPath` set to `.githooks`; with `--ci`, `.github/workflows/guard.yml`.
- **left untouched:** any of these the repository already had, and any file at those paths that Guard did not write.
- **still to do in this repository:** how to activate each surface you have not, the line to add for each file left untouched, and for each `ci` check that no workflow job runs, the step to add to a job of your own workflow ([CI](#ci-and-what-verify-does-not-say)).
- **executed by Guard, not managed:** each check, and `verify`, that one of the repository's own workflows already runs in Guard's declared form (see `kaal-guard verify`).

`init --ci` is one decision: Guard's workflow runs `verify` and every `ci` check in one job, so you register nothing twice. It is installed only where no workflow of yours already runs a check or `verify` in Guard's declared form, since it would run those a second time; `init --ci` then installs nothing for CI and names what it found. `upgrade` never installs it.

`init --hook` sets `core.hooksPath` only when all three of these hold:

- it is unset in every Git configuration scope,
- the hook in `.githooks` is the one Guard installed,
- Git runs no hooks of the repository's own from `.git/hooks`, which setting it would turn off.

Every file Guard writes is content the package catalogues in its `contract.json`, written byte for byte. Guard registers each one, with its SHA-256 and the version that wrote it, in `.kaal/state/guard/installation.json`, which you commit with the files. The record also lists the surfaces you activated. A file is Guard's only while that record registers it and its SHA-256 is unchanged; matching bytes alone never make a file Guard's. When Guard sets `core.hooksPath`, it records that in its checkout state in Git's metadata (`kaal/guard/state.json` there), never in a tracked file. Only Guard writes the record and the state.

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
- **`trusted`** (optional): a file or directory Guard takes as the base commit holds it, never the candidate's version, and runs in place of the candidate's. It needs the `base` fact, and the verdict names the base commit that supplied it. That is Git provenance for exactly the designated files, and nothing more: what they import from outside the designation, the interpreter and the environment the check runs in are not covered. To bring a helper file under it, designate a directory that holds the checker and the helper.
- **`outcomes`** (optional): `{4: held}` names exit status 4 as held. Held is shown as held, never as a pass and never as a fail.

The frontmatter is a strict subset of YAML that Guard reads itself: one `key: value` line per member; plain or double-quoted strings and integers; flow lists such as `[hook, ci]`; and the flow map of `outcomes`. Anything else, a member Guard does not define, or a value of the wrong type is refused as cannot judge, naming the file, the member and the rule, and the member you probably meant (`trustd: not defined for Guard/Check; did you mean trusted?`). Nothing then runs and nothing is written. The installation record and the checkout state are held to the same rule.

`kaal-guard` reads the directory `--config <dir>` names, or else `.kaal/config/guard/` at the repository's top level, from any directory inside it. Only the `.md` files directly in it are declarations, taken in name order. Where there is none, every command but `init`, `upgrade` and `remove` is cannot judge and says to run `kaal-guard init`.

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

Guard prints one line per check, `<verdict>: <check>: <evidence>`. A fail or cannot-judge line is followed by `do: <next step>`. The check's own output goes, unchanged, to the terminal or the CI log.

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

`upgrade` reports each file as upgraded or current, with the versions it moves between, or as kept: modified since Guard wrote it, which keeps its registered version, or not Guard's. It installs a file a newer version adds only for a surface you activated, and never activates one: only `init --hook` and `init --ci` do. Installing an earlier version from `0.0.2` on and running `upgrade` moves unmodified files back the same way.

## The hook

For each pushed branch, the hook:

1. takes the remote's default branch (`<remote>/HEAD`, else `<remote>/main`) as the base and prints the commit it used;
2. supplies `head`, `base`, `base-ref` and `changed`, and runs the `hook` checks.

When Git cannot give a fact, such as an unfetched base or changed paths it cannot compute, the hook supplies nothing in its place, so a check that needs it cannot judge. The hook is local feedback only: CI decides. `git push --no-verify` skips it once.

A repository with a `pre-push` hook of its own adds this line to it:

```sh
sh node_modules/@kaihacksai/kaal-guard/templates/pre-push "$@" || exit 1
```

## CI, and what verify does not say

A job declares a check with a step whose whole `run:` line is `kaal-guard run`, `npx kaal-guard run` or `npx --no kaal-guard run` with `--check <name>`. Prefer `npx --no`: where the package is not installed it fails, instead of fetching whatever the registry holds under the command's name:

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

Neither `init` nor `verify` makes a job required, or proves that it ran. To have a merge depend on a check, add its job as a required check in branch protection yourself.

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

Each form deletes only the registered files of that surface you haven't changed and marks it no longer activated; a file you changed is kept and reported. Plain `remove` also deletes the installation record. It unsets `core.hooksPath` only in the scope Guard's checkout state records, and only while it still holds the value Guard set; a clone or worktree without that state leaves it alone. No form touches your declarations in `.kaal/config/guard/` or your Test Cases.

MIT licensed.
