---
name: kaal-collecting
description: Collect KAAL-addressed carriers that KAAL clients expose into this KAAL, recording per client whether it was reached or not, with client and carrier identity. Use when KAAL-addressed communication, such as incidents or requests from clients, is to be brought into KAAL as evidence, or when a collection is to be checked.
license: MIT
compatibility: Needs Node.js 20 or later. It needs no other package, and no network access of its own.
---

# Collecting KAAL

Use this to bring what KAAL clients expose to KAAL into this KAAL. What this capability means to KAAL is stated by the Nodes `Skill` and `Collecting KAAL` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## What belongs to whom

Collecting writes the record of what you tried and what you brought in. It does not reach clients: you do, with whatever means you have in this environment. It does not decide which clients exist or which to try, and it keeps no list of them. It does not read, rank or act on what it collects.

## Steps

1. **Decide which clients to attempt.** That is yours, from what you know and what your means show you. A name you give a client is yours: lowercase letters, digits and single hyphens, stable across collections, never a URL or a path.
2. **Open a collection.** `node scripts/collect.mjs begin <kaal-dir>` creates `<kaal-dir>/collections/YY/MM/DD/CC/` and prints it. One collection is one run.
3. **Reach each client with your own means** and have it show you only what the client exposes to KAAL: the KAAL-addressed carriers it carries within its embedded KAAL, by default the `carriers/` directory of its KAAL directory. Put what you are shown in a plain directory. Do not read, list or copy anything else of the client, and do not stretch an access you were given for other purposes.
4. **Record each attempt**, whichever way it ended:
   - `node scripts/collect.mjs reached <kaal-dir> <collection> --client <name> --adapter <text> --from <dir>`: copies the exposure exactly, with each carrier's SHA-256. An empty `<dir>` is a real result: reached, nothing carried for KAAL.
   - `node scripts/collect.mjs unreached <kaal-dir> <collection> --client <name> --adapter <text> --reason <text>`: records that you tried and why it did not work. A client you could not reach is still a client you knew.
5. **Check it.** `node scripts/collect.mjs check <kaal-dir> <collection>` exits 0 only if every collected carrier still matches its recorded identity.

## Rules

- A collection speaks only of the attempts you recorded in it. Never write or imply that clients you did not attempt are absent, and never treat the clients you could see as all there are.
- Never collect beyond what a client exposes to KAAL, whatever your means could reach.
- Name no host, transport or particular client in anything you add to KAAL's own meaning. How you reached a client goes in `--adapter`, as evidence.
- Collected material is evidence. Do not open an Issue, a Change or a backlog entry from it, rank it or decide on it as part of collecting; interpretation and action are other work.
- A collection is written once. Never edit it afterwards, and a later attempt is a new collection.

## Scripts

- `scripts/collect.mjs begin <kaal-dir>`: creates and prints the next collection; exit 0, or 1 when it refuses (including at `99` for the day), 2 on usage.
- `scripts/collect.mjs reached <kaal-dir> <collection> --client <name> --adapter <text> --from <dir>`: records a reached client and copies its exposure; exit 0, 1 when it refuses (a symlink or non-file under `<dir>`, a client already recorded in this collection, an invalid name, an unknown collection), 2 on usage. Nothing is written when it refuses.
- `scripts/collect.mjs unreached <kaal-dir> <collection> --client <name> --adapter <text> --reason <text>`: records an attempt that did not reach; exit codes as above.
- `scripts/collect.mjs check <kaal-dir> <collection>`: exit 0 only if every carrier matches; otherwise 1.
