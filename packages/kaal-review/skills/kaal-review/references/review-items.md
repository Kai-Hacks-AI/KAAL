# Review items, results and navigation

Use this when a claim can only be settled by judgement, and you want the question, the appraisal and its conclusion to be written down apart from each other, so that anyone can later find what was asked, what was concluded, and at which revision. Nothing here needs a particular repository layout, a Git history or any other tool.

A **review item** asks a question about a subject. A **result** records one appraisal of an item. The item says what to look for; the result says what was found.

## The relationship

A test verifies a subject. A review item validates a subject. Both point at the subject, and the subject can be asked who verifies it and who validates it. Validation may point at more than verification can: anything can be validated, but not everything can be verified.

## A review item

A file `V<n>.md` with this front matter and chapters:

```
---
id: <namespace>/V<n>
validates: [<subject id>, ...]
---
## Question
<one question>

## Criteria
- <what would make the answer yes>

## Expected evidence
- <what an appraiser should read or run>
```

An item with no subject, no question, no criteria or no expected evidence is incomplete and is reported, never silently skipped.

## A result

A file `RV<n>.md`, one appraisal of one item at one revision:

```
---
id: <namespace>/RV<n>
appraises: <item id>
revision: <revision of the subject>
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

`scripts/navigate.mjs` exports `navigate(root, { revision })`. It reads the tree under `root` and returns `{ items, results, validatedBy, current, stale, findings }`: the items, the results, which items validate each subject, which results apply (or are carried) at the revision, which are stale, and the problems found. It states no coverage and no approval. Writing an item, performing an appraisal, choosing the conclusion and deciding that a carry-forward is justified remain judgement; the script only reads and reports.
