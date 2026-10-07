---
name: kaal-request
description: Record a request addressed to KAAL, something the client wants from KAAL that is not presently available or sufficient, as a carrier kept locally beside its embedded KAAL, and check that a file is one. Use only when the client deliberately addresses a request to KAAL; it is not for the client's own requests or backlog.
license: MIT
compatibility: Needs Node.js 20 or later. Writes into the KAAL directory, by default .kaal/. It needs no other package.
---

# KAAL Request

Use this to address a request to KAAL: to make a carrier of it, kept locally beside the embedded KAAL, or to check that a file is one. What this capability means to KAAL is stated by the Nodes `Skill` and `KAAL Request` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## What belongs to whom

Making a carrier with this capability is what addresses it to KAAL. Whatever your own project keeps for its own incidents, defects, requests, ideas or backlog stays there and is not governed by this: use this only for what you deliberately address to KAAL, and do not use it to record your own. It decides nothing about whether, how or when a carrier leaves your repository or is collected; the carrier waits where it was made.

## Steps

1. **Write your two texts yourself**, in your own words: wanted, being what you want from KAAL, and missing, being what KAAL does not provide, or provides insufficiently, for it. Say only what you know; do not name particular clients, and do not write one statement twice.
2. **Make the carrier.** `node scripts/request.mjs write <kaal-dir> --wanted <text> --missing <text>`. A text given as `@path` is read from that file. `<kaal-dir>` is your KAAL directory, by default `.kaal`. It prints the carrier's path relative to `<kaal-dir>`, `requests/YY/MM/DD/CC.md`, where `YY/MM/DD` is today's date in UTC (`--date YYYY-MM-DD` names another) and `CC` is the next free number of that day, `01` to `99`.
3. **Leave it there.** The carrier stays in the KAAL directory, where KAAL can later collect it. Commit it with the rest of your repository if you keep the KAAL directory in version control. Do not edit it or move it.
4. **Check one.** `node scripts/request.mjs check <file>` exits 0 only if the file is exactly a carrier in canonical form.

## Rules

- Never write the structure by hand: the form is this capability's, and a hand-written carrier that differs by a heading level or a blank line is not one.
- A carrier is written once. `write` refuses to replace a file and never reuses a number, and you do not edit one after it is written.
- It adds no metadata, status, priority, identity of the sender or summary, and knows nothing of Git, GitHub, networks or any host.
- A request is not a `KAAL Incident`: use `KAAL Incident` only for the other kind, if its capability is installed.

## Scripts

- `scripts/request.mjs write <kaal-dir> --wanted <text|@file> --missing <text|@file> [--date YYYY-MM-DD]`: creates the next carrier; exit 0, 1 when it refuses (a part is empty or holds a heading line, `<kaal-dir>` is not a KAAL directory, or the day is full), 2 on usage.
- `scripts/request.mjs check <file>`: exit 0 only for the canonical form, otherwise 1.
