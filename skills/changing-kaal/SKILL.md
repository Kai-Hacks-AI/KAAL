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
├── work/       whatever the work produces or evidences; its contents are yours to decide
└── retro.md
```

Where a change is in the process is never written down. It is read from the record and its seals, by the repository's helper for this (below), which also answers what is allowed next:

| the helper says | what is next |
|---|---|
| `WORK OPEN` | complete the work in `work/`, then seal it |
| `WORK SEALED` | write `retro.md` |
| `RETRO PRESENT` | seal the Change |
| `CHANGE CLOSED` | nothing; the record is immutable |

## Steps

1. **Allocate.** `node scripts/next-change.mjs <kaal-dir> <name>` takes the number after the highest existing `CC` for that name and date, never reuses a gap, refuses when `99` is exhausted, creates the directory and prints its path relative to the KAAL directory. Do not choose a number by hand.
2. **Work.** Do the change, keeping what it produces and evidences under `work/`. Pay attention to your own experience of it; the retro is written from that. `work/` may change freely while it is open.
3. **Seal work.** When the work is complete, seal `work/`: `npm run seal-kaal-work -- changes/<name>/YY/MM/DD/CC`. After this `work/` is immutable: any edit, addition, deletion, rename or move inside it, or renaming `work/` itself, is detected. Do this before you begin the retro, so that what you reflect on cannot be revised afterwards. It is refused if a `retro.md` already exists.
4. **Retro.** Only now write `retro.md` in the change directory, as described in `references/retro.md`. Writing it does not disturb the seal on `work/`.
5. **Seal the Change.** `npm run close-kaal-change -- changes/<name>/YY/MM/DD/CC`. It is refused unless the work is sealed and `retro.md` is present. The Change's seal covers `work/` and `retro.md` together.

To see where a change is at any point: `npm run state-kaal-change -- changes/<name>/YY/MM/DD/CC`.

## Rules

- Do not write `retro.md` before the work is sealed, and do not go back and alter sealed work to make the history cleaner. If you find something while writing the retro, it belongs in the retro.
- A change record is immutable once closed: never edit a sealed `work/`, a `retro.md` once written, or a closed change, and never reuse or renumber a change directory.
- The retro is your own. Do not write what the user, a reviewer or a team thought, and do not write what you believe is wanted.
- Do not add metadata that says what phase a change is in, and do not add anything to the record beyond `work/` and `retro.md`.
- Changes closed before work was sealed (genesis `01`) are valid as they are; do not alter them to fit this process.

## Scripts and helpers

- `scripts/next-change.mjs [--date YYYY-MM-DD] <kaal-dir> <name>`: allocates and creates the next change directory under `<kaal-dir>/changes/<name>/`, dated today in UTC unless `--date` is given; exit 0, or 1 when it refuses. `<name>` is lowercase letters, digits and single hyphens.

The sealing and state commands are the repository's provisional helpers (`engineering/change-seal`), run from the repository root; this skill ships no script for them. `npm run seal-kaal-change` is the bare Change seal beneath `close-kaal-change` and does not know the process, so do not use it to close a change.
