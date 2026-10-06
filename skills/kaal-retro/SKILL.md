---
name: kaal-retro
description: Create a retrospective in its canonical form (Retro, then Learned, Liked, Lacked and Longed) from four texts, and check that a file is exactly one. Use when a retrospective must be written, or when a file must be checked to be a canonical retrospective, for any work, change or process.
license: MIT
compatibility: Needs Node.js 20 or later. It needs no other package.
---

# Retro

Use this to write a retrospective, or to check that a file is one. What this capability means to KAAL is stated by the Nodes `Skill` and `Retro` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## What belongs to whom

Retro owns the form of a retrospective and nothing about when one is owed. Whatever asks for a retrospective decides who writes it, when, where the file goes and what it is about. You bring that decision to Retro as a destination and four texts; Retro writes the structure.

## Steps

1. **Write your four texts yourself**, from your own seat: what you Learned, Liked, Lacked and Longed for. Do not speak for anyone else, and do not write one observation four ways. Where you have nothing honest to say for a part, say that plainly.
2. **Create it.** `node scripts/retro.mjs write <destination> --learned <text> --liked <text> --lacked <text> --longed <text>`. A text given as `@path` is read from that file, which is the easy way to give several paragraphs. It prints the destination.
3. **Check one.** `node scripts/retro.mjs check <file>` exits 0 only if the file is exactly a retrospective in canonical form.

## Rules

- Say what you mean in your texts, in any words: a text may quote or discuss headings or any Markdown. Retro keeps the four parts apart by writing a heading-like line of your text with a backslash before its `#`, which shows as exactly what you wrote and which `check` reads back as you gave it.
- Never write the structure by hand: the form is Retro's, and a hand-written retrospective that differs by a heading level or a blank line is not a retrospective.
- A retrospective is written once. `write` refuses to replace a file, and you do not edit one after it is written.
- Never write another seat's retrospective, and never fill a part with what you expect to be welcome.
- Retro adds no metadata, scores, action items, names or summary, and knows nothing of Git, GitHub or any host.

## Scripts

- `scripts/retro.mjs write <destination> --learned <text> --liked <text> --lacked <text> --longed <text>`: creates the file; exit 0, 1 when it refuses (a part is empty, or the destination exists), 2 on usage.
- `scripts/retro.mjs check <file>`: exit 0 only for the canonical form, otherwise 1.
