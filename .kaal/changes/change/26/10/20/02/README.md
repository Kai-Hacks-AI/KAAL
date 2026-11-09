# Change Record placement and governance strictness

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner ruled that artifact placement is context-owned, for every Skill: neither `.kaal/changes/` nor a root `changes/` is a universal rule, and the embedding repository decides how strictly it applies Change governance. Change Records and Change's numbering rule assumed one fixed root and a mandatory claim. This Change makes both the consuming context's choice, and keeps `.kaal/changes/` as KAAL's own convention.

- Owner alignment and approval: Slack #kaal, thread "Change · CHAOS" (ts 1792349860.046179), "Owner decision — CHAOS and contextual Change placement approved": two separate, bounded kaal-change Changes, no Engineering Change.
- Prior convention and numbering: #242 and #243 on `kaal/change`.

## How

- `capability/Change.md`: Change defines the available ways to manage Changes; the embedding repository chooses which and how strictly; where KAAL is embedded, its `.kaal/` governs Changes.
- `capability/Change-Record.md`: the record root is the consuming context's; `.kaal/changes/` is KAAL's local convention (`kaal-change` names the capability, `changes/` holds instances); a record documents the transition and links, never duplicates, the resulting state's documentation; whether a substantive Change must claim a record is the repository's choice, and this repository requires it.
- `lib/record.mjs`: every function takes `{ root }`, default `ROOT = ".kaal/changes"`; `checkClaim` also takes `required`, default `true`. With neither given it behaves exactly as before.
- `ownership.kaal.json`: the Capability Node's new id.

## What did not change

Engineering's Branching gate on `main` calls `checkClaim({ kind, changed, collector })` and keeps this repository's defaults, so it needs no Change. Nothing moves.

## Evidence

`npm test -w kaal-change`: the root and the requirement are covered in `test/record.test.mjs` and `test/numbering.test.mjs`.

## Owner review

The Owner reviewed this Change on #280 (review 5671006966). The Change Record Definition now says that a record is not the Change. Change owns its Change objects, which have a canonical identity and relationships independent of record placement. The record is an address for evidence and transition history that links to the authoritative objects. Git and GitHub stay optional controls. The record number is 02, because CHAOS (#281) takes 01.
