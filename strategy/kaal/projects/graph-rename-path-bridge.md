---
name: Graph rename via path bridge
kind: Project
owner: KAAL
subject: KAAL
---

# Graph rename via path bridge

Rename the package `kaal-graph` to `@kaihacksai/kaal-graph` without breaking its two consumers, Core and Review, at any step. Exercise B of the strategy model: a Project modelled under the strategy before the Project capability exists. This file declares the intent; it does not run the work. Each Change is owned by its own capability thread.

Authority: [Decision: Graph rename path bridge](../decisions/2026-11-08-graph-rename-path-bridge.md).

## Why a bridge

Core and Review name Graph by its unscoped name. Neither can change that name in the same Change as Graph's rename, because every Change lands alone and green. A path reference (`file:../kaal-graph`) resolves whatever Graph's package is called, so it lets the rename sit between two single-owner steps.

## Sequence

The order is declared and necessary: each step is only green because the previous one landed. Collector for all steps: `kaal/graph`; each lands by squash.

1. **Bridge in.** Core and Review each reference Graph by path.
   - Core: `core/C55` (PLAN #1245, DO #1252). Check: Core's `kaal-graph` devDependency spec is `file:../kaal-graph`.
   - Review: Change #1246, cut from the Graph thread because Review has no owner thread. Check: Review's `kaal-graph` devDependency spec is `file:../kaal-graph`.
2. **Rename.** Graph delivers its installed package (`graph/C5`, #1241), which deliberately leaves the scoped name out; the rename Change follows it. Check: `packages/kaal-graph/package.json` has name `@kaihacksai/kaal-graph`, and Graph's T11 passes.
3. **Bridge out.** Core and Review flip to the scoped name.
   - Core: `core/C54` (PLAN #1242, then its DO). Check: Core's devDependency key and imports use `@kaihacksai/kaal-graph`.
   - Review: its own flip Change. Check: same, for Review.
4. **Release acceptance.** Graph `graph/C6`. Check: Graph's release cases pass on the installed package. This is the step that lets Graph take its place in [Roadmap item 1.4](../roadmap/Roadmap.md).

## Prerequisites and non-prerequisites

- Step 2 needs both parts of step 1. Step 3 needs step 2. Step 4 needs step 3.
- Step 2 needs `graph/C5` (#1241) landed, because the rename is cut on that layout.
- The two parts inside step 1, and the two inside step 3, are independent of each other.
- Not part of this Project: promotion of Graph to `main`, the Graph version, publication to npm. Those stay with [Roadmap item 1.4](../roadmap/Roadmap.md) and need their own Owner go.

## Relations

- Part of: [CORE](../outcomes/core.md)
- Serves: [Roadmap item 1.4](../roadmap/Roadmap.md) (Graph, rename path and version to be declared). The scoped name is declared here.
- Served by: [main](../mechanisms/main.md) at the collector level; release output feeds [npmjs](../mechanisms/npmjs.md).
- Authority: [Decision: Graph rename path bridge](../decisions/2026-11-08-graph-rename-path-bridge.md)
