# @kaihacksai/kaal-guard

Connects a repository's own checks to its local Git `pre-push` hook and to GitHub CI, with one meaning per check. Guard runs the checks you list and reads their verdicts. It never interprets what a check tests or what it prints.

The command is `kaal-guard`. Node 20 or later and Git. The hook is POSIX `sh`, which Git for Windows provides.

## Start

```sh
npm install --save-dev @kaihacksai/kaal-guard
npx kaal-guard init
```

`init` writes only what is missing and reports in up to four parts:

- **installed by Guard:** `.githooks/pre-push`, `.github/workflows/guard.yml`, `guard.json` if there was none, and `core.hooksPath` set to `.githooks`.
- **left untouched:** any of these the repository already had.
- **still to do in this repository:** the line to add for each of those.
- **executed by Guard, not managed:** each check, and `verify`, that one of the repository's own workflows already runs in Guard's declared form (see `kaal-guard verify`). Guard's workflow then carries jobs only for what remains, and none when nothing does.

`init` sets `core.hooksPath` only when all three of these hold:

- it is unset,
- the hook in `.githooks` is Guard's own,
- Git runs no hooks of the repository's own from `.git/hooks`, which setting it would turn off.

`guard.json` records every file Guard wrote, with its SHA-256, under `managed`, and the Guard version that last wrote or confirmed it under `writers`; a file with no writer was written by `0.0.1`. A `core.hooksPath` Guard set is recorded under `config`. Guard changes only these entries of `guard.json`, and every other byte stays as you wrote it.

## List the checks

The checks are yours: any program your repository already runs. List them in `guard.json` at the repository root:

```json
{
  "checks": {
    "unit": { "command": "npm test", "runs": ["local", "ci"] },
    "scope": { "command": "node checks/scope.mjs", "runs": ["ci"], "facts": ["base", "changed"] }
  }
}
```

- **`command`**: a program and its arguments, as words separated by spaces. Double or single quotes group a word. There are no shell features: no pipes, redirection, variables or comments. It runs from the repository root, with no stdin.
- **`runs`**: `local`, for the hook, and/or `ci`, for a CI job.
- **`facts`** (optional): the facts the check needs. A fact that is not supplied makes the check cannot judge. The facts it receives, as environment variables:
  - `head` is `GUARD_HEAD`, the candidate commit.
  - `base` is `GUARD_BASE`, and `base-ref` is `GUARD_BASE_REF`: the target commit and its name.
  - `changed` is `GUARD_CHANGED`, a file listing the changed paths, NUL-separated.
- **`trusted`** (optional): a file or directory Guard takes as the base commit holds it, never the candidate's version, and runs in place of the candidate's. It needs the `base` fact, and the verdict names the base commit that supplied it. That is Git provenance for exactly the designated files, and nothing more: what they import from outside the designation, the interpreter and the environment the check runs in are not covered. To bring a helper file under it, designate a directory that holds the checker and the helper.
- **`outcomes`** (optional): `{ "4": "held" }` names exit status 4 as held. Held is shown as held, never as a pass and never as a fail.

After changing the `ci` checks, run `npx kaal-guard upgrade`. It rewrites the generated workflow while that file is still unmodified.

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
npx kaal-guard run --local            # the local checks, as the hook runs them
npx kaal-guard run --ci               # the ci checks
npx kaal-guard run --check <name> [--github] [--head <commit>] [--base <commit>] [--base-ref <name>] [--changed <file>]
npx kaal-guard verify [--github]      # each ci check is declared by a workflow job
npx kaal-guard upgrade                # rewrites only unmodified managed files
npx kaal-guard remove                 # deletes only unmodified managed files; keeps guard.json and your checks
```

`--github` adds GitHub annotations and a step-summary table.

## The hook

For each pushed branch, the hook:

1. takes the remote's default branch (`<remote>/HEAD`, else `<remote>/main`) as the base and prints the commit it used;
2. supplies `head`, `base`, `base-ref` and `changed`, and runs the `local` checks.

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

`--check ${{ matrix.check }}` declares each check the job lists as a line `- { check: <name> }`. Nothing else declares a check, and `verify` infers nothing from scripts or other YAML.

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
| `init` or `upgrade` kept a file | It is yours: either it existed before Guard, or you changed it. Add the printed line yourself. |
| The hook doesn't run | Check `git config core.hooksPath`. |

## Remove

```sh
npx kaal-guard remove
npm uninstall @kaihacksai/kaal-guard
```

`remove` deletes the managed files you haven't changed. It unsets `core.hooksPath` only if Guard set it. `guard.json` and your checks stay.

MIT licensed.
