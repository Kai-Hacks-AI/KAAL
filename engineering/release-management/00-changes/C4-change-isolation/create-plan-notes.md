# C4 create Plan notes

A running note of what create Plan did and did not do for this PLAN. It is part of the deliverable of this exercise. The last section is the ACT of this Change in embryo and may be moved to `act.md` when the DO closes.

## What worked

- The four chapters made the body short. Everything detailed went into files and the body stayed a pointer. Writing it last, from the files, made it easy.
- The checker gave a clear answer on a body without a network call, which let a body be fixed before it was opened.
- The baseline rule, `main` only, turned the RED into something observed. Copying only the Case files over a checkout of `main` shows which Case fails on what.
- One Gap per target artefact, and a Case per Gap and per node, made the PLAN complete: each target element has a Case that says why it is not met.
- The C3 evidence method was reusable verbatim, with one change: a Case that tests behavior needs the whole of `main` and not just its own file.

## What did not

- An agent that opens a PR through the API gets no template. The four chapters were assembled by hand from F3. A PLAN-body guide for agents does not exist yet.
- The body checker is not run on real PLAN bodies by any job, and the Cases renamed `.test.mjs` run nowhere. For this PLAN the checker was run by hand and the claim that it passed is the author's.
- There is no allocator for ids. The next free Change, Intent, Requirement, Architecture, Gap and Case ids were found by reading five branches. A collision with another thread's work is possible until a Change claims them.
- F2 describes a PLAN for something that does not exist. A migration PLAN has the opposite shape: the machinery exists, and the artefacts are missing. The gap rows had to be written as missing artefacts while the behavior already runs. A sentence in F2 would say so.
- A Case of behavior needs an interface to call, so the PLAN had to propose `judge()` and `--json --place`. That is a design decision inside a test. The Cases are written to be changed with the Owner's review, and the evidence says that the reference only shows that they can pass.
- The PR attribution rule of the session (attribution in the body) contradicts F3 and the checker, which refuses attribution wording. The attribution is a comment, as the CPO set it.

## What should be improved

- A template or a hook for agent-opened PLAN pull requests, and the checker run on every PLAN body in CI.
- A way to see, next to a Case, which job runs it.
- A stated pattern for migration PLANs: inventory with declared, executes and prevents, MERIT per realization, equivalence tests, retirement criteria. `inventory.md`, `merit.md` and `transition.md` are a first draft of it, to be reused for Branching, Promotion Source and Required Tests only after review.
