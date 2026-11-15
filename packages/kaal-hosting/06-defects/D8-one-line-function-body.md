# hosting/D8: `couplings` misses a platform query called inside a one-line function body

Owner: Hosting. Raised on 5 November 2026 from Codex's P2 finding on #1030 at 4b8f700 (`couplings.ts`, the `inPattern` test), reproduced by Hosting. It is a detection Defect of the same class as hosting/D5 to hosting/D7. This record changes no source, test, script or package.

## Record

```json
{
  "id": "hosting/D8",
  "context": "hosting (couplings, boundary detection)",
  "expected": "A platform query bound to an identifier is a finding wherever the identifier is used in production code, including inside a function body (hosting/F28, hosting/F32).",
  "observed": "`import { platform as host } from \"node:os\"; export function currentPlatform() { return host(); }` and the CommonJS destructured form produce no finding, while the same call on its own line is a finding. The scanner reads the opening brace of the function body as an unfinished destructuring pattern.",
  "where": "packages/kaal-hosting/05-src/skills/kaal-hosting/scripts/couplings.ts, the inPattern test on the line of the use",
  "status": "confirmed",
  "tests": ["hosting/T137", "hosting/T138"]
}
```

## Observed and effect

Reproduced on `kaal/hosting` 4b8f700 (Node 24). Production code with a one-line function body returns zero findings, so `boundary()` can be `verified` where the multi-line spelling fails "production code leaves the host to Hosting".

## Case

| Identity | Role | File |
| --- | --- | --- |
| hosting/T137 | RED: ESM named-import query in a one-line function body | [one-line-function-body.red.mjs](one-line-function-body.red.mjs) |
| hosting/T138 | RED: CommonJS destructured query in a one-line function body | same file |
| hosting/T139 | control, passes today: the same call on its own line is a finding | same file |

**Case version:** the Git blob id of `one-line-function-body.red.mjs`, `665ff5206675e49c47a9b6c388a698171baa6502`. Run by hand after `npm run build -w @kaihacksai/kaal-hosting`: `node --test packages/kaal-hosting/06-defects/one-line-function-body.red.mjs`. **Confirming Run (5 Nov, Node 24, Linux):** hosting/T139 passes; hosting/T137 and hosting/T138 fail.

**Answered** only by a later Run in which hosting/T137 and hosting/T138 pass, at this Case version, in the Change that fixes `couplings.ts`, with hosting/T139 still passing.

## Bounds and correction

Nothing is fixed here. The correction is a separate Hosting-owned Change into `kaal/hosting` that restricts the `inPattern` exclusion to real binding patterns. It changes a committed path of the Hosting 0.0.1 increment, so the ledger entry and promotion evidence are refreshed through the governed route before #1030 can promote. Whether it ships before 0.0.1 is the Owner's decision.
