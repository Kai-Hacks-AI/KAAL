---
name: kaal-changing
description: Record a change to KAAL under changes/<name>/YY/MM/DD/CC/ through work, a seal on the work, retro-work.md (the worker's own 4L retrospective: Learned, Liked, Lacked, Longed), retro-observe.md (the observer's, written after reading the work and retro-work.md) and a seal on the Change. Use when starting a change to KAAL, when its work is complete and must be sealed, or when you are to write either retro and close it.
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
allocate → work → seal work → retro-work → retro-observe → seal Change (closed)
```

The current process requires `work/`, `retro-work.md` and `retro-observe.md` in the record (it does not say these are all a record may hold):

```
<kaal-dir>/changes/<name>/YY/MM/DD/CC/
├── work/              Change-local material, support and evidence, frozen before the retros
├── retro-work.md      written by the worker, from inside the Work
└── retro-observe.md   written by the observer, from outside the Work
```

`work/` is the current convention for what is frozen before reflection, a deliberately simple boundary we are learning from. It is not a KAAL artifact type and says nothing lasting about what work is. The actual implementation lives wherever it belongs (packages, engineering, and so on), not necessarily inside `work/`; keep in `work/` the support and evidence you want the retro to reflect on, and do not invent file names or structure for it beyond need. `RATIFICATION` (a Node of the installed KAAL) may guide how you think while working; it is vocabulary, not files or phases.

Where a change is in the process is never written down. Ask `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`: it answers where the change is, what is valid next and what is wrong, and you do not reconstruct that yourself.

## Steps

1. **Allocate.** `node scripts/next-change.mjs <kaal-dir> <name>` takes the number after the highest existing `CC` for that name and date, never reuses a gap, refuses when `99` is exhausted, creates the directory and prints its path relative to the KAAL directory. Do not choose a number by hand. Allocation is optimistic: the next free `CC` is the next one visible in the lineage you are working from, with no reservation, lock or registry. Concurrent work may take the same number, and that race is acceptable. It is settled at admission: if another Change has taken the address by the time you refresh against the lineage, allocate again before you seal the Work and close, and the staged Change moves there as a whole (its address is not part of its identity). Staging may race; the lineage cannot.
2. **Work.** Do the change, and keep its Change-local support and evidence under `work/`. Pay attention to your own experience of it; your retro is written from that. `work/` may change freely while it is open.
3. **Seal work.** When the work is complete, seal `work/`: `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`. Treat `work/` as immutable from then on. Do this before any retro begins, so that what you reflect on cannot be revised afterwards. If it refuses or `state-kaal-change` reports a problem, resolve it; do not bypass it.
4. **Retro, from inside the Work.** Only now the worker who performed the change writes `retro-work.md` in the change directory, as described in `references/retro.md`. Writing it does not disturb the seal on `work/`.
5. **Retro, from outside the Work.** Only after `retro-work.md` exists, an observer from outside the Work reads the sealed `work/` and `retro-work.md`, then writes `retro-observe.md` from that observer's own seat, as described in `references/retro.md`.
6. **Close.** `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`. The Change's seal covers `work/` and both retros together; there is no separate seal for either retro.

## Admission

A Change joins the admitted KAAL only closed. Many steps may go into doing it, and they happen wherever work is staged; the Change is open there and its `work/` may change freely. What is proposed for admission is the finished state: one new Change, closed, with everything it changed. A partial Change is not proposed, and one admission carries exactly one new Change. `npm run check-kaal-admission -- <baseline-kaal-dir> <candidate-kaal-dir>` answers whether a candidate may be admitted (it is the repository's provisional helper, like the others; it refuses what is not closed, and does not judge whether the Change describes the rest of the candidate faithfully). Seal before you propose, not after: nothing is added to a Change once it is admitted.

## Rules

- Do not write a retro before the work is sealed, do not write `retro-observe.md` before `retro-work.md` exists, and do not go back and alter sealed work to make the history cleaner. If you find something while writing a retro, it belongs in the retro.
- A change record is immutable once closed: never edit a sealed `work/`, a retro once written, or a closed change, and never reuse or renumber a change directory.
- Each retro is its writer's own. Do not write what the user, anyone else or a team thought, and do not write what you believe is wanted.
- Do not add metadata that says what phase a change is in. Other meaningful artifacts may join a change record where a capability or process calls for them; they do not replace or reorder the steps above.
- Changes closed before work was sealed (genesis `01`) or with the single historical `retro.md` (`05/01`) are valid as they are; do not alter them to fit this process. `retro.md` is not written in a new change.

## Scripts and helpers

- `scripts/next-change.mjs [--date YYYY-MM-DD] <kaal-dir> <name>`: allocates and creates the next change directory under `<kaal-dir>/changes/<name>/`, dated today in UTC unless `--date` is given; exit 0, or 1 when it refuses. `<name>` is lowercase letters, digits and single hyphens.

The sealing and state commands are the repository's provisional helpers (`engineering/change-seal`), run from the repository root; this skill ships no script for them. `npm run seal-kaal-change` is the bare Change seal beneath `close-kaal-change` and does not know the process, so do not use it to close a change.
