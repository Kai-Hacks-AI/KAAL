# C115 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The CTO call and kaal-change's C14 gave the form before any design work: one optional field, agreed with the change thread in one message. The field reuses everything C113 built (validator, renderers, `checkTemplates`, the raise path), so the DO was 16 changed lines of source.
- The CPO's hold on the PLAN made the right Case. T335 as prose did not establish anything; as an executable Case it pins the owner's text at the base revision, the head's text never read, the caller's refused before any call, and the old body byte for byte.
- The DO delivered the draft Cases unchanged. Only an import path and a header comment moved.

## Learned

- A PLAN's Cases should be executable for every promise the CPO will review, including the one that needs fixtures from a Change that is not on main yet. The draft can name the fixtures it will use; it did not have to wait for them.
- A collector cut before the Change it extends needs a SYNC first. The SYNC is the capability's own development SYNC, not Integrating's. I asked Integrating for it, which cost a round.
- New documentation sections go at the end of a file, not next to another collector's sections: two collectors that each insert at one anchor conflict on the next SYNC, and a conflict cannot be hand-resolved in a SYNC.
- CodeQL can fail for the installation's API rate limit, which is not the PR's. One re-run, after the first run had finished, cleared it.

## Lacked

- C113 on main when the PLAN was written, so T335 could not run before the DO.
- A way to run the whole `test:publisher` chain locally; I ran the Cases and the loop tests this Change touches, and CI ran the rest.

## Longed For

- kaal-change's HOTFIX declaration carrying the envelope line as `visible`, and Release's C138 DO using the generated templates, so the hand-written line is retired.

## Follow-ups

- kaal-change's C14 DO and its PLAN amendment (T1555 allows `visible`), then release's C138 DO, both after this Change is promoted to main.
- No WIRE, no template install, no publish. The PROMOTION belongs to the flow threads.
