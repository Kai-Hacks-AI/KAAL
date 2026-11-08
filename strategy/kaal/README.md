---
name: KAAL strategy
kind: Index
owner: KAAL
---

# KAAL strategy

KAAL's own product strategy and roadmap, persisted in Git. KAAL is the first consumer of the Product, Roadmap, Portfolio and Project capabilities, none of which exists yet; this folder is usable without them.

Authority: Change [Roadmap PLAN](../../.kaal/changes/roadmap/26/11/08/01/README.md) (#1258). This folder is KAAL-owned, authoritative product strategy. `.kaal/` is the installation environment and holds no strategy.

## Status of these files

They are plain Markdown with YAML frontmatter (`name`, `kind`, `owner`) and relations written as Markdown links. They are **not yet kaal-graph Nodes**: they declare no `type` or `edges` references, because the generic types do not exist. Converting them is the migration step of the PLAN and keeps names and locations. Identity is title plus location; a move or rename is a governed Change.

## Content rules

- **Declared** (here): outcomes, intended milestones, dependencies, sequence, mechanisms, milestone checks.
- **Judgment** (here, `decisions/`): dated, who decided, what, supporting references. Append-only; a later Decision supersedes, never rewrites.
- **Derived** (never here): CI, merged status, published versions, ledger, npm. A Milestone states the check that proves it, not the result.
- A historical Decision may cite a derived result as dated evidence; it is never a live status record.
- Containment is by location. Everything else is a link in a `Relations` section. Order is the ordered list in [Roadmap](roadmap/Roadmap.md).
- Content from outside KAAL (external or consumer observations) stays with its owner and is linked, never copied. A link transfers no authority: it becomes KAAL content only through a KAAL-owned Decision and a governed Change.

## Map

- [Product](Product.md)
- Consumer-defined types: [Direction](types/Direction.md), [Mechanism](types/Mechanism.md)
- Outcomes: [TAKE](outcomes/take.md), [EMBED](outcomes/embed.md) ([into others](outcomes/embed/into-others.md), [into KAAL](outcomes/embed/into-kaal.md)), [CORE](outcomes/core.md)
- Mechanisms: [npmjs](mechanisms/npmjs.md), [main](mechanisms/main.md)
- [Roadmap](roadmap/Roadmap.md)
- Projects: [Graph rename via path bridge](projects/graph-rename-path-bridge.md)
- Decisions: [2026-11-08 Roadmap model](decisions/2026-11-08-roadmap-model.md), [2026-11-08 Final roadmap](decisions/2026-11-08-final-roadmap.md), [2026-11-08 Graph rename path bridge](decisions/2026-11-08-graph-rename-path-bridge.md), [2026-11-08 Project and Product concurrent with Portfolio](decisions/2026-11-08-project-and-product-concurrent-with-portfolio.md)
