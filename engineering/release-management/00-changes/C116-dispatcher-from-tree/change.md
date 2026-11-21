# C116 change

## PLAN

This PLAN is the design and the Cases it asks for, in words. It adds no Case file and no source. The Engineering check runs every Case and the phase judge that would excuse a Case that is RED at PLAN does not exist yet, so the Cases and the source travel together in the DO (as release/C114 did), and a Case is never RED on the collector.

### Decisions (the PLAN's recommendations; the approval of this pull request is the go)

1. **The final step is decided from the tree at the merge revision, with the judges, not from the body.** Applies to the KAAL class (`kaal/<capability>/<item>`). The collector is read at `mergeSha` as data: the Changes it carries are the Change folders that are in the collector and not on `main` (a folder difference of the two checkouts, so no list of files and no limit of an API page). The Dispatcher asks `demand Act`, `verify Act` and `limit Act` through the library; the final step is reached when all three answer PASS with `applies` true: exactly one retro reflects every carried Change, it is well formed (asked of kaal-retro, handed in by path), and the merged pull request touched only the ACT folders. Any FAIL, UNKNOWN or `applies` false is a skip that names the judge and its message. `limit Act`'s `applies` replaces `stepOf` for this class.
2. **`hold Act` is not asked yet.** It needs Testing's observation of the Cases at the revision and that adapter does not exist; asked without it the answer is always UNKNOWN and nothing would ever be raised. What it guards is already held when the ACT merges: the Engineering check, which runs every Case, is required on the pull request. The Dispatcher notes this in its skip and raise records, and the PLAN that builds the adapter adds `hold Act` to the set without changing the rest. Declared here so that nobody reads the absence as a decision.
3. **The title is computed from the collector's name**, never from prose: `PROMOTION: <capability> <item>`, decomposed from `kaal/<capability>/<item>` (so `kaal/release/act-applies` is `PROMOTION: release act-applies`). The prefix `PROMOTION:` stays. A branch name of another shape is a loud skip.
4. **The body has the three chapters of the source template**, built from the tree and the template: `Change` (one line per carried Change, `<id> <name>: <phases>`, ids allowed in the body; phases from the Change's folder: PLAN when it has a `change.md` PLAN section, DO when it has `do.md`, ACT when a retro reflects it), `Why now` (a fixed placeholder that Promoting replaces: the Dispatcher dispatches, "why now" is a judgement), and `HOW TO WORK` (the rows of the template, read from the source template of the default branch so there is one copy of the process; step 0 names the source branch and the merged ACT pull request; the Dependency row is omitted, Promoting adds it when the source is behind `main`). Nothing of the ACT's prose reaches the title or the body.
5. **HOTFIX and WIRE keep their current decision for now** (their controls are rebuilt next, and the Dispatcher then reads them the same way). Their code path and Cases are untouched.
6. **The workflow source gets the trusted-judge pattern.** `dispatcher-raise.yml`'s classify job checks out the default branch (the judge, run) and the collector at the merge revision into a second folder (data, never run, no credentials persisted), and the job that holds the token stays as it is: it takes the decisions as data and makes the one write. The engineering source `05-src/wiring/workflows/dispatcher-raise.yml` is changed in the DO; installing it into `.github` is a WIRE with the Owner's go. The installed templates lag the source (two chapters against three): installing them is a WIRE as well.
7. **The sanitising of the body widens to what the template holds.** `raise.mjs` strips every character outside a small set, which removes the `|` of the HOW TO WORK table. The Dispatcher builds the whole body from fixed text and from names it has filtered; `raise.mjs` reads the structure (the three chapters, in order) instead of filtering free text, and still refuses anything else.

### Cases the DO adds (ids T1322 onward), in Given-When-Then

- **Final step from the tree.** Given a collector tree with one retro that reflects its carried Change and a merged pull request that touched only the retros folder, when the Dispatcher decides, then it raises. Given each of: two retros, a retro that reflects only some of the Changes, a malformed retro, a path outside the ACT folders, a retro the finder refuses, a Change folder with no record: then it skips naming the judge. UNKNOWN never raises. The prose of the merged body (any chapters, any first line) changes nothing.
- **Title.** Given `kaal/release/act-applies`, the title is `PROMOTION: release act-applies`. Given a name of another shape, a skip. Given an ACT whose body holds ids, markup or a long line, the title is the same.
- **Body.** Given a tree with two Changes, the body has the chapters `Change`, `Why now`, `HOW TO WORK` in that order, a line for each Change in the form `<id> <name>: <phases>`, the placeholder under `Why now`, and the rows of the template; it equals the template's chapters (the Case reads the template and compares the headings and the table header, not its wording).
- **Reads the tree as data.** Given the workflow source, the second checkout has no credentials persisted, nothing of it is installed or run, and the token job reads no collector.
- **Reads strictly.** Given a decision whose body has another structure, `raise.mjs` refuses it; a body of the Dispatcher's own making is accepted with its table.
- **Existing Cases.** HOTFIX and WIRE decisions are as they were.

### Left to Promoting and to people

The pick (priority), "Why now", the Dependency row and the approval. The automation of the pick is a later Change and is not planned here.

## Ids

Change `release/C116`, Cases T1322 onward (T1321 and C115 are taken by the queue move). No Intent: the Change implements release/I39 and release/I40, whose contracts it keeps.

## DO

On the merged PLAN, into this collector, with the Cases:

1. The Cases above, plain `.test.mjs`, in `05-src/promotion-raise/` where the Dispatcher's source lives.
2. `final-step.mjs` and `dispatch.mjs` (the `final` command): the tree facts, the three judges through the library, the title and the body; `gather.mjs` stays as it is. `raise.mjs`: the structure check. `05-src/wiring/workflows/dispatcher-raise.yml`: the second checkout and the arguments.
3. The accept list below.

## Accept list

- The Cases of release/C93 that read the body of an ACT to decide (T-ids to be listed in the DO from a run) learn that the KAAL class is decided by the tree; their HOTFIX and WIRE assertions stay.
- `raise.mjs`'s Case for the plain filter learns the structured body.

## What this does not do

It changes nothing under `.github`, no ruleset and no hook. It does not raise, approve, merge or edit anything the Dispatcher did not already raise. It does not decide the pick and does not write "Why now".

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.
