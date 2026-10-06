---
name: kaal-changing
description: Record a change to KAAL under changes/<name>/YY/MM/DD/CC/ through work, a seal on the work, retro-work.md (the worker's own 4L retrospective: Learned, Liked, Lacked, Longed), retro-observe.md (the observer's, written after reading the work and retro-work.md) and a seal on the Change. The worker stops after retro-work.md; an independent observer writes retro-observe.md. Use when starting a change to KAAL, when its work is complete and must be sealed, when you are the worker who writes retro-work.md and must then stop, or when you are the observer asked to write retro-observe.md.
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

The two retros are written by two different actors, and the process stops between them. The point where it stops is the handoff:

```
work → seal work → worker writes retro-work → HANDOFF
     → independent observer reads sealed work + retro-work, writes retro-observe
     → observer's text incorporated unchanged in substance → seal Change
```

The handoff is a state, and it is the one `state-kaal-change` calls `RETRO-WORK PRESENT`: `work/` sealed, `retro-work.md` present, no `retro-observe.md`. Whether you are the worker or the observer depends on which side of it you are.

Where a change is in the process is never written down. Ask `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`: it answers where the change is, what is valid next and what is wrong, and you do not reconstruct that yourself.

## Steps

1. **Allocate.** `node scripts/next-change.mjs <kaal-dir> <name>` takes the number after the highest existing `CC` for that name and date, never reuses a gap, refuses when `99` is exhausted, creates the directory and prints its path relative to the KAAL directory. Do not choose a number by hand.
2. **Work.** Do the change, and keep its Change-local support and evidence under `work/`. Pay attention to your own experience of it; your retro is written from that. `work/` may change freely while it is open.
3. **Seal work.** When the work is complete, seal `work/`: `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`. Treat `work/` as immutable from then on. Do this before any retro begins, so that what you reflect on cannot be revised afterwards. If it refuses or `state-kaal-change` reports a problem, resolve it; do not bypass it.
4. **Retro, from inside the Work (the worker's last step).** Only now the worker who performed the change writes `retro-work.md` in the change directory, as described in `references/retro.md`. Writing it does not disturb the seal on `work/`. **Then the worker stops.** That is the handoff. The worker does not write `retro-observe.md`, does not produce it through a sub-agent or any other part of its own execution, and does not close the change.
5. **Retro, from outside the Work (the observer's step).** The next actor to occupy the observer seat must be independent: it must not have participated in the work or in the worker's execution. How an actor comes to occupy that seat is outside KAAL. See "If you are the observer" below for its role, input and output.
6. **Incorporate, then close.** The observer's text goes into the change as `retro-observe.md`, unchanged in substance: placing it and fitting it to the retro form is not editing it; adding to it, softening it, answering it or removing from it is. Only then `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`. The Change's seal covers `work/` and both retros together; there is no separate seal for either retro.

## If you are the observer

You are the observer, not the worker, and not an approver or reviewer of the change: your output is evidence, and whether the change is accepted is another decision. If you took part in the work, or are part of the execution of whoever did, you are not the observer: say so and stop.

- **Input:** the sealed `work/` and `retro-work.md` of the change, and `references/retro.md`. Nothing else is yours to rely on.
- **Output:** exactly one file, `retro-observe.md`, in the retro form, from your own seat. Do not restate or answer `retro-work.md`, and do not speak for the worker.
- **Change nothing else.** Not `work/`, not `retro-work.md`, not any seal.

If you find a defect, record it in your retro. It does not reopen the change: sealed work is not revised and no retro is rewritten. Work that the finding calls for is another change.

## Rules

- Do not write a retro before the work is sealed, do not write `retro-observe.md` before `retro-work.md` exists, if you are the worker do not write it at all, and do not go back and alter sealed work to make the history cleaner. If you find something while writing a retro, it belongs in the retro.
- A fresh context is not an independent observer. A `retro-observe.md` written by a sub-agent that the worker started, briefed or otherwise got out of its own execution, before the handoff, does not meet this process, however clean that sub-agent's context. Independence does not depend on which model or provider the observer is.
- That the observer is independent is something the process requires and KAAL's checks cannot prove: they show that both retros exist beside a sealed work, not who wrote them. Do not read a closed change as proof of it.
- A change record is immutable once closed: never edit a sealed `work/`, a retro once written, or a closed change, and never reuse or renumber a change directory.
- Each retro is its writer's own. Do not write what the user, anyone else or a team thought, and do not write what you believe is wanted.
- Do not add metadata that says what phase a change is in. Other meaningful artifacts may join a change record where a capability or process calls for them; they do not replace or reorder the steps above.
- Changes closed before work was sealed (genesis `01`) or with the single historical `retro.md` (`05/01`) are valid as they are; do not alter them to fit this process. `retro.md` is not written in a new change.

## Scripts and helpers

- `scripts/next-change.mjs [--date YYYY-MM-DD] <kaal-dir> <name>`: allocates and creates the next change directory under `<kaal-dir>/changes/<name>/`, dated today in UTC unless `--date` is given; exit 0, or 1 when it refuses. `<name>` is lowercase letters, digits and single hyphens.

The sealing and state commands are the repository's provisional helpers (`engineering/change-seal`), run from the repository root; this skill ships no script for them. `npm run seal-kaal-change` is the bare Change seal beneath `close-kaal-change` and does not know the process, so do not use it to close a change.
