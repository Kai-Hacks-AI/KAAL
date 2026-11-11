# C4 inventory

The as-is control and its realizations, observed on 11 Nov 2026 against `main` 8720c40. Three words are kept apart. A realization is **declared** when a file or a setting names it, it **executes** when a run of it has been observed, and it **prevents** when an observed result of it stopped an integration or a rule makes that result a condition of one. A realization that is declared is not thereby executing, and one that executes does not thereby prevent.

## Responsibility today

Change Isolation keeps changes that must travel independently apart. The judge `engineering/change-isolation/check.mjs` decides from the changed paths alone:

- Core travels alone: a Change that touches Core (`packages/kaal-core/` and the Engine files `.kaal/AGENTS.md`, `.kaal/KAAL-KERNEL.md`, `.kaal/core/`) holds only Core and three listed supporting files (`package.json`, `package-lock.json`, `engineering/acceptance/embed.test.mjs`).
- `.github` travels alone.
- A transition ledger held by the target (`transitions.json`, 10 entries) admits one exact multi-owner change, by path set and Git blob, and an entry a promotion carries is admitted only with an attestation derived from an author-independent code-owner review.
- Its verdicts are exit status 0 (conforms), 1 (does not conform, one line per offending path) and 2 (cannot judge). The adapter adds a fourth outcome, 3 (does not apply: a synchronization already admitted on the default branch), and asks Branching's `lineage.ts` to verify a synchronization first.

## Realizations

| Realization | Place | Declared | Executes (observed) | Prevents (observed) |
| --- | --- | --- | --- | --- |
| `check.mjs` judge | all | yes | yes: every run below calls it | only through the rows that follow |
| `transitions.json` ledger, `attest.mjs`, `attestation.mjs`, `attesters.json` | Integration IN, Promotion IN | yes | 3 landings were admitted only by an entry (O3); the last on 8 Nov | admits, never refuses, by design |
| `.kaal/config/guard/Change-Isolation.md` (`runs: [ci]`) | Integration IN, Promotion IN | yes | yes, through the CI jobs below | through the required checks below |
| `.kaal/config/guard/push.md` (`runs: [hook]`), `engineering/github/push-check.sh`, `.githooks/pre-push` | Development OUT | yes | only where `core.hooksPath` is set: it is unset in a fresh clone (H1); called directly under Node 24 it judged and failed a mixed Change | no: it can be skipped with `--no-verify`, and its header says CI decides |
| `.github/workflows/change-isolation.yml`, job Change Isolation | Integration IN, Promotion IN | yes | 4635 runs; the latest 100 are all success, and at least 100 failures are recorded | see O1 to O3 |
| `.github/workflows/merge-group.yml`, job Change Isolation | Promotion IN (queue) | yes | 26 merge group runs, the job succeeded in all 26 | a failure of this job has not been observed (O5) |
| `change-isolation-review-relay.yml`, `change-isolation-review.yml` | Integration IN, Promotion IN | yes | 576 runs; of the latest 100, 95 succeeded and 5 failed (H3) | writes a check named Change Isolation (H3) |
| `merge-group-review.yml` and `merge-group-admission.yml`, check Change Isolation (review) | Promotion IN | yes | 26 group runs: 21 succeeded, 5 failed | required on `main` only. The admission job judges nothing, by its own comment (H5) |
| Rulesets `integration` and `promotion` | Integration IN, Promotion IN | yes | read from the API | see O1, O2 and O5 |
| `check.test.mjs`, `carried-entry.test.mjs`, `attest.test.mjs`, `deferred.test.mjs` | the judge | yes | 46 tests, run by Engineering CI and green | not applicable |
| `attest-target.red.mjs`, `ledger-in-promotion.red.mjs`, `merge-group.red.mjs`, `review-unreadable.red.mjs` | the judge, the attestation | yes | 37 tests, all green when run by hand, named by no script, lane or workflow (H4) | no |
| `engineering/controls/README.md`, section Change Isolation | documentation | yes | not applicable | not applicable. It describes a planned Control and is stale (H6) |

## Observations

Each observation can be repeated. `evidence.md` holds the commands.

