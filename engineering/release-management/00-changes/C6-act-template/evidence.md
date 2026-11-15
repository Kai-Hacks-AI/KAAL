# C6 evidence

The PLAN of C6 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C6 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`. `main` holds the PLAN template and no ACT template.
- Method: the seven Cases of this PLAN (T91 to T97) are copied over a tree that holds `main`'s PLAN template and none of this PLAN's documents, and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- A throwaway reference template, outside the repository, was used once to show that the Cases can pass: all seven were green with it. It is the proposal below, and it implies no wording of the delivered template.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T91 | I5 | I5 is absent | the ACT template is absent |
| release/T92 | F10 | the ACT template is absent | the ACT template is absent |
| release/T93 | A29 | A29 is absent | green |
| release/T94 | A30 | the ACT template is absent | the ACT template is absent |
| release/T95 | G28 | I5 is absent | green |
| release/T96 | G29 | F10 is absent | the ACT template is absent |
| release/T97 | G30 | A29 is absent | the ACT template is absent |

On `main`: 7 RED-observed, 0 error, 0 green. In the tree of this PLAN: 5 RED-observed and 2 green, about documents this PLAN adds. The red Cases wait for the ACT template, a `.github` change that the DO delivers.

## Proposal for the template

The PLAN template has four chapters and 564 bytes. The proposal has two chapters and 495 bytes.

```
## Change
<!-- One line, `<id> <name>: <short description>` ... -->

## Records
<!-- What this ACT adds to the Change, named and not repeated. Today that is the 4L retrospective; it is a hint, not a closed list. -->
```

Change makes the Change identifiable. Records points at what the ACT adds without copying it, so the reviewer opens the retrospective in the Change's files. Naming a list of elements is avoided, so a later element needs no new chapter.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T9*.red.mjs` import the file, call `run()` and report RED-observed when it throws an assertion error.
