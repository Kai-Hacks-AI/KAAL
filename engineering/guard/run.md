# Guard: Run

`kaal-guard run` exists from guard/C1, `verify` from guard/C4a, and `init`, `upgrade` and `remove` from guard/C4b, so far only in this repository, where KAAL's pre-push hook and CI use `run` from guard/C3a and guard/C3c. The consumer docs ship in the package as its README (guard/C4d); this page is the Engineering view.

## Embed: shipped in the package

The package is published to npm as `@kaihacksai/kaal-guard`, first as `@kaihacksai/kaal-guard@0.0.1`, once the Owner authorizes it (R1). Its command is `kaal-guard`.

```sh
npm install --save-dev @kaihacksai/kaal-guard
npx kaal-guard init        # creates .kaal/config/guard/ and the installation record; activates nothing (guard/F30)
npx kaal-guard init --hook # also activates the hook; --ci activates Guard's workflow, on request only (guard/F17)
npx kaal-guard run --hook  # what the hook runs; run --ci what Guard's workflow runs
npx kaal-guard verify      # a workflow job declares every ci check in Guard's form (declared integration only)
npx kaal-guard upgrade     # replaces only registered, unmodified managed files
npx kaal-guard remove      # --hook or --ci undoes one surface; alone, both and the record; keeps your declarations and tests
```

Each check is declared as `.kaal/config/guard/<name>.md`, its frontmatter in Guard's strict YAML subset (guard/F1); every command refuses a declaration, installation record or checkout state outside its contract as cannot judge, naming the file, the member and the rule (guard/F18). `kaal-guard` reads the directory `--config` names, or `.kaal/config/guard/` at the top level (guard/F28). A root `guard.json` from `0.0.1` is refused, naming the fresh setup (guard/F15).

`init` reports apart what it installed, what it left untouched and what is still to do, including how to activate each surface not yet activated. It writes only catalogued content (`contract.json`) and registers each file it writes in `.kaal/state/guard/installation.json` (guard/F29); a file the record does not register is never Guard's. `init --hook` sets `core.hooksPath` to `.githooks` only if it is unset in every scope, the hook there is Guard's registered one and Git runs no hooks of the repository's own from `.git/hooks`, and records that in its checkout state in Git's metadata. If the repository already has a `pre-push` hook or workflows, `init` leaves them alone and prints the line to add: `sh node_modules/@kaihacksai/kaal-guard/templates/pre-push "$@" || exit 1` in the hook, or a step `npx --no kaal-guard run --check <name> --github` in a job.

Guard does not establish that a check or a Test Case it runs is unchanged since its accepted PLAN baseline: a changed test can still return GREEN, and that is not a Guard integrity guarantee ([the `0.0.2` release boundary](change.md#002-release-boundary)).

The generated workflow is not enforcement. Three claims stay apart:
- `verify` shows declared integration only: a workflow job names each ci check in Guard's form.
- That a check ran is the evidence of its CI job.
- That a merge requires it holds only once branch protection names the job as a required check, which the repository sets itself; neither `init` nor `verify` does or proves it.

## Engineer: KAAL itself

KAAL installs `@kaihacksai/kaal-guard` from its own tree, `packages/kaal-guard`, as a development dependency (not a workspace) and declares its checks in `.kaal/config/guard/`. Its own hook and workflows run them in the declared form, so `init` reports them as executed by Guard, not managed, and `init --ci` installs nothing beside them (guard/F17). Development, the full documentation and the Engineering-only outer tests live here, in `engineering/guard/`.

## External: naked delivery by KAAL Engineering

KAAL Engineering implements Guard in the target from the target's own commands, adapting it where needed, and delivers it as one Change, normally a pull request. The Change contains a working `.githooks/pre-push`, working CI jobs (in the target's existing workflows or a new one) and the local docs to maintain them. It contains neither the `kaal-guard` package nor any other KAAL element, and never overwrites the target's existing files. From guard/C5 the tooling is `engineering/guard/external/deliver.mjs`; [its page](external/README.md) says how to deliver.

## Verify

Guard owns one integration contract, and `verify` checks only that: whether each `ci` check is **declared** in Guard's declared form. It reads `.github/workflows/*.yml` and `*.yaml` as lines and infers nothing from scripts or other YAML.

- The jobs are the `  <key>:` lines indented two spaces directly under a top-level `jobs:` line.
- A job declares a check with a step whose whole `run:` value, on that one line, is `kaal-guard run`, `npx kaal-guard run` or `npx --no kaal-guard run` with `--check <name>`, the name a plain word, as in `- run: npx kaal-guard run --check <name> --github`.
- `--check ${{ matrix.check }}` declares each check the job lists on a line of its own as `- { check: <name>, … }`.
- A job declares every `ci` check with a step whose whole `run:` value is `kaal-guard run --ci`, with one of the same prefixes and options after it. This is the form of Guard's own workflow, which the consumer opts into with `init --ci` (guard/F17): the step is the consumer's one assignment of every `ci` check to that job.
- A job declares the consistency check with a step whose whole `run:` value is `kaal-guard verify`, with one of the same prefixes, optionally followed by `--config <dir>` and then `--github`.
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
| `verify` names a ci check no job declares | give a job of your workflow the step `- run: npx kaal-guard run --check <name> --github` ([the declared form](#verify)), or run `kaal-guard init --ci` to hand every ci check to Guard's workflow; then make that job required. `verify` checks neither; Guard never adds the job itself |
| `init` left a file alone | it existed before Guard, or the installation record does not register it; add the printed line yourself |
| the hook doesn't run | `kaal-guard init --hook`, or `git config core.hooksPath .githooks` |
