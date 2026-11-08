# The layout's non-functional folder must be tracked (record and fix)

## Intent

Hosting 0.0.1 is the first package in the layout Packaging owns, and the Owner asked for a **soft conformance assessment with retained evidence**: Packaging's structure checker on Hosting's real folder. The assessment must say what a reader who clones the repository gets, not what one working tree held.

## What the final-head assessment found

Packaging's checker, given the real `npm pack` file list and a real build, reported `verified` on the layout Change (`00-changes/layout/do-record.md`). Re-run at the final head on a **fresh `git archive` of the collector tree** (no untracked files, no `dist/` carried over, then built with `04-test/engineering-check/build.mjs`) it reports:

```
result: failed
findings: [ { kind: "missing-folder", path: "02-requirements/non-functional" } ]
```

The layout requires `02-requirements/functional/` and `02-requirements/non-functional/`. Hosting's tree held an **empty** `non-functional` folder in the working tree where the checker was first run. Git does not store an empty folder, so no clone has it, and the earlier `verified` described a working tree and not the repository. It is an error in the evidence of the layout Change, found by running the assessment on what Git delivers. No consumer-visible behaviour is involved: `npm test`, the exports and the boundary command are unchanged.

## The fix, and the alternatives

Chosen (smallest, reversible): track the folder with a short pointer file, `02-requirements/non-functional/requirements.md`. It says that `hosting/N1` to `hosting/N11` are stated beside the functional requirements they constrain in `../functional/requirements.md`, that the folder exists because the layout requires it, and that it holds no requirement of its own. It ships under `dist/docs/requirements/non-functional/` like every file of that folder.

Alternative, for the Owner if wanted: move `hosting/N1` to `hosting/N11` into `non-functional/requirements.md`. That changes every document and Case that quotes their position (package-check Cases, the shipped manifest, the release record) and is a separate Change.

## Evidence (RED, then GREEN, on a fresh `git archive`)

| Tree | Packaging's structure checker (Packaging at 850367e, real pack list, real build) |
| --- | --- |
| collector tree before this Change (a62efc2 merged with main, 04b3d21) | `failed`, `missing-folder: 02-requirements/non-functional` |
| the same tree plus `02-requirements/non-functional/requirements.md` | `verified`, no findings |

`npm run test:publisher` on the tree with the file: 204 pass, 3 skipped (the root-only and Windows-only Cases), 0 fail; 5 and 9 pass in the two sequential release steps. No Case, hash or file list pins the folder's contents.

## Ledger entry

This Change also appends the transition-ledger entry the promotion carries (`hosting-0-0-1-b1-2026-11-08`) as its own commit, computed after the fix from the tree this Change leaves, as the ledger-in-promotion design requires. It changes no committed path; only the ledger.
