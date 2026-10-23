# Guard: Run

`kaal-guard run` exists from C1, `verify` from C4a, and `init`, `upgrade` and `remove` from C4b, so far only in this repository, where KAAL's pre-push hook and CI use `run` from C3a and C3c. The consumer docs ship in the package as its README (C4d); this page is the Engineering view.

## Embed: shipped in the package

The package is published to npm as `kaal-guard`, first as `kaal-guard@0.0.1`.

```sh
npm install --save-dev kaal-guard
npx kaal-guard init        # writes guard.json and missing adapters only; reports any it left alone
npx kaal-guard run --local # what the hook runs
npx kaal-guard verify      # a workflow job declares every ci check in Guard's form (declared integration only)
npx kaal-guard upgrade     # replaces only unmodified managed files
npx kaal-guard remove      # deletes only unmodified managed files; keeps guard.json and your tests
```

`init` reports apart what it installed, what it left untouched and what is still to do. It sets `core.hooksPath` to `.githooks` only if it is unset, the hook there is Guard's own and Git runs no hooks of the repository's own from `.git/hooks`, and records that. If the repository already has a `pre-push` hook or workflows, `init` leaves them alone and prints the line to add: `sh node_modules/kaal-guard/templates/pre-push "$@" || exit 1` in the hook, or a step `npx kaal-guard run --check <name> --github` in a job.

The generated workflow is not enforcement. Three claims stay apart:
- `verify` shows declared integration only: a workflow job names each ci check in Guard's form.
- That a check ran is the evidence of its CI job.
- That a merge requires it holds only once branch protection names the job as a required check, which the repository sets itself; neither `init` nor `verify` does or proves it.

## Engineer: KAAL itself

KAAL installs `kaal-guard` from its own tree, `packages/kaal-guard`, as a development dependency (not a workspace) and lists its checks in `guard.json`. Development, the full documentation and the Engineering-only outer tests live here, in `engineering/guard/`.

## External: naked delivery by KAAL Engineering

KAAL Engineering implements Guard in the target from the target's own commands, adapting it where needed, and delivers it as one Change, normally a pull request. The Change contains a working `.githooks/pre-push`, working CI jobs (in the target's existing workflows or a new one) and the local docs to maintain them. It contains neither the `kaal-guard` package nor any other KAAL element, and never overwrites the target's existing files.

## Verify

Guard owns one integration contract, and `verify` checks only that: whether each `ci` check is **declared** in Guard's declared form. It reads `.github/workflows/*.yml` and `*.yaml` as lines and infers nothing from scripts or other YAML.

- The jobs are the `  <key>:` lines indented two spaces directly under a top-level `jobs:` line.
- A job declares a check with a step whose whole `run:` value, on that one line, is `kaal-guard run`, `npx kaal-guard run` or `npx --no kaal-guard run` with `--check <name>`, the name a plain word, as in `- run: npx kaal-guard run --check <name> --github`.
- `--check ${{ matrix.check }}` declares each check the job lists on a line of its own as `- { check: <name>, … }`.
- Nothing else declares anything: a block script, a chained command, a quoted name, another expression or matrix key, `echo`, `name:` or `env:` text, a comment.

Three claims stay separate:

| Claim | Established by |
| --- | --- |
| **Declared integration**: the check is wired in Guard's declared form | `verify` |
| **Observed execution**: GitHub Actions ran the check | CI execution evidence: the job's run and its verdict line |
| **Merge enforcement**: GitHub requires the check | repository governance: branch protection or rulesets |

A pass says `declared by job <key> in <file>; declared integration only, not that GitHub ran or requires that job`.

## Diagnosis

| Symptom | Do |
| --- | --- |
| `cannot judge: …` | fix the named cause; it blocks and never passes |
| `not applicable: …` | nothing; it is reported as not applicable, not as a pass |
| `held: …` | the Owner's evidenced hold; the check's own output in the log says why |
| the hook passes but CI fails | compare the base the hook printed with CI's; `git fetch`, then rerun |
| `verify` names a ci check no job declares | give a job the step `- run: npx kaal-guard run --check <name> --github` ([the declared form](#verify)), and make that job required; `verify` does not check either |
| `init` left a file alone | it existed before Guard; add the printed line yourself |
| the hook doesn't run | `git config core.hooksPath .githooks` |
