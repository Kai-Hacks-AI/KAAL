# How KAAL measures Intent, Defect and Change

## Principles

1. Record the **event**, once, at the moment it happens, by the actor who knows it. Derive every metric afterwards.
2. Reuse the artifacts that exist: Change file, Defect file, Case, 4L, CPO review, git. Add only the fields that are missing.
3. Prefer events derivable from git or GitHub (recorder: nobody). Hand-written events carry date and source.
4. A record is append-only. A correction is a new dated event.
5. Absent is UNKNOWN, never zero and never pass.
6. The pull request is a carrier. It appears only as the reference where an event can be found.

## Intent

| Event | Recorded where | By | When |
| --- | --- | --- | --- |
| STATED | `01-intent/I<n>` front matter: `stated: <date>`, `source: <message or PR ref>` | the thread writing the Intent | in the PLAN that creates the Intent |
| FULFILLED | derived: the PROMOTION to main of the Change that `closes` its Gaps | none | at promotion |
| DROPPED / SUPERSEDED | dated line `status:` on the Intent, with `by:` ruling reference | the Owner's ruling, written by the carrying thread | same day |
| REWORKED | an Amendment on a Change that `implements` it (see Change) | carrying thread | at amendment |

## Defect

A Defect file (extends hosting `D<n>`; one shape for all capabilities) records:
`introduced-in:` Change id, `introduced-stage:` PLAN, DO, CHECK, GATE, WIRE, MAIN; `found-stage:` the same set plus FIELD; `found-by:` check, review, trial, use; `found:` date; `closed-by:` Change id; `red-case:` the Case that failed first.
Recorded by whoever finds it, in the PLAN that opens it; `closed-by` completed in the closing Change. Escape is derived: `found-stage` later than `introduced-stage`.

## Change

| Event | Source |
| --- | --- |
| PLAN RED | derived: first commit where the PLAN's Cases run red |
| DO start, ACT landed, PROMOTED | derived from the collector and the squash commit on main |
| AMENDMENT | `## Amendment` heading must carry a date and cause: `intent`, `defect`, `review`, `ruling` |
| CPO CHANGE-REQUEST | one dated line in the Change `## Record`, with the review reference, by the thread that handles it |
| ID CLASH / ABANDONED | dated line in `## Record` |

Derivable on demand: lead time, rework loops, Changes per Intent, cause mix.

## Reader rules

- A single reader library reads Intent, Defect and Change records and returns events, never metrics baked in.
- Missing field returns UNKNOWN. Counts report how many records were UNKNOWN beside the value.
- Back-filled records carry `reconstructed: true` and are reported separately.
- A **measurement epoch** is marked on main when the shapes land; no comparison crosses it without saying so.

## Not answerable from this repository alone

Improvement versus before KAAL: no earlier period exists here. It needs an external baseline stated by the Owner, or a trial that runs a Change with and without KAAL.
