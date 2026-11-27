# Review items, results and navigation

Use this when a claim can only be settled by judgement, and you want the question, the appraisal and its conclusion to be written down apart from each other, so that anyone can later find what was asked, what was concluded, and at which revision. Nothing here needs a particular repository layout, a Git history or any other tool.

A **review item** asks a question about a scope. A **result** records one appraisal of an item. The item says what to look for; the result says what was found.

## The relationship

A test verifies a subject. A review item validates a scope. Both point at what they examine, and it can be asked who verifies it and who validates it. Review is broader than testing, and testing is more precise: a scope may be a file, a folder or a set, and anything can be validated, but not everything can be verified.

## A review item

A review item names three things, and none stands in for another.

- The **scope** is what is examined: the entries of `validates`. An entry is the id of an element, `path:<file>` for a file, `path:<folder>/` for a folder with everything under it, or several entries for a set. A path is plain text, relative, with no `..` and no backslash, and is never looked up on disk.
- The **reference** is what the scope is compared against: the entries of `against`. An entry is the id of an element, a `path:` entry, or `intrinsic` when no outside reference is needed because the scope is compared against itself, its own purpose, definitions or consistency. An item always states a reference, so a review with an intrinsic one is told apart from one that forgot it.
- The **criteria** are the dimensions and rules by which the comparison is judged, for instance completeness, consistency or testability. They say how to judge, not what to judge against, so a criterion does not restate the reference.

A file `V<n>.md` with this front matter and chapters:

```
---
id: <namespace>/V<n>
validates: [<scope entry>, ...]
against: [<reference entry>, ...]
---
## Question
<one question>

## Criteria
- <a dimension or rule of judgement>

## Expected evidence
- <what an appraiser should read or run>
```

An item with no scope, no reference, no question, no criteria or no expected evidence is incomplete and is reported with what is missing, never silently skipped. A criterion that is word for word an entry of `validates` or `against` is reported. Whether a criterion is a real dimension of judgement, whether an outside reference is the right one and whether an intrinsic one is enough remain judgement: the script checks only that each is stated.

## A result

A file `RV<n>.md`, one appraisal of one item at one revision:

```
---
id: <namespace>/RV<n>
appraises: <item id>
revision: <revision of the scope>
appraiser: <who or which Agent>
relation: author | not-author | unknown
execution: performed | could-not-perform
conclusion: satisfied | not-satisfied | unresolved
carries: <result id>      (only for a carry-forward)
parts:                    (optional)
  - <part>: <conclusion>
source: <where the appraisal was done>
---
## Execution
## Result
```

- Three conclusions only. `unresolved` is a conclusion; a tool failure, missing evidence or an appraisal that never ran is not, and is recorded as `execution: could-not-perform` with no conclusion.
- A result applies to the revision it names. At another revision it is stale, unless a later result at that revision explicitly carries it forward and says why. A carry-forward keeps the conclusion it carries.
- A result that names the appraiser's relation to the work lets whoever sets the policy decide whether an independent appraisal is needed. This reference sets no such policy.
- A result grants no authority. `satisfied` is not an approval and not a merge.

## Navigation

`scripts/navigate.mjs` exports `navigate(root, { revision })`. It reads the tree under `root` and returns `{ items, results, validatedBy, judgedAgainst, current, stale, findings }`: the items, the results, which items validate each scope entry, which items are judged against each reference, which results apply (or are carried) at the revision, which are stale, and the problems found. Asked about a file, `about(answer, 'path:<file>')` also finds the items whose scope is a folder above it; `judging(answer, <reference>)` finds the items judged against a reference. The command takes `--subject <scope entry>` or `--against <reference>`. It states no coverage and no approval. Writing an item, performing an appraisal, choosing the conclusion and deciding that a carry-forward is justified remain judgement; the script only reads and reports.
