---
id: release/RT9
format: 4L
reflects: [release/C122]
---
Account of: I am the release thread. I took the four judges of the ACT from judges that nothing runs to a workflow source that runs them on pull requests into a collector (C122): the PLAN, the CPO's clarification of its states, and the DO with the runner, the library layer, the workflow source and Cases T1339 to T1345. This is my account only: the CPO, the Owner and Testing have not been asked what they lacked, and I wrote the retro of my own collector.

## Liked
- subject: a Case that merges a branch into a main that has moved, with real Git, and runs the runner over the result
  keeps: release/T1342 shows that the changed paths of a pull request are those against the first parent of its merge result, so a change of the base is never the pull request's, and that the flag alone decides the exit code over the same run.
- subject: the CPO's review asked for the states to be named before approval, and the PLAN took it as a chapter
  keeps: the three states (detective, advisory red but not required, preventive by ruleset only) are written once in the PLAN and again in the verdict line, so a red check cannot be read as enforcement.

## Learned
- subject: the library is pinned to its layers and forbids a process, so the PLAN's home for the tree reader could not hold the Git read
  source: the full Cases run after the first build, which showed release/T1314 red; I read it, kept `changedPaths` with the runner, listed the new layer in T1314 and wrote the accepted edit in the DO.
- subject: the old classifier of the live Dispatcher skips an ACT whose body is not the template, and says only "unknown"
  source: the job log of the Dispatcher run on the Testing ACT, which showed `not-a-final-step` with `KAAL: unknown`, read while this DO was in review.

## Lacked
- subject: the PLAN put a reader that starts Git into a folder whose contract says it starts no process
  decision-point: choosing the file path of the library module in the PLAN.
  cost: one rebuild of the reader and an accepted edit of T1314 after the DO was written.
  findable: yes
  address: script
- subject: nothing told Testing, before its adapter was planned, that hold's Case catalog reads only one quote form of the Case id
  decision-point: writing the hold branch of the runner, which asks the Cases that apply.
  cost: Testing found 36 Case files invisible to hold and asked for a change that is now a Change of its own.
  findable: no
  address: Skill

## Longed For
- subject: a real run of act-judges on a real ACT pull request before the WIRE
  worked-anyway: the Cases build trees on disk and a real merge commit and run the runner as the workflow does; the first real pull request will show what they could not, which is the evidence the gate asks for.

Decisions: none made, the owner decides.
