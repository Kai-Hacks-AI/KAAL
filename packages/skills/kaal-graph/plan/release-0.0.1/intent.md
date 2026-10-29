# Graph 0.0.1: Intent

This is `graph/C4`, a PLAN Change. It ships no code. It fixes the consumer contract of Graph's first release, `@kaihacksai/kaal-graph@0.0.1`. That covers your sequencing question on #621 and your namespace alignment on #622 (comment 6503611371). `graph/C5` and `graph/C6` turn its planned tests GREEN, one Change at a time.

Graph's scope stays as it is: a Node's Form and identity, the Edges embedded in Nodes, structural navigation (`reach`, `reverse`, `cycles`), and the `kaal-graph` CLI. It never gives a consumer's relationships their meaning. This Change adds no semantics.

- **graph/I4. Consumer self-sufficiency.** A consumer without a KAAL source checkout can do everything from the installed package alone:
  - install it, understand it and use it;
  - verify it, with an honest result: verified, failed or unknown (printed as "cannot verify"). Zero tests is never verified.

  The bar is `@kaihacksai/kaal-guard`, which the package meets or exceeds.
- **graph/I5. One namespace.** Graph publishes as `@kaihacksai/kaal-graph`, consistent with Guard, Core, Hosting and Foundation. Graph renames only itself, and only after Hosting's rename.
- **graph/I6. Nothing that exists changes meaning.** The algorithms, exports, Node ids and CLI behaviour stay as they are. The release adds documentation, delivered tests, packaging and the name.
