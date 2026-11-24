# C124 change

## PLAN

One pure check, one thin runner, a baseline file and a control record. Nothing here installs a workflow, sets a flag, changes a ruleset or fixes a name.

### Decisions (the approval of this pull request is the go for the DO)

1. **What conforms.** A workflow conforms when its top-level `name:` is present, is not the bare repository name `KAAL`, and no other workflow has the same name. *This is my reading of the intent of #328 ("a display name that says what it does, so the Actions list and the checks panel can tell them apart"); a stricter rule, such as a naming scheme, is a later Change and would change the baseline. Question 1 asks.*
2. **The check is pure and only emits findings.** `workflowNamesFindings(workflows)` takes a list of `{file, name}` and returns the sorted finding names: `<file>:missing-name`, `<file>:generic-name` (the bare `KAAL`) and `<file>:duplicate-name` (every file that shares a name with another). It knows no ratchet, no baseline and no Git. Reading `name:` from a file is a thin reader of its own, and takes the folder as an argument.
3. **The ratchet is a filter in front of the verdict, not part of the check.** The command emits the findings of the head. The verdict comes from kaal-controls' `judge-mode.mjs --mode ratchet --findings <F> --baseline <B> --previous <A>`: `F` the findings of the head, `B` the baseline file of the head, `A` the accepted baseline read from the pull request's **base** (never the candidate's own, as `lifecycle.md` requires). PASS only when no finding is new and the baseline did not grow; a stale allowance (a resolved finding still listed) is the case controls' C22 defines. Dropping the ratchet is deleting that step and the baseline file, with the check untouched.
4. **The baseline is a file kept with the control.** `04-controls/CTL36-verify-workflow-names/baseline.json`, a sorted JSON list of finding names. At adoption it is the five `generic-name` findings of today, the Owner's adoption decision made by approving this Change. After an accepted run that resolved a finding, the next baseline is `A ∩ F`; it is stored by a Change a person approves, which also renames the workflow, so the baseline shrinks in the same pull request that fixes the name.
5. **Registered preventive, ratchet declared on the control.** `04-controls/CTL36-verify-workflow-names/CTL36.md` is `type: preventive`, `status: designed`, `has: [release/I70]`, with the strategy `ratchet`, the baseline source (the file of decision 4), the owner (release management), the exit (the accepted baseline is empty: then the filter and the file are removed and the control is plain preventive) and the evidence (fixture, one real run, one provoked FAIL: a new workflow named `KAAL`). **It declares no deadline:** the deadline of the exit is a planning concern, outside the control and outside the generic mechanism. It registers no `:ratchet` station and no third mode.
6. **Named prerequisite.** The finder rejects unknown fields today, so those fields cannot be declared until controls' registration Change lands (planned after C22; names not decided). The DO writes the record in the shape that Change fixes. If it is not on `main` when the DO starts, the DO lands the check, the command, the baseline and the Cases and leaves the record's registration fields to a follow-up, saying so in `do.md`. This PLAN does not guess the field names.
7. **The command.** `node 05-src/workflow-names/judge-workflow-names.mjs --head <folder> --out <findings.json>` reads `<folder>/.github/workflows/*.yml` only, writes the findings list and no verdict, and exits 0 even when the list is not empty. An unreadable file, a folder with no `.github/workflows` or a file with no parsable top-level `name:` line that is not a plain missing name is exit 2 with no file, which `judge-mode` reads as UNKNOWN. It runs on a plain `pull_request`, with no token, in the Integrating and Promoting stations once wired, and runs the base's script, never the pull request's.
8. **Nothing runs yet.** The workflow job is engineering's source (C29) and a release WIRE installs it. Until a ruleset names the check a red job blocks nothing. No flag: engineering stages jobs that are seen to run first; the Owner's go makes it required. This Change gives a command, a baseline and a record; the workflow, the WIRE and any ruleset change each wait for Kai's own go.

### Cases (plain `.test.mjs`; they land with the DO, ids taken then after the highest on main)

- conforming names are `[]`; a missing `name:`, the bare `KAAL`, and two workflows with one name are named by file and reason, sorted; a name with a trailing comment or quotes is read correctly.
- the check emits no `PASS` or `FAIL` and knows no baseline (the pure layer imports nothing).
- with the five allowed: the five today pass; a sixth `KAAL` workflow fails as new; renaming one passes and `next` drops it; putting a resolved allowance back is growth and fails; a missing `previous` is UNKNOWN. (Run through `judge-mode`; they test our adoption, not controls' mechanics.)
- the command: findings written, exit 0 with findings, exit 2 and no file for each UNKNOWN of decision 7, reads only the folder it is given.
- the baseline file today equals the findings of `.github/workflows` of the repository (so a rename that forgets the baseline names itself).
- the control record: preventive, `has` release/I70, declares the strategy, source, owner and exit, declares no deadline and no `:ratchet` station.

### Questions for the CPO

1. **The rule.** Is "present, not the bare `KAAL`, unique" the right first rule? A scheme (for example the prefix of the owning capability) would fix more and fit the intent better, but it would put 10 or more workflows into the baseline today. Recommended: this rule now, a scheme later as its own Change with its own baseline.

### Not in this Change

No workflow rename (those are `.github` changes, each its own WIRE), no workflow job, no WIRE, no ruleset change, no deadline, no ratchet mechanics (controls').
