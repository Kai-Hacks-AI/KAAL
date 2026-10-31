# Release Readiness: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run test:plan -w kaal-hosting`. `hosting/C11` turns hosting/T21–T24 GREEN and `hosting/C12` turns hosting/T25–T31 GREEN. Each moves its tests into Hosting's publisher suite (`test:publisher` from `hosting/C12` on), so they run in the Linux, Windows and macOS Hosting lanes. hosting/T25–T31 pack the candidate and run the consumer's own command in a fresh consumer, so each Hosting lane verifies the release candidate on its host.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T21: the package is `@kaihacksai/kaal-hosting` 0.0.1, public, with its repository directory, engines, license and runtime dependencies unchanged; the README names it and how to install it. Its exports and files are hosting/T41's, by `hosting/C15` | hosting/F15 | Requirements |
| hosting/T22: no module specifier, dependency entry or workspace selector in the repository names `kaal-hosting`, and each names `@kaihacksai/kaal-hosting` instead | hosting/F16 | Requirements |
| hosting/T53: in the source workspace, `npm test` runs every declared `test:<name>` suite once, in name order and never itself. It is `verified` only when each passed, `failed` naming a failing suite (the others still run), and `cannot verify` with none declared (`hosting/C22`) | hosting/F20 | Requirements |
| hosting/T54: the place is detected explicitly. A copy in a directory that no enclosing `workspaces` lists, or with no enclosing `workspaces`, is `cannot verify` naming the directory. It runs no suite and is never taken for an installation (`hosting/C22`) | hosting/F20 | Requirements |
| hosting/T48: a reference is found by its syntax: a stale import of a subpath that no longer resolves, in each module form, is found, as are the name alone, a dependency entry and a workspace selector; a host fact, a review rule, a longer name or the scoped name is not (`hosting/C19`) | hosting/F16 | Requirements |
| hosting/T23: the lockfile links `node_modules/@kaihacksai/kaal-hosting` to the workspace and has no entry for `kaal-hosting` | hosting/F16 | Requirements |
| hosting/T24: the packed tarball (whose contents are hosting/T41's, by `hosting/C15`) installs alone into a fresh consumer outside the repository as `node_modules/@kaihacksai/kaal-hosting`, and a consumer script runs `within`, `reconcile` and `execute` through `@kaihacksai/kaal-hosting` and reads `EXCLUSIONS` from `@kaihacksai/kaal-hosting/conformance` | hosting/I5, hosting/F17 | Intent |
| hosting/T25: the installed package carries `docs/` with Intent, Requirements, Architecture, Testing and Limitations, defining each identifier a shipped case cites exactly once and citing no Engineering path, `plan/` path or Change; the README points to `docs/` and to the verification command | hosting/I7, hosting/F18 | Requirements |
| hosting/T26: `npm explore @kaihacksai/kaal-hosting -- npm test` in a fresh consumer is `verified`, exit 0: every case the manifest declares ran and passed or is not applicable here, each of the four loops ran a passing case, and the summary names the package, version, real location, platform, Node version and a digest that equals the one recomputed from the installed copy | hosting/I6, hosting/F19, hosting/F20, hosting/F21, hosting/F22, hosting/F25 | Intent |
| hosting/T27: an installed file changed, removed or added makes the run `cannot verify`, exit 2, naming the file | hosting/F21, hosting/F22 | Requirements |
| hosting/T28: every identifier `docs/` defines is covered, allocated or unverified in the summary, and each allocated or unverified one is printed as not verified by this run | hosting/F23 | Requirements |
| hosting/T29: a verified run leaves the consumer, the installed copy included, byte for byte as it was | hosting/F24 | Requirements |
| hosting/T30: a manifest that declares no case, declares a case that does not exist, or leaves an identifier undeclared, and a delivered case skipped with its hash refreshed, each make the run `cannot verify`, exit 2 | hosting/F21, hosting/F23, hosting/F25 | Requirements |
| hosting/T31: each result is exact. An absent or malformed manifest and a todo case are `cannot verify` with a cause; a failing case is `failed`, exit 1, with that case reported as `fail`; and a case the manifest declares not applicable here is reported `not applicable` while the run is still `verified` | hosting/F21, hosting/F22, hosting/F25 | Requirements |

hosting/A7–A10 and hosting/N4 are placements, validated by review. The Test Cases of the verification itself, which do not ship (Limits), are the publisher's: hosting/T27 and T29–T31 are some of them. hosting/F26, the shared observable result contract, is verified by Engineering's check against Testing's conformance cases (hosting/A11, #625), not by these tests: they check Hosting's verifier from the inside and do not stand in for it. The Limits are stated, not tested.

## RED evidence

At `hosting/C10`, hosting/T21–T24 are RED by behavioural assertion. The package's `name` is `kaal-hosting` (T21). The repository holds its references under the old name, in Graph, Core, Testing, the Engineer skill, Engineering and the root `package.json` (T22). The lockfile links `node_modules/kaal-hosting` (T23). The packed tarball has the intended files, but installs at `node_modules/kaal-hosting`, so the consumer finds no `@kaihacksai/kaal-hosting` (T24). hosting/T25–T31 are RED by behavioural assertion too, first because the candidate does not install as `@kaihacksai/kaal-hosting`. They are not in Hosting's `npm test`, so KAAL's lanes stay green.

## Checked against throwaway references

Neither reference was committed.
- **After the rename alone** (the state `hosting/C11` leaves), hosting/T21–T24 are GREEN, and hosting/T25–T31 stay RED by behavioural assertion: `docs/intent.md` is not shipped (T25), and the installed package ships no `test/verify.mjs` (T26–T31).
- **With a minimal product on top**, all of hosting/T21–T31 are GREEN, on Node 24. That reference had five `docs/` files, one case in each loop, a verification entry of about 100 lines from Node's built-ins, and a publisher script that writes the manifest from the packed file list, the cases' names and `docs/testing.md`.
- **Weaker references.** Each weaker variant of that reference was caught:

| Weaker reference | Caught by |
| --- | --- |
| ignores a mismatch between the installed files and the manifest | hosting/T27 |
| does not print allocated or unverified identifiers as not verified | hosting/T28 |
| calls a manifest with no case verified | hosting/T30 |
| skips the coverage check | hosting/T30 |
| counts a skipped case as passed | hosting/T30 |
| writes a file into the consumer during the run | hosting/T29 (and T26, T28, T30) |
| a `docs/` file cites a `plan/` path | hosting/T25 |
| `docs/limitations.md` is missing | hosting/T25 |
| the summary misreports the Node version | hosting/T26 |
| a digest over the hashes alone, without paths | hosting/T26 |
| counts a todo case as passed | hosting/T31 |
| ignores the declared applicability | hosting/T31 |
| reports a failing case as cannot verify | hosting/T31 |
| crashes, instead of cannot verify, on an absent manifest | hosting/T31 |

The checks also showed that a command started from inside a `node:test` run inherits `NODE_TEST_CONTEXT`, which makes a nested `run()` skip every file. The planned tests clear it, so the consumer's command runs as it would for a consumer.

## hosting/C19: a reference is found by its syntax

`hosting/C19` is a PLAN correction to hosting/T22's matcher, a new hosting/T48 that tests the matcher, and one value in hosting/T42. It was found while checking #657 (`hosting/C11`) against `kaal/hosting` after `hosting/C14` and `hosting/C17` landed. Testing names this kind of defect BRITTLE (testing/C41, #681).

**False RED.** T22 counted any quoted `kaal-hosting/<anything>` as a module specifier. `hosting/C16` named host facts and review rules in Hosting's own namespace: `kaal-hosting/special-entries` (hosting/F37) and `kaal-hosting/host-applicability` (hosting/F40). These identifiers resolve to no module. With #657 applied on today's `kaal/hosting`, T22 failed on 18 of them in `src/boundary-core.ts`, `src/fixtures.ts` and `test/plan/portability.test.mjs`. One of them is the unknown fact `kaal-hosting/windows` that T44 uses. It would fail the same way on every capability that declares a host fact (testing/C39, guard's T114). T42 also listed the old, unscoped name as a literal, to show it is not the boundary.

**False GREEN avoided** (the Owner's review on #685, comment 6542849310). A first version of this correction counted only the subpaths the package exports. That let the candidate define what counts as a reference to itself: a stale `import "kaal-hosting/legacy"` would pass once `./legacy` was no longer exported.

**Correction.**
- A reference is found by its syntax. It is one of three things:
  - the name itself as a quoted string;
  - the name and any subpath inside module syntax: `import`, `export … from`, `import()`, `require()`, `require.resolve()`, `import.meta.resolve()` or `declare module`, whether or not that subpath resolves;
  - a workspace selector.
- A string outside that syntax that only begins with the name is not a reference.
- hosting/T48 checks the matcher directly, with sixteen stale forms that must each be found and nine identifiers that must not.
- T42 keeps the old name as a value it tests, but spells it in parts, as `release.test.mjs` does.
- The assertions of hosting/T21–T24 do not change.

**Evidence (Node 24, Linux).** These were checked on a throwaway merge of #657 into this correction, which was not committed.

| Check | Result |
| --- | --- |
| T22 before the correction | RED, 18 identifiers and T42's literal |
| T22, T48, and T21, T23, T24 after the correction | GREEN |
| a stale `import "kaal-hosting/conformance"`, `import "kaal-hosting"`, `import("kaal-hosting/fixtures")`, unexported `import "kaal-hosting/legacy"` or `-w kaal-hosting` in the repository | T22 RED, each |

| Weaker matcher | Caught by T48 at |
| --- | --- |
| any quoted subpath, the original | a dynamic import of a template, and the host facts |
| exported subpaths only, this correction's first version | a side-effect import of `/legacy` |
| no module syntax | a side-effect import of `/legacy` |
| no quoted name | the name alone |
| no `require` | a require |

On `kaal/hosting` before the rename, the old matcher found 115 references and the corrected one finds 97. The 18 it no longer finds are exactly the identifiers above, and every other reference is still found. #657's file set does not change.

## hosting/C22: one test entry, two places

`hosting/C22` is a PLAN correction to hosting/F20 and hosting/A9, with two new planned tests. hosting/A9 had the root `test:hosting` lane and `engineering/lanes/hosting.mjs` switch to `test:publisher`. That conflicts with engineering/C6 (#655, merged), which records the Owner's convention on #625 (comment 6504401799): Engineering's lanes and Testing's coverage run each package's own `npm test` in its directory, and npm ships the same `scripts.test` it reads in source. Engineering raised the conflict when `hosting/C12` was being prepared. So Hosting's `npm test` is now comprehensive in the source workspace and consumer-only once installed, as foundation/F9 and core/F75 have it. The place is detected explicitly. Nothing in Engineering or Testing changes. hosting/T26–T31 are unchanged.

**RED evidence.** At `hosting/C22`, hosting/T53 and T54 are RED, blocked before behavioural assertion: the package ships no `test/verify.mjs` yet. `hosting/C12` delivers it.

**Checked against a throwaway reference.** A reference source mode for `test/verify.mjs`, written for this PLAN and not committed, turns both GREEN on Node 24 (Linux). Each weaker variant of it is caught:

| Weaker reference | Caught by |
| --- | --- |
| reports `verified` although a suite failed | hosting/T53 |
| stops at the first failing suite | hosting/T53 |
| runs the suites in declaration order, not name order | hosting/T53 |
| is `verified` with no suite declared | hosting/T53 |
| takes any directory that is not an installation for the source workspace | hosting/T54 |

## hosting/C23: shipped cases live in test/embed/

`hosting/C23` is a PLAN correction to hosting/F17, hosting/F19, hosting/A9 and hosting/A15, with three planned tests narrowed to the new path. On #702 (comment 6543551316) the Owner ruled that `test/acceptance/` is ambiguous. A capability's own shipped cases, run against the installed package by its own `npm test`, live in `test/embed/`. Engineering's lane scenarios, which `install()` the packed tarballs, live in `test/engineer/`. There is no `test/external/` convention. Testing plans this as `testing/C43` (#702).

The C12 DO (#700) met the conflict: KAAL's Acceptance lane took Hosting's shipped `test/acceptance/` files for its own scenarios and failed them with "installed no packed package".

- **What changes.** hosting/F17 and hosting/F19 ship `test/embed/` in place of `test/acceptance/` and `test/unit/`. hosting/A9 places every shipped case there: one file per outer loop, the Code loop's files beside them, and the harness. hosting/A15 replaces the two planned `files` rows with one, `test/embed`, still planned for `hosting/C12`.
- **Tests narrowed.** These change their path only, and what they assert stays the same:
  - hosting/T31's `firstCase` picks the first outer case under `test/embed/`.
  - hosting/T30 plants its skip in the first outer case file under `test/embed/`.
  - hosting/T30's nonexistent declared case is named under `test/embed/`.
- **Unchanged.** hosting/T25–T29, hosting/T41 (it reads A15), and every other planned test.

**RED evidence.** At `hosting/C23`, hosting/T25–T31 stay RED as before, blocked before behavioural assertion: the package ships no `test/verify.mjs`. `hosting/C12` turns them GREEN with its cases in `test/embed/`.

