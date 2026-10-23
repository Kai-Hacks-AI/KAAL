# Guard: Run

`kaal-guard run` exists from C1 and `verify` from C4a, so far only in this repository, where KAAL's pre-push hook and CI use `run` from C3a and C3c; the other commands are intended.

## Embed: shipped in the package

The package is published to npm as `kaal-guard`, first as `kaal-guard@0.0.1`.

```sh
npm install --save-dev kaal-guard
npx kaal-guard init        # writes guard.json and missing adapters only; reports any it left alone
npx kaal-guard run --local # what the hook runs
npx kaal-guard verify      # a workflow job references every ci check (static wiring only)
npx kaal-guard upgrade     # replaces only unmodified managed files
npx kaal-guard remove      # deletes only unmodified managed files; keeps guard.json and your tests
```

`init` sets `core.hooksPath` to `.githooks` only if it is unset, and records that. Add the job names as required checks in branch protection. If the repository already has a `pre-push` hook or workflows, `init` leaves them alone and prints the one line to add, such as `npx kaal-guard run --local` in the hook, or a step `npx kaal-guard run --check <name> --github` in a job.

## Engineer: KAAL itself

KAAL installs `kaal-guard` from its own tree, `packages/kaal-guard`, as a development dependency (not a workspace) and lists its checks in `guard.json`. Development, the full documentation and the Engineering-only outer tests live here, in `engineering/guard/`.

## External: naked delivery by KAAL Engineering

KAAL Engineering implements Guard in the target from the target's own commands, adapting it where needed, and delivers it as one Change, normally a pull request. The Change contains a working `.githooks/pre-push`, working CI jobs (in the target's existing workflows or a new one) and the local docs to maintain them. It contains neither the `kaal-guard` package nor any other KAAL element, and never overwrites the target's existing files.

## Verify

`verify` reads `.github/workflows/*.yml` and `*.yaml` as text and recognizes one form only. Under `jobs:`, a job references a check when one of its steps' `run:` commands, inline or as a line of a `|` or `>` block, begins with `kaal-guard run`, `npx kaal-guard run` or `npx --no kaal-guard run` and gives `--check <name>` as a plain word. With `--check ${{ matrix.check }}`, each `check: <name>` entry in that job's `matrix:` is referenced. Any other form, such as a quoted name, another expression or another matrix key, references nothing, and `verify` reports that check as not referenced rather than guess.

A pass means static wiring only: `statically referenced by job <key> in <file>`. Whether GitHub runs that job, reaches that step (an `if:` is not read) or requires it is outside `verify`.

## Diagnosis

| Symptom | Do |
| --- | --- |
| `cannot judge: …` | fix the named cause; it blocks and never passes |
| `not applicable: …` | nothing; it is reported as not applicable, not as a pass |
| `held: …` | the Owner's evidenced hold; the check's own output in the log says why |
| the hook passes but CI fails | compare the base the hook printed with CI's; `git fetch`, then rerun |
| `verify` names a ci check no job references | add a step `run: npx kaal-guard run --check <name> --github` to a job ([the form verify reads](#verify)); `verify` reads files only, so also make that job required |
| `init` left a file alone | it existed before Guard; add the printed line yourself |
| the hook doesn't run | `git config core.hooksPath .githooks` |
