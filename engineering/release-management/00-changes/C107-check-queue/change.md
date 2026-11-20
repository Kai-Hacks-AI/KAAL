# C107 change

## PLAN

1. Add the drafts in `interface.md`: Intent I57 (with the definition of the queue), Requirement F83, Architecture A73, control CTL27 `check Queue`, and the judge `05-src/queue/judge-queue.mjs` with its command line.
2. Add the Cases T1285 to T1291 and T1293, all RED: I57 (T1285), F83 (T1286), and CTL27 (T1291) equal their drafts, and the control is accepted by the controls checker with their minimum evidence; A73 and the judge equal their drafts and PASS when nothing other than the promotion is based on the branch (T1287); FAIL names every pull request in the queue (T1288); UNKNOWN, never PASS, for an unreadable branch, promotion, list or item, for an incomplete list, and for a promotion of `main` (T1289); the command line exits 0, 1 and 2 and names the promotion by a number or by a merge group ref, not both (T1290); the merge group ref names its pull request (T1293).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no workflow, no ruleset source, no hook and nothing under `.github`.

## Ids

Change `release/C107`, Intent `release/I57`, Requirement `release/F83`, Architecture `release/A73`, control `release/CTL27`, Cases T1285 to T1291 and T1293 (T1292 is not used). No gap id. Checked on 20 Nov 2026 against the 68 open pull request heads and `main`: none is taken.

## DO

On the merged PLAN, into the collector of this Change:

1. Add the five files of `interface.md`: `01-intent/I57-collector-queue-empty/I57.md`, `02-requirements/F83-check-queue/F83.md`, `03-architecture/A73-judge-queue/A73.md`, `04-controls/CTL27-check-queue/CTL27.md` and `05-src/queue/judge-queue.mjs`.
2. After release/C105's DO is on `main`, add `parent: release/A68` to A73.
3. Rename T1285 to T1291 and T1293 from `.red.mjs` to `.test.mjs` when green.

## Accept list

None. No existing Case reads what this Change adds. The runner on the throwaway copy: 322 tests, 306 pass, the 16 failures of `main` unchanged.

## Where one judgement is asked (feasibility, placement, order)

The judge is one function; four places can ask it, each mapping the verdict to what it does. All but the first are later Changes.

| place | when | what a verdict does | UNKNOWN |
| --- | --- | --- | --- |
| required check `check Queue` on the promotion (`pull_request`) | a pull request into `main` from a collector, hotfix or wire branch | FAIL blocks the merge | blocks |
| required check `check Queue` on the merge group (`merge_group`) | the promotion enters the merge queue | FAIL removes it from the queue | blocks |
| advisory hook, a part of the pre-push dispatcher (`.githooks/new/pre-push.d`) | a push of a collector branch that has an open promotion | prints the queue and exits 0, never blocks | prints that it could not check, exits 0 |
| the same command line, by hand | before the Owner deletes a promoted collector | a reminder | reported |

- **The merge queue path.** `main` has a merge queue, and `merge-group.yml` and `engineering-merge-group.yml` already show the shape: a workflow that runs only for `merge_group`, one job per required context, the default branch's checker, fail closed. The check needs the same: a required context must also report on the merge group or the queue waits for it. The promotion is named by the group ref (`pullOfGroupRef`, T1293); its head branch is read from that pull request at run time.
- **Fresh and complete facts.** The job that judges gathers the open pull requests itself, in the same run, through Hosting's read of open pull requests (hosting/C111, on `main`); a cut list is `complete: false` and the judge says UNKNOWN. An earlier green check of the pull request is never reused: the merge group run judges again.
- **Race limits.** A pull request that is opened or retargeted onto the collector after the merge group's run and before the merge is not caught: GitHub offers no lock on a base, and the window is the queue's own run time. The second judgement in the merge queue is the nearest point to the merge and so makes the window as short as it can be; the by-hand run before deletion is the last backstop, and the deletion stays the Owner's step. Not claimed: branches that descend from the collector without a pull request.
- **The hook must not obstruct.** It runs only when the pushed branch is a collector that already has an open promotion (a promotion attempted), asks the same judge, and always exits 0. Pushes of work that resolves the queue go to other branches and are not touched. Needs a read of open pull requests in the developer's environment through Hosting; without a route it says UNKNOWN as a note.
- **Why the Promoting station, and why detective first.** Only a ruleset in front of `main` sees a promotion; the `20 - integrating` rulesets apply to pull requests into `kaal/**`, `hotfix/**` and `wire/**` and never see one. The detection can be run anywhere, so the control is detective, as every new control is. It becomes preventive only with the Owner's go, in the Change that declares `block Queue`; release/CTL26 then observes the requirement in force.

## Next Changes, in order

1. Facts and jobs: gather the queue through Hosting; the workflow `check Queue` for `pull_request` and for `merge_group`, with a WIRE and the Owner's go.
2. The advisory hook.
3. The station: `stages.json` declares `check Queue` on Promoting, traced to release/CTL27 and only with the Owner's go, after the DOs of release/C105 and C106 shape the same files.
4. Evidence: `real:1` is a run on a real promotion; `provoked:1:fail` is a scratch collector with a pull request based on it, which the Owner creates.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Rollout, detective first (the Owner's protocol, no exceptions)

1. **Observe**: run the command line on real promotions and merge groups; nothing is blocked.
2. **Advisory**: the job `check Queue` on `pull_request` and `merge_group`, and the hook, behind a feature flag (a repository variable, off by default; `advisory` reports and never fails), with the evidence collected: `real:1`, and `provoked:1:fail` (a scratch collector with a queued pull request, which the Owner creates).
3. **Required**: only with the Owner's explicit go is the check declared on the Promoting station and loaded; the Change that does so declares the preventive control `block Queue` (two real runs) and release/CTL26 observes it in force. The judge never blocks, the place that asks decides, and once required UNKNOWN does not pass.
