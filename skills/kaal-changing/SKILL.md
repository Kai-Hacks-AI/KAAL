---
name: kaal-changing
description: Record a change to KAAL under changes/<name>/YY/MM/DD/CC/ through work, review by ROWING (rounds in review/ until one converges on the work), a seal on the work, three retrospectives (retro-work.md the Worker's, retro-review.md the Reviewer's, retro-owner.md the Owner's, each a 4L retrospective), then a seal on the Change. Use when starting a change to KAAL, when its work is ready for review or you are to review it, when its work is converged and must be sealed, or when you are to write any of the retros and close it.
license: MIT
compatibility: Needs Node.js 20 or later. Written for a KAAL directory, by default .kaal/, whose changes/ holds the change records.
---

# Changing KAAL

Use this to give a change to KAAL its record, and to close it. What this capability means to KAAL is stated by the Nodes `Skill` and `Changing KAAL` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## The change record

A change has its own identity, which is not a PR number. Its record is a directory inside the installed KAAL, in `<kaal-dir>/changes/` (`.kaal` is only the default name of the KAAL directory):

```
<kaal-dir>/changes/<name>/YY/MM/DD/CC/
```

`<name>` is the line of work the change belongs to; for now it is `genesis`. `YY/MM/DD` is the change date. `CC` is a two-digit sequence, `01` to `99`, identifying one change within that name and date. For example `.kaal/changes/genesis/26/10/04/02/`.

## The process

A change goes through exactly this, in this order:

```
allocate → work ⇄ review → seal work → retro-work, retro-review and retro-owner → seal Change (closed)
```

Work and review go round until a review round converges on the work as it then stands; only then is the work sealed. The record holds `work/`, `review/`, `retro-work.md`, `retro-review.md` and `retro-owner.md` (the current process requires these and does not say a record may hold nothing else):

```
<kaal-dir>/changes/<name>/YY/MM/DD/CC/
├── work/              Change-local material, support and evidence; open while review has findings, frozen before the retros
├── review/            one file per round, NN.md, written by the Reviewer and never edited afterwards
├── retro-work.md      written by the Worker, from the Work's seat
├── retro-review.md    written by the Reviewer, from the review's seat
└── retro-owner.md   written by the Owner, from the Owner's seat
```

`work/` is the current convention for what is frozen before reflection, a deliberately simple boundary we are learning from. It is not a KAAL artifact type and says nothing lasting about what work is. The actual implementation lives wherever it belongs (packages, engineering, and so on), not necessarily inside `work/`; keep in `work/` the intent, requirements, architecture and the support and evidence the review and the retros are to reflect on, and do not invent file names or structure for it beyond need. `RATIFICATION` and `ROWING` (Nodes of the installed KAAL) may guide how you think while working and while reviewing; they are vocabulary, not files or phases.

Where a change is in the process is never written down. Ask `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`: it answers where the change is, what is valid next and what is wrong, and prints the identity of `work/` as it now stands, which a round names. You do not reconstruct that yourself.

Three roles take part: the Owner, the Worker and the Reviewer, two that row and one that steers. They are roles of the process, not necessarily three actors; see `references/rowing.md` for what each does and may not do, for the form of a round, and for what KAAL's checks can and cannot show.

## Steps

1. **Allocate.** `node scripts/next-change.mjs <kaal-dir> <name>` takes the number after the highest existing `CC` for that name and date, never reuses a gap, refuses when `99` is exhausted, creates the directory and prints its path relative to the KAAL directory. Do not choose a number by hand. Allocation is optimistic: the next free `CC` is the next one visible in the lineage you are working from, with no reservation, lock or registry. Concurrent work may take the same number, and that race is acceptable. It is settled at admission: if another Change has taken the address by the time you refresh against the lineage, allocate again before you seal the Work and close, and the staged Change moves there as a whole (its address is not part of its identity). Staging may race; the lineage cannot.
2. **Work.** The Worker does the change, and keeps its Change-local support and evidence under `work/`, including the Intent, Requirements and Architecture the review is anchored to. Pay attention to your own experience of it; your retro is written from that. `work/` may change freely while it is open. When the Work is ready, the Worker stops: the next step is not the Worker's.
3. **Review.** Acting as Reviewer (a role that may be held by the same actor as the Worker, with weaker independence), the actor reviews the Work as realized by ROWING (`references/rowing.md`) and writes the next round, `review/NN.md`, naming the identity of `work/` that `state-kaal-change` prints. A round says `findings` or `converged`. With findings, the Worker resolves them in `work/`, stops again, and the Reviewer writes the next round. This repeats inside the one change until a round says `converged` about the work as it now stands. While acting as Reviewer, the actor does not change `work/`.
4. **Seal work.** Once the review has converged, seal `work/`: `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`. Treat `work/` as immutable from then on. Do this before any retro begins, so that what you reflect on cannot be revised afterwards. If it refuses or `state-kaal-change` reports a problem, resolve it; do not bypass it.
5. **Retro, from the Work's seat.** Only now the Worker writes `retro-work.md` in the change directory, as described in `references/retro.md`. Writing it does not disturb the seal on `work/`.
6. **Retro, from the review's seat.** Only now the Reviewer writes `retro-review.md`, as described in `references/retro.md`: what it learned, liked, lacked and longed for in reviewing. It is not the review's result, and it carries no verdict.
7. **Retro, from the Owner's seat.** Only now the Owner writes `retro-owner.md`, as described in `references/retro.md`: what it learned, liked, lacked and longed for in observing the Change from outside, as the one who holds its Intent. It is a reflection, not the Owner's decision to accept the Change, which comes after the Change is sealed and is not an artifact of the record. The three retros are written in any order; each is its own seat's perspective, and it is recommended that none be read before writing one's own.
8. **Close.** `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`. The Change's seal covers `work/`, `review/` and the three retros together; there is no separate seal for any of them. The closed change is what the Owner is given to accept; only then does the Owner decide, and that decision is not an artifact of the record.

## Admission

A Change joins the admitted KAAL only closed. Many steps may go into doing it, and they happen wherever work is staged; the Change is open there and its `work/` may change freely. What is proposed for admission is the finished state: one new Change, closed, with everything it changed. A partial Change is not proposed, and one admission carries exactly one new Change. `npm run check-kaal-admission -- <baseline-kaal-dir> <candidate-kaal-dir>` answers whether a candidate may be admitted (it is the repository's provisional helper, like the others; it refuses what is not closed, and does not judge whether the Change describes the rest of the candidate faithfully). Seal before you propose, not after: nothing is added to a Change once it is admitted.

## Rules

- Do not seal work before a review round has converged on it, do not write a retro before the work is sealed, and do not go back and alter sealed work to make the history cleaner. If you find something while writing a retro, it belongs in the retro.
- Review is not execution and not ownership: the Reviewer judges the Work as realized, against the Change as intended, and does not rewrite it. A finding is work to resolve; a broader consequence is for the retro or a future change.
- A change record is immutable once closed: never edit a sealed `work/`, a round or a retro once written, or a closed change, and never reuse a change directory or renumber a closed one.
- Each retro is its writer's own. Do not write what the user, anyone else or a team thought, and do not write what you believe is wanted. A retro does not approve, and a finding does not live only in a retro. The Owner's reflection and the Owner's decision are two acts: `retro-owner.md` is the first and never the second.
- One actor may hold several roles; the process stays valid, and its separation is only weaker. KAAL's checks see artifacts and their order, never who wrote them; independence of the Reviewer is asked of the process and is not something they can establish.
- Do not add metadata that says what phase a change is in. Other meaningful artifacts may join a change record where a capability or process calls for them; they do not replace or reorder the steps above.
- Changes closed before review was a step are valid as they are: genesis `01` and `05/01` with the single historical `retro.md`, `05/02` and `06/01` with `retro-work.md` and `retro-observe.md` and no review. Do not alter them. In a new change neither `retro.md` nor `retro-observe.md` is written: `retro-observe.md` is the historical name of the outer perspective, from when it was thought of as an Observer, and it is the Owner's retrospective, `retro-owner.md`, beside `retro-work.md` and `retro-review.md`.

## Scripts and helpers

- `scripts/next-change.mjs [--date YYYY-MM-DD] <kaal-dir> <name>`: allocates and creates the next change directory under `<kaal-dir>/changes/<name>/`, dated today in UTC unless `--date` is given; exit 0, or 1 when it refuses. `<name>` is lowercase letters, digits and single hyphens.

The sealing and state commands are the repository's provisional helpers (`engineering/change-seal`), run from the repository root; this skill ships no script for them. `npm run seal-kaal-change` is the bare Change seal beneath `close-kaal-change` and does not know the process, so do not use it to close a change.
