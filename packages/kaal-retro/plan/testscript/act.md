Method: 4L
Subject: Making the package's own `npm test` run (retro/C3), PLAN through DO, and the overclaim in retro/C2's DO that it exposed.
Participants: the delivering agent only. The CPO's reviews are cited where they changed the work; no consumer's view is available.

## Liked
- Observation: Running `npm test` in the package, as the promotion review would, found the defect before any reviewer did.
- Observation: T16 was RED for the right reason (the `pretest` error) and the fix was one line.
- Potential improvement: Qualify a package by the command a reviewer would run, not only by the files that test it.

## Learned
- Observation: retro/C2's DO text said `npm test` gave 15 pass. What had been run was `node --test` on two files with kaal-core already built.
- Interpretation: A shorter command that tests the same files is not the package's own script. The claim was stated as fact without running the thing it named.
- Observation: T16 failed a second time after the fix, because run inside `node --test` the child inherited `NODE_TEST_CONTEXT` and node skipped it as recursive.
- Interpretation: A Case that runs the runner needs a clean environment; running it green once against the fixed script, not only red against the broken one, would have shown this at PLAN.

## Lacked
- Observation: Nothing in the process runs a package's own `test` script from the package directory before a DO claims it passes.
- Potential improvement: When a record names a command, run exactly that command and quote its output.
- Potential improvement: For a Case that spawns the runner, run it green against a known-good script at PLAN.

## Longed For
- Observation: The `--prefix ../kaal-core` path assumes the package sits beside kaal-core.
- Potential improvement: Revisit it if the package is ever published or moved; not needed while it is unpublished.

Decisions: None made. The statement in retro/C2's DO about `npm test` is superseded by retro/C3's DO. Registration in `.kaal/`, publication, wiring and promotion are for the Owner and CPO.
