# Packaging as a capability: Testing

The DO writes these cases first and observes each one RED by a behavioural assertion. A RED that shows only a missing module or file is blocked, not evidence.

| Test | Checks | Fixture the case must fail, naming the cause |
| --- | --- | --- |
| packaging/T27 | F15: `kaal-packaging`, packed and installed into a fresh consumer with Hosting and Foundation, passes its own `conform`. Every finding is `verified`, apart from F13 when no Testing model functions are given, which is `unknown` | Today's package, which reports `failed` for F8, F9 and F10 |
| packaging/T28 | F15: the source `npm test` follows the declared plan, and the installed one runs `test:embedded` only | A `test` script that runs `test/publisher/` once installed |
| packaging/T29 | F16, N12: `kaal-packaging measure` and `conform` print what the functions return, end on one result line, and exit 0, 1 or 2 by the result | A command that reports `verified` on a failed finding. A command that exits 0 on `unknown` |
| packaging/T30 | F17: the shipped skill is in the shared skill format, names both commands, and cites only Packaging IDs that exist and other owners' IDs as references | A skill that restates Testing's result terms |
| packaging/T31 | F18: the agent instructions name Packaging, the skill and the commands | Instructions that do not mention Packaging |
| packaging/T32 | F19: F7 verifies a dependency that resolved from a registry with integrity. It fails a `file:` or `link:` resolution, and is `unknown` for a dependency the install records nothing for | A fixture that pins `kaal-dep@1.2.3`, placed by path, which F7 verifies today |
| packaging/T33 | N11: no file under `packages/kaal-packaging/` names `process.platform`, `win32`, a `.cmd` launcher or a platform-dependent `shell` | Today's `test/plan/measurement.test.mjs` and `package.test.mjs` |
| packaging/T34 | A13: `measure` and `conform` run a given npm script through Hosting, and the stand-in reaches them only that way | A stand-in found on `PATH` |

**Trace.**

| Requirement | Case |
| --- | --- |
| packaging/F15 | T27, T28 |
| packaging/F16 | T29 |
| packaging/F17 | T30 |
| packaging/F18 | T31 |
| packaging/F19 | T32 |
| packaging/N11 | T33, T34 |
| packaging/N12 | T29 |

T15's existing F7 cases move to the registry form, with no false RED: a dependency installed from a registry tarball with integrity still verifies.

## RED evidence (packaging/C9)

The cases are in `test/embed/` (T29, T30, T32, T34, T35) and `test/publisher/capability.test.mjs` (T27, T28, T31, T33), run with `npm test -w kaal-packaging` on Node 24.22.1 with npm 11.19.1. Each wrong implementation below was one edit to the GREEN tree, and every case was RED on a behavioural assertion against at least one:

| Wrong implementation | RED |
| --- | --- |
| today's package, with no `docs/` shipped (manifest regenerated, so only the contract decides) | T27: `packaging/F8: docs/intent.md is not shipped; …` |
| the first DO tree itself: a regular expression in `package.test.mjs` read `from "file:…"`, which Packaging's own import scan took for an undeclared import | T27: `packaging/N8: undeclared imports`. Dogfooding found it; the case now quotes with `.` |
| `test` is not a declared suite's command | T28 |
| `conform` exits 0 on `unknown` | T29 |
| `conform` prints `verified` on a failed finding | T29 |
| the skill names no `kaal-packaging conform` | T30 |
| the skill restates `unknown` | T30: `it defines "unknown" itself instead of citing Testing` |
| `AGENTS.md` without a Packaging section | T31 |
| F7 on version syntax alone, as before packaging/F19 | T15, T32 |
| a test passing `shell` by platform | T33 |
| the npm realization ignoring a given `npm` | T34 |

**Two departures from the PLAN, for the Owner.**
- **T27 and packaging/F7.** The PLAN expected every finding `verified` apart from F13. Under packaging/F19, a dependency installed from a local tarball fails F7, and `kaal-hosting` and `@kaihacksai/kaal-foundation` are not on a registry yet. So T27 holds F7 `failed`, naming exactly those two and nothing else, and every other finding `verified`. It passes Testing's model functions as a caller would, so F13 is decided and `verified`. This is an interim, dependency-blocked result, not final acceptance: Packaging passes its full generic contract only when the exact packed-and-installed candidate verifies F7 with both dependencies from their registries. F7 is not weakened for it (the Owner's review on #713).
- **packaging/T35.** The case packaging/C5 titled `packaging/A7` now has a case identity, packaging/T35 [packaging/A7], so the verifier can name it in the per-case `cases` and the manifest can declare it.

## Revised to the Owner's review on #713 (6544415998)

- **F7 dogfooding.** T27, the README, `docs/limitations.md` and `docs/testing.md` call Packaging's own result interim and dependency-blocked, and state the condition for final acceptance. None says Packaging passes its full generic contract.
- **The command and F13.** `conform` takes `--testing <module>`, a module file the caller provides that exports Testing's model functions. Packaging still takes no dependency on Testing. Without them, a package that ships a model is `unknown` for F13, and the command prints a note that the run is not a complete conformance judgement. The skill, Operations and `AGENTS.md` give the route to a complete run. T29 now covers both paths.
- **Acquisition.** No document shows `npx kaal-packaging`. The commands run by path, `node packages/kaal-packaging/bin/kaal-packaging.mjs` in the repository and `node node_modules/kaal-packaging/bin/kaal-packaging.mjs` once installed. The unscoped name `kaal-packaging` is unclaimed on npm (`npm view` gives 404), so a lookup could reach someone else's package. packaging/T36 holds the documents to the path form. It also shows that, beside an unrelated package exposing a `kaal-packaging` bin, the documented path never runs it while the bare name does, and that the repository invocation runs with every registry unreachable.

| Wrong implementation | RED |
| --- | --- |
| `AGENTS.md` shows `npx kaal-packaging measure` | T36 |
| `conform` ignores `--testing` | T29 |
| `conform` prints no note when F13 was not judged | T29 |
