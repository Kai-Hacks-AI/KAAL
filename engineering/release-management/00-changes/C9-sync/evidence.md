# C9 evidence

The interface of a SYNC is derived from the SYNC pull requests that exist. Work that is not on `main` is not delivered functionality, and C9 cites nothing that is not on `main`, except the pull requests it observes.

## Observed

| Pull request | What the body holds | Diff the reviewer sees |
| --- | --- | --- |
| #1091 SYNC main into kaal/hosting | Intent, What changes, Not in this PR; commits of both sides; a bot request and a generated footer | 1 file, 717 lines, all `main`'s |
| #1424, #1429, #1430 | Change, From, To, Because; `main` named by the promotion that produced it | 37 files / 888 lines, then 13 files / 184 lines twice, all `main`'s |
| #1400 | One `## Change` chapter of prose and a footer | 1 file, 17 lines |
| #1262 | Free prose; `main` commit, `Synchronized-with` trailer, the `lineage.ts` verdict; a bot request and a footer | 20 files, 1361 lines |
| #1235 | Free prose; the driver named as "Foundation 0.0.2 needs ... (Route A, #848)"; the verdict; a bot request and a footer | 422 files, 23443 lines |
| #1277 | Intent, Design, Verified by, Validated by (the repository template); attribution at the top; one resolution in a table | 339 files, 18168 lines |
| #965 | Intent, Shape, Verified by, Not in scope; attribution at the top; the two conflict paths listed | 448 files, 32301 lines |
| #1026, #1023 | Intent or prose; the driver is "the Dependabot thread's Testing Defect" and a blocked promotion | 529 files; 1 file |

## Recurring problems

1. No stable shape. The body of a SYNC has been written in at least six shapes, three of them borrowed from the PLAN and repository templates. A synchronization is not a Change and claims no Change Record, so the PLAN chapters (#1424, #1429, #1430, #1400) describe nothing: `To` reads "The collector contains main. Its own files are unchanged." in three of them.
2. The one content that every body carries, and Git cannot show, is why the synchronization is needed: to make a promotion fresh (#1023, #1091, #1262, #1400, #1424, #1429, #1430) or to unblock development (#965, #1026, #1235). It is stated in a different place and form each time.
3. The driver is named inconsistently: by a promotion pull request (#1263, #1416), by a defect or a thread (#1026), by blocked pull requests (#965), by a Route and an issue (#1235). None is a stable identity; a pull request number is not the Change that needed the synchronization. The CPO's direction, that a Change drives a SYNC, names the stable one.
4. Source and target are restated in every body: the `main` commit, the collector, the parents of the merge commit. Git already holds them: the second parent of the merge commit, the `Synchronized-with` trailer of #1262, the base of the pull request and the verdict of `lineage.ts` quoted in #1262 and #1235. A restatement can only diverge. #1429 even holds the commit only in its comment.
5. Resolutions recur where `main` and the collector conflict (#965, #1026, #1235, #1277), and they are what the reviewer checks ("the one resolution above is the point to check", #1277). But the Branching verdict already lists the explicit resolutions and the paths adopted unchanged from `main` (#1262, #1235). What only the author can add is why a decision at a conflict was taken, and that exists in only some syncs.
6. Content leaks into the body: a bot request and a generated footer (#1091, #1262, #1235, #1026, #1023), attribution at the top (#1277, #965), and the verdicts and test results that the checks show.
7. Three styles name the same operation (`SYNC main into ...`, `Synchronize ... with main`, the merge subject `Sync main into ...`). The Owner has since set the standing title convention `<TYPE>: <meaningful description>` with no Change id; F14 states it for SYNC, and the Change hint of the template keeps the id out of the title.

## Assessment of the CPO candidate, `## Change` and `## Reason`

Adopted, with two refinements, because the evidence supports it and nothing else is necessary:

- Change: confirmed by 3. The line is the identity and name of the driving Change, `<id> <name>`, with no description, so that it stays stable and says nothing the Change does not. A SYNC claims no Change Record of its own, and this chapter means the Change it serves, as in the other interfaces.
- Reason: confirmed by 2. One short paragraph with a specific purpose.
- Source and target are not chapters: confirmed by 4.
- Refinement 1, from 5: a Resolutions chapter is not necessary. A decision at a conflict is stated in Reason, when there is one. A chapter that is `none` in most syncs would be an obligation, and the verdict already names the paths.
- Refinement 2, from 6: the limits that keep the body clean (no footer, link, attribution or separator) stay, because the generated footer appeared on every recent body in the evidence.
- Not necessary, with evidence: the commit of `main` and the collector (4), the verification (the checks show it, #1262, #1235), a statement of the merge method (Branching names it), a statement of the rule of synchronization.
- Decided by the CPO: a synchronization that several Changes need (#965 served #892 and #916) names the primary driving Change in Change, and Reason says why it is the primary driver. Other Changes appear only with their relationship, never as a list.

## Provenance

- Baseline: `main` at `27d86be`. `main` holds the PLAN, ACT, DO and Promotion templates and no SYNC template text.
- Method: the nine Cases of this Change (T110 to T115 and T118 to T120) are copied over a tree that holds `main` and none of this Change's documents, and each Case's `run()` is called. A second execution in the tree of this Change, with no `.github` SYNC template, shows that they need nothing outside it.
- Seven throwaway mutations of `sync-template.md`, run once, show that the Cases fail meaningfully.

## Result

On `main`: 9 RED-observed, 0 error, 0 green. Each reports the artefact that is absent.

In the tree of this Change, without the installed template: all nine are green.

| Mutation of `sync-template.md` | Cases that turn red |
| --- | --- |
| a Because chapter added | T112, T113, T114, T119 |
| a Sync chapter added | T112, T113, T114, T119 |
| chapters out of order | T112, T114, T119 |
| the hint of Reason removed | T114 |
| the Reason hint no longer names the primary driver | T114 |
| a link inside a hint | T114 |
| a generated footer | T114 |

T111 tests the interface itself on bodies, not the template: it accepts the worked body of F14 and rejects a PLAN-shaped body (the shape of #1429), a footed body, a Change line without an identity, a restated source and an empty reason.

The installed `.github` template, and the Cases T116, T117 and T121 that verify its installation against `sync-template.md`, are release/C16.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T110` to `T115` and `T118` to `T120` `.test.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error.
