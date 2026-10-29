# Core Standalone: Testing

The planned outer tests live in `packages/kaal-core/test/plan/standalone.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C33` turns them GREEN.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T81: kaal-core's `package.json` declares no runtime dependency on Graph's package; a peer dependency is allowed only when marked optional, and a `devDependency` only for the build | core/F76 | Requirements |
| core/T82: no file in kaal-core's `src/` imports Graph's package | core/F77, core/A37 | Architecture |
| core/T83: kaal-core and its runtime workspace dependencies, none of them Graph, packed and installed into a clean directory with no Graph package, import, and `evaluate(payload())` admits Core's payload Nodes with no rejection | core/F78, core/I24 | Intent |
| core/T84: in that clean installation, no shipped file of kaal-core names Graph's package as a module, `dist/node/` holds exactly `form.mjs`, `form.d.ts`, `node.mjs`, `node.d.ts` and `provenance.json`, and the manifest lists exactly those four, each matching its SHA-256 | core/F79, core/A38 | Requirements |
| core/T85: after kaal-core's build, `dist/node/` holds exactly the four copies and the manifest, each delivered copy is byte-identical to the Graph source file its manifest names, and the manifest's Graph version equals Graph's workspace version and kaal-core's `devDependencies` entry | core/F79, core/A38 | Architecture |

core/F80's registration split is tested by `core/C26`'s own tests, revised when its DO runs. Without Graph, an `acyclic` declaration is reported as "cannot verify".

## RED evidence

On `kaal/core`, all five tests are RED on the behaviour itself:
- **T81**, because `dependencies` names `kaal-graph`.
- **T82**, because `src/bootstrap.ts`, `cli.ts`, `engine.ts`, `frontmatter.ts`, `installation.ts`, `node.ts` and `register.ts` import it.
- **T83**, because Graph is among kaal-core's runtime dependencies, so no clean installation without it exists.
- **T84 and T85**, because kaal-core delivers no Node support and no manifest. The tests fail on the missing manifest, not on a crash.

**Discriminating.** Each test names the exact dependency, file, installation, copy or digest that breaks it.
- A DO that leaves any one Graph import or runtime dependency in place stays RED.
- So does a DO that edits a copy, copies a file the manifest does not list, or lets the pinned version drift.

Satisfiability is shown by the scope: Core's use of Graph, listed in the Intent, is Form and identity plus a lookup by name and id. Graph confirmed that `form.mjs` and `node.mjs` import only `yaml`, `node:crypto` and each other (#622, comment 6504871864).
