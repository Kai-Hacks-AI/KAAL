---
name: changing-kaal
description: Record a change to KAAL under changes/<name>/YY/MM/DD/CC/ through work, a seal on the work, a retro.md (the participating agent's own 4L retrospective: Learned, Liked, Lacked, Longed) and a seal on the Change. Use when starting a change to KAAL, when its work is complete and must be sealed, or when you are to write its retro and close it.
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
allocate → work → seal work → retro → seal Change (closed)
```

The record holds `work/` and `retro.md`:

```
<kaal-dir>/changes/<name>/YY/MM/DD/CC/
├── work/       Change-local material, support and evidence, frozen before the retro
└── retro.md
```

`work/` is the current convention for what is frozen before reflection, a deliberately simple boundary we are learning from. It is not a KAAL artifact type and says nothing lasting about what work is. The actual implementation lives wherever it belongs (packages, engineering, and so on), not necessarily inside `work/`; keep in `work/` the support and evidence you want the retro to reflect on, and do not invent file names or structure for it beyond need. `RATIFICATION` (a Node of the installed KAAL) may guide how you think while working; it is vocabulary, not files or phases.

Where a change is in the process is never written down. Ask `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`: it answers where the change is, what is valid next and what is wrong, and you do not reconstruct that yourself.

## Steps

1. **Allocate.** `node scripts/next-change.mjs <kaal-dir> <name>` takes the number after the highest existing `CC` for that name and date, never reuses a gap, refuses when `99` is exhausted, creates the directory and prints its path relative to the KAAL directory. Do not choose a number by hand.
2. **Work.** Do the change, and keep its Change-local support and evidence under `work/`. Pay attention to your own experience of it; the retro is written from that. `work/` may change freely while it is open.
3. **Seal work.** When the work is complete, seal `work/`: `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`. Treat `work/` as immutable from then on. Do this before you begin the retro, so that what you reflect on cannot be revised afterwards. If it refuses or `state-kaal-change` reports a problem, resolve it; do not bypass it.
4. **Retro.** Only now write `retro.md` in the change directory, as described in `references/retro.md`. Writing it does not disturb the seal on `work/`.
5. **Close.** `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`. The Change's seal covers `work/` and `retro.md` together; there is no separate seal for the retro.

## Rules

- Do not write `retro.md` before the work is sealed, and do not go back and alter sealed work to make the history cleaner. If you find something while writing the retro, it belongs in the retro.
- A change record is immutable once closed: never edit a sealed `work/`, a `retro.md` once written, or a closed change, and never reuse or renumber a change directory.
- The retro is your own. Do not write what the user, a reviewer or a team thought, and do not write what you believe is wanted.
- Do not add metadata that says what phase a change is in, and do not add anything to the record beyond `work/` and `retro.md`.
- Changes closed before work was sealed (genesis `01`) are valid as they are; do not alter them to fit this process.

## Scripts and helpers

- `scripts/next-change.mjs [--date YYYY-MM-DD] <kaal-dir> <name>`: allocates and creates the next change directory under `<kaal-dir>/changes/<name>/`, dated today in UTC unless `--date` is given; exit 0, or 1 when it refuses. `<name>` is lowercase letters, digits and single hyphens.

The sealing and state commands are the repository's provisional helpers (`engineering/change-seal`), run from the repository root; this skill ships no script for them. `npm run seal-kaal-change` is the bare Change seal beneath `close-kaal-change` and does not know the process, so do not use it to close a change.
