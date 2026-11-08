---
name: KAAL Roadmap
kind: Roadmap
subject: KAAL
owner: KAAL
---

# KAAL Roadmap

Subject: [KAAL](../Product.md). Order is meaningful and is stated once, here. Authority: [Final roadmap](../decisions/2026-11-08-final-roadmap.md).

Direction runs outside to inside (TAKE, EMBED, CORE); this Sequence runs the other way, inside to outside. Neither overwrites the other.

Each item gives the Outcome it serves and the check that proves it. A check is a question answered from the authoritative source on demand. Results are not stored here.

## Sequence

1. **Engineer KAAL (npmjs): release order.** Serves [CORE](../outcomes/core.md) and, through [npmjs](../mechanisms/npmjs.md), [EMBED](../outcomes/embed.md). Order:
   1. Foundation 0.0.2, the first release in the final layout. Check: npm dist-tag `latest` of `@kaihacksai/kaal-foundation` is at least 0.0.2.
   2. Packaging 0.0.1. Check: the package is published at 0.0.1 or later.
   3. Core 0.0.1. Check: the package is published at 0.0.1 or later.
   4. Graph (rename path and version to be declared). Check: the renamed package is published.
   5. Testing 0.0.1. Check: published at 0.0.1 or later.
   6. Guard 0.0.5. Check: `@kaihacksai/kaal-guard` latest is at least 0.0.5.
   7. Controls 0.0.1, the semantics package only. Check: published at 0.0.1 or later.
2. **Engineer KAAL (main).** Consequence of item 1; refers back to 1.x and adds main-only items (Guard hotfix, Engineering Change). Serves [CORE](../outcomes/core.md) through [main](../mechanisms/main.md). Check: each named Change is merged on `main`.
3. **Embed KAAL (kaal).** [Into KAAL](../outcomes/embed/into-kaal.md): install published packages into `.kaal`. No PLAN yet. Check: a PLAN Change exists, then `.kaal` resolves the published versions.
4. **Embed KAAL (others).** [Into others](../outcomes/embed/into-others.md). Check: to be declared with its first consumer.
5. **External KAAL.** [TAKE](../outcomes/take.md). Check: to be declared with its first trial subject.

## Dependencies

- 2 depends on 1. 3 depends on 1 (published packages) and 2. 4 and 5 depend on 3.
- Within 1, the listed order is the declared order; a reorder is a [Decision](../decisions/), not a silent edit.
