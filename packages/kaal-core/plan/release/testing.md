# kaal-core 0.0.1 Release and Consumer Readiness: Testing

The planned outer tests live in `packages/kaal-core/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

`core/C29` turns them GREEN. These tests are the publisher's: they do not ship, and they check what does ship.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T74: the package ships Intent, Requirements, Architecture, limitations, operations and testing documents. The README links each, no delivered document links a file that does not ship or a repository plan, and the limitations name what 0.0.1 leaves out | core/F69, core/N19, core/A33 | Requirements |
| core/T75: `npm test` is the consumer entry and builds nothing, and the publisher's tests have their own script. The delivered loops ship and the planned tests do not. `docs/testing.md` names every delivered test file, and names the planned tests as not delivered | core/F70, core/F71, core/A33, core/A34 | Architecture |
| core/T76: packed with its runtime dependencies and installed into a clean directory, the package's shipped files are documented, and `npm test` ends in `verified` with exit 0. A corrupted `dist/index.js` never gives `verified`. With no delivered tests, the result is `cannot verify` with exit 2 | core/F72, core/F70, core/A35, core/I23 | Intent |
| core/T77: 0.0.1 contains registration: `kaal-core/registration` ships and exports `assemble` | core/F68 | Requirements |
| core/T78: every workspace package kaal-core depends on at runtime can be published | core/F73 | Requirements |

**Why the tests discriminate.** I checked them with a throwaway reference, which was not committed. It had the six documents, one delivered test for each loop, a `test/verify.mjs`, the two scripts, and Foundation made public. With it, T74, T75, T76 and T78 turned GREEN. T77 stays RED until `core/C26`. Each weaker reference below was caught:

| Weaker reference | Caught by |
| --- | --- |
| reports `verified` when no delivered test ran | core/T76 |
| reports `verified` when a delivered test fails | core/T76 |
| a delivered document links a repository plan | core/T74 |
| the planned tests ship | core/T75 |
| `npm test` builds before it verifies | core/T75, T76 |
| a runtime dependency is private | core/T78 |

The reference showed one trap for `core/C29`. `node --test` sets `NODE_TEST_CONTEXT` for the processes it starts, so `test/verify.mjs` must clear it when it starts the delivered loops. Otherwise their results go to the outer runner, and every loop counts zero tests.

The following are validated by review:
- The documents are coherent for a reader who knows nothing of KAAL. A test checks only that they exist, link what ships, and name what is left out.
- `docs/testing.md` states coverage honestly, against Testing's definitions.
- The release dependency map in [Architecture](architecture.md), and its conflicts.

## RED evidence

On `kaal/core`, all five tests are RED. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/release.test.mjs`, outside Core's `npm test` until `core/C29`.
- **Missing deliverables:** T74, T75 and T76 fail on their first assertion, because no `docs/` and no consumer `npm test` exist. That is planning evidence.
- **Blocked:** T77 is blocked before behavioural assertion, because kaal-core exports no `./registration` until `core/C26`.
- **Behavioural:** T78 fails because `@kaihacksai/kaal-foundation` is `private`. That is conflict 1 in [Architecture](architecture.md#conflicts-for-owner-alignment).
