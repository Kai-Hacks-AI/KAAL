# kaal-core 0.0.1 Release and Consumer Readiness: Testing

The planned outer tests live in `packages/kaal-core/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK.

`core/C29` turns them GREEN. These tests are the publisher's: they do not ship, and they check what does ship.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T74: the package ships Intent, Requirements, Architecture, limitations, operations and testing documents. The README links each, no delivered document links a file that does not ship or a repository plan, and the limitations name what 0.0.1 leaves out | core/F69, core/N19, core/A33 | Requirements |
| core/T75: the package declares `test:consumer` as `node test/verify.mjs`, `test:publisher` for its publisher tests, and `npm test` as `node test/run.mjs`. The runner, the delivered loops and the verifier ship, and the planned tests do not. `docs/testing.md` names every delivered test file, and names the planned tests as not delivered | core/F70, core/F71, core/F75, core/A33, core/A34 | Architecture |
| core/T76 (revised by `core/C36`): packed with its runtime dependencies and installed into a clean directory, the installed files are exactly those the installed `test/verify.json` lists, plus the manifest. `npm test` ends in `verified` with exit 0 without starting the publisher suite. A corrupted `dist/index.js` never gives `verified`. The result is read from the last line of stdout, so npm warnings on stderr do not count. With `dist/index.js` restored, changing or emptying any one loop's delivered test files gives `cannot verify` with exit 2, because they no longer match the manifest, and so does removing all delivered tests | core/F72, core/F70, core/F85, core/A35, core/I23 | Intent |
| core/T77: 0.0.1 contains registration: `kaal-core/registration` ships and exports `assemble` | core/F68 | Requirements |
| core/T78: every workspace package kaal-core depends on at runtime can be published | core/F73 | Requirements |
| core/T80: the shipped runner, `test/run.mjs`, on fixture packages. In a source layout, it runs every declared `test:<name>` suite once, never `test` itself, and a failing suite fails it without hiding later suites. Installed under `node_modules`, it runs only `test:consumer` and exits with its result. A damaged source (a marker missing), an ambiguous layout (an installed package with a source marker), an empty inventory, and a missing `test:consumer` or `test:publisher` each give `cannot verify` with exit 2 and run no suite | core/F75, core/A34 | Architecture |
| core/T79: kaal-core is `@kaihacksai/kaal-core`, and every workspace package it depends on at runtime is named under `@kaihacksai/kaal-` | core/F74 | Requirements |
| core/T91 (added by `core/C36`): the shipped `test/verify.mjs`, on fixture packages whose manifest matches their files. It gives `verified` with exit 0 only when exactly the declared cases ran and passed. Each of the following gives `cannot verify` with exit 2: a declared case that never ran, was skipped or was marked todo; an undeclared case that ran; a file changed after the manifest was made, a file added to an installation, or one the manifest lists that is missing; no manifest; an empty inventory. In a source workspace, files that do not ship, such as `src/` and `test/plan/`, are not added files, but a changed shipped file is still `cannot verify`. A declared case that fails with the files intact gives `failed` with exit 1. A nested `node_modules` is ignored. Each run emits exactly one execution record. The record names the candidate by name, version and manifest SHA-256, and gives each required case's outcome: passed, failed, skipped or not run, so a skipped case is never recorded as passed. An inconsistent candidate runs no case. Each result line names the candidate and the declared and executed counts, and names its cause. A case that writes to its working directory leaves the fixture as it was | core/F70, core/F85, core/F87, core/N23, core/A43 | Architecture |
| core/T92 (added by `core/C36`): kaal-core declares Node.js 24 or later. `docs/operations.md` names Linux, macOS and Windows under "Supported platforms". Once built, `test/verify.json` lists exactly the other files `npm pack` ships, each at its SHA-256, and declares at least one case, each in a shipped file and naming the `core/…` Intents, Requirements, Architecture elements or Defects it tests | core/F85, core/F86, core/A43 | Requirements |

**Why the tests discriminate.** I checked them with a throwaway reference, which was not committed. It had the six documents, one delivered test for each loop, a `test/verify.mjs`, the runner `test/run.mjs`, the three scripts, and Foundation made public. With it, T74, T75, T76, T78 and T80 turned GREEN. T79 was checked by renaming the reference's packages under `@kaihacksai/`; the reference did not commit those renames, which belong to their owners. T77 stays RED until `core/C26`. Each weaker reference below was caught. The last five came from Codex's review, and T76 was revised to catch each:

| Weaker reference | Caught by |
| --- | --- |
| reports `verified` when no delivered test ran | core/T76 |
| reports `verified` when a delivered test fails | core/T76 |
| a delivered document links a repository plan | core/T74 |
| the planned tests ship | core/T75 |
| `npm test` builds before it verifies | core/T75, T76 |
| a runtime dependency is private | core/T78 |
| a runtime dependency keeps an unscoped name | core/T79 |
| the runner also runs `test:publisher` in an installation | core/T76, T80 |
| the runner runs `test`, so it invokes itself | core/T80 |
| the runner runs only the consumer suite in the source workspace | core/T80 |
| the runner ignores a failing suite | core/T80 |
| installed, the runner flattens the consumer's `cannot verify` to `failed` | core/T80 |
| the runner takes a missing `test/plan/` to mean installed, so a damaged checkout skips the publisher's tests | core/T80 |
| the runner ignores a source marker in an installed package | core/T80 |
| the runner passes with no declared suite | core/T80 |
| the runner passes when `test:publisher` is missing in source | core/T80 |
| the runner passes when `test:consumer` is missing | core/T80 |
| ships files that "Shipped files" does not list | core/T76 |
| reports `cannot verify` when kaal-core fails to import, but `verified` when no test ran | core/T76 |
| reports `verified` when one loop runs no test while the others pass (only the total is counted) | core/T76 |
| counts a test file that declares no test as one test (the `# tests` summary of `node --test`) | core/T76 |
| ignores the exit status of the delivered tests and only counts them, so a failing test is never `failed` | core/T76 |
| decides on counts: a declared case that never runs still gives `verified` (added by `core/C36`) | core/T91 |
| ignores an undeclared case that ran | core/T91 |
| treats a skipped or todo case as passing | core/T91 |
| runs the cases without checking the files against the manifest | core/T91, T76 |
| counts a nested `node_modules` as added files | core/T91 |
| leaves `NODE_TEST_CONTEXT` set, so no case is seen to run | core/T91 |
| reports a declared failing case as `cannot verify` | core/T91 |
| runs the cases in the package directory, so a case's output changes the installation | core/T91 |
| treats a source workspace's unshipped files as added, so a healthy checkout never verifies (Codex, #673) | core/T91 |
| ignores added files everywhere, so an installation with an extra file still verifies | core/T91 |
| emits no execution record, so a run leaves no evidence (Owner, #673) | core/T91 |
| records a skipped case as passed | core/T91 |
| identifies the candidate by something other than its manifest's SHA-256 | core/T91 |
| leaves the candidate out of the result line | core/T91 |

The reference showed one trap for `core/C29`. `node --test` sets `NODE_TEST_CONTEXT` for the processes it starts, so `test/verify.mjs` must clear it when it starts the delivered loops. Otherwise their results go to the outer runner, and every loop counts zero tests. A second trap: `node --test` reports a file that declares no test as one passing test, so its `# tests` summary cannot show an empty loop. The verifier must count only the tests the files declare.

The following are validated by review:
- The documents are coherent for a reader who knows nothing of KAAL. A test checks only that they exist, link what ships, and name what is left out.
- `docs/testing.md` states coverage honestly, against Testing's definitions.
- The release dependency map in [Architecture](architecture.md), and its release blockers.

**`core/C36`'s reference.** I checked T91 against a throwaway `test/verify.mjs` that implements `core/A43`, which was not committed. T91 turned GREEN with it, and each of the fourteen `core/C36` rows above, applied to that reference, turned it RED. T92 is checked by review of its assertions. It has no reference, because the build that writes the manifest is `core/C29`'s.

## RED evidence

On `kaal/core`, all nine tests are RED. They run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/release.test.mjs`, outside Core's `npm test` until `core/C29`.
- **Missing deliverables:** T74, T75, T76, T80 and T92 fail on their first assertion, because no `docs/`, no consumer suite, no runner and no manifest exist. That is planning evidence.
- **Blocked:** T91 is blocked before behavioural assertion, because no `test/verify.mjs` ships until `core/C29`.
- **Blocked:** T77 is blocked before behavioural assertion, because kaal-core exports no `./registration` until `core/C26`.
- **Behavioural:** T78 fails because `@kaihacksai/kaal-foundation` is `private`. That is release blocker 1 in [Architecture](architecture.md#release-blockers).
- **Behavioural:** T79 fails because kaal-core, `kaal-graph` and `kaal-hosting` are unscoped. That is release blocker 2.
