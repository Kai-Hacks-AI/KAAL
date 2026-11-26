# C132 change

## PLAN

Assessment first, then one decision. Nothing here installs a workflow, sets a flag or changes a ruleset.

### Assessment

A real defect of the two checks, not of the SYNC: the rule they keep (a judge nobody under review can change) is met by running the judge of the base, but "the base" is only the default branch for a pull request into `main`. For a pull request into a collector it is a branch that may be behind the judge. Observed on SYNC #2414: both checks UNKNOWN, exit 2, "the judge is absent on the base". It is harmless now (neither check is required by a ruleset for collectors, and `verify Triggers` is required only by `promoting`, whose base is `main`) and it would block every SYNC into a stale collector once they are preventive. Not a hotfix: nothing is blocked.

### Decisions (the approval of this pull request is the go for the DO)

1. **The judge is the default branch's.** Each workflow checks out the default branch (`github.event.repository.default_branch`) for the judge, and fetches the base commit and the head as Git data into the same repository. The pull request's files are never checked out and never run. For a pull request into `main` nothing changes (base and default branch are the same commit).
2. **The judge reads base and head as Git data.** `verify-triggers.mjs` already does (`--base <sha> --head <ref>`). `judge-workflow-names.mjs` reads a folder, so the step puts the head in a worktree as today. The accepted baseline stays the file of the base commit.
3. **A base that predates the control.** A SYNC into a stale collector has a base without the baseline file, because the control was adopted after the collector's last SYNC. The accepted baseline of the base is then absent and the judge says UNKNOWN. Recommended: where the base commit holds no baseline file at all, the accepted baseline is the file of the default branch, and the check reports that it used it. A pull request cannot widen the allowance, because the head's file may not list a name the default branch's file does not. Without this rule decision 1 only moves the UNKNOWN from the judge to the baseline. *Question 1 asks.*
4. **Where each change lands.** The source of `verify-triggers.yml` is release's (`05-src/wiring/workflows`), and this DO changes it with its Cases (T1124, T1126 and T1134 run its steps as written). The source of `verify-workflow-names.yml` is engineering's (C29, `13-source`), so engineering takes it as its own Change, as for C33. Each installed copy then needs its own WIRE, each on Kai's go. Nothing is installed by this PLAN or its DO.
5. **No weakening, and no new trust.** The default branch is already the trusted judge of the Act judges and the CodeQL gate. The head is only read through Git. A judge that is absent on the default branch is UNKNOWN, as today.

### Cases (plain `.test.mjs`; they land with the DO, ids taken then)

- the workflow steps of `verify-triggers.yml`, run as written on a stale collector base (no judge there): the judge of the default branch runs and answers; add fails, remove and unchanged pass, a pull request that carries its own judge does not run it.
- a base with no baseline file: the default branch's file is the accepted baseline and the verdict says so; a head that lists a name the default branch's file lacks is growth and fails; a base with a baseline file uses its own.
- a default branch with no judge or no baseline is UNKNOWN, never a pass.
- the existing Cases T1124, T1126, T1134 and C131's T1418 to T1422 stay green, changed only where a seed must now carry the default branch.

### Questions for the CPO

1. **The baseline of a base that predates the control.** Use the default branch's file when the base holds none (recommended), or leave it UNKNOWN until the collector has been synced (then every SYNC into a stale collector keeps failing, and the collector must be synced first)?

### Not in this Change

No engineering workflow change (engineering's own Change), no WIRE, no ruleset change, no flag, no change to what counts as a finding.
