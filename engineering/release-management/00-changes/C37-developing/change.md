# release/C37 change: Engineering / verify Stages (Developing), the stage before Integration challenges itself and is challenged

Owner direction (16 Nov 2026): `.githooks` is the Developing stage, so it is not judged by the Wiring job as a neighbour. The stages are chained, and each stage must be able to say "this could have been found earlier". The challenge model: (1) a local check in `.githooks` secures the Developing rules, (2) each ruleset challenges itself, (3) Promoting challenges Publishing, (4) Integrating challenges Developing. This Change builds the parts (1) and (4) and moves the `.githooks` judgement out of the plan for the Wiring job. It builds on release/C35 (stages, six minimal rulesets and the `Engineering` workflow, all on `main`) and on #1705 (the `.githooks` structure on `main`).

## From, to, because

- **From:** Developing is declared in `stages.json` as `judged: later`. Nothing checks that the `.githooks` on a branch match what Engineering expects, locally or in CI, and nothing at Integration notices when a change skipped the hooks.
- **To:** `verify Stages (Developing)`, one check in two places: a local script run by the dispatcher before a push, and a job of the `Engineering` workflow on pull requests. Both run the same judge. `integrating` requires it beside `verify Stages (Integrating)`, so Integration challenges Developing. `verify Stages (Wiring)` judges `wiring.json` only.
- **Because:** the stages are chained and each must catch what an earlier stage should have caught; a local check alone can be skipped, so the server side must challenge what skipped it.

## What Developing expects

`stages.json` declares Developing as judged with `exact: true`: the `.githooks` tree is exactly these files and nothing else.

| Path under `.githooks` | Expected | Mode |
| --- | --- | --- |
| `pre-push` | a copy of `05-src/wiring/hooks/pre-push-dispatcher` | 755 |
| `old/pre-push` | the legacy hook, sha256 `df18ff0179e9a10ae340cd463d7012305c438b7148f0217348974b7ab56c8c06` | 755 |
| `new/pre-push.d/README.md` | present | 644 |
| `new/pre-push.d/verify-stages-developing` | a copy of `05-src/wiring/hooks/verify-stages-developing` | 755 |

The judge reads the candidate's `.githooks` (sha256 and mode of every file) and the sources the declaration names, and fails each departure under `verify Stages (Developing)` alone: a missing or changed file, an altered legacy hook, an extra file, a hook that is not executable, an unreadable input (fails closed).

## The local script

`05-src/wiring/hooks/verify-stages-developing` is a POSIX sh script: it finds the repository root, runs `node <root>/engineering/release-management/05-src/stages/judge.mjs <root> Developing`, and exits with the judge's code (it also fails when `node` or the judge is missing). It runs at `pre-push`, which the dispatcher already runs from `new/pre-push.d/` after the legacy hook. It is a copy of its source, which is the rule of the `new/` folder (README). The earlier point right after branching is a `post-checkout` hook; that needs a second dispatcher file and is a separate later Change.

## The check in CI

- **Name:** `Engineering / verify Stages (Developing)`: workflow `Engineering`, job `verify Stages (Developing)`, verb `verify` (detective, release/C5 `naming.md`), target in brackets. A sixth entry in the matrix of `engineering.yml`, running the trusted judge from the default branch against the PR head, as the other five.
- **Enforcement:** `integrating.json` requires `verify Stages (Integrating)` and `verify Stages (Developing)`, strict false, empty bypass. Every other ruleset requires only its own check. A `wire/*` head is then green on `(Integrating)`, `(Developing)` and `(Wiring)`, a `kaal/**` head on `(Integrating)`, `(Developing)` and `(Collecting)`, a `hotfix/**` head on `(Integrating)`, `(Developing)` and `(Hotfixing)`. C16 reads exactly these.
- **Challenges, as ruled:** each branch ruleset judges itself; the Promoting job judges Publishing as today; Integrating requires Developing.

## Landing order (each its own PR; the Owner's step is last)

1. **PLAN** into collector `kaal/engineering/developing`, CPO exact-head approval; T510-T517 RED.
2. **DO + ACT** into the same collector: `stages.json`, the judge, `integrating.json` with the second check, the script source, `controls.md` and README updated, the affected C35 Cases adapted (T481, T484, T485, T486 name `Developing` and the second integrating check), T510-T517 GREEN.
3. **PROMOTION** of the collector to `main`: source only; no workflow, no install.
4. **WIRE** `wire/githooks-developing`: installs the script into `.githooks/new/pre-push.d/` from the source on `main`, verified against it. It is admitted on `(Integrating)` and `(Wiring)` as before.
5. **`.github` alone** on collector `kaal/engineering/developing-workflow`, cut from `main` after step 3: the `Developing` entry in the matrix of `engineering.yml`.
6. **SYNC** `main` into that collector, only if `main` moved.
7. **PROMOTION** of the workflow to `main`. The first Developing run is green because step 4 has landed.
8. **Owner:** update the live ruleset `integrating` to require both checks, from the new `integrating.json`, only after one green Developing run. Only this step touches GitHub settings.

## Cases (all RED on `main`)

T510 the declaration judges Developing with the exact expected files, modes and the legacy sha256. T511 the judge passes the agreed tree and fails each departure under the Developing job alone, and fails closed. T512 a broken `.githooks` fails only `verify Stages (Developing)`; the other five jobs do not judge it. T513 `integrating` requires both checks, the other four rulesets only their own. T514 C16 admits a `wire/*` head only when `(Integrating)`, `(Developing)` and `(Wiring)` are green on the exact head. T515 the local script is POSIX sh, runs the Developing judgement of the same judge, passes the agreed tree and fails a changed dispatcher or an unreadable declaration. T516 the check names are unique and follow the naming guidance, distinct from `Guard` and the CI job `Engineering`. T517 `node judge.mjs <root> Developing` exits 0, 1 and 2. T518 the installed `.githooks` tree of the repository passes the Developing judgement: shipped RED with the DO, renamed to `.test.mjs` by the WIRE that installs the script.

## Not in this Change

No live ruleset is created, changed or retired (step 8 is the Owner's, after the Change landed); no `post-checkout` hook; no level 2 or 3 test (a standalone test, separate); no change to `.github` outside step 5; no judgement of how a branch skipped the hooks beyond requiring the check (a later Change may add evidence that the hook ran); no replacement for `Promotion Source`.

## DO

`05-src/stages/stages.json` declares Developing as judged and exact with its four files. `05-src/stages/judge.mjs` judges the `.githooks` facts under `verify Stages (Developing)` alone, requires the second check in `integrating`, and its CLI reads the checkout's `.githooks` (`readHooks`). `integrating.json` requires both checks. `05-src/wiring/hooks/verify-stages-developing` is the local script (POSIX sh, exit 0, 1 or 2 as the judge). `controls.md` and the README name the second check. T510-T517 are GREEN. C35 changes: T484 is retired (Developing is judged now), T481, T485 and T486 name the second check of `integrating`, and the C35 Cases helper carries the Developing facts. On the live tree the Developing judgement is RED until the WIRE of step 4 installs the script, so no workflow runs it before then (step 5 comes after step 4). Level 1 on `main` stays green for the other five jobs.
