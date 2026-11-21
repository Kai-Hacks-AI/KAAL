# C28 change

The Owner asked where a research capability sits in the folder structure, and said earlier that research, and trials with it, might deserve first-class attention (C27 left it open: "Operations is fine for now"). This page is engineering's answer, to be judged before anything is built. The capability itself, kaal-research, is another thread's: a note `R<n>`, a Skill, a finder and a well-formed check. Engineering gives it a place and nothing more.

## The answer in three lines

1. **Package:** `kaal-research` owns the note, its Skill, finder and check, as `kaal-retro` owns the retrospective. It is not part of engineering.
2. **Folder:** the note lives with the capability that asked the question, in `02-learnings/research/`, beside `02-learnings/retros/`. The id is `<capability>/R<n>`, as a retrospective is `<capability>/RT<n>`.
3. **Evidence:** it stays with its note, inside `research/`. A Case is for what can be re-run; a trial cannot be, so its key, prompt hashes, settings and excerpts are the note's evidence, not Cases and not `runs`.

## Why `02-learnings` and not `14-operations`

C27 reasoned that Operations is where the package is run and what that shows. A trial is a run, which pulls toward Operations, but the layout is ordered by what a folder is for:

- Research is **input to planning**, not output of operating. A Change, an Intent, a Requirement or a retrospective cites `R<n>` to say why it is shaped as it is. The steering group, `00-backlog`, `01-changes` and `02-learnings`, holds what shapes the work; Operations answers the Source.
- A source note, a verdict on an outside paper or a tool's documentation, is no execution at all. Splitting trials from sources across two folders would put one object in two places.
- `retros` and `research` are the two things a capability learned: one about its own work, one about the world. The 4L Learned lens cites a source note by id, which is a link inside one group.
- `14-operations` stays one thing: controls and, where needed, `runs`. Putting trial transcripts into `runs` would mix the package's own fallback records with another object's evidence.

## How notes and evidence sit beside Changes and Cases

| Artefact | Place | Verified by | Relation to a note |
| --- | --- | --- | --- |
| Change | `00-changes/C<n>-…` (the Change folder) | its Cases | cites `R<n>` by id when a decision rests on it |
| Case | beside the element, `test-cases` | running it | never holds trial evidence; a Case is deterministic |
| Retrospective | `02-learnings/retros/RT<n>` | kaal-retro | its Learned entries cite a source note by id |
| Research note | `02-learnings/research/R<n>…` | kaal-research (to state) | the object |
| Note evidence | inside `research/`, with its note | the note's rules | key, prompt hashes, model and settings, excerpts; whole transcripts only if kaal-research says so |

The layout gives the place and says nothing about what is inside `research`. One-way citation by id is the edge, as for the other objects: the note never names its consumers.

## Where the existing notes are

`engineering/research/*.md` and the trials kept in the shared project folder predate any place. They are not moved here: the notes are re-homed one by one, by the capability that asked, once kaal-research exists. Until then `engineering/research/` is a folder the ratchet will name, and the layout check does not look at it.

## What this changes

Only the layout template (`02-learnings` gets the child `research` and a role line) and the Case that pins its children (T1245, amended at the DO). The check reads the template and needs no new rule.

## What this does not do

- No note, Skill, finder or well-formed check: that is kaal-research, after its own PLAN.
- No migration of the existing trials, no wiring, no ruleset, no publication.
- No decision on a verifier for `research`. As for `retros`, the layout names none.

## Alternatives considered

- **`14-operations/research`**, as C27 left it. Possible and cheaper to describe, but it files a verdict on a paper next to the package's controls, and the cited-by-decision edge then crosses from the concerns into the steering group.
- **A numbered folder of its own** (for instance `03-research`). Rejected for now (YAGNI): two children of `02-learnings` already give research first-class standing, and a folder of its own can be split out later by one template edit.
- **Research notes at the repository level only**, without an asking capability. Rejected: nothing exists without a capability, and the capability that asked is the one that must act on the verdict.

## PLAN

1. Add Requirement F59 and gap G118 under `packages/kaal-engineering/`, and Cases T1330 and T1331 as `.red.mjs` beside F59.
2. Observe the expected RED against the collector, and show that each Case can pass on a throwaway copy that holds `draft/` (`evidence.md`).
3. `draft/` holds the revised template, for review only.

## Ids

Proposed: Change engineering/C28, Requirement engineering/F59, gap G118, Cases T1330 and T1331. They are the next free on `main` and every branch at the time of writing (highest Case seen: T1323; `engineering/acceptance` has its own C28, a different capability); the allocator confirms.

## DO

Not authorized by this PLAN. After the Owner's go: move the template from `draft/` into the Skill and remove `draft/`; update the order section of `package-layout.md`; amend T1245 to name `research` as a child; rename T1330 and T1331 to `.test.mjs`.

## Questions for review

1. Is `02-learnings/research` the right place, or does the Owner prefer `14-operations/research` (the alternative above)? One template edit moves it either way.
2. Should the id carry the asking capability (`engineering/R3`), as the retrospective does?

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
