# Run Cases and report their outcomes: ACT (testing/C63, testing/C64)

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It does not close the Change's open points, and it claims no collector qualification, promotion or publication.

## Liked

Two CPO reviews that each made the design more honest rather than larger. The first round, an external review of my proposal, caught that I had counted the file-level result as a test and called a timeout bounded when it only was a timer. The PLAN review then required a real whole-run bound through Hosting, and the DO showed why: a per-test timeout cannot stop a test that blocks the event loop. Having the Cases assert absence before importing the runner kept every planned Case RED by assertion and never a load error. Putting the Node 24 question to CI as an explicit acceptance gate, with the captured streams kept, turned an assumption into evidence.

## Learned

An observed difference is not always a defect of the thing observed: Node 24 and Node 22 disagree about what happens to a sibling of a timed-out test, and one of my own planned Cases had baked in the Node 22 answer. A runner started from inside `node --test` inherits the test context of its parent and silently misbehaves, which no probe of mine had met until the Cases ran under the wrapper. Hosting's timeout does not return a null status for `node --test`, because it answers the signal and exits with its own code, so the stopped file has to be recognised by the clock too. Testing's own boundary also forbids direct file access in delivered code, and two older assertions pinned the package shape, so a new export and bin touches Cases that look unrelated. I also learned to check what a shared branch holds before pushing: a commit meant for one PR landed on another's head and had to be reverted.

## Lacked

Node 24 and a built Hosting in my sandbox: every Node 24 and Hosting fact in this Change came from CI, one round trip at a time, and a diagnostic commit was needed to print the streams. A way to run the whole Testing suite locally. An independent seat for the reference runner that validated the Cases: I wrote the Cases, the reference and the mutants.

## Longed For

A kaal-change Change that consumes the report, with the two concerns the CPO recorded carried into its Requirements: test counts are not Case counts, and RED 0 is not completion without `execution.complete`, UNKNOWN and observed files. A Guard adapter that judges the report instead of reading the runner's exit code. A published, scheduling-independent Node 24 stream corpus that other Changes can reuse. A head branch per PR that is never my shared working branch.

## Open

Not closed. Consumer judgment (kaal-change) and enforcement (Guard) are separate Changes. Determinism is claimed only for Cases independent of scheduling and shared mutable state. A file stopped by the bound has partial or lost results by design. Collector qualification, promotion and publication are separate decisions.
