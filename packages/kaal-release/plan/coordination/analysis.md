# analyze Flow: analysis

> **Superseded in scope (CPO, 12 Nov 2026).** The delivery is now the minimal Show WIP v1 of [requirements.md](requirements.md). This document describes the earlier, larger analyze Flow design and is kept for the trace; where it differs, requirements.md and testing.md win.

The CTO handover asked seven questions. Evidence is from the repository and the open piece list of 12 Nov 2026. Nothing was run against GitHub.

## 1. Where it belongs

In the `kaal-release` Skill, as a script (Owner, 12 Nov). The kaal-release PLAN (#1350) constrains how:

- F5/I2: shipped files hold no KAAL identity. The Script carries no collector, control or branch-lineage name. KAAL's conventions are supplied by a **declaration the consumer owns**; KAAL's declaration lives in `engineering/release-management/` (Delivery, not shipped).
- N2: no runtime dependency on KAAL. The Script cannot import the existing KAAL code.
- I3, F3: the Skill never forces a decision, so "one promotion pair in flight" is declared policy and the pair order is declared.
- I9, F8: Release owns the decision whether progression is allowed. The Script lists recommendations, not verdicts.
- N3, T9 and others were written for a Skill-only 0.0.1: amended, exactly, in amendments.md.

## 2. What exists and is reused

- **track Work** (#1363, #1364), on the blocked `kaal/engineering-release-management` collector and not on `main`, already gathers open requests, review at the head, unresolved threads, behind-base, auto-merge, CI per check and collector distance. It has no priority, dependency, pair or sync purpose. Its ideas are ported, not imported.
- **C12 / #1435** reads a piece's type from its declared template. The Script takes `type` as a fact and never reads a title; titles are the envelope control's concern.
- **kaal-engineer-skill** already ships and checks `scripts/`.

## 3. Layers and relationships

The layers backwards from the outcome are Publishing, Promotion, Integration, Development. Two relationships are explicit, never inferred from titles or from the SYNC Reason prose:

- **Promotion pair.** A SYNC and a PROMOTION that prepare and deliver one collector's Change. It is a declared (collector, Change) entry in an ordered list. Its members are found by structure: a SYNC piece into the collector naming the Change, and a PROMOTION piece into the target from the collector. A member that does not exist is OPEN. Only the first incomplete pair is active; pieces already open for later pairs wait and never become competing active pairs.
- **Development sync.** A SYNC that unblocks one Change: it names that Change. Synchronization is the remedy only when a declared freshness check fails while the collector is behind the target. A conflict, a branch behind its base, another failing check and a missing review are REVISE or REVIEW instead. A development sync does not occupy the promotion lane.

Templates: PLAN, DO, ACT, SYNC, PROMOTION, HOTFIX, with DEFAULT as fallback. HOTFIX is the expedite class, an exceptional route outside the pair and its WIP limit. A DEFAULT or unknown type is reported and not classified.

## 4. Promotion SYNC vs development SYNC

A sync is a promotion sync when it matches a declared pair (the collector it goes into and its Change), a development sync when it names the Change of a piece blocked as above, and otherwise it has no purpose and is reported.

## 5. Incomplete promotion and next candidate

A pair is complete when a delivery names the collector's current version (F13). The history of the target is not used: promotions squash, so the collector's commits never reach it and a promoted collector that survives looks ahead forever. The supplier (F14, F16) supplies, per landed PROMOTION, the collector version it carried when it landed (recorded by the host on the piece), and the target version it became as provenance only. The next candidate is the next declared pair, and its first step is OPEN for the sync when its collector is behind, or for the promotion.

## 6. The live sequence

The real-world order is promotion #1440, then sync #1430, then promotion #1428. #1428 and #1440 are both open promotions, and #1430 is open. Declared as two ordered pairs, #1440 is the next action (review), #1430 waits for it, #1428 waits for #1430, and when #1440 lands #1430 becomes the next action. Case T13 shows it.

## 7. First increment and what stays outside

The slice: the Script, the supplier, the command, their Cases going GREEN with the connected path run on the real repository, and the amendments applied. Writes, DO and ACT proposals, the HOTFIX route, Publishing, and any wiring stay outside.

## Assumptions

- Review is current only if it names the head commit.
- A missing or ambiguous fact is reported, never guessed.
- The supplier reads `type` and `change` from the template and the named Change, not from prose.
