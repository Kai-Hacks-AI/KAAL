# C28 change

The Owner asked where research sits in the folder structure, and said research and rehearsals might deserve first-class attention (C27 left it open: "Operations is fine for now"). Then he sharpened it: research is external references, researching what is out there, and a rehearsal is where we test our own ideas, so the two are not one thing and not one folder; they might be siblings. He then named them so that the names share an R (retros, research, rehearsals), gave rehearsals the id `RH<n>` (`R<n>` is research, `RT<n>` is a retrospective), and added a fourth sibling, `reviews`, for targeted reviews that are deemed worth keeping. This page is engineering's answer, to be judged before anything is built. The capability that owns the objects, kaal-research, is another thread's and does not exist yet; the Owner decided that rehearsal is part of research, so one capability, kaal-research, owns two Skills, one for research and one for rehearsal. Engineering gives them a place and nothing more.

## The answer in five lines

1. **Two objects, two names.** Research is what is out there: papers, tool documentation, market research. A rehearsal is our own idea, run and observed.
2. **Four siblings in `02-learnings`:** `retros/`, `research/`, `rehearsals/` and `reviews/`. Each lives with the capability that asked the question or owns the idea.
3. **Owners:** `kaal-research` owns the research note (`<capability>/R<n>`). `kaal-research` also owns the rehearsal object (`RH<n>`), as its second Skill: the Owner decided that rehearsal is part of research, so there is no separate rehearsal capability. `kaal-review` owns the review object (`RV<n>`).
4. **`14-operations` stays one thing:** controls and, where needed, `runs`.
5. **Reviews are kept only when deemed worthy.** The layout gives the place; whether a review is worth persisting, and what verifies one, is the review capability's decision. Not every review deserves a record.

## Why siblings in `02-learnings`

- The four are what a capability learned, by four routes: from its own work (`retros`), by reading what is out there (`research`), by trying its own idea (`rehearsals`), and from a targeted review worth keeping (`reviews`). The steering group holds what shapes the work, and each verdict is cited by id by a Change, an Intent, a Requirement or a retrospective.
- A rehearsal is a run, which pulls toward `14-operations`. Against it: its product is a verdict that steers planning, not evidence that a Source delivers behaviour; rehearsal evidence (transcripts, keys, prompt hashes) differs from the package's own `runs`; and `14-operations` verifies by `controls`, so a rehearsal in it would need a control to exist beside it, a coupling that has nothing to do with the rehearsal.
- Siblings keep the two names apart, as the Owner asked, and cost one template edit each.

## The small research of a retrospective

A retrospective's Learned lens already carries its own `source` or `searched` line. That stays enough for small outside lookups: no note, nothing to migrate. A larger study, or a source several decisions rest on, becomes a research note, and the retrospective cites `R<n>` by id instead. The layout needs nothing for this beyond the place.

## How notes and evidence sit beside Changes and Cases

| Artefact | Place | Verified by | Relation |
| --- | --- | --- | --- |
| Change | the Change folder | its Cases | cites `R<n>` or a rehearsal by id when a decision rests on it |
| Case | beside the element, `test-cases` | running it | never holds rehearsal evidence; a Case is deterministic |
| Retrospective | `02-learnings/retros/RT<n>` | kaal-retro | its Learned entries cite research by id |
| Research note | `02-learnings/research/R<n>…` | kaal-research (to state) | the object for what is out there |
| Rehearsal | `02-learnings/rehearsals/…`, `RH<n>` | kaal-research, second Skill (to state) | the object for our own ideas |
| Review | `02-learnings/reviews/…`, `RV<n>` | kaal-review (to state) | a targeted review deemed worth persisting; the rest are not kept |

What the evidence holds is each capability's rule; the shape engineering expects: for research, where, date retrieved, first- or secondhand, an excerpt where the source can vanish; for a rehearsal, the key and criteria written before the first run, prompt hashes, model and settings, the judge's excerpts, and whole transcripts only where its capability says so. Neither is a Case, since neither can be re-run to the same result.

## Where the existing notes are

`engineering/research/*.md` and the rehearsals kept in the shared project folder predate any place. They are not moved here: each is re-homed by the capability that asked, once its owner exists. Until then `engineering/research/` is a folder the ratchet will name.

## What this changes

The layout template (`02-learnings` gets the children `research`, `rehearsals` and `reviews`) and the Case that pins its children (T1245, amended at the DO). The check reads the template and needs no new rule.

## What this does not do

No note, Skill, finder or check, no Skills of kaal-research, no rule for which review is worthy, no migration, no wiring, no ruleset, no publication, and no verifier for any of the three folders: as for `retros`, the layout names none.

## Alternatives considered

- **`14-operations/research` and `14-operations/rehearsals`**, as C27 left them. Rejected: Operations would hold objects whose verdicts steer planning, and `14-operations` would depend on controls for them. The Owner agrees with the siblings under `02-learnings` and notes that trials could have been argued under Operations, but fit better in `02-learnings`.
- **One `research` folder with a `kind` for inbound and own.** This PLAN's earlier shape. Rejected after the Owner's correction: the two should not be confused under one name.
- **A numbered folder of their own** (for instance `03-research`). Rejected for now (YAGNI): siblings in `02-learnings` already give both first-class standing, and one template edit can split them out later.

## PLAN

1. Add Requirements F59, F60 and F61 and gap G118 under `packages/kaal-engineering/`, and Cases T1331 to T1334 as `.red.mjs` beside them.
2. Observe the expected RED against the collector, and show that each Case can pass on a throwaway copy that holds `draft/` (`evidence.md`).
3. `draft/` holds the revised template, for review only.

## Ids

Proposed: Change engineering/C28, Requirements engineering/F59, F60 and F61, gap G118, Cases T1331 to T1334. They are the next free on `main` and every branch at the time of writing (highest Case seen: T1330, taken by release in #2216; `engineering/acceptance` has its own C28, a different capability); the allocator confirms.

## DO

Not authorized by this PLAN. After the Owner's go: move the template from `draft/` into the Skill and remove `draft/`; update the order section of `package-layout.md`; amend T1245 to name the four children; rename T1331 to T1334 to `.test.mjs`.

## Questions for review

1. Is `02-learnings` the right parent for both? The Owner answered yes (21 Nov 2026): trials could have been argued under Operations, but fit better here. Approval of this PLAN is still the go.
2. Answered by the Owner (21 Nov 2026): rehearsal is part of research, and kaal-research owns two Skills, one for research and one for rehearsal; the folders stay siblings.
3. Is "persist only when deemed worthy" the right selection rule for reviews, with the decision owned by review?

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
