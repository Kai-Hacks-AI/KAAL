# Second trial of the general skill (packaging/T59): expectations, committed before the trial

Written before the agent runs. The agent is not given this file or the mapping. These accounts are not mirrored by a worked example in the skill (the first trial's limit). The letters carry no outcome.

## What a good judgment distinguishes

- **G**: The evidence is a run in the source checkout plus an owner statement that the published package "works the same". No installed run exists, so the evidence does not support a claim about what ships (practice 2). The agent should call this unknown for the shipped artifact, not failed, name the missing observation (install the published 1.2.0 and run its verification), and note the boundary inventory is missing: `load` reads files, but no Case covers a missing or unreadable file or a non-UTF-8 file (G2's failure behaviour is undefined, not just untested), and G3 "read only" has no Case. It should not reject the account for headings or tables.
- **H**: Two separate problems. (1) `acme-shared` is installed from `file:../acme-shared`, so the dependency works only for the owner: blocked and interim under practice 3, not accepted. (2) Case T3's expectation is produced by the code under test, so it can never fail for a wrong answer: it decides from the code's own earlier output, not from the obligation. The digest is elided (`9c1f...e0a7`), so the installed artifact cannot be tied to it. The agent should say the evidence supports "3 passing on the owner's machine", not conformance, and mark the digest as not independently checked.
- **I**: A control. The account is complete for its claim: no dependencies, installed runs on two platforms, a full digest, behaviour Cases on both boundaries, and a Case that checks the "imports nothing" obligation. The agent should not invent findings. It may note what no account can establish (the digest is the owner's statement until recomputed; adequacy of the 10-row table is the owner's) and should accept the account conditional on those observations, which is a judgment and not a proof.

## Counted as a miss

- Treating the owner-reported "works the same" as evidence for the shipped package (G).
- Accepting H's `file:` dependency or T3 as sound, or treating the elided digest as a digest.
- Rejecting I, or inventing a boundary or dependency I does not have.
- Failing to separate what scripts observed, what the agent judged, what is unknown and what only the owner can decide.
