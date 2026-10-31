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
