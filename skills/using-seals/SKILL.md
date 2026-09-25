---
name: using-seals
description: Seal directories so their files cannot change unnoticed, and check when seals are broken.
---

# Using Seals

A seal closes a unit: a directory whose files must not change once sealed. Sealing writes `seal.json` into the unit, recording the hash of every other file in it.

Units form a chain. The using system decides which units belong to a chain and in which order; this skill never knows what a unit means. A unit is given as a relative path beneath the root with `/` separators; a chain refuses units that are listed twice, contain one another, or pass through a symlink, before anything is read or written. Each seal also records the previous seal of its chain, so changing any sealed unit breaks its own seal and every seal after it.

Seal with `scripts/seal.ts <root> <unit>...`: every open unit of the chain is sealed, oldest first. Sealing refuses a chain whose seals are already broken, an empty unit, and a unit holding symlinks, and writes nothing when it refuses. A fully sealed chain is left as it is.

Check with `scripts/check.ts <root> <unit>...`. It reports files added, changed or removed after sealing, a seal that no longer matches its own content or belongs to another unit, a seal that does not chain to the one before it, a sealed unit after an open one, symlinks in a sealed unit, and a seal that is unreadable or not structurally a seal.

Seals hash exact bytes. The using system must keep sealed files byte-exact wherever they are checked out, for example by disabling line-ending conversion for them. When to seal and what to seal is the using system's decision; this skill only seals and checks.
