# Release Readiness: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run test:plan -w kaal-hosting`. `hosting/C11` turns hosting/T21–T24 GREEN and `hosting/C12` turns hosting/T25–T31 GREEN. Each moves its tests into Hosting's publisher suite (`test:publisher` from `hosting/C12` on), so they run in the Linux, Windows and macOS Hosting lanes. hosting/T25–T31 pack the candidate and run the consumer's own command in a fresh consumer, so each Hosting lane verifies the release candidate on its host.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T21: the package is `@kaihacksai/kaal-hosting` 0.0.1, public, with its repository directory, engines, license and runtime dependencies unchanged; the README names it and how to install it. Its exports and files are hosting/T41's, by `hosting/C15` | hosting/F15 | Requirements |
| hosting/T22: no module specifier, dependency entry or workspace selector in the repository names `kaal-hosting`, and each names `@kaihacksai/kaal-hosting` instead | hosting/F16 | Requirements |
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

## hosting/C19: a specifier is what resolves

`hosting/C19` is a PLAN correction to hosting/T22's matcher and to one value in hosting/T42. It was found while checking #657 (`hosting/C11`) against `kaal/hosting` after `hosting/C14` and `hosting/C17` landed. Testing names this kind of defect BRITTLE (testing/C41, #681).

**False RED.** T22 counted any quoted `kaal-hosting/<anything>` as a module specifier. `hosting/C16` named host facts and review rules in Hosting's own namespace: `kaal-hosting/special-entries` (hosting/F37) and `kaal-hosting/host-applicability` (hosting/F40). These identifiers resolve to no module. With #657 applied on today's `kaal/hosting`, T22 failed on 18 of them in `src/boundary-core.ts`, `src/fixtures.ts` and `test/plan/portability.test.mjs`. One of them is the unknown fact `kaal-hosting/windows` that T44 uses. It would fail the same way on every capability that declares a host fact (testing/C39, guard's T114). T42 also listed the old, unscoped name as a literal, to show it is not the boundary.

**Correction.**
- A specifier is now the name alone, or the name and a subpath that the package's `exports` declares, because only those resolve. A workspace selector is unchanged.
- T42 keeps the old name as a value it tests, but spells it in parts, as `release.test.mjs` does.
- No other assertion changes.

**Evidence (Node 24, Linux).** These were checked on a throwaway merge of #657 into this correction, which was not committed.

| Check | T22 |
| --- | --- |
| before the correction | RED, 18 identifiers and T42's literal |
| after the correction | GREEN |
| a stale `import "kaal-hosting/conformance"` | RED |
| a stale `import "kaal-hosting"` | RED |
| a stale `import("kaal-hosting/fixtures")` | RED |
| a stale `-w kaal-hosting` | RED |
| a weaker matcher that ignores subpaths, with a stale `"kaal-hosting/conformance"` | GREEN, so it is caught as weaker |

Across the repository, the corrected matcher still finds a reference in each of the 56 files of #657's set that the old matcher found. It finds none elsewhere. hosting/T21, T23 and T24 are GREEN on the same merge. #657's file set does not change.
