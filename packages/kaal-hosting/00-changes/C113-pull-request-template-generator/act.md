# C113 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- Kai's ruling and the ownership map came first, so the PLAN needed one design question, not a negotiation: owners declare the chapters and rules, Hosting renders and raises. The two paths (template for people, body and raise for agents) share one declaration.
- The CPO's principle that authority is never caller-selected shaped the best part of the design. Policy is read at the base revision, the changed paths come from GitHub's comparison, and tests inject only the transport (`fetch`, `api`), never data. The `world()` stand-in for the API made 15 Cases cheap and honest.
- The review of the DO found two real gaps, and each became a Case that fails on the earlier DO and passes now.

## Learned

- "Revision-bound" has to be checked field by field. I bound the head (the opened head must be the checked head) and the paths by `filename`, and missed that the comparison also names a rename's source (`previous_filename`) and that the opened pull request names its base. Next time, list every field of each answer that carries authority and say for each what binds it, before writing the Cases.
- New Cases belong to the PLAN. I added T327 and T328 in the DO first. The rule is a PLAN amendment, merged, and then the DO reconciled to it; I did that after the coordinator pointed to Kai's rule, and it cost a round. The DO must satisfy agreed Cases without adding any.
- A synchronous child process cannot test a command that talks to an in-process server: the process that serves the stand-in is blocked. T316 starts the command asynchronously.
- Hosting's shipped source may not name the old package as a string literal (T22), and a new bin must be declared in both interface tables (T41). Both showed on CI before locally, because the local publisher suite stops at the first known failure.
- A PR's first Branching run can fail and passes after auto-merge is disabled and re-enabled.

## Lacked

- Windows and macOS runs of my own; CI ran them, and the first Windows run is what showed the T22 literal.
- The owners' declarations (Change, Release) and Engineering's policy files at the paths the generator reads. Until they exist `raisePullRequest` refuses every raise, by design, so nothing could be shown end to end on a real repository.
- The sandbox still fails the same five publisher steps as the unmodified collector, so the whole chain could not be shown green locally.

## Longed For

- Engineering's type list and write-area policy (C37) and the owners' declarations on main, so one real raise can be shown.
- One command that runs every step of `test:publisher` on its own and reports each.

## Follow-ups

- hosting/C114 changes the raise to take a grant (a token whose abilities Hosting established) instead of a bare token, and moves the CLI to mint one; its Cases amend T310 to T317 only in how they obtain authority.
- Owners write their declarations in their own Changes; Release's C138 waits for them.
- SYNC, PROMOTION and WIRE by the agent path are refused (fail closed) until delegated areas are resolved.
- No npm publish, no pin moves; `.kaal/hosting` is untouched. The PROMOTION belongs to the flow threads.
