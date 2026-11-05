# hosting/D6: `couplings` misses a platform query bound by destructuring

Owner: Hosting. Raised on 4 November 2026 from Codex's P2 finding on #1030 (`couplings.ts`, destructured CommonJS requires) and put to Hosting as a potential detection Defect by the CPO/Owner ("finding 3a"), to be established with an independent RED Case and corrected in a separate Hosting-owned Change before Hosting 0.0.1 promotion. This record changes no source, test, script or package.

## Record

```json
{
  "id": "hosting/D6",
  "context": "hosting (couplings, boundary detection)",
  "expected": "A platform query bound by destructuring `node:os`, `os`, `node:path`, `path` or `process`, in CommonJS or ESM, is a finding (hosting/F28, hosting/F27).",
  "observed": "`const { platform: host } = require(\"node:os\"); module.exports = host();`, `const { sep } = require(\"node:path\")` and `const { platform } = os` (os imported as a namespace) produce no finding, while the same query as an ESM named import is a coupling finding.",
  "where": "packages/kaal-hosting/src/couplings.ts, the binding of identifiers to platform queries",
  "status": "confirmed",
  "tests": ["hosting/T104", "hosting/T105", "hosting/T106"]
}
```

## Contract

- hosting/F27: `couplings` reads every `.js .mjs .cjs .ts .mts .cts` source.
- hosting/F28: `platform-query` covers `os.platform()`, `path.sep`, `path.win32`, and the like "through any import or destructuring" of those modules.
- `COUPLING_COVERAGE` claims "identifiers bound to them in the same file", and hosting/F32 says a report with no finding means none was found within that coverage. A destructuring in the same file is inside that coverage.

## Observed and effect

Reproduced on the `kaal/hosting` 35df842 build (Node 22 sandbox; Codex reproduced on Node 24). Production code with a destructured query returns zero findings, so `boundary()` can be `verified` with no review where the ESM spelling fails "production code leaves the host to Hosting". The wider fixture set (8 shapes) is in `hosting-3a-commonjs-destructuring-evidence.md`; this record keeps three that fail and one control.

## Case

| Identity | Role | File |
| --- | --- | --- |
| hosting/T104 | RED: CommonJS destructured `platform` from `node:os` | [destructured-require.red.mjs](destructured-require.red.mjs) |
| hosting/T105 | RED: CommonJS destructured `sep` from `node:path` | same file |
| hosting/T106 | RED: destructuring a namespace-imported `os` | same file |
| hosting/T107 | control, passes today: ESM named import `platform` is a finding | same file |

**Case version:** the Git blob id of `destructured-require.red.mjs`, `ef0311e5f387b4231130c1032130ea4bed7a6773`. Run by hand from the repository root after `npm run build -w @kaihacksai/kaal-hosting`: `node --test packages/kaal-hosting/defects/destructured-require.red.mjs`. **Confirming Run (4 Nov, Node 22 sandbox):** hosting/T107 passes; hosting/T104, T105 and T106 fail.

**Answered** only by a later Run in which hosting/T104 to hosting/T106 pass, at this Case version, in the Change that fixes `couplings.ts`, with hosting/T107 still passing.

## Bounds and correction

Nothing is fixed here. The correction is a separate Hosting-owned Change into `kaal/hosting`; it changes `couplings.ts`, a committed path of the Hosting 0.0.1 increment, so the ledger entry and promotion evidence are refreshed through the governed route before #1030. It is planned together with hosting/D5, the HOSTS.md specifiers and the agreed digest interface as one Change, so there is a single ledger refresh. Findings 3b and 3c are separate (3c is hosting/D5).
