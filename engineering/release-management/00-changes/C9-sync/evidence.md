# C9 evidence

The interface of a SYNC is derived from the SYNC pull requests that exist. Work that is not on `main` is not delivered functionality, and C9 cites nothing that is not on `main`, except the open pull requests it observes.

## Observed

| Pull request | Body | Diff the reviewer sees |
| --- | --- | --- |
| #1091 SYNC main into kaal/hosting (5 Nov) | Intent, What changes, Not in this PR; `main` and collector commits named (9e86987 into 933f119); a request to a bot and a generated footer inside the body | 1 file, 717 lines, all of it `main`'s own |
| #1424 Synchronize kaal/release/act-template with main | Change, From, To, Because; `main` named as "now at the promotion of kaal/controls (#1410)" | 37 files, 888 lines, all of it `main`'s own |
| #1429 Synchronize kaal/release/do-template with main | Change, From, To, Because; `main` named as "now at the promotion of check PR Body (#1425)"; the commit `d19abef` appears only in a comment | 13 files, 184 lines, all of it `main`'s own (the C8 files) |
| #1430 Synchronize kaal/release/wire-do-template with main | the same words as #1429 | 13 files, 184 lines, the same |

## Recurring problems

1. The body of #1424, #1429 and #1430 reuses the four PLAN chapters. A synchronization is not a Change and claims no Change Record, so Change, From, To and Because describe nothing. `To` reads "The collector contains main. Its own files are unchanged." in all three, and each chapter restates the others.
2. `main` is named by the event that produced it, not by a commit. `main` moves, so the body cannot be read later. #1091 named commits but in prose, and for both sides, one of which moves whenever a Change lands.
3. The diff is `main`'s accepted content, so it hides the only thing a reviewer must decide: whether the synchronization decided anything of its own. The bodies say "unchanged" or "none" in a sentence. #1091 is the only one that says what the diff differs by. A resolution is a statement that needs a place in the body.
4. The reason is a symptom of the Branching check ("shows as behind", "fails the Branching check as not fresh"). What waits on the synchronization is the reason, and it is the one fact Git cannot show (`branching.md` says a synchronization cannot be told from development or promotion by Git).
5. Content leaks into the body or the comment: #1091 asks a bot to review and ends with a footer, and the comment of #1429 restates the rule of `branching.md`.
6. Three styles name the same operation: "SYNC main into kaal/hosting: ...", "Synchronize <collector> with main" and the merge subject "Sync main into <collector>". This is outside C9.

Each observed problem is answered by a chapter or a limit of F14: 1 by the three own chapters, 2 by the Sync line, 3 by Resolutions, 4 by Needed by, 5 by the limits on what the body holds.

## Provenance

- Baseline: `main` at `d19abef`. `main` holds the PLAN template and no SYNC template.
- Method: the eleven Cases of this PLAN (T110 to T120) are copied over a tree that holds `main` and none of this PLAN's documents, and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- A throwaway reference template, outside the repository, shows that the Cases can pass. Five throwaway mutations of it, run once, show that they fail meaningfully.

## Result

On `main`: 11 RED-observed, 0 error, 0 green. Each reports the artefact that is absent.

In the tree of this PLAN: T110, T111, T115, T116 and T118 are green, about documents this PLAN adds. T112, T113, T114, T117, T119 and T120 stay red with "the SYNC template is absent", and wait for the template that the DO delivers.

With the throwaway reference template all eleven are green. Mutations of it:

| Mutation | Cases that turn red |
| --- | --- |
| Sync chapter renamed Change | T112, T113, T119 |
| a Because chapter added | T112, T113, T114, T119 |
| chapters out of order | T112, T119 |
| the hint of Needed by removed | T114 |
| a link inside a hint | T114 |

T111 tests the interface itself on bodies, not the template: it accepts the worked body of F14 and rejects a PLAN-shaped body (the shape of #1429), a footed body, a source that names no commit ("main now") and an empty Resolutions.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T110` to `T120` `.red.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error.