- **O1. The required checks.** Read from the API of the repository on 11 Nov 2026: the ruleset `integration` (`kaal/**` and `kaal/**/*`) requires the context Change Isolation and not Change Isolation (review). The ruleset `promotion` (the default branch) requires both, with strict up-to-date checks and a merge queue (squash, one entry at a time). Neither ruleset has a bypass actor.
- **O2. A failure holds a Change back.** A Change Isolation run failed with "core travels alone" on the promotion #621 and its pull request is open and behind. The pull request #1319 has a failing Change Isolation run on its current head and its merge state is blocked. Of 13 merged pull requests sampled whose branch had a failing run, all 13 merged at a head where Change Isolation was success.
- **O3. The history conforms.** The judge replayed over the 139 first-parent landings of `main`, path rules only: 135 conform, 3 do not, and one root commit has no parent. The 3 are the landings whose subjects name a ledger entry: `52b4e20` (flat packages), `9a89e80` (a trial) and `cec37d9` (Hosting 0.0.1). No other landing mixed Core or `.github` with anything else.
- **O4. The local hook.** In this clone `git config core.hooksPath` is empty, so Git calls no hook on a push. Called directly with a pushed ref under Node 24, the hook printed "Change Isolation: core travels alone: README.md is not Core or its supporting files" next to a Branching and a Promotion Source verdict and ended `fail: push`. Under Node 22 it ended "cannot judge: kaal-guard needs Node 24" with exit status 1.
- **O5. The queue.** 26 merge group runs: Change Isolation succeeded in all 26 and Branching failed in 4. A failed group did not merge, and the same pull request merged later in a new group (#1270), so the queue prevents integration. That it prevents on a Change Isolation failure has not been observed.
- **O6. Check names.** Three writers publish a check called Change Isolation on a pull request head: the pull request job, the review handler (through the API) and, for the queue, the group job. On the head `bfac261` of #1397 the check runs were success at 16:30:21, failure at 16:30:41 (the review handler) and success at 16:42:36, all on 11 Nov. Which of same-named runs GitHub evaluates for a required context is not observed.

## Findings

- **H1. The hook and CI judge differently.** `push-check.sh` passes only the changed paths to the judge and never reads the ledger. CI reads the ledger from the target's tip. The three landings of O3 fail the hook's judgment and passed CI. The hook is also not active by default, and it needs Node 24 or later.
- **H2. One declaration, three controls.** `push.md` runs Branching, Promotion Source and Change Isolation as one check. Its verdict is `push`, so a failure is not attributable to a control without reading the text. `merge-group.yml` likewise holds three controls in one file.
- **H3. The review handler fails on an ordinary Change.** Of the 5 failures among the latest 100 runs only the latest was read: it stopped in the step "Read the target and the approvals, derive the attestation" (`attest.mjs` exited with status 1) on #1397, an ordinary Change into `kaal/release/create-plan`. The handler then writes a failing check named Change Isolation, "could not be established", which a later run replaced.
- **H4. Green Cases named RED run nowhere.** The four `.red.mjs` files of the folder pass and are invoked by nothing. Engineering CI runs the explicit file list of `test:engineering`, so a Case that is not listed does not execute.
- **H5. Admission is a pass by design.** The pull request side of Change Isolation (review) reads and judges nothing, so on a pull request that context is no evidence. Only the group's own run judges.
- **H6. The description is stale.** `engineering/controls/README.md` says "nothing below exists yet", while the machinery has run since October.
- **H7. A coupling.** The adapter asks `lineage.ts`, which Branching owns, to verify a synchronization before it judges, so the control's applicability depends on another control's verdict.

## Not observed

- That the pre-push hook is installed on any machine of the people who push.
- That a Change Isolation failure stops a merge group.
- Which same-named check run GitHub evaluates (O6).
- Why the five group runs of Change Isolation (review) failed. Their jobs were not read.
- The behavior of any realization in a clone, ruleset or workflow that these commands did not reach.

## Placement

| Boundary | Behavior | Class | Realization |
| --- | --- | --- | --- |
| Development OUT | the rule as text, `engineering/github/branching.md#engineer` and the guard declarations | directive | documents |
| Development OUT | judges before a push | detective, advisory | pre-push hook |
| Integration IN | judges a pull request into a collector | detective | change-isolation.yml |
| Integration IN | makes the check a condition of merging | preventive | rulesets (`guard Integration`) |
| Integration OUT | none of its own | not applicable | opening the promotion is judged at Promotion IN |
| Promotion IN | judges the promotion and the merge group | detective | change-isolation.yml, merge-group.yml |
| Promotion IN | makes both checks and the review check a condition of merging | preventive | rulesets and queue (`guard Integration`) |
| all | names the paths that must move into a Change of their own | corrective | every FAIL line |

One workflow or file does not correspond to one control: `push.md` and `merge-group.yml` hold three controls each, and the review machinery serves one rule of this control and is a part of no other.
