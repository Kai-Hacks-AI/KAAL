---
name: using-seals
description: Seal directories so their files cannot change unnoticed, and check when seals are broken.
---

# Using Seals

A seal closes a unit: a directory whose files must not change once sealed. Sealing writes `seal.json` into the unit, recording the hash of every other file in it.

Units form a named chain. The using system names each chain (lowercase kebab-case) and decides which units belong to it and in which order; this skill never knows what a unit means. A unit is given as a relative path beneath the root with `/` separators; a chain refuses units that are listed twice (also when they differ only in case), contain one another, or pass through a symlink, before anything is read or written. Each seal also records the previous seal of its chain, so changing any sealed unit breaks its own seal and every seal after it. Each chain's head, kept in `seals.json` at the root, records its last sealed unit and that unit's seal, so removing trailing seals is noticed too.

Seal with `scripts/seal.ts <root> <chain> <unit>...`: every open unit of the chain is sealed, oldest first, and the chain's head moves to the newest seal. Sealing refuses a chain whose seals are already broken, an empty unit, and a unit holding symlinks, and writes nothing when it refuses. A fully sealed chain is left as it is.

Check with `scripts/check.ts <root> <chain> <unit>...`. It reports files added, changed or removed after sealing, a seal that no longer matches its own content or belongs to another unit, a seal that does not chain to the one before it, a sealed unit after an open one, symlinks in a sealed unit, a seal that is unreadable or not structurally a seal, a seal removed from a unit up to the head, a seal beyond the head, and a head that is missing, unknown or does not match its unit's seal.

Seals hash exact bytes. The using system must keep sealed files byte-exact wherever they are checked out, for example by disabling line-ending conversion for them. When to seal and what to seal is the using system's decision; this skill only seals and checks.
