# C111 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The shape the Owner gave held up in code: one small module per transport, a thin selection step with no route in it, and one seam for the binary. The seam made every Case a fake `gh`, so T290–T296 need no binary, network or Git and run on all three hosts.
- The CPO's review of the PLAN and of the DO both pushed on the same point, an outage must not read as a missing fact, and that became F87 and a Case (T295) instead of a comment.
- The investigation before the PLAN paid off: plain REST has no review-thread state, and the cloud session's route does. Knowing that early kept the thread count and kept `unknown` honest.

## Learned

- A refusal and a failure in transit look alike on a command line. The classification reads `gh`'s own error text (HTTP status, "not available from Claude Code sessions", rate limit), so it is only as good as those messages. It is covered by Cases on the text we know, not by a real `gh`.
- `index.ts` re-exports the new module and the module imports `execute` and `HostingError` from `index.ts`. That cycle is safe only because both uses are inside functions. A top-level use would break it silently.
- The build includes only the folders `tsconfig.json` lists, so a subfolder of scripts needed its own include line, and its command needed its own copy entry in the build.
- A GitHub list that is cut (threads, reviews, checks) cannot give a count. The old Show WIP showed a lower bound for threads; Hosting says unknown. This is recorded in the DO record as a difference.

## Lacked

- A real `gh` in any Case: the routes were probed by hand in a cloud session and copied into the fake. If GitHub changes an answer's shape, no Case here notices until a consumer runs.
- Windows and macOS runs locally; CI covers them. The same five publisher failures as the unmodified collector (the sibling validator and the dependency manifest are not installed in this sandbox) were left as they were.
- Case ids that are final at PLAN time. Checking 323 branches for the consumer Change showed its release ids clashed with release/C72; Hosting's did not.

## Longed For

- The consumer: Show WIP (release/C99) asking Hosting for facts and running in a cloud session. Until it exists, `readPullRequests` has no caller.
- One allocator for Change and Case ids that sees every open branch.

## Follow-ups

- The release/C99 DO (its Cases renumbered to T1200–T1202), raised from a `main` that holds this Change.
- The inventory reads (branches, tags, compare, package files) as the next Hosting slice, one Change.
- No npm publish and no pin moves; `.kaal/hosting` is untouched.
