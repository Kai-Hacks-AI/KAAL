# C90 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, Requirement, Architecture, the control, the judge module and the workflow source) and the Cases T1116 to T1125, all RED.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, no control declaration outside the drafts, nothing under `.github`, no ruleset and no setting.

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
| T1124 | release/F67 | CTL19 folder | the workflow source: plain `pull_request`, read-only, no secret, no trigger itself |
| T1125 | release/G112 | this folder | the gap is closed: each of the five recorded workflows would now be refused |

T1125 is the change-semantic Case and retires at the ACT. T1123 is the target test and is renamed `.test.mjs` when the count reaches 0; until then it is held RED and ignored by the finders, so main stays green. T1122 derives its positive input from the real tree; the negatives are small and hand-made.

## Ids

Change `release/C90`, Intent `release/I50`, Requirement `release/F67`, Architecture `release/A62`, Gap `release/G112`, control `release/CTL19`, Cases T1116 to T1125 (all used). Reserved by the release thread on 18 Nov 2026.

## DO

Not authorized by this PLAN. On the merged PLAN, into the collector `kaal/release/verify-triggers`: add the four element files, `05-src/triggers/verify-triggers.mjs` and `05-src/wiring/workflows/verify-triggers.yml` equal to the drafts, rename T1116 to T1122, T1124 and T1125 from `.red.mjs` to `.test.mjs` when green, keep T1123 `.red.mjs`.

## ACT

A 4L retrospective in `act.md`; T1125 and the folder's registration retire there. Its PROMOTION takes the next seat after the promotion that is active at that moment, ahead of everything still waiting (Owner, 18 Nov 2026).

## Left open

- A pull request can edit the workflow that runs the check. The check is a detective on plain `pull_request`; its source is judged against the wired install by the WIRE judge, and the Inspector's signed check replaces it later. Requiring it is the Owner's step.
- Registration in the Integrating and Promoting stations, and requiring the check, are separate steps: a WIRE and a ruleset load, with times given to the Owner when the DO is on main.
