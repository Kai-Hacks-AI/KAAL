# Publication Readiness: Testing

The planned outer tests live in `packages/kaal-foundation/test/plan/publication.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `foundation/C4` turns them GREEN, and they join `test:publisher`. These tests are the publisher's: they do not ship, and they check what does ship.

`foundation/C6` revised how they run npm: as npm's own CLI script, named by `npm_execpath`, under the Node that runs them, with no shell chosen by platform (#668, testing/F67). Run outside npm, they have no npm to run and fail rather than guess. What each test asserts is unchanged.

| Test | Checks | Loop |
| --- | --- | --- |
| foundation/T9: the package is not private, keeps its name and version, and declares no dependencies | foundation/F4, foundation/N2, foundation/N6 | Requirements |
| foundation/T10: packed and installed into a clean directory, the installed files are exactly those the installed `docs/operations.md` lists under "Shipped files", the subpath hashes `abc`, and the installed `npm test` ends in `verified` with exit 0 without starting the publisher suite. A module with wrong digests, one wrong only on the FIPS empty and 896-bit messages, and one that accepts a string each give `failed`. A module that cannot be imported is never `verified`. A failing delivered test gives `failed`; delivered files that declare no test, and missing delivered tests, give `cannot verify`. The result is read from the last line of stdout | foundation/F5, foundation/F8, foundation/A5, foundation/I4, foundation/I6 | Intent |
| foundation/T11: the README gives the install command, links each delivered document, does not call the package private or unpublished, and keeps the provisional ownership statement | foundation/F6 | Requirements |
| foundation/T12: the six documents ship, link only shipped files and no repository plan, the limitations say what Foundation does not do, and `docs/testing.md` names each delivered test file and the publisher's tests as not delivered | foundation/F7 | Requirements |
| foundation/T13: `npm test` is the runner, `test:consumer` the verifier, `test:publisher` runs `test/plan/`, and `files` ships the delivered layout and no plan or publisher test | foundation/F9, foundation/A6 | Architecture |
| foundation/T14: the shipped runner on fixture packages. In a source layout it runs every declared `test:<name>` suite once, never `test` itself, and a failing suite fails it without hiding later ones. Installed under `node_modules`, it runs only `test:consumer` and exits with its result. A damaged source, an ambiguous layout, an empty inventory, and a missing `test:consumer` or `test:publisher` each give `cannot verify` with exit 2 and run no suite | foundation/F9, foundation/A6 | Architecture |

**Why the tests discriminate.** I checked them with a throwaway reference, which was not committed. It had the six documents, one delivered test file with the known-answer vectors, padding boundaries, a view and the refusals, a verifier, the runner, the three scripts, and no `private`. With it, all six tests turned GREEN. Each weaker reference below was caught:

| Weaker reference | Caught by |
| --- | --- |
| still `private` | foundation/T9 |
| ships an extra file, such as `test/` | foundation/T10, T13 |
| a delivered document names a repository plan | foundation/T12 |
| README keeps "not published", or drops "provisional" | foundation/T11 |
| delivered tests without the FIPS known-answer vectors | foundation/T10 |
| delivered tests without the refusals | foundation/T10 |
| the verifier reports `verified` when the delivered tests are missing | foundation/T10 |
| the verifier counts a file that declares no test as one test | foundation/T10 |
| the runner needs only one source marker, so a damaged checkout skips the publisher's tests | foundation/T14 |

The two traps core/C28 recorded for kaal-core's verifier hold here too: the verifier must clear `NODE_TEST_CONTEXT`, and `node --test` reports a file that declares no test as one passing test.

## RED evidence

On `kaal/foundation`, all six tests are RED:
- **Behavioural:** T9 fails because the package is `private`, and T11 because the README says the package is not published and gives no install command.
- **Missing deliverables:** T10, T12 and T13 fail on their first assertion, because no runner, no `docs/` and no named suites exist. That is planning evidence.
- **Blocked:** T14 is blocked before behavioural assertion, because `test/run.mjs` does not exist.

The C1/C2 tests (`test/plan/sha256.test.mjs`) are unchanged.
