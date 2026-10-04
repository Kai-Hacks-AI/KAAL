---
name: changing-kaal
description: Record a change to KAAL under changes/<name>/YY/MM/DD/CC/ and close it with a retro.md, the participating agent's own 4L retrospective (Learned, Liked, Lacked, Longed). Use when starting a change to KAAL and you need its change directory, or when a change is ending and you are to write its retro.
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

## Steps

1. **Start the change.** Allocate its directory: `node scripts/next-change.mjs <kaal-dir> <name>`. It takes the number after the highest existing `CC` for that name and date, never reuses a gap, refuses when `99` is exhausted, creates the directory and prints its path relative to the KAAL directory. Do not choose a number by hand.
2. **Do the change.** Pay attention to your own experience of it; the retro is written from that.
3. **Close the change.** Write `retro.md` in the change directory, as described in `references/retro.md`. Write it when the change is finished, not before.

## Rules

- A change record is immutable once written: never edit a `retro.md` once it is written, and never reuse or renumber a change directory.
- The retro is your own. Do not write what the user, a reviewer or a team thought, and do not write what you believe is wanted.
- Do not add files, headings or metadata to the change record beyond what `references/retro.md` states.

## Scripts

- `scripts/next-change.mjs [--date YYYY-MM-DD] <kaal-dir> <name>`: allocates and creates the next change directory under `<kaal-dir>/changes/<name>/`, dated today in UTC unless `--date` is given; exit 0, or 1 when it refuses. `<name>` is lowercase letters, digits and single hyphens.
