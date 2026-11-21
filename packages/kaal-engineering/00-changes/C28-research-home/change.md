# C28 change

The Owner asked where research sits in the folder structure, and said research and trials might deserve first-class attention (C27 left it open: "Operations is fine for now"). Then he sharpened it: research is external references, researching what is out there, and a trial is where we test our own ideas, so the two are not one thing and not one folder; they might be siblings. This page is engineering's answer, to be judged before anything is built. The capabilities that own the two objects, kaal-research and a trial capability, are other threads' and do not exist yet. Engineering gives them a place and nothing more.

## The answer in four lines

1. **Two objects, two names.** Research is what is out there: papers, tool documentation, market research. A trial is our own idea, run and observed.
2. **Siblings in `02-learnings`:** `02-learnings/research/` and `02-learnings/trials/`, beside `02-learnings/retros/`. Each lives with the capability that asked the question or owns the idea.
3. **Owners:** `kaal-research` owns the research note (`<capability>/R<n>`). The trial object needs a capability of its own (nothing without a capability); the id is its to choose.
4. **`14-operations` stays one thing:** controls and, where needed, `runs`.

## Why siblings in `02-learnings`

- The three are what a capability learned, by three routes: from its own work (`retros`), by reading what is out there (`research`), by trying its own idea (`trials`). The steering group holds what shapes the work, and each verdict is cited by id by a Change, an Intent, a Requirement or a retrospective.
- A trial is a run, which pulls toward `14-operations`. Against it: its product is a verdict that steers planning, not evidence that a Source delivers behaviour; trial evidence (transcripts, keys, prompt hashes) differs from the package's own `runs`; and `14-operations` verifies by `controls`, so a trial in it would need a control to exist beside it, a coupling that has nothing to do with the trial.
- Siblings keep the two names apart, as the Owner asked, and cost one template edit each.

## The small research of a retrospective

A retrospective's Learned lens already carries its own `source` or `searched` line. That stays enough for small outside lookups: no note, nothing to migrate. A larger study, or a source several decisions rest on, becomes a research note, and the retrospective cites `R<n>` by id instead. The layout needs nothing for this beyond the place.

## How notes and evidence sit beside Changes and Cases

| Artefact | Place | Verified by | Relation |
| --- | --- | --- | --- |
| Change | the Change folder | its Cases | cites `R<n>` or a trial by id when a decision rests on it |
| Case | beside the element, `test-cases` | running it | never holds trial evidence; a Case is deterministic |
| Retrospective | `02-learnings/retros/RT<n>` | kaal-retro | its Learned entries cite research by id |
| Research note | `02-learnings/research/R<n>…` | kaal-research (to state) | the object for what is out there |
| Trial | `02-learnings/trials/…` | the trial capability (to state) | the object for our own ideas |

What the evidence holds is each capability's rule; the shape engineering expects: for research, where, date retrieved, first- or secondhand, an excerpt where the source can vanish; for a trial, the key and criteria written before the first run, prompt hashes, model and settings, the judge's excerpts, and whole transcripts only where its capability says so. Neither is a Case, since neither can be re-run to the same result.

## Where the existing notes are

`engineering/research/*.md` and the trials kept in the shared project folder predate any place. They are not moved here: each is re-homed by the capability that asked, once its owner exists. Until then `engineering/research/` is a folder the ratchet will name.

## What this changes

The layout template (`02-learnings` gets the children `research` and `trials`) and the Case that pins its children (T1245, amended at the DO). The check reads the template and needs no new rule.

## What this does not do

No note, Skill, finder or check, no trial capability, no migration, no wiring, no ruleset, no publication, and no verifier for either folder: as for `retros`, the layout names none.

## Alternatives considered

- **`14-operations/research` and `14-operations/trials`**, as C27 left them. Rejected: Operations would hold objects whose verdicts steer planning, and `14-operations` would depend on controls for them.
- **One `research` folder with a `kind` for inbound and own.** This PLAN's earlier shape. Rejected after the Owner's correction: the two should not be confused under one name.
- **A numbered folder of their own** (for instance `03-research`). Rejected for now (YAGNI): siblings in `02-learnings` already give both first-class standing, and one template edit can split them out later.

## PLAN

1. Add Requirements F59 and F60 and gap G118 under `packages/kaal-engineering/`, and Cases T1331, T1332 and T1333 as `.red.mjs` beside them.
2. Observe the expected RED against the collector, and show that each Case can pass on a throwaway copy that holds `draft/` (`evidence.md`).
3. `draft/` holds the revised template, for review only.

## Ids

Proposed: Change engineering/C28, Requirements engineering/F59 and F60, gap G118, Cases T1331 to T1333. They are the next free on `main` and every branch at the time of writing (highest Case seen: T1330, taken by release in #2216; `engineering/acceptance` has its own C28, a different capability); the allocator confirms.

## DO

Not authorized by this PLAN. After the Owner's go: move the template from `draft/` into the Skill and remove `draft/`; update the order section of `package-layout.md`; amend T1245 to name the three children; rename T1331 to T1333 to `.test.mjs`.

## Questions for review

1. Is `02-learnings` the right parent for both, or does the Owner prefer a parent of their own for the two (a `03-` folder)?
2. Which capability owns the trial object, and what is its id? (Engineering suggests a separate capability and leaves the id to it.)

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
