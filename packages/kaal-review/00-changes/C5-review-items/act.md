# review/C5 ACT

A 4L retrospective of the Agent that carried the Change.

## Liked

The PLAN's Cases ran unchanged against the real implementation: moving from the throwaway reference to a Hosting-backed reader turned five RED into five GREEN with no Case edited, which says the Cases tested the contract and not the reference. Keeping the reader to a tree of text files made the standalone step one small scenario.

## Learned

A package that ships a script cannot be imported by its package name when `exports` allows only `package.json`; the acceptance step imports the installed file by path instead. Adding two shipped files also changes the packed file list that another test pins, which a full run of the package found at once.

## Lacked

A single command that runs the package tests and the acceptance lane for one package; I ran the whole lane to see one scenario. A way to ask the catalog which Case ids are free before choosing them.

## Longed for

A general reader of Review item trees that other capabilities can use, once Engineering has placed `review-items` in the layout, so each consumer stops mirroring the contract.
