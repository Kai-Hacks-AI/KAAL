# Loops as a Graph: Architecture

- **testing/A31** [testing/F105–testing/F108, testing/N23, testing/N24]: `kaal-testing/loops` exports `check(declaration, graph, files)`, `answered(...)` and `plan(...)`. It is incubated in Testing's `lib/loops.mjs` beside `traces.mjs` and `defect.mjs`, under Testing's PLAN, DO and CHECK. It builds on `traces` (Case to target) and does not replace it. It reads a Graph through plain data (Nodes and Edges as `kaal-graph` gives them), so Testing needs no runtime dependency on Graph.
- **testing/A32** [testing/F109–testing/F114]: Running a Plan reuses Testing's `reporter` and the composed-Plan runner (testing/C50). The inversion of the RED role is in Testing's report, after the Run, so a Run's raw outcomes are never altered.
- **testing/A33** [testing/F105, testing/F107]: **The split.**

| Concern | Owner |
| --- | --- |
| The mechanism: declaration check, loop proof, `answered`, Plan composition, RED role; the Skill capability for composing suites (BASS ladder, computed by scripts, judged by Skill or Agent) | Testing |
| Node and Edge mechanics, `check()` for dangling references, traversal | Graph |
| The Loop Declaration itself: levels, names, order, kinds, locations. In KAAL the consumer is Engineering, and the declaration (with its suite memberships) sits in the package's `04-test/engineering-check/loops.md` | The consumer (Engineering in KAAL) |
| The items as Nodes (Intent, Requirements, Defects, Architecture) | Their owning package, with Graph's mechanics |
| The outward relationship types between items (`Serves` and the like) | Their item owners (Requirements, Architecture, ...) |
| Which items a Change touches; accepted-defect judgment (FAR's sibling) | Change |
| The CI lane that runs a Plan and what it gates | Engineering |

- **Where Cases sit.** In context, next to the item they prove; the folder is the loop. `04-test` holds no Cases: its three suites collect them. Defect Cases sit in `06-defects/D<n>.test.mjs` beside the Defect Node, and there are no more `.red.mjs` files once the DO lands.
- **Worked example.** [hosting-example.md](hosting-example.md) shows the layout for `kaal-hosting`.
- **Not decided here.** The Loop Declaration's file form (a Node with `levels` in its frontmatter is the proposal); the accepted-defect ratchet (testing/C54); the migration of each package's items to Nodes, which belongs to the item owners. Hosting D15–D17 keep their `.red.mjs` until the DO.
