# C90 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, Requirement, Architecture, the control, the judge module and the workflow source) and the Cases T1116 to T1126, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.

## Reading the pull request

The workflow checks out the base commit (`github.event.pull_request.base.sha`, full history, no stored credential), so the judge it runs is the base's own copy and no file of the pull request is executed. It then fetches the head with `git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"`: `refs/pull/<n>/head` lives in the base repository for a fork pull request as well, so no fork remote is needed and the exact head SHA does not have to be present beforehand. The judge verifies that both refs resolve to commits before reading them as Git data. A failed fetch fails the job; an unresolvable ref or an absent judge is UNKNOWN (exit 2); none passes. A pull request into a branch whose base does not yet hold the judge fails closed until that branch is synchronized.

## Mechanism

A pure judge over two maps of workflow path to text. A workflow uses the trigger only when its top-level `on:` names it (scalar, flow list, block map or block list); a comment, a string or a branch name does not. FAIL when a workflow uses it on the head and did not on the base, or the count rises; PASS otherwise; UNKNOWN when the base or head could not be read. The reader takes a directory or a Git ref. The base is the baseline: nothing is hand-kept.

## Placement of the Cases

| Case | Tests | Sits in | Asserts |
| --- | --- | --- | --- |
| T1116 | release/CTL19 | `04-controls/CTL19-verify-triggers` | listed as detective with I50, equal to its draft |
| T1117 | release/I50 | `01-intent/I50-no-pull-request-target` | the directive and its source, exactly as given |
| T1118 | release/F67 | `02-requirements/F67-verify-triggers` | serves I50, the ratchet, no hand-kept list |
| T1119 | release/A62 | `03-architecture/A62-verify-triggers` | addresses F67, names the module and the workflow source |
| T1120 | release/CTL19 | CTL19 folder | adding one, or giving one to an existing workflow, fails |
| T1121 | release/CTL19 | CTL19 folder | removing or replacing passes, a swap to a new workflow fails, an unreadable base is UNKNOWN |
| T1122 | release/CTL19 | CTL19 folder | the real tree against itself passes; comment, branch name and all four forms |
| T1123 | release/I50 | CTL19 folder | the target: the real tree uses it in no workflow. Held RED until the count is 0 |
| T1124 | release/F67 | CTL19 folder | the workflow source: plain `pull_request`, read-only, no secret, no trigger itself; checks out the base commit (not the head), full history, no stored credential; fetches the head from `refs/pull/<n>/head`; runs only the judge of the base |
| T1126 | release/CTL19 | CTL19 folder | the workflow's own fetch and judge steps, extracted from the source and run as written in a scratch clone against a fork-style pull request (head only on `refs/pull/<n>/head`): add fails, remove and unchanged pass, a pull request that replaces the judge with `process.exit(0)` is still judged by the base's judge, a missing pull request ref fails the fetch and never reaches a pass, an unresolvable base or head and an absent judge are UNKNOWN (exit 2) |
| T1125 | release/G112 | this folder | the gap is closed: each of the five recorded workflows would now be refused |

T1125 is the change-semantic Case and retires at the ACT. T1123 is the target test and is renamed `.test.mjs` when the count reaches 0; until then it is held RED and ignored by the finders, so main stays green. T1122 derives its positive input from the real tree; the negatives are small and hand-made.

## Ids

Change `release/C90`, Intent `release/I50`, Requirement `release/F67`, Architecture `release/A62`, Gap `release/G112`, control `release/CTL19`, Cases T1116 to T1126 (all used; T1126 added after the CPO review of the PLAN). Reserved by the release thread on 18 Nov 2026.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/verify-triggers`: add the four element files, `05-src/triggers/verify-triggers.mjs` and `05-src/wiring/workflows/verify-triggers.yml` equal to the drafts, rename T1116 to T1122, T1124, T1125 and T1126 from `.red.mjs` to `.test.mjs` when green, keep T1123 `.red.mjs`.

## ACT

A 4L retrospective in `act.md`; T1125 and the folder's registration retire there. Its PROMOTION takes the next seat after the promotion that is active at that moment, ahead of everything still waiting (Owner, 18 Nov 2026).

## Left open

- A pull request can edit the workflow that runs the check. The check is a detective on plain `pull_request`; its source is judged against the wired install by the WIRE judge, and the Inspector's signed check replaces it later. Requiring it is the Owner's step.
- Registration in the Integrating and Promoting stations, and requiring the check, are separate steps: a WIRE and a ruleset load, with times given to the Owner when the DO is on main.
