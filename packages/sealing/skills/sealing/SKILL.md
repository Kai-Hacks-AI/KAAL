---
name: sealing
description: Establish and verify the seal of a KAAL artifact, given the identity its own domain defines. Computes the canonical identity of a directory tree for a domain that is a tree, and writes, checks and lists seal markers in a seals directory. Use when something must be sealed or a seal checked, or when a tree's identity is needed.
license: MIT
compatibility: Needs Node.js 20 or later. Works on any directory and seals directory; it needs no other package.
---

# Sealing

Use this to seal an artifact or check that it is still what was sealed. What this capability means to KAAL is stated by the Nodes `Skill` and `Sealing` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## What belongs to whom

Sealing does not decide what an artifact's identity is. The domain of the artifact does, and you bring that decision to Sealing:

- A **Node**'s identity is the SHA-256 of its exact bytes; Core defines it, and a Node's seal is `seals/<ID>` in the KAAL directory.
- A **tree** (a directory of files) has a canonical identity that Sealing computes for a domain you name, below. Which directory is the artifact, which domain names it, and whether the tree's own name is part of its identity are the artifact's own decisions. A Change and a Change's `work/` are defined by Changing KAAL, not here.
- Where seals of a kind are kept, and when something must be sealed, are decided by the domain and its process, not here.

## Steps

1. **Get the ID.** For a tree, `node scripts/tree-id.mjs [--named] <domain> <dir>` prints it. `<domain>` is the domain's own single-line name, such as `KAAL Change v1`. Without `--named` the identity covers the relative paths and exact bytes under `<dir>`; with `--named` it also covers the last segment of `<dir>`, so the tree moved to another parent keeps its identity and renamed does not. Nothing else about where it is takes part. It refuses what it could not state the same on every platform (symlinks, empty directories, an empty tree, names that are not NFC, backslashes, control characters, paths differing only by case) rather than normalising it.
2. **Seal it.** `node scripts/seal.mjs write <seals-dir> <id>` writes an empty marker named by the ID in the seals directory the domain uses; sealing again changes nothing.
3. **Verify it.** Compute the ID again and check it: `node scripts/seal.mjs check <seals-dir> <id>` exits 0 only if that ID is sealed. An artifact whose current ID is not sealed is not the sealed artifact. `node scripts/seal.mjs list <seals-dir>` prints what is sealed.

## Rules

- A sealed artifact never changes. Changed bytes, a changed path or a different name are another artifact with another ID, never the sealed one with a new seal.
- Never remove or replace a seal, and never seal an ID you did not compute from the artifact as it now is.
- Do not use Sealing to decide what an artifact is, and do not add Git, GitHub or CI concerns to it: repository controls consume seals from outside.

## Scripts

- `scripts/tree-id.mjs [--named] <domain> <dir>`: prints the tree's ID; exit 0, or 1 when the tree has no identity, 2 on usage.
- `scripts/seal.mjs write|check|list <seals-dir> [<id>]`: writes, checks (exit 0 or 1) or lists seal markers; it computes no ID.
