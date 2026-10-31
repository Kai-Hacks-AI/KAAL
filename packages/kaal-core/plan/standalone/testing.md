# Core Standalone: Testing

The planned outer tests live in `packages/kaal-core/test/plan/standalone.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C33` turns them GREEN.

`core/C37` revised how they run a command: through kaal-hosting's `execute`, with no shell chosen by platform (`core/F88`). What each test asserts is unchanged.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T81: kaal-core's `package.json` declares no runtime dependency on Graph's package; a peer dependency is allowed only when marked optional, and a `devDependency` only for the build | core/F76 | Requirements |
| core/T82: no file in kaal-core's `src/` imports Graph's package | core/F77, core/A37 | Architecture |
| core/T83: kaal-core and its runtime workspace dependencies, none of them Graph, packed and installed into a clean directory with no Graph package, import, and `evaluate(payload())` admits Core's payload Nodes with no rejection | core/F78, core/I24 | Intent |
| core/T84: in that clean installation, no shipped file of kaal-core names Graph's package as a module, `dist/node/` holds exactly `form.mjs`, `form.d.ts`, `node.mjs`, `node.d.ts` and `provenance.json`, and the manifest lists exactly those four, each matching its SHA-256 | core/F79, core/A38 | Requirements |
| core/T85 (revised by `core/C38`): after kaal-core's build, `dist/node/` holds exactly the four copies and the manifest. Each delivered copy comes from the Graph source file of the same name in `skills/kaal-graph/scripts/` and is byte-identical to it. The one exception is `node.d.ts`: while Graph's source holds no `node.d.ts`, it comes from Graph's `edges.d.ts`. The manifest's Graph version equals Graph's workspace version and kaal-core's `devDependencies` entry | core/F79, core/A38 | Architecture |
| core/T94 (added by `core/C38`): every name kaal-core's `src/` imports from `#node/form` or `#node/node` is exported by the delivered `form.mjs` or `node.mjs` when they run. Those subpath imports are not among the package's `exports` | core/F79, core/A38 | Architecture |
| core/T86: in the clean installation with no Graph, `assemble` admits registrations whose traces form a cycle with no finding for it, and reports `cycles`, `reach` and `incoming` as unavailable (`null`), not empty | core/F80, core/A39, core/N20 | Intent |

core/F80 is also tested by the registration PLAN's tests:
- core/T54, T57 and T67 are revised by this Change: a cycle is observed when Graph is present, and is never a finding.
- core/T86 checks the Graph-absent path.

## RED evidence

On `kaal/core`, all six tests are RED:
- **T81**, because `dependencies` names `kaal-graph`.
- **T82**, because `src/bootstrap.ts`, `cli.ts`, `engine.ts`, `frontmatter.ts`, `installation.ts`, `node.ts` and `register.ts` import it.
- **T83**, because Graph is among kaal-core's runtime dependencies, so no clean installation without it exists.
- **T84 and T85**, because kaal-core delivers no Node support and no manifest. The tests fail on the missing manifest, not on a crash.
- **T86 is a blocked RED.** No clean installation without Graph exists, and `kaal-core/registration` is `core/C26`'s. It becomes discriminating once `core/C33` and `core/C26` make it run. It counts as evidence only then.

- **T94 is a blocked RED.** kaal-core declares no `#node/*` imports until `core/C33`. It fails on that first assertion.

**Discriminating.** Each test names the exact dependency, file, installation, copy or digest that breaks it.
- A DO that leaves any one Graph import or runtime dependency in place stays RED.
- So does a DO that edits a copy, copies a file the manifest does not list, or lets the pinned version drift.
- (Added by `core/C38`.) So does a DO that writes its own `node.d.ts` instead of Graph's, takes `edges.d.ts` while Graph's source has `node.d.ts`, imports a declaration-only name such as `Graph` from `#node/node`, or adds `#node/*` to `exports`.

Satisfiability is shown by the scope: Core's use of Graph, listed in the Intent, is Form and identity plus a lookup by name and id. Graph confirmed that `form.mjs` and `node.mjs` import only `yaml`, `node:crypto` and each other (#622, comment 6504871864).
