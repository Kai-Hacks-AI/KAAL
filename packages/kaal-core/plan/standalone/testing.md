# Core Standalone: Testing

The planned outer tests live in `packages/kaal-core/test/plan/standalone.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C33` turns them GREEN.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T81: kaal-core's `package.json` declares no dependency of any kind on Graph's package | core/F76 | Requirements |
| core/T82: no file in kaal-core's `src/` imports Graph's package | core/F77, core/A37 | Architecture |
| core/T83: kaal-core and its runtime workspace dependencies, none of them Graph, packed and installed into a clean directory with no Graph package, import, and `evaluate(payload())` admits Core's payload Nodes with no rejection | core/F78, core/I24 | Intent |

## RED evidence

On `kaal/core`, all three tests are RED on the behaviour itself:
- T81, because `dependencies` names `kaal-graph`;
- T82, because `src/bootstrap.ts`, `cli.ts`, `engine.ts`, `frontmatter.ts`, `installation.ts`, `node.ts` and `register.ts` import it;
- T83, because Graph is among kaal-core's runtime dependencies, so a clean installation without it is impossible.

**Discriminating.** Each test names the exact dependency, file or installation that breaks it, and a DO that leaves any one Graph import or dependency entry in place stays RED. A throwaway reference is not possible before the base package exists (row 2), so satisfiability is shown by the scope: Core's use of Graph, listed in the Intent, is Form, identity and the structural functions, plus a lookup by name and id.
